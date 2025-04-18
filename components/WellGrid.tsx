"use client"; // Required for fetching data client-side with useEffect

import React, { useState, useEffect } from 'react';
import WellCard from './WellCard';
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { Well } from '@/lib/types'; // Import Well type

export default function WellGrid() {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWells() {
      setLoading(true);
      setError(null);
      try {
        // Fetch only necessary columns for the grid
        const { data, error: fetchError } = await supabase
          .from('wells')
          .select('id, name, camp, formation, status') // Select specific columns
          .order('name', { ascending: true }); // Optional: order by name

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setWells(data as Well[]); // Type assertion, ensure data matches Well[]
        }
      } catch (err: any) {
        console.error("Error fetching wells:", err);
        setError("Failed to load well data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchWells();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    // Basic loading state - replace with a spinner or skeleton later
    return <div className="text-center p-10">Loading wells...</div>;
  }

  if (error) {
    // Basic error state
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  if (wells.length === 0) {
     // Handle case where no wells are returned (yet)
     return <div className="text-center p-10 text-gray-600">No wells found. Mock data might be needed.</div>;
   }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {wells.map((well) => (
        <WellCard key={well.id} well={well} />
      ))}
    </div>
  );
} 