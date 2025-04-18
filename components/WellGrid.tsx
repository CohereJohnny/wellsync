"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WellCard from './WellCard';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { Well } from '@/lib/types'; // Import Well type
import type { WellFilters } from './toolbar';

export default function WellGrid() {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchWells() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('wells')
          .select('id, name, camp, formation, status')
          .order('name', { ascending: true });

        // Apply filters if they exist
        const camp = searchParams.get('camp');
        const formation = searchParams.get('formation');
        const status = searchParams.get('status');

        if (camp) {
          query = query.eq('camp', camp);
        }
        if (formation) {
          query = query.eq('formation', formation);
        }
        if (status) {
          query = query.eq('status', status);
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
    }

    fetchWells();
  }, [searchParams]); // Re-fetch when search params change

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
        <WellCard key={well.id} well={well} />
      ))}
    </div>
  );
} 