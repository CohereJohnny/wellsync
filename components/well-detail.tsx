'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FaultHistoryTable } from '@/components/fault-history-table'
import { ChatPanel } from '@/components/chat/chat-panel'
import type { Well, Fault } from '@/lib/types'
import { cn } from '@/lib/utils'

interface WellDetailProps {
  wellId: string
  initialWell: Well
  initialFaults: Fault[]
}

export function WellDetail({ wellId, initialWell, initialFaults }: WellDetailProps) {
  const [well, setWell] = useState<Well>(initialWell)
  const [faults, setFaults] = useState<Fault[]>(initialFaults)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

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
          </div>
        </Card>

        {/* Right Panel - Chat */} 
        {/* Ensure ChatPanel container takes full height */}
        <div className="h-full min-h-[500px]"> {/* Added min-height */} 
          <ChatPanel className="h-full" wellId={wellId} />
        </div>
      </div>

      {/* Fault History Section Card Styling */}
      <Card className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          {/* Heading 2 Style */}
          <h2 className="text-xl font-semibold text-blue-800">Fault History</h2> {/* Navy -> blue-800 */} 
          <FaultHistoryTable 
            faults={faults} 
            isLoading={isLoading} 
          />
        </div>
      </Card>
    </div>
  );
} 