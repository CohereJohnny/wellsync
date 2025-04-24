"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import WellCard from './WellCard';
import { useSupabase } from '@/context/supabase-context'; // Import the hook
import { Well } from '@/lib/types'; // Import Well type
import type { WellFilters } from './toolbar';
import { RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';
import { Skeleton } from "@/components/ui/skeleton";

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

  // State for subscription management
  const [retryCount, setRetryCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('initializing');

  // Function to fetch wells with filters
  const fetchWells = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('wells')
        .select('id, name, camp, formation, status')
        .order('name', { ascending: true });

      // Apply filters if they exist and are not 'all'
      const camp = searchParams.get('camp');
      const formation = searchParams.get('formation');
      const status = searchParams.get('status');

      if (camp && camp !== 'all') {
        // Capitalize first letter for database query
        query = query.eq('camp', camp.charAt(0).toUpperCase() + camp.slice(1));
      }
      if (formation && formation !== 'all') {
        // Handle hyphenated values and capitalize first letter
        const formattedFormation = formation === 'bone-spring'
          ? 'Bone Spring'
          : formation.charAt(0).toUpperCase() + formation.slice(1);
        query = query.eq('formation', formattedFormation);
      }
      if (status && status !== 'all') {
        // Handle hyphenated values and capitalize first letter
        const formattedStatus = status === 'pending-repair'
          ? 'Pending Repair'
          : status.charAt(0).toUpperCase() + status.slice(1);
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
    }
  }, [searchParams, supabase, t]);

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
  const setupRealtimeSubscription = useCallback(async () => {
    try {
      setSubscriptionStatus('initializing');
      
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
                supabase.removeChannel(channel);
                setupRealtimeSubscription();
              }, RETRY_DELAY);
            }
          }
        });

      // Cleanup function to remove the channel subscription
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      setSubscriptionStatus('error');
      return () => {}; // Return empty cleanup function
    }
  }, [supabase, handleRealtimeUpdate, retryCount]);

  // Main effect for fetching data and managing subscription lifecycle
  useEffect(() => {
    // Initial fetch
    fetchWells();

    // Initial subscription setup
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      console.log("Cleaning up WellGrid subscription...");
      // Remove the channel if it exists
      if (supabase.channel('wells-grid-changes')) {
        supabase.removeChannel(supabase.channel('wells-grid-changes'));
      }
      setSubscriptionStatus('error'); // Explicitly set status on unmount
    };
  }, [fetchWells, supabase]); // Only fetchWells and supabase now

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
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="font-medium">{t('errorOccurred')}</p>
        <p>{error}</p>
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
            key={`${well.id}-${well.status}-${well.name}`} // Key strategy unchanged for now
            well={well}
          />
        ))}
      </div>
    </>
  );
} 