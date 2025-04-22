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
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function FaultHistoryTable({ faults, isLoading }: FaultHistoryTableProps) {
  const [expandedFaultId, setExpandedFaultId] = React.useState<string | null>(null)
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof Fault
    direction: 'asc' | 'desc'
  }>({
    key: 'timestamp',
    direction: 'desc',
  })

  const sortedFaults = React.useMemo(() => {
    if (!faults) return []
    
    const sorted = [...faults].sort((a, b) => {
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
      
      // Handle string comparisons safely
      const aValue = a[sortConfig.key]?.toString() || ''
      const bValue = b[sortConfig.key]?.toString() || ''
      
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return sorted
  }, [faults, sortConfig])

  const requestSort = (key: keyof Fault) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Badge styling based on spec
  const getBadgeClasses = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    // Use green for resolved, red for active (destructive)
    const bgColor = lowerStatus === 'resolved' ? 'bg-green-500' : 'bg-red-500'; 
    return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor); // Use text-xs for smaller badges
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (!faults?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No fault history available
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => requestSort('timestamp')}
          >
            Timestamp
            {sortConfig.key === 'timestamp' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </TableHead>
          <TableHead
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => requestSort('fault_type')}
          >
            Fault Type
            {sortConfig.key === 'fault_type' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </TableHead>
          <TableHead>Part ID</TableHead>
          <TableHead
            className="cursor-pointer hover:text-foreground transition-colors"
            onClick={() => requestSort('status')}
          >
            Status
            {sortConfig.key === 'status' && (
              <span className="ml-1">
                {sortConfig.direction === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedFaults.map((fault) => (
          <React.Fragment key={fault.fault_id}>
            <TableRow 
              className={cn(
                'cursor-pointer hover:bg-muted/50 transition-colors',
                expandedFaultId === fault.fault_id && 'bg-muted/50',
                'odd:bg-gray-100'
              )}
              onClick={() => setExpandedFaultId(
                expandedFaultId === fault.fault_id ? null : fault.fault_id
              )}
            >
              <TableCell className="w-[40px]">
                {expandedFaultId === fault.fault_id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </TableCell>
              <TableCell>
                {new Date(fault.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>{fault.fault_type}</TableCell>
              <TableCell>{fault.part_id}</TableCell>
              <TableCell>
                <Badge className={getBadgeClasses(fault.status)}>
                  {fault.status}
                </Badge>
              </TableCell>
            </TableRow>
            {expandedFaultId === fault.fault_id && (
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="p-4">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-muted-foreground">{fault.description}</p>
                    </div>
                    {fault.resolved_at && (
                      <div>
                        <span className="font-medium">Resolved At:</span>
                        <p className="mt-1 text-muted-foreground">
                          {new Date(fault.resolved_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Part Details:</span>
                      <p className="mt-1 text-muted-foreground">
                        Part ID: {fault.part_id}
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
  )
} 