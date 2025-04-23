'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ColumnDef,
  SortingState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'

interface Fault {
  fault_id: string
  well_id: string
  part_id: string
  fault_type: string
  description: string
  timestamp: string
  status: 'active' | 'resolved'
  resolved_at?: string
}

interface FaultHistoryTableProps {
  faults: Fault[]
  isLoading?: boolean
}

const getBadgeClasses = (status: string) => {
  const lowerStatus = status?.toLowerCase() || '';
  const bgColor = lowerStatus === 'resolved' ? 'bg-green-500' : 'bg-red-500';
  return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor);
}

const columnHelper = createColumnHelper<Fault>()

const columns: ColumnDef<Fault, any>[] = [
  columnHelper.display({
    id: 'expander',
    header: () => null,
    cell: ({ row }) => (
      <button
        {...{
          onClick: row.getToggleExpandedHandler(),
          style: { cursor: 'pointer' },
        }}
        className="p-1 rounded hover:bg-gray-200"
        aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    ),
    meta: {
        className: 'w-[40px]'
    }
  }),
  columnHelper.accessor('timestamp', {
    header: ({ column }) => (
      <button
        className="flex items-center hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Timestamp
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </button>
    ),
    cell: info => new Date(info.getValue()).toLocaleString(),
  }),
  columnHelper.accessor('fault_type', {
    header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fault Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('part_id', {
    header: 'Part ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: ({ column }) => (
        <button
          className="flex items-center hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </button>
      ),
    cell: info => (
      <Badge className={getBadgeClasses(info.getValue())}>
        {info.getValue()}
      </Badge>
    ),
  }),
]

export function FaultHistoryTable({ faults, isLoading }: FaultHistoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'timestamp', desc: true },
  ])
  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const data = React.useMemo(() => faults || [], [faults])

  const table = useReactTable({
    data,
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
    getRowCanExpand: () => true,
    initialState: {
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No fault history available
      </div>
    )
  }

  return (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
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
          {table.getRowModel().rows.map(row => (
            <React.Fragment key={row.id}>
              <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                      row.getCanExpand() ? 'cursor-pointer' : '',
                      'hover:bg-gray-100 even:bg-slate-50 transition-colors align-middle',
                      row.getIsExpanded() && 'bg-muted/50'
                  )}
               >
                {row.getVisibleCells().map(cell => (
                  <TableCell 
                    key={cell.id} 
                    className={cn("px-4 py-3 whitespace-nowrap text-base text-gray-700 align-middle", cell.column.columnDef.meta?.className)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
  
              {row.getIsExpanded() && (
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={columns.length} className="px-4 py-3 text-base">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-900">Description:</span>
                        <p className="mt-1 text-gray-600">{row.original.description}</p>
                      </div>
                      {row.original.resolved_at && (
                        <div>
                          <span className="font-medium text-gray-900">Resolved At:</span>
                          <p className="mt-1 text-sm text-gray-600">
                            {new Date(row.original.resolved_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-900">Part Details:</span>
                        <p className="mt-1 text-gray-600">
                          Part ID: {row.original.part_id}
                        </p>
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