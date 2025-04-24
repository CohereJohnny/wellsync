'use client'

import { useEffect, useState, useMemo } from 'react'
import { notFound } from 'next/navigation'
import { useSupabase } from '@/context/supabase-context'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FaultHistoryTable } from '@/components/fault-history-table'
import { ChatPanel } from '@/components/chat/chat-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FaultSimulationModalContent } from './fault-simulation-modal-content'
import type { Well, Fault, Part } from '@/lib/types'
import { cn } from '@/lib/utils'
import MapView from '@/components/map-view'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface WellDetailProps {
  wellId: string
  initialWell: Well
  initialFaults: Fault[]
}

export function WellDetail({ wellId, initialWell, initialFaults }: WellDetailProps) {
  const t = useTranslations('wellDetail')
  const tStatus = useTranslations('wellStatus')
  const tActions = useTranslations('toolbar.actions')
  const tToasts = useTranslations('wellDetail')
  
  console.log(`[WellDetail ${wellId}] Initial status:`, initialWell?.status); // Log initial status
  const supabase = useSupabase()
  const [well, setWell] = useState<Well>(initialWell)
  const [faults, setFaults] = useState<Fault[]>(initialFaults)
  const [isLoadingFaults, setIsLoadingFaults] = useState(false)
  const [parts, setParts] = useState<Part[]>([])
  const [isLoadingParts, setIsLoadingParts] = useState(true)
  const [loadingPartsError, setLoadingPartsError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmittingFault, setIsSubmittingFault] = useState(false)
  
  const { toast } = useToast()
  const router = useRouter()

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
        toast({
          title: tToasts('toastPartsErrorTitle'),
          description: tToasts('toastPartsErrorDescription'),
          variant: "destructive",
        })
      } finally {
        setIsLoadingParts(false)
      }
    }
    fetchParts()
  }, [toast, supabase, tToasts])

  useEffect(() => {
    const channel = supabase
      .channel('fault-updates')
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
          
          if (payload.eventType === 'INSERT') {
            // Add new fault to the list
            setFaults((current) => [payload.new as Fault, ...current])
          } else if (payload.eventType === 'UPDATE') {
            // Update existing fault
            setFaults((current) =>
              current.map((fault) =>
                fault.fault_id === payload.new.fault_id
                  ? { ...fault, ...payload.new }
                  : fault
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // Remove fault from list
            setFaults((current) =>
              current.filter((fault) => fault.fault_id !== payload.old.fault_id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [wellId, supabase])

  // Re-add Handle fault submission specific to this well
  const handleFaultSubmit = async (data: { 
    wellId: string; // Although we know the wellId, the form sends it
    partId: string; 
    faultType: string; 
    description?: string; 
  }) => {
    // Use the wellId from the component's context/props if needed, 
    // but the form data includes it, so we can use data.wellId
    if (data.wellId !== wellId) {
      console.warn('Submitting fault for a different well than the current detail page?');
      // Decide how to handle this - maybe use props wellId instead? For now, use form data.
    }
    
    try {
      setIsSubmittingFault(true);
      const response = await fetch('/api/faults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wellId: data.wellId, // Use ID from form data
          partId: data.partId,
          faultType: data.faultType,
          description: data.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || tToasts('toastFaultErrorDescription'));
      }

      toast({
        title: tToasts('toastFaultCreatedTitle'),
        description: tToasts('toastFaultCreatedDescription'),
      });
      
      setDialogOpen(false);
      // No router.refresh() needed, rely on realtime updates handled by existing useEffect

    } catch (error: any) {
      console.error('Error creating fault:', error);
      toast({
        title: tToasts('toastFaultErrorTitle'),
        description: error.message || tToasts('toastFaultErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingFault(false);
    }
  };

  // useEffect to subscribe to well updates (e.g., status changes)
  useEffect(() => {
    const wellChannel = supabase
      .channel('well-detail-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wells',
          filter: `id=eq.${wellId}`,
        },
        async (payload) => {
          console.log('Received well update:', payload)
          
          const newWellData = payload.new as Partial<Well>; // Type assertion
          const incomingStatus = newWellData?.status;
          
          if (incomingStatus) { 
             console.log(`[WellDetail ${wellId}] Realtime status update received:`, incomingStatus);
          } else if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) { 
             console.log(`[WellDetail ${wellId}] Realtime status update received but status is:`, (payload.new as any).status);
          } 

          if (payload.eventType === 'UPDATE') {
            // Check if the update tries to set status to Operational while active faults exist
            const hasActiveFaults = faults.some(fault => fault.status !== 'resolved'); // Use lowercase 'resolved'

            // Add detailed logging for debugging
            console.log(
              `[WellDetail ${wellId}] Checking status update. ` +
              `Incoming: ${incomingStatus}, HasActiveFaults: ${hasActiveFaults}, ` +
              `FaultsState: ${JSON.stringify(faults)}`
            );

            if (incomingStatus === 'Operational' && hasActiveFaults) {
              console.warn(`[WellDetail ${wellId}] Ignored realtime update setting status to 'Operational' because active faults exist.`);
              // Optionally update other fields but keep the status derived from faults
              setWell((current) => ({ 
                  ...current, 
                  ...newWellData, // Apply other updates from payload
                  status: current.status // Keep existing status (likely 'Fault')
              }));
            } else {
              // Apply the update as usual (including the status)
              setWell((current) => ({ ...current, ...newWellData }));
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(wellChannel)
    }
  }, [wellId, supabase, faults])

  // Status text lookup using tStatus
  const getStatusText = (status: string): string => {
    const lowerStatus = status?.toLowerCase().replace(/\s+/g, '') || '';
    // Check if a key exists for the status, otherwise return original status
    if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair') {
      return tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair');
    }
    return status; 
  }

  // Badge styling based on spec
  const getBadgeClasses = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    const bgColor = lowerStatus === 'operational' ? 'bg-green-500' : 
                    lowerStatus === 'fault' ? 'bg-red-500' : 
                    'bg-yellow-500'; // Default/Pending color
    return cn('text-white px-2 py-0.5 text-xs font-medium rounded', bgColor); // Use text-xs for smaller badges here
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto min-h-[calc(100vh-6rem)]">
      {/* Left Column: Well Info, Map, Fault History */}
      <div className="flex-1 space-y-6">
        {/* Well Info Card */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{well.name}</h2>
              <span className={getBadgeClasses(well.status)}>
                {getStatusText(well.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">{t('campLabel')}</p>
                <p className="font-medium">{well.camp}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('formationLabel')}</p>
                <p className="font-medium">{well.formation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('locationLabel')}</p>
                <p className="font-medium">{well.latitude}, {well.longitude}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('lastMaintenanceLabel')}</p>
                <p className="font-medium">{well.last_maintenance || t('lastMaintenanceNA')}</p>
              </div>
            </div>

            {/* Current Fault Display */}
            {well.status === 'Fault' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-700 font-semibold flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> {t('currentFaultTitle')}
                </h3>
                <div className="mt-2 text-sm">
                  {faults && faults.length > 0 && faults[0].status !== 'resolved' ? (
                    <>
                      <p>
                        <span className="font-medium">{t('partLabel')}</span> {faults[0].part_id}
                      </p>
                      <p>
                        <span className="font-medium">{t('typeLabel')}</span> {faults[0].fault_type}
                      </p>
                      {faults[0].description && <p className="mt-1">{faults[0].description}</p>}
                    </>
                  ) : (
                    <p className="italic text-gray-600">Loading fault details...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Map Card */}
        <Card className="overflow-hidden">
          <div className="px-6 pt-4 pb-2">
            <h3 className="text-lg font-semibold">{t('mapLocationTitle')}</h3>
          </div>
          <div className="h-[320px] w-full">
            <MapView
              latitude={well.latitude ?? 0}
              longitude={well.longitude ?? 0}
            />
          </div>
        </Card>

        {/* Fault History Card */}
        <Card>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('faultHistoryTitle')}</h3>
              
              {/* Trigger Fault Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    {tActions('triggerFault')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{t('dialogTitlePrefix')}{well.name}</DialogTitle>
                    <DialogDescription>
                      {t('dialogDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {isLoadingParts ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">{t('dialogLoadingParts')}</p>
                    </div>
                  ) : loadingPartsError ? (
                    <div className="p-8 text-center text-destructive">
                      <p>{t('dialogErrorPartsPrefix')}{loadingPartsError}</p>
                    </div>
                  ) : (
                    <FaultSimulationModalContent 
                      currentWell={well} 
                      parts={parts}
                      onSubmit={handleFaultSubmit}
                      isLoadingWellsParts={isLoadingParts}
                      loadingError={loadingPartsError}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
            
            <FaultHistoryTable faults={faults} isLoading={isLoadingFaults} />
          </div>
        </Card>
      </div>

      {/* Right Column: Chat */}
      <div className="lg:w-1/3 flex flex-col">
        <Card className="h-auto">
          <div className="p-4 font-medium border-b">{t('aiAssistantTitle')}</div>
          <div className="overflow-hidden" style={{ height: '450px' }}>
            <ChatPanel wellId={wellId} />
          </div>
        </Card>
      </div>
    </div>
  )
} 