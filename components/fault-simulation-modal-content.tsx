'use client'

import { FaultSimulationForm } from './fault-simulation-form'
import { Well, Part } from '@/lib/types'

interface FaultSimulationModalContentProps {
  wells: Well[];
  parts: Part[];
  onSubmit: (data: { 
    wellId: string; 
    partId: string; 
    faultType: string; 
    description?: string; 
  }) => Promise<void>;
  isLoadingWellsParts: boolean; // Prop to indicate if parent is loading data
  loadingError: string | null; // Prop to pass loading error from parent
  defaultWellId?: string; // Add prop here too
}

export function FaultSimulationModalContent({
  wells,
  parts,
  onSubmit,
  isLoadingWellsParts,
  loadingError,
  defaultWellId // Destructure prop
}: FaultSimulationModalContentProps) {

  if (isLoadingWellsParts) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading wells and parts...
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

  // If no wells or parts are available (after loading), show a message
  if (!wells?.length || !parts?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No wells or parts available for fault simulation.
      </div>
    )
  }

  return (
    <FaultSimulationForm
      wells={wells}
      parts={parts}
      onSubmit={onSubmit} // Pass the onSubmit handler down
      defaultWellId={defaultWellId} // Pass prop down to form
    />
  )
} 