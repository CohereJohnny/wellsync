'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabase } from '@/context/supabase-context';
import { Transformer, Fault } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaultHistoryTable } from '@/components/fault-history-table';
import { Chat } from '@/components/chat/chat';
import { RealtimeChannel } from '@supabase/supabase-js';
import { FaultSimulationDialog } from '@/components/fault-simulation-dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function TransformerDetail() {
  const params = useParams();
  const transformerId = params.id as string;
  const supabase = useSupabase();
  const t = useTranslations('transformerDetail');
  const tStatus = useTranslations('transformerStatus');
  const { toast } = useToast();

  const [transformer, setTransformer] = useState<Transformer | null>(null);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Function to get status text with translation
  const getStatusText = (status: string) => {
    const lowerStatus = status?.toLowerCase().replace(/\s+/g, '') || '';
    if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair') {
      return tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair');
    }
    return status;
  };

  // Get status badge style based on status
  const getStatusBadgeClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus === 'operational') {
      return 'bg-green-100 text-green-800';
    } else if (lowerStatus === 'fault') {
      return 'bg-red-100 text-red-800';
    } else if (lowerStatus === 'pendingrepair' || lowerStatus === 'pending repair') {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Get marker color based on status
  const getMarkerColor = (status: string): string => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'operational') return 'bg-green-500';
    if (lowerStatus === 'fault') return 'bg-red-500';
    if (lowerStatus === 'pending repair' || lowerStatus === 'pendingrepair') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('lastMaintenanceNA');
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  // Function to handle realtime transformer updates
  const handleTransformerUpdate = (payload: any) => {
    if (payload.new && payload.new.id === transformerId) {
      console.log('Realtime transformer update received:', payload);
      setTransformer(payload.new as Transformer);
    }
  };

  // Function to handle realtime fault updates
  const handleFaultUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT' && payload.new && payload.new.transformer_id === transformerId) {
      console.log('Realtime fault insert received:', payload);
      setFaults(prevFaults => [payload.new as Fault, ...prevFaults]);
    }
  };

  // Function to load transformer data
  const loadTransformerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch transformer details
      const { data: transformerData, error: transformerError } = await supabase
        .from('transformers')
        .select('*')
        .eq('id', transformerId)
        .single();

      if (transformerError) {
        throw transformerError;
      }

      setTransformer(transformerData as Transformer);

      // Fetch fault history
      const { data: faultData, error: faultError } = await supabase
        .from('faults')
        .select('*')
        .eq('transformer_id', transformerId)
        .order('timestamp', { ascending: false });

      if (faultError) {
        throw faultError;
      }

      setFaults(faultData as Fault[]);
    } catch (err: any) {
      console.error('Error loading transformer data:', err);
      setError(err.message || 'Failed to load transformer data');
      toast({
        title: 'Error',
        description: 'Failed to load transformer data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up realtime subscriptions
  const setupRealtimeSubscription = () => {
    if (realtimeChannel) {
      console.log('Realtime subscription already active');
      return;
    }

    try {
      console.log('Setting up realtime subscription for transformer and faults');
      const channel = supabase
        .channel('transformer-detail-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'transformers', filter: `id=eq.${transformerId}` },
          handleTransformerUpdate
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'faults', filter: `transformer_id=eq.${transformerId}` },
          handleFaultUpdate
        )
        .subscribe();

      setRealtimeChannel(channel);
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
    }
  };

  // Effect for initial data load
  useEffect(() => {
    if (transformerId) {
      loadTransformerData();
      setupRealtimeSubscription();
    }

    // Cleanup function
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        setRealtimeChannel(null);
      }
    };
  }, [transformerId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !transformer) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <h2 className="text-lg font-semibold">Error Loading Transformer</h2>
          <p>{error || 'Transformer not found'}</p>
          <Button 
            onClick={loadTransformerData} 
            variant="outline" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left column - Transformer Details - 3/5 width on medium+ screens */}
        <div className="md:col-span-3 space-y-6">
          {/* Transformer Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{transformer.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusBadgeClass(transformer.status)}>
                  {getStatusText(transformer.status)}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => setDialogOpen(true)}
              variant="secondary"
            >
              {t('triggerFaultButton')}
            </Button>
          </div>

          {/* Transformer Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{transformer.name} Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('substationLabel')}</p>
                <p>{transformer.substation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('typeLabel')}</p>
                <p>{transformer.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('lastMaintenanceLabel')}</p>
                <p>{formatDate(transformer.last_maintenance)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('currentFaultTitle')}</p>
                {transformer.fault_details ? (
                  <div className="flex flex-col">
                    <span>{t('partLabel')} {transformer.fault_details.part_id}</span>
                    {transformer.fault_details.part_specifications && transformer.fault_details.part_specifications.serial_number && (
                      <span>{t('serialNumberLabel')}: {transformer.fault_details.part_specifications.serial_number}</span>
                    )}
                    <span>{t('typeLabel')} {transformer.fault_details.fault_type}</span>
                  </div>
                ) : (
                  <p>None</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {t('mapLocationTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transformer.latitude && transformer.longitude && mapboxAccessToken ? (
                <div className="h-48 rounded-md overflow-hidden">
                  <Map
                    mapboxAccessToken={mapboxAccessToken}
                    initialViewState={{
                      longitude: transformer.longitude,
                      latitude: transformer.latitude,
                      zoom: 14
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                  >
                    <Marker
                      longitude={transformer.longitude}
                      latitude={transformer.latitude}
                    >
                      <div 
                        className={`w-5 h-5 rounded-full border-2 border-white shadow-md ${getMarkerColor(transformer.status)}`}
                        title={transformer.name}
                      ></div>
                    </Marker>
                  </Map>
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-400 border rounded-md flex items-center justify-center h-48">
                  {transformer.latitude && transformer.longitude ? (
                    <div className="text-center">
                      Lat: {transformer.latitude.toFixed(4)}, Long: {transformer.longitude.toFixed(4)}
                      <p className="text-xs mt-1">{mapboxAccessToken ? 'Error loading map' : 'MapBox token not configured'}</p>
                    </div>
                  ) : (
                    <p>No location data available</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fault History */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('faultHistoryTitle')}</h2>
            <FaultHistoryTable faults={faults} />
          </div>
        </div>

        {/* Right column - Chat - 2/5 width on medium+ screens */}
        <div className="md:col-span-2 h-full">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>{t('aiAssistantTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Chat resourceId={transformerId} resourceType="transformer" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fault Simulation Dialog */}
      <FaultSimulationDialog
        isOpen={dialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
        initialWell={transformer}
      />
    </div>
  );
} 