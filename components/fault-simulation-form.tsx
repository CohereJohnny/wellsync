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
import { Well, Part, Transformer } from '@/lib/types'
import { useTranslations } from 'next-intl'

// TODO: Consider moving predefined fault types to a config or fetching from DB
// For now, define with keys for translation
const FAULT_TYPES = [
  { key: 'insulation_deterioration', severity: 'critical' },
  { key: 'winding_failure', severity: 'critical' },
  { key: 'oil_leakage', severity: 'high' },
  { key: 'overheating', severity: 'high' },
  { key: 'bushing_failure', severity: 'high' },
  { key: 'core_saturation', severity: 'medium' },
  { key: 'cooling_system_malfunction', severity: 'medium' },
  { key: 'tap_changer_misoperation', severity: 'medium' },
  { key: 'voltage_fluctuation', severity: 'medium' },
  { key: 'partial_discharge', severity: 'high' },
  { key: 'moisture_ingress', severity: 'medium' },
  { key: 'protection_system_failure', severity: 'critical' },
  { key: 'phase_imbalance', severity: 'high' },
  { key: 'harmonic_overload', severity: 'medium' },
  { key: 'abnormal_vibration', severity: 'low' },
  { key: 'ground_fault', severity: 'critical' },
  { key: 'lightning_strike_damage', severity: 'high' },
  { key: 'loose_connection', severity: 'medium' },
]

// Updated props to accept currentResource
interface FaultSimulationFormProps {
  currentResource: Well | Transformer;
  resourceType: 'well' | 'transformer';
  parts?: Part[];
  onSubmit: (data: { resourceId: string; partId: string; faultType: string; description?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function FaultSimulationForm({
  currentResource,
  resourceType,
  parts = [],
  onSubmit,
  isSubmitting,
}: FaultSimulationFormProps) {
  const { toast } = useToast()
  const [selectedPart, setSelectedPart] = useState<string>('')
  const [selectedFaultType, setSelectedFaultType] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const t = useTranslations('faultSimulationForm')

  const handleSubmit = async () => {
    // Validate required fields
    if (!currentResource?.id || !selectedPart || !selectedFaultType) {
      toast({
        title: t('validationError.title'),
        description: t('validationError.description'),
        variant: 'destructive',
      })
      return
    }

    try {
      await onSubmit({
        resourceId: currentResource.id,
        partId: selectedPart,
        faultType: selectedFaultType,
        description: description.trim() || undefined,
      })
      // Success toast is handled by the dialog component after onSubmit resolves
      // Reset form fields
      setSelectedPart('')
      setSelectedFaultType('')
      setDescription('')
    } catch (error) {
      // Error toast is handled by the dialog component if onSubmit rejects
      console.error("FaultSimulationForm submission error caught (should be handled by parent):", error);
    }
  }

  // Check for parts
  if (!parts?.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('noParts')}
      </div>
    )
  }

  // Get the appropriate label key based on resource type
  const resourceLabelKey = resourceType === 'transformer' ? 'targetTransformer' : 'targetWell';

  return (
    <div className="space-y-4 pt-4">
      {/* Target Resource display */}
      <div className="space-y-1">
        <Label htmlFor="target-resource" className="text-sm font-medium text-gray-700">{t(resourceLabelKey)}</Label>
        <p id="target-resource" className="text-base text-gray-900 font-semibold p-2 border border-gray-200 rounded-md bg-gray-50">
          {currentResource.name}
        </p>
      </div>

      {/* Part Selector */}
      <Select value={selectedPart} onValueChange={setSelectedPart} disabled={isSubmitting}>
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
      <Select value={selectedFaultType} onValueChange={setSelectedFaultType} disabled={isSubmitting}>
        <SelectTrigger>
          <SelectValue placeholder={t('faultTypePlaceholder')} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {FAULT_TYPES.map((faultType) => {
            // Convert snake_case to camelCase for translation key
            const camelCaseKey = faultType.key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            // Construct the translation key with camelCase
            const translationKey = `faultType${camelCaseKey.charAt(0).toUpperCase() + camelCaseKey.slice(1)}`;
            // Get the translated name
            const translatedName = t(translationKey);
            // Get the translated severity
            const translatedSeverity = t(`severity.${faultType.severity}`);
            return (
              <SelectItem key={faultType.key} value={faultType.key}>
                {translatedName} ({translatedSeverity})
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="fault-description">{t('description')}</Label>
        <Textarea
          id="fault-description"
          placeholder={t('descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-primary-foreground hover:bg-blue-600"
      >
        {isSubmitting ? t('triggeringButton') : t('triggerButton')}
      </Button>
    </div>
  )
} 