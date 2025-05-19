'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabase } from '@/context/supabase-context';
import { Transformer } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EyeIcon, AlertTriangle, ClipboardList } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TransformerFilters } from './toolbar-transformer';
import { useRouter } from 'next/navigation';

interface TransformerTableViewProps {
  openFaultDialog: (transformer: Transformer) => void;
}

export function TransformerTableView({ openFaultDialog }: TransformerTableViewProps) {
  const t = useTranslations('transformerTable');
  const tStatus = useTranslations('transformerStatus');
  const searchParams = useSearchParams();
  const supabase = useSupabase();
  const router = useRouter();
  
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get filter values from URL
  const substationFilter = searchParams.get('substation');
  const typeFilter = searchParams.get('type');
  const statusFilter = searchParams.get('status');

  // Create filters object for query
  const filters: TransformerFilters = {
    substation: substationFilter,
    type: typeFilter,
    status: statusFilter,
  };

  // Get the locale from the URL
  const locale = window.location.pathname.split('/')[1] || 'en';

  // Function to fetch transformers with filters
  const fetchTransformers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('transformers')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (filters.substation && filters.substation !== 'all') {
        const formattedSubstation = filters.substation.charAt(0).toUpperCase() + filters.substation.slice(1);
        query = query.eq('substation', formattedSubstation);
      }
      if (filters.type && filters.type !== 'all') {
        const formattedType = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
        query = query.eq('type', formattedType);
      }
      if (filters.status && filters.status !== 'all') {
        const formattedStatus = filters.status === 'pending-repair'
          ? 'Pending Repair'
          : filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
        query = query.eq('status', formattedStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setTransformers(data as Transformer[]);
      }
    } catch (err: any) {
      console.error("Error fetching transformers:", err);
      setError(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transformers when filters change
  useEffect(() => {
    fetchTransformers();
  }, [filters.substation, filters.type, filters.status]);

  // Function to format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t('notAvailable');
    try {
      return format(new Date(dateString), 'PP');
    } catch (e) {
      return dateString;
    }
  };

  // Function to get translated status text
  const getStatusText = (status: string) => {
    const lowerStatus = status?.toLowerCase().replace(/\s+/g, '') || '';
    if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair') {
      return tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair');
    }
    return status;
  };

  // Function to get badge classes based on status
  const getStatusBadgeClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    
    if (lowerStatus === 'operational') {
      return 'bg-green-100 text-green-800';
    } else if (lowerStatus === 'fault') {
      return 'bg-red-100 text-red-800';
    } else if (lowerStatus === 'pendingrepair' || lowerStatus === 'pending repair') {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to navigate to transformer detail view
  const handleViewDetails = (transformerId: string) => {
    router.push(`/${locale}/transformer/${transformerId}`);
  };

  // Loading state
  if (isLoading) {
    return <div className="p-8 text-center">{t('loading')}</div>;
  }

  // Error state
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // Empty state
  if (transformers.length === 0) {
    return <div className="p-8 text-center">{t('noTransformersFound')}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('nameHeader')}</TableHead>
            <TableHead>{t('substationHeader')}</TableHead>
            <TableHead>{t('typeHeader')}</TableHead>
            <TableHead>{t('statusHeader')}</TableHead>
            <TableHead>{t('lastMaintenanceHeader')}</TableHead>
            <TableHead className="text-right">{t('actionsHeader')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transformers.map((transformer) => (
            <TableRow key={transformer.id}>
              <TableCell className="font-medium">{transformer.name}</TableCell>
              <TableCell>{transformer.substation}</TableCell>
              <TableCell>{transformer.type}</TableCell>
              <TableCell>
                <Badge className={cn(getStatusBadgeClass(transformer.status), "font-normal")}>
                  {getStatusText(transformer.status)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(transformer.last_maintenance)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleViewDetails(transformer.id)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('viewDetailsTooltip')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => openFaultDialog(transformer)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('triggerFaultTooltip')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                        >
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('createSRTooltip')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 