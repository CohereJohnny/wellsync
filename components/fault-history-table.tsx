'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Fault } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ExpandedState,
  getExpandedRowModel,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react'

interface FaultHistoryTableProps {
  faults: Fault[]
  isLoading?: boolean
  resourceType?: 'well' | 'transformer'
}

export function FaultHistoryTable({
  faults, 
  isLoading,
  resourceType = 'transformer' // Default to transformer for new implementation
}: FaultHistoryTableProps) {
  const t = useTranslations('faultHistory')
  const tStatus = useTranslations('transformerStatus') // Use transformer status translations by default
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: string | null) => {
    if (!timestamp || !isClient) return 'N/A'
    try {
      return new Date(timestamp).toLocaleString()
    } catch (e) {
      console.error("Error formatting timestamp:", e)
      return 'Invalid Date'
    }
  }, [isClient])

  // Get translated status text
  const getTranslatedStatus = useCallback((status: string): string => {
    const lowerStatus = status?.toLowerCase().replace(/\s+/g, '') || ''
    if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair' || lowerStatus === 'resolved') {
      return tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair')
    }
    return status
  }, [tStatus])

  // Badge styling based on status for consistent colors
  const getBadgeClasses = (status: string) => {
    const lowerStatus = status?.toLowerCase() || ''
    // Make active (fault) status red, resolved status green, default to yellow
    const bgColor = lowerStatus === 'operational' || lowerStatus === 'resolved' ? 'bg-green-500' :
                    lowerStatus === 'fault' || lowerStatus === 'active' ? 'bg-red-500' :
                    'bg-yellow-500' // Default/Pending color
    return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor)
  }

  // Get correct ID field label based on resource type
  const getResourceIdLabel = () => {
    return resourceType === 'transformer' ? t('transformerIdLabel') : t('wellIdLabel');
  };

  // Define columns
  const columns = useMemo<ColumnDef<Fault>[]>(() => [
    {
      accessorKey: 'timestamp',
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('timestampHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
            className="mr-2"
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {formatTimestamp(row.getValue('timestamp'))}
        </div>
      ),
    },
    {
      accessorKey: 'fault_type',
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('typeHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => row.getValue('fault_type') || '--',
    },
    {
      accessorKey: 'part_id',
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('partHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => row.getValue('part_id') || '--',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('statusHeader')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <span className={getBadgeClasses(status)}>
            {getTranslatedStatus(status)}
          </span>
        )
      },
    },
  ], [t, formatTimestamp, getTranslatedStatus])

  // Initialize TanStack Table
  const table = useReactTable({
    data: faults,
    columns,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (faults.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t('noFaultHistory')}
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4 py-2 text-sm font-medium">
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
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => row.toggleExpanded()}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow className="bg-gray-50 border-t border-b border-gray-200">
                  <TableCell colSpan={row.getVisibleCells().length} className="px-6 py-3">
                    <div className="text-sm">
                      <p className="mb-2">
                        <span className="font-medium">Description:</span>
                        <br />
                        {row.original.description || t('noDescription')}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="font-medium">{t('partIdLabel')}:</span>
                          <br />
                          {row.original.part_id}
                          {row.original.part_specifications && row.original.part_specifications.serial_number && (
                            <>
                              <br />
                              <span className="text-xs text-gray-500">
                                {t('serialNumberLabel')}: {row.original.part_specifications.serial_number}
                              </span>
                            </>
                          )}
                        </div>
                        {row.original.severity && (
                          <div>
                            <span className="font-medium">{t('severityLabel')}:</span>
                            <br />
                            {row.original.severity}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="font-medium">{t('faultIdLabel')}:</span>
                          <br />
                          {row.original.fault_id}
                        </div>
                        <div>
                          <span className="font-medium">{getResourceIdLabel()}:</span>
                          <br />
                          {row.original.transformer_id || row.original.well_id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 