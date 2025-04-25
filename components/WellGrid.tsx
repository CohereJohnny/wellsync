"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import WellCard from './WellCard';
import { useSupabase } from '@/context/supabase-context'; // Import the hook
import { Well } from '@/lib/types'; // Import Well type
import type { WellFilters } from './toolbar';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Wifi, WifiOff } from 'lucide-react';

// Define subscription status types
type SubscriptionStatus = 'initializing' | 'connected' | 'error' | null;

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Define props for WellGrid
interface WellGridProps {
  openFaultDialog: (well: Well) => void;
}

export default function WellGrid({ openFaultDialog }: WellGridProps) {
  const supabase = useSupabase(); // Get client from context
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const t = useTranslations('wellGrid');
  const tStatus = useTranslations('wellStatus');
  const { toast } = useToast();

  // State for subscription management
  const [retryCount, setRetryCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('initializing');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const initialLoadRef = useRef(true);

  // Get individual filter values to avoid recreating filters object on every render
  const campFilter = searchParams.get('camp');
  const formationFilter = searchParams.get('formation');
  const statusFilter = searchParams.get('status');

  // Memoize the filters object 
  const filters = useMemo<WellFilters>(() => ({
    camp: campFilter,
    formation: formationFilter,
    status: statusFilter,
  }), [campFilter, formationFilter, statusFilter]);

  // Function to fetch wells with filters
  const fetchWells = useCallback(async () => {
    console.log('Fetching wells with filters:', filters);
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('wells')
        // Select ALL columns now as WellCard needs the full object for the dialog
        .select('*') 
        .order('name', { ascending: true });

      // Apply filters
      if (filters.camp && filters.camp !== 'all') {
        query = query.eq('camp', filters.camp.charAt(0).toUpperCase() + filters.camp.slice(1));
      }
      if (filters.formation && filters.formation !== 'all') {
        const formattedFormation = filters.formation === 'bone-spring'
          ? 'Bone Spring'
          : filters.formation.charAt(0).toUpperCase() + filters.formation.slice(1);
        query = query.eq('formation', formattedFormation);
      }
      if (filters.status && filters.status !== 'all') {
        const formattedStatus = filters.status === 'pending-repair'
          ? 'Pending Repair'
          : filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
        query = query.eq('status', formattedStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setWells(data as Well[]); // Cast to Well[]
      }
    } catch (err: any) {
      console.error("Error fetching wells:", err);
      setError(t('errorFetchingWells'));
      setWells([]);
    } finally {
      setIsLoading(false);
      initialLoadRef.current = false;
    }
  }, [supabase, filters, t]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Realtime well change received:', payload);
    
    if (payload.eventType === 'INSERT') {
      setWells(currentWells => {
        if (currentWells.some(w => w.id === payload.new.id)) {
          return currentWells;
        }
        // Ensure the new object conforms to Well type before adding
        const newWell = payload.new as Well;
        return [...currentWells, newWell].sort((a, b) => 
          (a.name || '').localeCompare(b.name || ''));
      });
    } 
    else if (payload.eventType === 'UPDATE') {
       setWells(currentWells => 
        currentWells.map(well => 
          well.id === payload.new.id ? { ...well, ...(payload.new as Partial<Well>) } : well
        )
      );
    } 
    else if (payload.eventType === 'DELETE') {
      setWells(currentWells => 
        currentWells.filter(well => well.id !== payload.old.id)
      );
    }
  }, []);

  // Set up realtime subscription with retry logic
  const setupRealtimeSubscription = useCallback(() => {
    console.log('Setting up realtime subscription');
    setSubscriptionStatus('initializing');
    
    try {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      const channel = supabase
        .channel('wells-grid-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wells' },
          handleRealtimeUpdate
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to wells changes');
            setSubscriptionStatus('connected');
            setRetryCount(0); 
          } else if (status === 'CHANNEL_ERROR' || err) {
            console.error('Subscription error:', status, err);
            setSubscriptionStatus('error');
            
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying subscription (${retryCount + 1}/${MAX_RETRIES})...`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current);
                  channelRef.current = null;
                }
                setupRealtimeSubscription();
              }, RETRY_DELAY);
            } else {
              console.error(`Max retry attempts (${MAX_RETRIES}) reached. Giving up.`);
              toast({
                title: t('realtimeError'),
                description: t('realtimeDisconnected'),
                variant: 'destructive',
              });
            }
          }
        });
      
      channelRef.current = channel;
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setSubscriptionStatus('error');
    }
  }, [supabase, handleRealtimeUpdate, retryCount, t, toast]);

  // Effect for initial data load and subscription setup - runs once
  useEffect(() => {
    console.log("Initializing WellGrid");
    fetchWells();
    setupRealtimeSubscription();

    // Cleanup function for subscription
    return () => {
      console.log("Cleaning up WellGrid subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchWells, setupRealtimeSubscription, supabase]);

  // Separate effect to handle filter changes
  useEffect(() => {
    // Skip the initial render since fetchWells is already called in the mount effect
    if (!initialLoadRef.current) {
      console.log('Filters changed, re-fetching wells');
      fetchWells();
    }
  }, [filters.camp, filters.formation, filters.status, fetchWells]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h3 className="text-xl font-semibold text-destructive">{t('errorOccurred')}</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchWells} variant="outline" className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  // Empty state
  if (wells.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium text-gray-600">{t('noWellsFound')}</p>
        <p className="text-gray-500">{t('tryAdjustingFilters')}</p>
      </div>
    );
  }

  // Subscription status indicator logic
  let subscriptionIndicator = null; // Declare outside the blocks
  if (subscriptionStatus === 'initializing') {
      subscriptionIndicator = <div className="text-xs text-muted-foreground">{t('connectingRealtime')}</div>;
  } else if (subscriptionStatus === 'error') {
      subscriptionIndicator = (
          <Badge variant="destructive" className="flex items-center gap-1.5">
              <WifiOff className="h-3 w-3" />
              {t('realtimeError')}
          </Badge>
      );
  } else if (subscriptionStatus === 'connected') {
       subscriptionIndicator = (
          <Badge variant="outline" className="flex items-center gap-1.5 border-green-500 text-green-600">
              <Wifi className="h-3 w-3" />
              Connected
          </Badge>
      );
  }

  // Grid layout
  return (
    <div className="flex flex-col space-y-4">
      {/* Use the declared variable */} 
      {subscriptionIndicator}

      {/* Main Well Grid - Adjusted for 5 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {wells.map(well => (
          <WellCard 
            key={well.id} 
            well={well} 
            openFaultDialog={() => openFaultDialog(well)}
            onCreateSR={(id) => toast({ 
              title: "Action Needed", 
              description: `Create SR action for well ${id} needs implementation.` 
            })} 
          />
        ))}
      </div>
    </div>
  );
} 