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
import { Well, Part } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation' // For potential refresh

interface FaultSimulationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialWell: Well | null; // Well to pre-select, or null if triggered from Toolbar
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
  const [wells, setWells] = useState<Well[]>([]); // For selector if initialWell is null
  const [parts, setParts] = useState<Part[]>([]);
  const [selectedWell, setSelectedWell] = useState<Well | null>(initialWell);

  // Update selected well if initialWell changes while open (edge case)
  useEffect(() => {
    setSelectedWell(initialWell);
  }, [initialWell]);

  // Fetch wells (only if needed) and parts when the dialog opens
  useEffect(() => {
    async function fetchData() {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);
      setParts([]); // Reset parts
      if (!initialWell) {
          setWells([]); // Reset wells if we need to select one
      }

      try {
        // Fetch parts always
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*');
        if (partsError) throw partsError;
        setParts(partsData || []);

        // Fetch wells only if no initial well is provided
        if (!initialWell) {
          const { data: wellsData, error: wellsError } = await supabase
            .from('wells')
            .select('*')
            .order('name');
          if (wellsError) throw wellsError;
          setWells(wellsData || []);
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
  }, [isOpen, initialWell, supabase, toast, t]);

  // Handle form submission
  const handleFaultSubmit = async (data: { 
    wellId: string; 
    partId: string; 
    faultType: string; 
    description?: string;
  }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/faults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      setSelectedWell(null); 
      // We keep initialWell as is, it's controlled from parent
    }
    onOpenChange(open);
  };

  const targetWell = initialWell || selectedWell;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] shadow-lg bg-white">
        <DialogHeader>
          <DialogTitle>
            {t('simulationDialog.title')} 
            {initialWell ? `: ${initialWell.name}` : ''} 
          </DialogTitle>
          <DialogDescription>
            {initialWell 
              ? t('simulationDialog.description') // Modify description if needed
              : t('simulationDialog.description') 
            }
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4">
          {isLoading ? (
            <p>{t('simulationDialog.loading')}</p>
          ) : error ? (
            <p className="text-red-500">{t('simulationDialog.errorPrefix')}{error}</p>
          ) : (
            <>
              {/* Show Well Selector ONLY if no initialWell was provided */}
              {!initialWell && (
                <Select 
                  value={selectedWell?.id || ''} 
                  onValueChange={(wellId) => {
                    const newlySelected = wells.find(w => w.id === wellId);
                    setSelectedWell(newlySelected || null);
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
              )}
              
              {/* Conditionally render the form only when a target well is determined */}
              {targetWell && (
                <FaultSimulationForm
                  currentWell={targetWell} 
                  parts={parts}
                  onSubmit={handleFaultSubmit}
                  isSubmitting={isSubmitting} // Pass submitting state
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 