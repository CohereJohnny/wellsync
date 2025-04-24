'use client'

import { FaultSimulationForm } from './fault-simulation-form'
import { Well, Part } from '@/lib/types'
import { useTranslations } from 'next-intl'

interface FaultSimulationModalContentProps {
  currentWell: Well;
  parts: Part[];
  onSubmit: (data: { 
    wellId: string; 
    partId: string; 
    faultType: string; 
    description?: string; 
  }) => Promise<void>;
  isLoadingWellsParts: boolean; // Prop to indicate if parent is loading data
  loadingError: string | null; // Prop to pass loading error from parent
}

export function FaultSimulationModalContent({
  currentWell,
  parts,
  onSubmit,
  isLoadingWellsParts,
  loadingError,
}: FaultSimulationModalContentProps) {
  const t = useTranslations('faultSimulationModal');

  if (isLoadingWellsParts) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('loading')}
      </div>
    )
  }
  
  if (loadingError) {
    return (
      <div className="p-4 text-center text-red-500">
        {loadingError}
      </div>
    )
  }

  // If no parts are available (after loading), show a message
  if (!currentWell || !parts?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('unavailable')}
      </div>
    )
  }

  return (
    <FaultSimulationForm
      currentWell={currentWell}
      parts={parts}
      onSubmit={onSubmit}
    />
  )
} 