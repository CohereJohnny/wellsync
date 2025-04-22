'use client'

import { useEffect, useState } from 'react'
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

interface WellDetailProps {
  wellId: string
  initialWell: Well
  initialFaults: Fault[]
}

export function WellDetail({ wellId, initialWell, initialFaults }: WellDetailProps) {
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
          title: "Error",
          description: "Failed to load parts for fault simulation.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingParts(false)
      }
    }
    fetchParts()
  }, [toast, supabase])

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
        throw new Error(errorData.details || 'Failed to create fault');
      }

      toast({
        title: 'Fault Created',
        description: 'The fault has been successfully simulated for this well.',
      });
      
      setDialogOpen(false);
      // No router.refresh() needed, rely on realtime updates handled by existing useEffect

    } catch (error: any) {
      console.error('Error creating fault:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create fault for this well',
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

  // Badge styling based on spec
  const getBadgeClasses = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    const bgColor = lowerStatus === 'operational' ? 'bg-green-500' : 
                    lowerStatus === 'fault' ? 'bg-red-500' : 
                    'bg-yellow-500'; // Default/Pending color
    return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor); // Use text-xs for smaller badges here
  }

  return (
    // Add max-width, centering, and padding to the container
    <div className="max-w-screen-xl mx-auto p-6 space-y-6">
      {/* Maintain grid layout, ensure gap is applied */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Well Information Card Styling */}
        <Card className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {/* Heading 1 Style */}
              <h1 className="text-2xl font-bold text-blue-800">{well.name}</h1> {/* Navy -> blue-800 */} 
              {/* Apply consistent badge styling */}
              <Badge className={getBadgeClasses(well.status)}>
                {well.status}
              </Badge>
            </div>

            {/* Key-Value Info Styling */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                {/* Label style: text-sm font-medium text-gray-500 */}
                <h2 className="text-sm font-medium text-gray-500">Camp</h2>
                {/* Value style: text-lg */} 
                <p className="text-lg text-gray-800">{well.camp}</p> {/* Added text color */} 
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Formation</h2>
                <p className="text-lg text-gray-800">{well.formation}</p>
              </div>
              {/* Location display using optional properties */}
              {well.latitude != null && well.longitude != null && (
                <div className="col-span-2">
                  <h2 className="text-sm font-medium text-gray-500">Location</h2>
                  <p className="text-lg text-gray-800">{`${well.latitude?.toFixed(4)}, ${well.longitude?.toFixed(4)}`}</p>
                </div>
              )}
              {/* Last Maintenance display using optional property */}
              {well.last_maintenance && (
                 <div>
                    <h2 className="text-sm font-medium text-gray-500">Last Maintenance</h2>
                    <p className="text-lg text-gray-800">
                    {new Date(well.last_maintenance).toLocaleDateString()}
                    </p>
                 </div>
              )}
               {/* Display current fault details if status is Fault and details exist */}
               {well.status === 'Fault' && well.fault_details && (
                 <div className="col-span-2 border-t pt-4 mt-4">
                    <h2 className="text-sm font-medium text-red-600">Current Fault</h2>
                    <p className="text-lg text-gray-800">
                      Part: {well.fault_details?.part_id || 'N/A'}, Type: {well.fault_details?.fault_type || 'N/A'}
                    </p>
                 </div>
               )}
            </div>

            {/* Re-add Map Section */}
            {well.latitude != null && well.longitude != null && (
              <div className="mt-6 border-t pt-4">
                <h2 className="text-sm font-medium text-gray-500 mb-2">Map Location</h2>
                <MapView 
                  latitude={well.latitude}
                  longitude={well.longitude}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel - Chat */} 
        {/* Ensure ChatPanel container takes full height */}
        <div className="h-full min-h-[500px]"> {/* Added min-height */} 
          <ChatPanel className="h-full" wellId={wellId} />
        </div>
      </div>

      {/* Fault History Section Card Styling & Dialog Wrapper */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}> 
        <Card className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-4">
            {/* Header with Title and Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-800">Fault History</h2>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2 hover:bg-red-600" size="sm">
                  <AlertTriangle className="h-4 w-4" />
                  Trigger Fault
                </Button>
              </DialogTrigger>
            </div>
            <FaultHistoryTable 
              faults={faults} 
              isLoading={isLoadingFaults}
            />
          </div>
        </Card>
        {/* Dialog Content (Modal) */}
        <DialogContent className="sm:max-w-[425px] shadow-lg bg-white">
            <DialogHeader>
              <DialogTitle>Simulate Fault for {well.name}</DialogTitle>
              <DialogDescription>
                Select a part and fault type to simulate for this specific well.
              </DialogDescription>
            </DialogHeader>
            <FaultSimulationModalContent 
              wells={[well]}
              parts={parts}
              onSubmit={handleFaultSubmit}
              isLoadingWellsParts={isLoadingParts}
              loadingError={loadingPartsError}
              defaultWellId={well.id}
            />
          </DialogContent>
      </Dialog>
    </div>
  );
} 