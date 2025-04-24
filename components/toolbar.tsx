'use client'

import { useState, useEffect } from 'react'
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
import { AlertTriangle, RotateCcw, LayoutGrid, List } from 'lucide-react'
import { FaultSimulationForm } from './fault-simulation-form'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/context/supabase-context'
import { Well, Part } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export type WellFilters = {
  camp?: string | null
  formation?: string | null
  status?: string | null
}

export function Toolbar() {
  const t = useTranslations('toolbar');
  const tStatus = useTranslations('wellStatus');
  const supabase = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [wells, setWells] = useState<Well[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWellForSimulation, setSelectedWellForSimulation] = useState<Well | null>(null)
  const { toast } = useToast()
  const currentView = searchParams.get('view') || 'card'

  // Fetch wells and parts when dialog opens
  useEffect(() => {
    async function fetchData() {
      if (!dialogOpen) return
      
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all wells
        const { data: wellsData, error: wellsError } = await supabase
          .from('wells')
          .select('*')

        if (wellsError) throw wellsError

        // Fetch all parts
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*')

        if (partsError) throw partsError

        // Sort wells alphabetically by name
        const sortedWells = wellsData?.sort((a, b) => a.name.localeCompare(b.name)) || [];
        setWells(sortedWells)
        setParts(partsData || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
        toast({
          title: t('toasts.fetchErrorTitle'),
          description: t('toasts.fetchErrorDescription'),
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dialogOpen, toast, supabase, t])

  const createQueryString = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }

  const updateFilter = (name: keyof WellFilters, value: string) => {
    const queryString = createQueryString(name, value === 'all' ? null : value)
    router.push(pathname + '?' + queryString)
  }

  const updateView = (newView: 'card' | 'table') => {
    const queryString = createQueryString('view', newView)
    router.push(pathname + '?' + queryString)
  }

  const handleFaultSubmit = async (data: { 
    wellId: string; 
    partId: string; 
    faultType: string; 
    description?: string;
  }) => {
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
        throw new Error(errorData.details || t('toasts.faultErrorDescription'))
      }

      toast({
        title: t('toasts.faultCreatedTitle'),
        description: t('toasts.faultCreatedDescription'),
      })
      
      setDialogOpen(false)
      // Refresh the page to show updated well status
      router.refresh()
    } catch (error: any) {
      console.error('Error creating fault:', error)
      toast({
        title: t('toasts.faultErrorTitle'),
        description: error.message || t('toasts.faultErrorDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      const { error } = await supabase.rpc('reset_demo_data');

      if (error) {
        console.error('Error resetting demo data:', error);
        throw new Error(error.message || t('toasts.resetErrorDescription'));
      }

      toast({
        title: t('toasts.resetSuccessTitle'),
        description: t('toasts.resetSuccessDescription'),
      });

      // Refresh the page to reflect changes
      router.refresh();

    } catch (error: any) {
      console.error('Error resetting demo:', error);
      toast({
        title: t('toasts.resetErrorTitle'),
        description: error.message || t('toasts.resetErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-4 p-4 bg-white shadow-sm">
      <div className="flex items-center flex-wrap gap-4">
        <Select
          onValueChange={(value) => updateFilter('camp', value)}
          defaultValue={searchParams.get('camp') || 'all'}
        >
          <SelectTrigger className="w-[180px] text-sm">
            <SelectValue placeholder={t('filters.allCamps')} />
          </SelectTrigger>
          <SelectContent className="bg-white text-sm">
            <SelectItem value="all">{t('filters.allCamps')}</SelectItem>
            <SelectItem value="Midland">{t('filters.campMidland')}</SelectItem>
            <SelectItem value="Delaware">{t('filters.campDelaware')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => updateFilter('formation', value)}
          defaultValue={searchParams.get('formation') || 'all'}
        >
          <SelectTrigger className="w-[180px] text-sm">
            <SelectValue placeholder={t('filters.allFormations')} />
          </SelectTrigger>
          <SelectContent className="bg-white text-sm">
            <SelectItem value="all">{t('filters.allFormations')}</SelectItem>
            <SelectItem value="Wolfcamp">{t('filters.formationWolfcamp')}</SelectItem>
            <SelectItem value="Bone Spring">{t('filters.formationBoneSpring')}</SelectItem>
            <SelectItem value="Spraberry">{t('filters.formationSpraberry')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => updateFilter('status', value)}
          defaultValue={searchParams.get('status') || 'all'}
        >
          <SelectTrigger className="w-[180px] text-sm">
            <SelectValue placeholder={t('filters.allStatuses')} />
          </SelectTrigger>
          <SelectContent className="bg-white text-sm">
            <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
            <SelectItem value="Operational">{tStatus('operational')}</SelectItem>
            <SelectItem value="Fault">{tStatus('fault')}</SelectItem>
            <SelectItem value="Pending Repair">{tStatus('pendingrepair')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <Button
          variant={currentView === 'card' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => updateView('card')}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          {t('view.card')}
        </Button>
        <Button
          variant={currentView === 'table' ? 'secondary' : 'ghost'} 
          size="sm"
          onClick={() => updateView('table')}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          {t('view.table')}
        </Button>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResetDemo} 
          disabled={isResetting}
          className="gap-2"
        >
          <RotateCcw className={cn("h-4 w-4", isResetting && "animate-spin")} />
          {isResetting ? t('actions.resettingDemo') : t('actions.resetDemo')}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        // Reset selected well when dialog closes
        if (!open) {
          setSelectedWellForSimulation(null);
        }
      }}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="gap-2 hover:bg-red-600 border">
            <AlertTriangle className="h-4 w-4" />
            {t('actions.triggerFault')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] shadow-lg bg-white">
          <DialogHeader>
            <DialogTitle>{t('simulationDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('simulationDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4">
            {isLoading ? (
              <p>{t('simulationDialog.loading')}</p>
            ) : error ? (
              <p className="text-red-500">{t('simulationDialog.errorPrefix')}{error}</p>
            ) : (
              <>
                {/* Well Selector specific to the Toolbar Dialog */}
                <Select 
                  value={selectedWellForSimulation?.id || ''} 
                  onValueChange={(wellId) => {
                    const selected = wells.find(w => w.id === wellId);
                    setSelectedWellForSimulation(selected || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('simulationDialog.selectWellPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {wells.map((well) => (
                      <SelectItem key={well.id} value={well.id}>
                        {well.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Conditionally render the form only when a well is selected */}
                {selectedWellForSimulation && (
                  <FaultSimulationForm
                    currentWell={selectedWellForSimulation} // Pass the selected Well object
                    parts={parts}
                    onSubmit={handleFaultSubmit}
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 