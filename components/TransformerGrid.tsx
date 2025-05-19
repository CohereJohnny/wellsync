"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { TransformerCard } from './TransformerCard';
import { useSupabase } from '@/context/supabase-context'; // Import the hook
import { Transformer } from '@/lib/types'; // Import Transformer type
import type { TransformerFilters } from './toolbar-transformer';
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

// Define props for TransformerGrid
interface TransformerGridProps {
  openFaultDialog: (transformer: Transformer) => void;
}

export default function TransformerGrid({ openFaultDialog }: TransformerGridProps) {
  const supabase = useSupabase(); // Get client from context
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const t = useTranslations('transformerGrid');
  const tStatus = useTranslations('transformerStatus');
  const { toast } = useToast();

  // State for subscription management
  const [retryCount, setRetryCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('initializing');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const initialLoadRef = useRef(true);

  // Get individual filter values to avoid recreating filters object on every render
  const substationFilter = searchParams.get('substation');
  const typeFilter = searchParams.get('type');
  const statusFilter = searchParams.get('status');

  // Memoize the filters object 
  const filters = useMemo<TransformerFilters>(() => ({
    substation: substationFilter,
    type: typeFilter,
    status: statusFilter,
  }), [substationFilter, typeFilter, statusFilter]);

  // Function to fetch transformers with filters
  const fetchTransformers = useCallback(async () => {
    console.log('Fetching transformers with filters:', filters);
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('transformers')
        // Select ALL columns now as TransformerCard needs the full object for the dialog
        .select('*') 
        .order('name', { ascending: true });

      // Apply filters
      if (filters.substation && filters.substation !== 'all') {
        const formattedSubstation = filters.substation.charAt(0).toUpperCase() + filters.substation.slice(1);
        query = query.eq('substation', formattedSubstation);
      }
      if (filters.type && filters.type !== 'all') {
        const formattedType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
        query = query.eq('type', formattedType);
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
        setTransformers(data as Transformer[]); // Cast to Transformer[]
      }
    } catch (err: any) {
      console.error("Error fetching transformers:", err);
      setError(t('errorFetchingTransformers'));
      setTransformers([]);
    } finally {
      setIsLoading(false);
      initialLoadRef.current = false;
    }
  }, [supabase, filters, t]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('Realtime transformer change received:', payload);
    
    if (payload.eventType === 'INSERT') {
      setTransformers(currentTransformers => {
        if (currentTransformers.some(w => w.id === payload.new.id)) {
          return currentTransformers;
        }
        // Ensure the new object conforms to Transformer type before adding
        const newTransformer = payload.new as Transformer;
        return [...currentTransformers, newTransformer].sort((a, b) => 
          (a.name || '').localeCompare(b.name || ''));
      });
    } 
    else if (payload.eventType === 'UPDATE') {
      setTransformers(currentTransformers => 
        currentTransformers.map(transformer => 
          transformer.id === payload.new.id ? { ...transformer, ...(payload.new as Partial<Transformer>) } : transformer
        )
      );
    } 
    else if (payload.eventType === 'DELETE') {
      setTransformers(currentTransformers => 
        currentTransformers.filter(transformer => transformer.id !== payload.old.id)
      );
    }
  }, []);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (channelRef.current) {
      console.log("Reusing existing channel for transformer updates");
      return;
    }

    console.log("Setting up realtime subscription for transformers");
    setSubscriptionStatus('initializing');

    try {
      const channel = supabase
        .channel('transformer-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transformers' },
          handleRealtimeUpdate
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to transformer updates");
            setSubscriptionStatus('connected');
            setRetryCount(0); // Reset retry count on successful connection
          } else if (status === 'CHANNEL_ERROR') {
            console.error("Channel error for transformer updates");
            setSubscriptionStatus('error');
            
            // Retry logic
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying connection (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
                // Remove the errored channel and try again
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current);
                  channelRef.current = null;
                }
                setupRealtimeSubscription();
              }, RETRY_DELAY);
            } else {
              console.error(`Failed to connect after ${MAX_RETRIES} attempts`);
              // User could manually retry if needed
            }
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.error("Error setting up realtime subscription:", err);
      setSubscriptionStatus('error');
    }
  }, [supabase, handleRealtimeUpdate, retryCount]);

  // Effect for initial data load and subscription setup - runs once
  useEffect(() => {
    console.log("Initializing TransformerGrid");
    fetchTransformers();
    setupRealtimeSubscription();

    // Cleanup function for subscription
    return () => {
      console.log("Cleaning up TransformerGrid subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchTransformers, setupRealtimeSubscription, supabase]);

  // Separate effect to handle filter changes
  useEffect(() => {
    // Skip the initial render since fetchTransformers is already called in the mount effect
    if (!initialLoadRef.current) {
      console.log('Filters changed, re-fetching transformers');
      fetchTransformers();
    }
  }, [filters.substation, filters.type, filters.status, fetchTransformers]);

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
        <Button onClick={fetchTransformers} variant="outline" className="mt-4">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  // Empty state
  if (transformers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg font-medium text-gray-600">{t('noTransformersFound')}</p>
        <p className="text-gray-500">{t('tryAdjustingFilters')}</p>
      </div>
    );
  }

  // Subscription status indicator logic
  let subscriptionIndicator = null;
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

      {/* Main Transformer Grid - Adjusted for 5 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {transformers.map(transformer => (
          <TransformerCard 
            key={transformer.id} 
            transformer={transformer} 
            openFaultDialog={() => openFaultDialog(transformer)}
            onCreateSR={(id) => toast({ 
              title: "Action Needed", 
              description: `Create SR action for transformer ${id} needs implementation.` 
            })} 
          />
        ))}
      </div>
    </div>
  );
} 