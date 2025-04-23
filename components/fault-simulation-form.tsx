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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

// Reverted props to accept currentWell
interface FaultSimulationFormProps {
  currentWell: Well;
  parts?: Part[];
  onSubmit: (data: { wellId: string; partId: string; faultType: string; description?: string }) => Promise<void>;
}

export function FaultSimulationForm({
  // Reverted props destructuring
  currentWell,
  parts = [],
  onSubmit,
}: FaultSimulationFormProps) {
  const { toast } = useToast()
  // Removed selectedWellId state
  const [selectedPart, setSelectedPart] = useState<string>('')
  const [selectedFaultType, setSelectedFaultType] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    // Reverted validation
    if (!currentWell?.id || !selectedPart || !selectedFaultType) {
      toast({
        title: 'Validation Error',
        description: 'Please select a part and fault type for the current well.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        // Use currentWell.id
        wellId: currentWell.id,
        partId: selectedPart,
        faultType: selectedFaultType,
        description: description.trim() || undefined,
      })
      toast({
        title: 'Success',
        description: 'Fault has been triggered successfully',
      })
      // Removed selectedWellId reset
      setSelectedPart('')
      setSelectedFaultType('')
      setDescription('')
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

  // Reverted check (only check for parts)
  if (!parts?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No parts available for fault simulation.
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Removed Well Selector, added back Target Well display */}
      <div className="space-y-1">
          <Label htmlFor="target-well" className="text-sm font-medium text-gray-700">Target Well</Label>
          <p id="target-well" className="text-base text-gray-900 font-semibold p-2 border border-gray-200 rounded-md bg-gray-50">{currentWell.name}</p>
      </div>

      {/* Existing Part Selector */}
      <Select value={selectedPart} onValueChange={setSelectedPart}>
        <SelectTrigger>
          <SelectValue placeholder="Select a part" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {parts.map((part) => (
            <SelectItem key={part.part_id} value={part.part_id}>
              {part.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Existing Fault Type Selector */}
      <Select value={selectedFaultType} onValueChange={setSelectedFaultType}>
        <SelectTrigger>
          <SelectValue placeholder="Select a fault type" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {FAULT_TYPES.map((faultType) => (
            <SelectItem key={faultType.name} value={faultType.name}>
              {faultType.name} ({faultType.severity})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Existing Description */}
      <div className="space-y-2">
        <Label htmlFor="fault-description">Description (Optional)</Label>
        <Textarea
          id="fault-description"
          placeholder="Add any relevant details about the simulated fault..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Existing Submit Button */}
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full bg-blue-500 text-primary-foreground hover:bg-blue-600"
      >
        {isLoading ? 'Triggering Fault...' : 'Trigger Fault'}
      </Button>
    </div>
  )
} 