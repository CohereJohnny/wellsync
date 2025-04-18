'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Well, Part } from '@/lib/types'

// Predefined fault types
const FAULT_TYPES = [
  { name: 'Pressure Loss', severity: 'high' },
  { name: 'Temperature Spike', severity: 'critical' },
  { name: 'Flow Rate Drop', severity: 'medium' },
  { name: 'Vibration', severity: 'low' },
  { name: 'Power Failure', severity: 'critical' },
  { name: 'Communication Loss', severity: 'high' },
]

interface FaultSimulationFormProps {
  wells?: Well[]
  parts?: Part[]
  onSubmit: (data: { wellId: string; partId: string; faultType: string }) => Promise<void>
}

export function FaultSimulationForm({
  wells = [],
  parts = [],
  onSubmit,
}: FaultSimulationFormProps) {
  const { toast } = useToast()
  const [selectedWell, setSelectedWell] = useState<string>('')
  const [selectedPart, setSelectedPart] = useState<string>('')
  const [selectedFaultType, setSelectedFaultType] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedWell || !selectedPart || !selectedFaultType) {
      toast({
        title: 'Validation Error',
        description: 'Please select a well, part, and fault type',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        wellId: selectedWell,
        partId: selectedPart,
        faultType: selectedFaultType,
      })
      toast({
        title: 'Success',
        description: 'Fault has been triggered successfully',
      })
      // Reset selections after successful submission
      setSelectedWell('')
      setSelectedPart('')
      setSelectedFaultType('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger fault',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If no wells or parts are available, show a message
  if (!wells?.length || !parts?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No wells or parts available for fault simulation.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Select value={selectedWell} onValueChange={setSelectedWell}>
        <SelectTrigger>
          <SelectValue placeholder="Select a well" />
        </SelectTrigger>
        <SelectContent>
          {wells.map((well) => (
            <SelectItem key={well.id} value={well.id}>
              {well.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPart} onValueChange={setSelectedPart}>
        <SelectTrigger>
          <SelectValue placeholder="Select a part" />
        </SelectTrigger>
        <SelectContent>
          {parts.map((part) => (
            <SelectItem key={part.part_id} value={part.part_id}>
              {part.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedFaultType} onValueChange={setSelectedFaultType}>
        <SelectTrigger>
          <SelectValue placeholder="Select a fault type" />
        </SelectTrigger>
        <SelectContent>
          {FAULT_TYPES.map((faultType) => (
            <SelectItem key={faultType.name} value={faultType.name}>
              {faultType.name} ({faultType.severity})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Triggering Fault...' : 'Trigger Fault'}
      </Button>
    </div>
  )
} 