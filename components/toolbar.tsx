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
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { AlertTriangle, RotateCcw, LayoutGrid, List, Map } from 'lucide-react'
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

export type ViewType = 'card' | 'table' | 'map'

interface ToolbarProps {
  openFaultDialog: (well: Well | null) => void;
}

export function Toolbar({ openFaultDialog }: ToolbarProps) {
  const t = useTranslations('toolbar');
  const tStatus = useTranslations('wellStatus');
  const supabase = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const currentView = (searchParams.get('view') || 'card') as ViewType

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

  const updateView = (newView: ViewType) => {
    const queryString = createQueryString('view', newView)
    router.push(pathname + '?' + queryString)
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
    <div className="w-full border-b bg-background py-4 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6">
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
            aria-pressed={currentView === 'card'}
          >
            <LayoutGrid className="h-4 w-4" />
            {t('view.card')}
          </Button>
          <Button
            variant={currentView === 'table' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => updateView('table')}
            className="gap-2"
            aria-pressed={currentView === 'table'}
          >
            <List className="h-4 w-4" />
            {t('view.table')}
          </Button>
          <Button
            variant={currentView === 'map' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => updateView('map')}
            className="gap-2"
            aria-pressed={currentView === 'map'}
          >
            <Map className="h-4 w-4" />
            {t('view.map')}
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
          
          <Button 
            variant="destructive" 
            className="gap-2 hover:bg-red-600 border"
            onClick={() => openFaultDialog(null)}
          >
            <AlertTriangle className="h-4 w-4" />
            {t('actions.triggerFault')}
          </Button>
        </div>
      </div>
    </div>
  )
} 