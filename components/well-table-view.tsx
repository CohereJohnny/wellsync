'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
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
import { ArrowUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Augment TanStack Table types for custom metadata
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue extends unknown> {
    className?: string
  }
}

// Helper function for badge classes
const getBadgeClasses = (status: string | null | undefined) => { // Allow null/undefined
  const lowerStatus = status?.toLowerCase() || '';
  const bgColor = lowerStatus === 'operational' ? 'bg-green-500' :
                  lowerStatus === 'fault' ? 'bg-red-500' :
                  'bg-yellow-500';
  return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor);
}

export function WellTableView() {
  const t = useTranslations('wellTable');
  const tStatus = useTranslations('wellStatus');
  const supabase = useSupabase();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [wells, setWells] = useState<Well[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  
  // Extract the locale from the pathname
  const locale = pathname.split('/')[1]; // Pathname format is "/en/..." or "/es/..."

  // Define columns using ColumnHelper - moved inside component to access translations
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
        <Link href={`/${locale}/well/${info.row.original.id}`} className="hover:underline text-blue-600">
          {info.getValue() ?? t('notAvailable')}
        </Link>
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
        // Transform status text to use translations
        let displayStatus = status ?? t('notAvailable');
        
        // If status is one of the known statuses, use translation
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
        // Check if value is a valid date string/number before creating Date
        return value && !isNaN(new Date(value).getTime())
          ? new Date(value).toLocaleDateString()
          : t('notAvailable');
      },
      meta: {
        className: 'text-right',
      },
    }),
  ], [t, tStatus, columnHelper, locale]);

  // Data Fetching Effect
  useEffect(() => {
    const fetchWells = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch all necessary fields used by the table
        let query = supabase.from('wells').select('*').order('name')

        const status = searchParams.get('status')
        const camp = searchParams.get('camp')
        const formation = searchParams.get('formation')

        // Filtering logic remains the same
        if (status && status !== 'all') {
            // Assuming status values in DB match the capitalized/spaced versions if needed
            query = query.eq('status', status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '))
        }
        if (camp && camp !== 'all') {
             // Assuming camp values in DB match the capitalized/spaced versions if needed
            query = query.eq('camp', camp.charAt(0).toUpperCase() + camp.slice(1).replace('-', ' '))
        }
        if (formation && formation !== 'all') {
             // Assuming formation values in DB match the capitalized/spaced versions if needed
            query = query.eq('formation', formation.charAt(0).toUpperCase() + formation.slice(1).replace('-', ' '))
        }

        const { data, error: dbError } = await query

        if (dbError) {
          throw dbError
        }
        setWells(data || [])
      } catch (err: any) {
        console.error("Error fetching wells for table view:", err)
        setError(err.message || t('fetchError'))
        setWells([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWells()
  }, [searchParams, supabase, t])

  // Define the realtime handler using useCallback
  const handleRealtimeUpdate = useCallback((payload: any) => {
      console.log('Well change received!', payload)
      if (payload.eventType === 'INSERT') {
          const newWell = payload.new as Well // Assume payload.new has all Well fields
          setWells((currentWells) => {
            if (currentWells.some(w => w.id === newWell.id)) {
              return currentWells;
            }
            // Cast the object from payload to Well type
            return [...currentWells, newWell].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
          })
        } else if (payload.eventType === 'UPDATE') {
          const updatedWellData = payload.new // Keep as any for easier access initially
          setWells((currentWells) => {
            // Map and explicitly cast the result array to Well[]
            const newWells = currentWells.map((well) => {
              if (well.id === updatedWellData.id) {
                // Construct a new object conforming to the Well type
                const updatedWell: Well = {
                  id: updatedWellData.id ?? well.id, // Should always exist
                  name: updatedWellData.name ?? well.name,
                  camp: updatedWellData.camp ?? well.camp,
                  formation: updatedWellData.formation ?? well.formation,
                  latitude: updatedWellData.latitude ?? well.latitude,
                  longitude: updatedWellData.longitude ?? well.longitude,
                  status: updatedWellData.status ?? well.status,
                  last_maintenance: updatedWellData.last_maintenance ?? well.last_maintenance,
                  fault_details: updatedWellData.fault_details ?? well.fault_details,
                  updated_at: updatedWellData.updated_at, // This field is required
                };
                return updatedWell;
              } else {
                return well;
              }
            }) as Well[]; // Cast the result of map
            return newWells;
          })
        } else if (payload.eventType === 'DELETE') {
          const oldWellId = payload.old.id
          setWells((currentWells) =>
            currentWells.filter((well) => well.id !== oldWellId)
          )
        }
  }, [setWells]);

  // Realtime subscription setup Effect
  useEffect(() => {
    const channel = supabase
      .channel('well-list-changes-table') // Use a unique channel name for the table view
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wells',
        },
        handleRealtimeUpdate // Use the useCallback version here
      )
      .subscribe()

    // Cleanup function to remove subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, handleRealtimeUpdate]);

  // Memoize the data
  const data = useMemo(() => wells, [wells]);

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Render Loading State
  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">{t('loading')}</div>;
  }

  // Render Error State
  if (error) {
    return <div className="p-6 text-center text-red-500">{t('error')}: {error}</div>;
  }

  // Render Empty State (after loading and no error)
  if (!table.getRowModel().rows?.length) {
    return <div className="p-6 text-center text-muted-foreground">{t('noWellsFound')}</div>;
  }

  // Render Table using TanStack Table and Shadcn UI Components
  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead 
                    key={header.id} 
                    className={cn(
                        "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider",
                        header.column.columnDef.meta?.className
                    )}
                 >
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
        <TableBody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              className="hover:bg-gray-100 even:bg-slate-50 transition-colors align-middle"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell 
                    key={cell.id} 
                    className={cn("px-4 py-3 whitespace-nowrap text-base text-gray-700 align-middle", cell.column.columnDef.meta?.className)}
                 >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 