'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FaultSimulationForm } from './fault-simulation-form'
import { useSupabase } from '@/context/supabase-context'
import { useToast } from '@/hooks/use-toast'
import { Well, Part, Transformer } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation' // For potential refresh

interface FaultSimulationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialWell: Well | Transformer | null; // Resource to pre-select, or null if triggered from Toolbar
}

export function FaultSimulationDialog({ 
  isOpen, 
  onOpenChange, 
  initialWell 
}: FaultSimulationDialogProps) {
  const t = useTranslations('toolbar'); // Assuming translations are in toolbar namespace
  const supabase = useSupabase();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wells, setWells] = useState<Well[]>([]); // For wells selector
  const [transformers, setTransformers] = useState<Transformer[]>([]); // For transformers selector
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedResource, setSelectedResource] = useState<Well | Transformer | null>(initialWell);
  const [resourceType, setResourceType] = useState<'well' | 'transformer'>('transformer');

  // Determine if initialWell is a Well or a Transformer
  useEffect(() => {
    if (initialWell) {
      // Check if it has substation (Transformer) or camp (Well)
      if ('substation' in initialWell) {
        setResourceType('transformer');
      } else if ('camp' in initialWell) {
        setResourceType('well');
      }
    }
  }, [initialWell]);

  // Update selected resource if initialWell changes while open (edge case)
  useEffect(() => {
    setSelectedResource(initialWell);
  }, [initialWell]);

  // Fetch resources (only if needed) and parts when the dialog opens
  useEffect(() => {
    async function fetchData() {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);
      setParts([]); // Reset parts

      try {
        // Fetch parts always
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*');
        if (partsError) throw partsError;
        setParts(partsData || []);

        // Fetch resources only if no initial resource is provided
        if (!initialWell) {
          if (resourceType === 'transformer') {
            const { data: transformerData, error: transformerError } = await supabase
              .from('transformers')
              .select('*')
              .order('name');
            if (transformerError) throw transformerError;
            setTransformers(transformerData || []);
            setWells([]);
          } else {
            const { data: wellsData, error: wellsError } = await supabase
              .from('wells')
              .select('*')
              .order('name');
            if (wellsError) throw wellsError;
            setWells(wellsData || []);
            setTransformers([]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data for dialog:', err);
        setError(err.message);
        toast({
          title: t('toasts.fetchErrorTitle'),
          description: t('toasts.fetchErrorDescription'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [isOpen, initialWell, resourceType, supabase, toast, t]);

  // Handle form submission
  const handleFaultSubmit = async (data: { 
    resourceId: string; 
    partId: string; 
    faultType: string; 
    description?: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      const payload = resourceType === 'transformer' 
        ? { 
            transformerId: data.resourceId, 
            partId: data.partId, 
            faultType: data.faultType, 
            description: data.description 
          }
        : { 
            wellId: data.resourceId, 
            partId: data.partId, 
            faultType: data.faultType, 
            description: data.description 
          };
          
      const response = await fetch('/api/faults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || t('toasts.faultErrorDescription'));
      }

      toast({
        title: t('toasts.faultCreatedTitle'),
        description: t('toasts.faultCreatedDescription'),
      });
      
      onOpenChange(false); // Close dialog on success
      router.refresh(); // Refresh data on the page
    } catch (error: any) {
      console.error('Error creating fault:', error);
      toast({
        title: t('toasts.faultErrorTitle'),
        description: error.message || t('toasts.faultErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle closing the dialog, reset internal state
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setSelectedResource(null); 
      // We keep initialWell as is, it's controlled from parent
    }
    onOpenChange(open);
  };

  // Handle resource type change
  const handleResourceTypeChange = (type: 'well' | 'transformer') => {
    setResourceType(type);
    setSelectedResource(null);
  };

  const targetResource = initialWell || selectedResource;
  const resourceName = targetResource ? targetResource.name : '';

  // Determine placeholder text based on resource type
  const selectPlaceholder = resourceType === 'transformer' 
    ? t('simulationDialog.selectTransformerPlaceholder') || 'Select target transformer'
    : t('simulationDialog.selectWellPlaceholder') || 'Select target well';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] shadow-lg bg-white">
        <DialogHeader>
          <DialogTitle>
            {t('simulationDialog.title')} 
            {initialWell ? `: ${resourceName}` : ''} 
          </DialogTitle>
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
              {/* Show resource type selector ONLY if no initialWell was provided */}
              {!initialWell && (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <button 
                      className={`px-3 py-1 rounded text-sm ${resourceType === 'transformer' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                      onClick={() => handleResourceTypeChange('transformer')}
                    >
                      Transformer
                    </button>
                    <button 
                      className={`px-3 py-1 rounded text-sm ${resourceType === 'well' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                      onClick={() => handleResourceTypeChange('well')}
                    >
                      Well
                    </button>
                  </div>

                  {/* Show appropriate resource selector based on type */}
                  {resourceType === 'transformer' ? (
                    <Select 
                      value={selectedResource?.id || ''} 
                      onValueChange={(id) => {
                        const newlySelected = transformers.find(t => t.id === id);
                        setSelectedResource(newlySelected || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {transformers.map((transformer) => (
                          <SelectItem key={transformer.id} value={transformer.id}>
                            {transformer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select 
                      value={selectedResource?.id || ''} 
                      onValueChange={(id) => {
                        const newlySelected = wells.find(w => w.id === id);
                        setSelectedResource(newlySelected || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectPlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {wells.map((well) => (
                          <SelectItem key={well.id} value={well.id}>
                            {well.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
              
              {/* Conditionally render the form only when a target resource is determined */}
              {targetResource && (
                <FaultSimulationForm
                  currentResource={targetResource}
                  resourceType={resourceType}
                  parts={parts}
                  onSubmit={handleFaultSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 