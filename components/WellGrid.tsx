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

export default function WellGrid() {
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
        .select('id, name, camp, formation, status')
        .order('name', { ascending: true });

      // Apply filters if they exist and are not 'all'
      if (filters.camp && filters.camp !== 'all') {
        // Capitalize first letter for database query
        query = query.eq('camp', filters.camp.charAt(0).toUpperCase() + filters.camp.slice(1));
      }
      if (filters.formation && filters.formation !== 'all') {
        // Handle hyphenated values and capitalize first letter
        const formattedFormation = filters.formation === 'bone-spring'
          ? 'Bone Spring'
          : filters.formation.charAt(0).toUpperCase() + filters.formation.slice(1);
        query = query.eq('formation', formattedFormation);
      }
      if (filters.status && filters.status !== 'all') {
        // Handle hyphenated values and capitalize first letter
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
        setWells(data as Well[]);
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
    
    // Handle new well added
    if (payload.eventType === 'INSERT') {
      setWells(currentWells => {
        if (currentWells.some(w => w.id === payload.new.id)) {
          return currentWells;
        }
        return [...currentWells, payload.new].sort((a, b) => 
          (a.name || '').localeCompare(b.name || ''));
      });
    } 
    // Handle well updated
    else if (payload.eventType === 'UPDATE') {
      setWells(currentWells => 
        currentWells.map(well => 
          well.id === payload.new.id ? { ...well, ...payload.new } : well
        )
      );
    } 
    // Handle well deleted
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
      // Clean up any existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      // Create new channel
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
            setRetryCount(0); // Reset retry count on success
          } else if (status === 'CHANNEL_ERROR' || err) {
            console.error('Subscription error:', status, err);
            setSubscriptionStatus('error');
            
            // Implement retry logic
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
      
      // Store channel reference for later cleanup
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
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

  // Subscription status indicator
  let subscriptionIndicator = null;
  if (subscriptionStatus === 'error') {
    subscriptionIndicator = (
      <div className="bg-yellow-50 p-2 rounded-lg mb-4 text-sm text-yellow-800">
        {t('realtimeDisconnected')}
      </div>
    );
  }

  // Render grid
  return (
    <>
      {subscriptionIndicator}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {wells.map((well) => (
          <WellCard
            key={`${well.id}-${well.status}-${well.name}`}
            well={well}
          />
        ))}
      </div>
    </>
  );
} 