'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/context/supabase-context'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Well } from "@/lib/types"
import { cn } from "@/lib/utils"

export function WellTableView() {
  const supabase = useSupabase()
  const searchParams = useSearchParams()
  const [wells, setWells] = useState<Well[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWells = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let query = supabase.from('wells').select('*').order('name')

        const status = searchParams.get('status')
        const camp = searchParams.get('camp')
        const formation = searchParams.get('formation')

        if (status && status !== 'all') {
            query = query.eq('status', status)
        }
        if (camp && camp !== 'all') {
            query = query.eq('camp', camp)
        }
        if (formation && formation !== 'all') {
            query = query.eq('formation', formation)
        }

        const { data, error: dbError } = await query

        if (dbError) {
          throw dbError
        }
        setWells(data || [])
      } catch (err: any) {
        console.error("Error fetching wells for table view:", err)
        setError(err.message || 'Failed to load wells')
        setWells([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWells()
  }, [searchParams, supabase])

  // *** Add new useEffect for Realtime Updates ***
  useEffect(() => {
    const channel = supabase
      .channel('well-list-changes') // Unique channel name
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'wells',
          // No filter here initially, handle updates based on current state
        },
        (payload) => {
          console.log('Well change received!', payload)

          if (payload.eventType === 'INSERT') {
            const newWell = payload.new as Well
            // We might need to re-apply filters here or fetch again
            // For simplicity now, just add it if it wasn't already somehow there
            setWells((currentWells) => {
              if (currentWells.some(w => w.id === newWell.id)) {
                return currentWells; // Already exists, maybe updated below
              }
              // TODO: Re-apply filters before adding?
              return [...currentWells, newWell].sort((a, b) => a.name.localeCompare(b.name)); // Keep sorted
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedWell = payload.new as Well
            setWells((currentWells) =>
              currentWells.map((well) =>
                well.id === updatedWell.id ? updatedWell : well
              )
            )
            // TODO: Check if the updated well still matches filters?
          } else if (payload.eventType === 'DELETE') {
            const oldWellId = payload.old.id
            setWells((currentWells) =>
              currentWells.filter((well) => well.id !== oldWellId)
            )
          }
        }
      )
      .subscribe()

    // Cleanup function to remove subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const getBadgeClasses = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    const bgColor = lowerStatus === 'operational' ? 'bg-green-500' : 
                    lowerStatus === 'fault' ? 'bg-red-500' : 
                    'bg-yellow-500'; // Default/Pending color
    return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor);
  }

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Loading wells...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error loading wells: {error}</div>;
  }

  if (!wells || wells.length === 0) {
    return <div className="p-6 text-center text-muted-foreground">No wells found matching your criteria.</div>;
  }

  return (
    <Table className="bg-white shadow-sm rounded-lg">
      <TableCaption>A list of wells matching the current filters.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Well Name</TableHead>
          <TableHead>Camp</TableHead>
          <TableHead>Formation</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Last Maintenance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wells.map((well) => (
          <TableRow key={well.id} className="odd:bg-gray-100 hover:bg-muted/50 transition-colors">
            <TableCell className="font-medium">
              <Link href={`/well/${well.id}`} className="hover:underline text-blue-600">
                {well.name}
              </Link>
            </TableCell>
            <TableCell>{well.camp}</TableCell>
            <TableCell>{well.formation}</TableCell>
            <TableCell>
              <Badge className={getBadgeClasses(well.status)}>
                {well.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {well.last_maintenance
                ? new Date(well.last_maintenance).toLocaleDateString()
                : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 