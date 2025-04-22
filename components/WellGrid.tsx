"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import WellCard from './WellCard';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { Well } from '@/lib/types'; // Import Well type
import type { WellFilters } from './toolbar';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function WellGrid() {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

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
  }, [searchParams]);

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    setWells(currentWells => {
      // Normalize the status for comparison
      const normalizedPayloadStatus = payload.new.status?.toLowerCase();
      const updatedWells = currentWells.map(well => {
        if (well.id === payload.new.id) {
          // Create a new object to ensure React detects the change
          return {
            ...well,
            ...payload.new,
            // Preserve the case of the original status
            status: payload.new.status
          };
        }
        return well;
      });

      // Check if any well was actually updated
      const wasUpdated = updatedWells.some((well, index) => 
        well.id === payload.new.id && 
        well.status !== currentWells[index].status
      );

      if (!wasUpdated) {
        return currentWells;
      }

      return [...updatedWells];
    });
  }, [setWells]);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {
      // Set up real-time subscription
      channel = supabase
        .channel('wells_channel')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'wells'
          },
          handleRealtimeUpdate
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
    };

    // Initial fetch and setup
    fetchWells().then(() => {
      setupRealtimeSubscription();
    });

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [fetchWells, handleRealtimeUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-red-600 mb-2">⚠️ Error</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {wells.map((well) => (
        <WellCard 
          key={`${well.id}-${well.status}-${well.name}`} 
          well={well} 
        />
      ))}
    </div>
  );
} 