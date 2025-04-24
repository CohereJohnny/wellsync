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
import { useTranslations } from 'next-intl'

// TODO: Consider moving predefined fault types to a config or fetching from DB
// For now, define with keys for translation
const FAULT_TYPES = [
  { key: 'wear_and_tear', severity: 'high' },
  { key: 'blockage', severity: 'medium' },
  { key: 'leakage', severity: 'medium' },
  { key: 'electrical_failure', severity: 'critical' },
  { key: 'other', severity: 'low' },
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
  const t = useTranslations('faultSimulationForm')
  const tCommon = useTranslations('common')

  const handleSubmit = async () => {
    // Reverted validation
    if (!currentWell?.id || !selectedPart || !selectedFaultType) {
      toast({
        title: t('validationError.title'),
        description: t('validationError.description'),
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
        title: t('success.title'),
        description: t('success.description'),
      })
      // Removed selectedWellId reset
      setSelectedPart('')
      setSelectedFaultType('')
      setDescription('')
    } catch (error) {
      toast({
        title: t('error.title'),
        description: t('error.description'),
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
        {t('noParts')}
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Removed Well Selector, added back Target Well display */}
      <div className="space-y-1">
          <Label htmlFor="target-well" className="text-sm font-medium text-gray-700">{t('targetWell')}</Label>
          <p id="target-well" className="text-base text-gray-900 font-semibold p-2 border border-gray-200 rounded-md bg-gray-50">{currentWell.name}</p>
      </div>

      {/* Existing Part Selector */}
      <Select value={selectedPart} onValueChange={setSelectedPart}>
        <SelectTrigger>
          <SelectValue placeholder={t('partPlaceholder')} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {parts.map((part) => (
            <SelectItem key={part.part_id} value={part.part_id}>
              {part.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Fault Type Selector */}
      <Select value={selectedFaultType} onValueChange={setSelectedFaultType} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={t('faultTypePlaceholder')} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {FAULT_TYPES.map((faultType) => {
            // Construct the translation key dynamically
            const translationKey = `faultType${faultType.key.charAt(0).toUpperCase() + faultType.key.slice(1)}`
            // Get the translated name
            const translatedName = t(translationKey)
            // Get the translated severity
            const translatedSeverity = t(`severity.${faultType.severity}`)
            return (
              <SelectItem key={faultType.key} value={faultType.key}>
                {translatedName} ({translatedSeverity})
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Existing Description */}
      <div className="space-y-2">
        <Label htmlFor="fault-description">{t('description')}</Label>
        <Textarea
          id="fault-description"
          placeholder={t('descriptionPlaceholder')}
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
        {isLoading ? t('triggeringButton') : t('triggerButton')}
      </Button>
    </div>
  )
} 