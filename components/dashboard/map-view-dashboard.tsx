'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Map, { Marker, MapRef, MapProps, ViewStateChangeEvent, ViewState } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSupabase } from '@/context/supabase-context';
import { Well, Part } from '@/lib/types';
import { WellFilters } from '@/components/toolbar';
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
  filters: WellFilters;
  openFaultDialog: (well: Well) => void;
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
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: -100,
    latitude: 40,
    zoom: 7,
  });

  const mapRef = useRef<MapRef>(null);

  const filteredWells = useMemo(() => {
    if (!searchTerm) {
      return wells;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return wells.filter(well => 
      (well.name?.toLowerCase().includes(lowerSearchTerm)) ||
      (well.camp?.toLowerCase().includes(lowerSearchTerm)) ||
      (well.formation?.toLowerCase().includes(lowerSearchTerm))
    );
  }, [wells, searchTerm]);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    async function fetchWells() {
      setIsLoading(true);
      setError(null);
      console.log("Fetching wells with filters:", filters);
      try {
        let query = supabase.from('wells').select('*');
        
        if (filters.camp && filters.camp !== 'all') {
          console.log(`Applying camp filter: ${filters.camp}`);
          query = query.eq('camp', filters.camp);
        }
        if (filters.formation && filters.formation !== 'all') {
          console.log(`Applying formation filter: ${filters.formation}`);
          query = query.eq('formation', filters.formation);
        }
        if (filters.status && filters.status !== 'all') {
          console.log(`Applying status filter: ${filters.status}`);
          query = query.eq('status', filters.status);
        }

        const { data, error: dbError, count } = await query;
        console.log(`Fetched wells data count: ${data?.length}, Supabase count: ${count}`);

        if (dbError) {
          console.error('Supabase fetch error:', dbError);
          throw dbError;
        }

        const sortedWells = (data || []).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setWells(sortedWells);

        if (sortedWells.length > 0 && sortedWells[0].latitude && sortedWells[0].longitude) {
          setViewState(prevState => ({
            ...prevState,
            latitude: sortedWells[0].latitude as number,
            longitude: sortedWells[0].longitude as number,
          }));
        } 

      } catch (err: any) {
        console.error('Error fetching wells for map:', err);
        setError('Failed to load well data for the map.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchWells();
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

  const handleMarkerClick = (wellId: string) => {
    router.push(`/${locale}/well/${wellId}`);
  };

  const handleZoomToWell = useCallback((wellId: string) => {
    const well = wells.find(w => w.id === wellId);
    if (well && well.latitude && well.longitude && mapRef.current) {
      mapRef.current.flyTo({
        center: [well.longitude, well.latitude],
        zoom: 10,
        duration: 1500
      });
    }
  }, [wells]);

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
          {filteredWells.map((well) => (
            <MapWellListItem
              key={well.id}
              well={well}
              openFaultDialog={() => {
                const wellToSimulate = wells.find(w => w.id === well.id);
                if (wellToSimulate) openFaultDialog(wellToSimulate);
              }}
              onZoomToWell={handleZoomToWell}
            />
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
          {filteredWells.map(well => (
            well.latitude && well.longitude && (
              <Marker
                key={well.id}
                longitude={well.longitude}
                latitude={well.latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(well.id);
                }}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 border-white cursor-pointer shadow",
                  getMarkerColor(well.status)
                )} title={well.name} />
              </Marker>
            )
          ))}
        </Map>
      </div>
    </div>
  );
} 