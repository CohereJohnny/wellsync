"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import WellCard from './WellCard';
import { useSupabase } from '@/context/supabase-context'; // Import the hook
import { Well } from '@/lib/types'; // Import Well type
import type { WellFilters } from './toolbar';
import { RealtimeChannel, RealtimeChannelSendResponse } from '@supabase/supabase-js';

// Define subscription status types
type SubscriptionStatus = 'SUBSCRIBED' | 'CONNECTING' | 'RETRYING' | 'FAILED' | 'CLOSED' | 'TIMED_OUT' | 'CHANNEL_ERROR';

// Constants for retry logic
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 2000;
const BACKOFF_FACTOR = 2;

export default function WellGrid() {
  const supabase = useSupabase(); // Get client from context
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // State for subscription management
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('CONNECTING');
  const retryAttemptRef = useRef<number>(0);
  const retryTimerIdRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Forward declare setup function ref for attemptResubscribe dependency
  const setupRealtimeSubscriptionRef = useRef<() => void>(() => {});

  // Function to fetch wells with filters
  const fetchWells = useCallback(async () => {
    setLoading(true);
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
      setError("Failed to load well data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [searchParams, supabase]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    // console.log('Realtime payload received:', payload); // Keep for debugging if needed
    if (payload.eventType === 'DELETE') {
        setWells(currentWells => currentWells.filter(well => well.id !== payload.old.id));
    } else {
        setWells(currentWells => {
            const isExisting = currentWells.some(well => well.id === payload.new.id);
            if (isExisting) {
                // Update existing well
                return currentWells.map(well => {
                    if (well.id === payload.new.id) {
                        return { ...well, ...payload.new }; // Update with new data
                    }
                    return well;
                });
            } else {
                // Add new well (and sort to maintain order)
                const newWells = [...currentWells, payload.new as Well];
                newWells.sort((a, b) => a.name.localeCompare(b.name));
                return newWells;
            }
        });
    }
  }, [setWells]); // Dependency only on setWells

  // Define attemptResubscribe FIRST
  const attemptResubscribe = useCallback(() => {
    if (retryTimerIdRef.current) {
      clearTimeout(retryTimerIdRef.current);
      retryTimerIdRef.current = null;
    }

    retryAttemptRef.current += 1;

    if (retryAttemptRef.current <= MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY_MS * (BACKOFF_FACTOR ** (retryAttemptRef.current - 1));
      console.warn(`Realtime subscription failed. Retrying attempt ${retryAttemptRef.current}/${MAX_RETRIES} in ${delay}ms...`);
      setSubscriptionStatus('RETRYING');

      retryTimerIdRef.current = setTimeout(() => {
        // Call the setup function via its ref
        setupRealtimeSubscriptionRef.current();
      }, delay);
    } else {
      console.error(`Realtime subscription failed after ${MAX_RETRIES} retries. Giving up.`);
      setSubscriptionStatus('FAILED');
    }
  }, []); // No dependencies needed now

  // Define setupRealtimeSubscription SECOND
  const setupRealtimeSubscription = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
        .catch(err => console.error("Error removing previous channel:", err));
      channelRef.current = null;
    }

    setSubscriptionStatus('CONNECTING');
    const newChannel = supabase.channel('wells_channel');

    newChannel
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'wells'
        },
        handleRealtimeUpdate // Use the stable callback
      )
      .subscribe((status, err) => {
        console.log('Realtime subscription status:', status, err || '');
        if (status === 'SUBSCRIBED') {
          setSubscriptionStatus('SUBSCRIBED');
          retryAttemptRef.current = 0;
          if (retryTimerIdRef.current) {
            clearTimeout(retryTimerIdRef.current);
            retryTimerIdRef.current = null;
          }
        } else if (status === 'TIMED_OUT') {
          setSubscriptionStatus('TIMED_OUT');
          attemptResubscribe();
        } else if (status === 'CHANNEL_ERROR') {
          setSubscriptionStatus('CHANNEL_ERROR');
          console.error('Realtime channel error:', err);
          attemptResubscribe();
        } else if (status === 'CLOSED') {
          setSubscriptionStatus('CLOSED');
        }
      });
    channelRef.current = newChannel;
  }, [supabase, handleRealtimeUpdate, attemptResubscribe]); // Now depends on attemptResubscribe

  // Update the ref AFTER setupRealtimeSubscription is defined
  setupRealtimeSubscriptionRef.current = setupRealtimeSubscription;

  // Main effect for fetching data and managing subscription lifecycle
  useEffect(() => {
    // Initial fetch
    fetchWells();

    // Initial subscription setup
    setupRealtimeSubscriptionRef.current();

    // Cleanup function
    return () => {
      console.log("Cleaning up WellGrid subscription...");
      // Clear any pending retry timer
      if (retryTimerIdRef.current) {
        clearTimeout(retryTimerIdRef.current);
        retryTimerIdRef.current = null;
      }
      // Remove the channel if it exists
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
            .then((status: RealtimeChannelSendResponse) => console.log("Channel removal status:", status))
            .catch(err => console.error("Error removing channel on cleanup:", err));
        channelRef.current = null;
      }
      setSubscriptionStatus('CLOSED'); // Explicitly set status on unmount
    };
  }, [fetchWells, supabase]); // Only fetchWells and supabase now

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        {/* Optional: Indicate connecting status */}
        {subscriptionStatus === 'CONNECTING' && <span className="ml-2 text-sm text-gray-500">Connecting...</span>}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-red-600 mb-2">⚠️ Error</div>
        <div className="text-sm text-gray-600">{error}</div>
        {/* Indicate failed subscription status */}
        {subscriptionStatus === 'FAILED' && <div className="text-xs text-orange-500 mt-1">Real-time updates failed.</div>}
      </div>
    );
  }

  // Render empty state
  if (wells.length === 0) {
    return (
      <div className="text-center p-10">
        <div className="text-gray-600 mb-2">No wells found</div>
        <div className="text-sm text-gray-500">
          Try adjusting your filters or viewing all wells
        </div>
      </div>
    );
  }

  // Render grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* Optional: Subtle indicator for subscription issues */}
      {subscriptionStatus === 'RETRYING' && <div className="col-span-full text-center text-xs text-orange-500 p-2">Real-time connection issues. Retrying...</div>}
      {subscriptionStatus === 'FAILED' && <div className="col-span-full text-center text-xs text-red-500 p-2">Real-time connection failed. Data may be stale.</div>}

      {wells.map((well) => (
        <WellCard
          key={`${well.id}-${well.status}-${well.name}`} // Key strategy unchanged for now
          well={well}
        />
      ))}
    </div>
  );
} 