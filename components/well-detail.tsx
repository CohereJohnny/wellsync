'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSupabase } from '@/context/supabase-context'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaultHistoryTable } from '@/components/fault-history-table'
import { ChatPanel } from '@/components/chat/chat-panel'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { FaultSimulationDialog } from './fault-simulation-dialog'
import type { Well, Fault, Part } from '@/lib/types'
import { cn } from '@/lib/utils'
import MapView from '@/components/map-view'
import { useTranslations } from 'next-intl'
import Map, { Marker } from 'react-map-gl/mapbox'

interface WellDetailProps {
  wellId: string
  initialWell: Well
  initialFaults: Fault[]
}

export function WellDetail({ wellId, initialWell, initialFaults }: WellDetailProps) {
  const t = useTranslations('wellDetail')
  const tStatus = useTranslations('wellStatus')
  
  console.log(`[WellDetail ${wellId}] Initial status:`, initialWell?.status);
  const supabase = useSupabase()
  const [well, setWell] = useState<Well>(initialWell)
  const [faults, setFaults] = useState<Fault[]>(initialFaults)
  const [isLoadingFaults, setIsLoadingFaults] = useState(false)
  const [parts, setParts] = useState<Part[]>([])
  const [isLoadingParts, setIsLoadingParts] = useState(true)
  const [loadingPartsError, setLoadingPartsError] = useState<string | null>(null)
  const [isFaultDialogOpen, setIsFaultDialogOpen] = useState(false)
  
  useEffect(() => {
    async function fetchParts() {
      setIsLoadingParts(true)
      setLoadingPartsError(null)
      try {
        const { data, error } = await supabase.from('parts').select('*')
        if (error) throw error
        setParts(data || [])
      } catch (err: any) {
        console.error("Error fetching parts:", err)
        setLoadingPartsError(err.message)
      } finally {
        setIsLoadingParts(false)
      }
    }
    fetchParts()
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`fault-updates-${wellId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'faults',
          filter: `well_id=eq.${wellId}`,
        },
        async (payload) => {
          console.log('Received fault update:', payload)
          setIsLoadingFaults(true)
          try {
            const { data: updatedFaults, error: fetchError } = await supabase
              .from('faults')
              .select('*')
              .eq('well_id', wellId)
              .order('timestamp', { ascending: false })

            if (fetchError) throw fetchError
            setFaults(updatedFaults || [])
            console.log('[WellDetail] Faults state updated after realtime event.')
          } catch (error) {
            console.error('[WellDetail] Error refetching faults after realtime event:', error)
          } finally {
            setIsLoadingFaults(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [wellId, supabase])

  useEffect(() => {
    const wellChannel = supabase
      .channel(`well-detail-updates-${wellId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wells',
          filter: `id=eq.${wellId}`,
        },
        (payload) => {
          console.log('Received well update:', payload)

          if (payload.eventType === 'UPDATE') {
            const newWellData = payload.new as Partial<Well>
            setWell((current) => ({ ...current, ...newWellData }))
            console.log('[WellDetail] Well state updated after realtime event.')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(wellChannel)
    }
  }, [wellId, supabase])

  const getStatusText = (status: string): string => {
    const lowerStatus = status?.toLowerCase().replace(/\s+/g, '') || ''
    if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair') {
      return tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair')
    }
    return status
  }

  const getBadgeClasses = (status: string) => {
    const lowerStatus = status?.toLowerCase() || ''
    const bgColor = lowerStatus === 'operational' ? 'bg-green-500' : 
                    lowerStatus === 'fault' ? 'bg-red-500' : 
                    'bg-yellow-500'
    return cn('text-white px-2 py-0.5 text-xs font-medium rounded', bgColor)
  }

  const getMarkerColor = (status: string): string => {
    const lowerStatus = status?.toLowerCase() || ''
    if (lowerStatus === 'operational') return 'bg-green-500'
    if (lowerStatus === 'fault') return 'bg-red-500'
    if (lowerStatus === 'pending repair' || lowerStatus === 'pendingrepair') return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex justify-between items-center">
              <span>{well.name}</span>
              <Badge className={getBadgeClasses(well.status)}>{getStatusText(well.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">{t('campLabel')}:</span> {well.camp || 'N/A'}</div>
              <div><span className="font-medium">{t('formationLabel')}:</span> {well.formation || 'N/A'}</div>
              <div><span className="font-medium">{t('locationLabel')}:</span> {well.latitude?.toFixed(4)}, {well.longitude?.toFixed(4)}</div>
              <div><span className="font-medium">{t('lastMaintenanceLabel')}:</span> {well.last_maintenance ? new Date(well.last_maintenance).toLocaleDateString() : t('lastMaintenanceNA')}</div>
            </div>
            {well.status === 'Fault' && well.fault_details && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                <h4 className="font-semibold text-red-700 mb-1">{t('currentFaultTitle')}</h4>
                <p><span className="font-medium">{t('partLabel')}</span> {well.fault_details.part_id || 'Unknown Part'}</p>
                <p><span className="font-medium">{t('typeLabel')}</span> {well.fault_details.fault_type || 'Unknown Type'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('mapLocationTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64 md:h-80 lg:h-96">
            <Map
              initialViewState={{
                longitude: well.longitude || -98.5795,
                latitude: well.latitude || 39.8283,
                zoom: well.latitude && well.longitude ? 13 : 3
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/streets-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            >
              {well.latitude && well.longitude && (
                <Marker longitude={well.longitude} latitude={well.latitude} anchor="center">
                   <div 
                      className={cn(
                          "w-3 h-3 rounded-full border-2 border-white shadow cursor-pointer", 
                          getMarkerColor(well.status)
                      )}
                      title={well.name}
                  />
                </Marker>
              )}
            </Map>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('faultHistoryTitle')}</CardTitle>
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-1.5"
              onClick={() => setIsFaultDialogOpen(true)}
            >
               <AlertTriangle className="h-4 w-4" />
              {t('triggerFaultButton')}
            </Button>
          </CardHeader>
          <CardContent>
            <FaultHistoryTable faults={faults} isLoading={isLoadingFaults} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
         <Card className="h-[calc(100vh-12rem)] flex flex-col">
            <CardHeader>
               <CardTitle>{t('aiAssistantTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <ChatPanel wellId={wellId} />
            </CardContent>
          </Card>
        </div>

      <FaultSimulationDialog 
        isOpen={isFaultDialogOpen}
        onOpenChange={setIsFaultDialogOpen}
        initialWell={well}
      />
    </div>
  );
} 