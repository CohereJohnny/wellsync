'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Map, { Marker, MapRef, MapProps, ViewStateChangeEvent, ViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSupabase } from '@/context/supabase-context';
import { Well, Part, Transformer } from '@/lib/types';
import { TransformerFilters } from '@/components/toolbar-transformer';
import { cn } from '@/lib/utils';
import { MapWellListItem } from './map-well-list-item';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslations } from 'next-intl';

interface MapViewDashboardProps {
  filters: TransformerFilters;
  openFaultDialog: (transformer: Transformer | null) => void;
}

interface MapViewportState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export function MapViewDashboard({ filters, openFaultDialog }: MapViewDashboardProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('mapView');
  const locale = params.locale as string;
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: -95.3698, // Houston coordinates
    latitude: 29.7604,
    zoom: 10,
  });

  const mapRef = useRef<MapRef>(null);

  const filteredTransformers = useMemo(() => {
    if (!searchTerm) {
      return transformers;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return transformers.filter(transformer => 
      (transformer.name?.toLowerCase().includes(lowerSearchTerm)) ||
      (transformer.substation?.toLowerCase().includes(lowerSearchTerm)) ||
      (transformer.type?.toLowerCase().includes(lowerSearchTerm))
    );
  }, [transformers, searchTerm]);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    async function fetchTransformers() {
      setIsLoading(true);
      setError(null);
      console.log("Fetching transformers with filters:", filters);
      try {
        let query = supabase.from('transformers').select('*');
        
        if (filters.substation && filters.substation !== 'all') {
          console.log(`Applying substation filter: ${filters.substation}`);
          const formattedSubstation = filters.substation.charAt(0).toUpperCase() + filters.substation.slice(1);
          query = query.eq('substation', formattedSubstation);
        }
        if (filters.type && filters.type !== 'all') {
          console.log(`Applying type filter: ${filters.type}`);
          const formattedType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
          query = query.eq('type', formattedType);
        }
        if (filters.status && filters.status !== 'all') {
          console.log(`Applying status filter: ${filters.status}`);
          const formattedStatus = filters.status === 'pending-repair' 
            ? 'Pending Repair' 
            : filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
          query = query.eq('status', formattedStatus);
        }

        const { data, error: dbError, count } = await query;
        console.log(`Fetched transformers data count: ${data?.length}, Supabase count: ${count}`);

        if (dbError) {
          console.error('Supabase fetch error:', dbError);
          throw dbError;
        }

        const sortedTransformers = (data || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setTransformers(sortedTransformers);

        if (sortedTransformers.length > 0 && sortedTransformers[0].latitude && sortedTransformers[0].longitude) {
          setViewState(prevState => ({
            ...prevState,
            latitude: sortedTransformers[0].latitude as number,
            longitude: sortedTransformers[0].longitude as number,
          }));
        } 

      } catch (err: any) {
        console.error('Error fetching transformers for map:', err);
        setError('Failed to load transformer data for the map.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransformers();
  }, [filters, supabase]);

  const debouncedSetSearchTerm = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    [],
  );

  const getMarkerColor = (status: string): string => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'operational') return 'bg-green-500';
    if (lowerStatus === 'fault') return 'bg-red-500';
    if (lowerStatus === 'pending repair' || lowerStatus === 'pendingrepair') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const handleMarkerClick = (transformerId: string) => {
    router.push(`/${locale}/transformer/${transformerId}`);
  };

  const handleZoomToTransformer = useCallback((transformerId: string) => {
    const transformer = transformers.find(t => t.id === transformerId);
    if (transformer && transformer.latitude && transformer.longitude && mapRef.current) {
      mapRef.current.flyTo({
        center: [transformer.longitude, transformer.latitude],
        zoom: 12,
        duration: 1500
      });
    }
  }, [transformers]);

  if (!mapboxAccessToken) {
    console.error('Mapbox access token is not configured.');
    return <div className="p-4 text-red-500 bg-red-100 border border-red-400 rounded">Map configuration error. Please contact support.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[650px]">
        <p className="text-gray-500">Loading map view...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-100 border border-red-400 rounded">{error}</div>;
  }

  return (
    <div className="flex h-[600px] flex-col md:flex-row border border-gray-200 rounded-md overflow-hidden">
      <div className="flex w-full flex-col md:w-1/3 lg:w-1/4 h-full">
        <div className="border-b p-4">
          <Input
            placeholder={t('searchPlaceholder')}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <ScrollArea className="flex-1 h-auto">
          {filteredTransformers.map((transformer) => (
            <div 
              key={transformer.id}
              className="py-2 px-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleMarkerClick(transformer.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{transformer.name}</h3>
                  <p className="text-sm text-gray-500">{transformer.substation} - {transformer.type}</p>
                </div>
                <div className={cn("w-3 h-3 rounded-full", getMarkerColor(transformer.status))}></div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="relative flex-1 h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={mapboxAccessToken}
          initialViewState={viewState}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          onMove={evt => setViewState(evt.viewState)}
        >
          {filteredTransformers.map(transformer => (
            transformer.latitude && transformer.longitude && (
              <Marker
                key={transformer.id}
                longitude={transformer.longitude}
                latitude={transformer.latitude}
                onClick={() => handleMarkerClick(transformer.id)}
              >
                <div 
                  className={cn(
                    "w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-all hover:w-6 hover:h-6",
                    getMarkerColor(transformer.status)
                  )}
                  title={transformer.name}
                ></div>
              </Marker>
            )
          ))}
        </Map>
      </div>
    </div>
  );
} 