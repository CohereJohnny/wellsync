'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Transformer } from '@/lib/types';

// Define the view types and filter types
export type ViewType = 'card' | 'table' | 'map';

export interface TransformerFilters {
  substation?: string | null;
  type?: string | null;
  status?: string | null;
}

export interface ToolbarProps {
  openFaultDialog: (transformer: Transformer | null) => void;
}

export function TransformerToolbar({ openFaultDialog }: ToolbarProps) {
  const t = useTranslations('toolbar');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the current view mode from URL or default to 'card'
  const view = searchParams.get('view') as ViewType || 'card';
  
  // Get current filter values from URL
  const currentFilters: TransformerFilters = {
    substation: searchParams.get('substation'),
    type: searchParams.get('type'),
    status: searchParams.get('status'),
  };

  // Update URL with new search parameters
  const updateSearchParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === 'all') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Handle view change
  const handleViewChange = useCallback(
    (newView: ViewType) => {
      updateSearchParams('view', newView);
    },
    [updateSearchParams]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (name: keyof TransformerFilters, value: string) => {
      updateSearchParams(name, value);
    },
    [updateSearchParams]
  );

  // Open fault simulation dialog with no transformer (will be chosen in dialog)
  const handleTriggerFault = useCallback(() => {
    openFaultDialog(null);
  }, [openFaultDialog]);

  return (
    <div className="container mx-auto px-4 py-2 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-center justify-between">
      {/* View Toggle */}
      <div>
        <Tabs defaultValue={view} onValueChange={(value) => handleViewChange(value as ViewType)}>
          <TabsList>
            <TabsTrigger value="card">{t('cardView')}</TabsTrigger>
            <TabsTrigger value="table">{t('tableView')}</TabsTrigger>
            <TabsTrigger value="map">{t('mapView')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Filters Section */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Substation Filter */}
        <Select
          value={currentFilters.substation || 'all'}
          onValueChange={(value) => handleFilterChange('substation', value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t('substation')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSubstations')}</SelectItem>
            <SelectItem value="heights">Heights</SelectItem>
            <SelectItem value="midtown">Midtown</SelectItem>
            <SelectItem value="galleria">Galleria</SelectItem>
            <SelectItem value="medical-center">Medical Center</SelectItem>
            <SelectItem value="energy-corridor">Energy Corridor</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Type Filter */}
        <Select
          value={currentFilters.type || 'all'}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t('type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value="distribution">Distribution</SelectItem>
            <SelectItem value="power">Power</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Status Filter */}
        <Select
          value={currentFilters.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="fault">Fault</SelectItem>
            <SelectItem value="pending-repair">Pending Repair</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Trigger Fault Button */}
        <Button 
          variant="secondary" 
          className="ml-auto sm:ml-4" 
          onClick={handleTriggerFault}
        >
          {t('triggerFault')}
        </Button>
      </div>
    </div>
  );
} 