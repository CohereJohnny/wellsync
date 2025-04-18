'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { FaultHistoryTable } from '@/components/fault-history-table'
import type { Well, Fault } from '@/lib/types'

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Well Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{well.name}</h1>
              <Badge variant={well.status === 'active' ? 'default' : 'destructive'}>
                {well.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Camp</h2>
                <p className="text-lg">{well.camp}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Formation</h2>
                <p className="text-lg">{well.formation}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Location</h2>
                <p className="text-lg">{well.location}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Last Updated</h2>
                <p className="text-lg">
                  {new Date(well.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">Technical Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Depth</h3>
                  <p>{well.depth} ft</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Pressure</h3>
                  <p>{well.pressure} psi</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Temperature</h3>
                  <p>{well.temperature}°F</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Flow Rate</h3>
                  <p>{well.flow_rate} bbl/d</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Panel - Chat (Placeholder) */}
        <Card className="p-6">
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Chat panel coming in future sprint
          </div>
        </Card>
      </div>

      {/* Fault History Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fault History</h2>
          <FaultHistoryTable 
            faults={faults} 
            isLoading={isLoading} 
          />
        </div>
      </Card>
    </div>
  )
} 