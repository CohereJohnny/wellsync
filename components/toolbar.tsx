'use client'

import { useCallback, useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { FaultSimulationForm } from './fault-simulation-form'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Well, Part } from '@/lib/types'

export type WellFilters = {
  camp?: string | null
  formation?: string | null
  status?: string | null
}

export function Toolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wells, setWells] = useState<Well[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch wells and parts when dialog opens
  useEffect(() => {
    async function fetchData() {
      if (!dialogOpen) return
      
      try {
        setIsLoading(true)
        setError(null)

        // Fetch operational wells
        const { data: wellsData, error: wellsError } = await supabase
          .from('wells')
          .select('*')
          .eq('status', 'Operational')

        if (wellsError) throw wellsError

        // Fetch all parts
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*')

        if (partsError) throw partsError

        setWells(wellsData || [])
        setParts(partsData || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
        toast({
          title: 'Error',
          description: 'Failed to load wells and parts',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dialogOpen, toast])

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: keyof WellFilters, value: string) => {
    const queryString = createQueryString(name, value === 'all' ? null : value)
    router.push(pathname + '?' + queryString)
  }

  const handleFaultSubmit = async (data: { wellId: string; partId: string; faultType: string }) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/faults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create fault')
      }

      toast({
        title: 'Fault Created',
        description: 'The fault has been successfully simulated.',
      })
      
      setDialogOpen(false)
      // Refresh the page to show updated well status
      router.refresh()
    } catch (error: any) {
      console.error('Error creating fault:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create fault',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b">
      <Select
        onValueChange={(value) => updateFilter('camp', value)}
        defaultValue="all"
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Camps" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Camps</SelectItem>
          <SelectItem value="Midland">Midland</SelectItem>
          <SelectItem value="Delaware">Delaware</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => updateFilter('formation', value)}
        defaultValue="all"
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Formations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Formations</SelectItem>
          <SelectItem value="Spraberry">Spraberry</SelectItem>
          <SelectItem value="Wolfcamp">Wolfcamp</SelectItem>
          <SelectItem value="Bone Spring">Bone Spring</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => updateFilter('status', value)}
        defaultValue="all"
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Operational">Operational</SelectItem>
          <SelectItem value="Fault">Fault</SelectItem>
          <SelectItem value="Pending Repair">Pending Repair</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Trigger Fault
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Simulate Fault</DialogTitle>
            <DialogDescription>
              Select a well and fault type to simulate a fault condition.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading wells and parts...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              {error}
            </div>
          ) : (
            <FaultSimulationForm
              wells={wells}
              parts={parts}
              onSubmit={handleFaultSubmit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 