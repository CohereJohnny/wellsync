'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/context/supabase-context'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Well } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  ColumnMeta,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, FileText, AlertTriangle, PlusCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import type { WellFilters } from './toolbar'

// Augment TanStack Table types for custom metadata
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue extends unknown> {
    className?: string
  }
}

// Add prop for opening dialog
interface WellTableViewProps {
  openFaultDialog: (well: Well) => void;
}

// Helper function for badge classes
const getBadgeClasses = (status: string | null | undefined) => { // Allow null/undefined
  const lowerStatus = status?.toLowerCase() || '';
  const bgColor = lowerStatus === 'operational' ? 'bg-green-500' :
                  lowerStatus === 'fault' ? 'bg-red-500' :
                  'bg-yellow-500';
  return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor);
}

export function WellTableView({ openFaultDialog }: WellTableViewProps) {
  const t = useTranslations('wellTable');
  const tStatus = useTranslations('wellStatus');
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  
  const locale = pathname.split('/')[1];

  // --- Internal Action Handlers ---
  const handleViewDetails = useCallback((wellId: string) => {
    router.push(`/${locale}/well/${wellId}`);
  }, [router, locale]);

  // Update Trigger Fault handler
  const handleTriggerFault = useCallback((well: Well) => {
    // Call the passed function with the full well object
    openFaultDialog(well);
  }, [openFaultDialog]);

  const handleCreateSR = useCallback((wellId: string) => {
    // TODO: Implement logic to open service request creation modal/form
    console.log('Create Service Request for well:', wellId);
    toast({
      title: "Action Needed",
      description: `Create SR action for well ${wellId} needs implementation.`,
    });
  }, [toast]);
  // --- End Internal Action Handlers ---

  const columnHelper = createColumnHelper<Well>();
  
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('nameHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => (
        <button onClick={() => handleViewDetails(info.row.original.id)} className="hover:underline text-blue-600 text-left">
          {info.getValue() ?? t('notAvailable')}
        </button>
      ),
      meta: {
        className: 'w-[150px] font-medium',
      },
    }),
    columnHelper.accessor('camp', {
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('campHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => info.getValue() ?? t('notAvailable'),
    }),
    columnHelper.accessor('formation', {
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('formationHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => info.getValue() ?? t('notAvailable'),
    }),
    columnHelper.accessor('status', {
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('statusHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => {
        const status = info.getValue();
        let displayStatus = status ?? t('notAvailable');
        if (status) {
          const lowerStatus = status.toLowerCase().replace(/\s+/g, '');
          if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair') {
            displayStatus = tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair');
          }
        }
        return (
          <Badge className={getBadgeClasses(status)}>
            {displayStatus}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('last_maintenance', {
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors ml-auto"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('lastMaintenanceHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: info => {
        const value = info.getValue();
        return value && !isNaN(new Date(value).getTime())
          ? new Date(value).toLocaleDateString()
          : t('notAvailable');
      },
      meta: {
        className: 'text-right',
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-center">{t('actionsHeader')}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center space-x-2"> 
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewDetails(row.original.id); }}
            title={t('viewDetailsTooltip')}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <FileText className="h-4 w-4 text-blue-600" />
          </button>
          {/* Update Trigger Fault button */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleTriggerFault(row.original); }} // Pass the full well object
            title={t('triggerFaultTooltip')}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleCreateSR(row.original.id); }}
            title={t('createSRTooltip')}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <PlusCircle className="h-4 w-4 text-green-600" />
          </button>
        </div>
      ),
      meta: {
        className: 'text-center w-[120px]',
      }
    }),
  ], [t, tStatus, handleViewDetails, handleTriggerFault, handleCreateSR, columnHelper]);

  const fetchWells = useCallback(async () => {
    // Define filters based on searchParams inside useCallback
    const campFilter = searchParams.get('camp');
    const formationFilter = searchParams.get('formation');
    const statusFilter = searchParams.get('status');
    const filters: WellFilters = {
      camp: campFilter,
      formation: formationFilter,
      status: statusFilter,
    };

    console.log('Fetching wells for table view with filters:', filters);
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('wells')
        .select('*') // Fetch all columns for the table
        .order('name', { ascending: true });

      // Apply filters
      if (filters.camp && filters.camp !== 'all') {
        query = query.eq('camp', filters.camp.charAt(0).toUpperCase() + filters.camp.slice(1));
      }
      if (filters.formation && filters.formation !== 'all') {
        const formattedFormation = filters.formation === 'bone-spring'
          ? 'Bone Spring'
          : filters.formation.charAt(0).toUpperCase() + filters.formation.slice(1);
        query = query.eq('formation', formattedFormation);
      }
      if (filters.status && filters.status !== 'all') {
        const formattedStatus = filters.status === 'pending-repair'
          ? 'Pending Repair'
          : filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
        query = query.eq('status', formattedStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setWells(data || []);
    } catch (err: any) {
      console.error("Error fetching wells:", err);
      setError(t('fetchError'));
      setWells([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, searchParams, t]); // Depend on searchParams directly

  useEffect(() => {
    fetchWells();
  }, [fetchWells]);

  const table = useReactTable({
    data: wells,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="rounded-md border shadow-sm bg-white">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className={(header.column.columnDef.meta as ColumnMeta<Well, unknown>)?.className}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className={(cell.column.columnDef.meta as ColumnMeta<Well, unknown>)?.className}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('noWellsFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 