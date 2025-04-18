'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type WellFilters = {
  camp?: string | null
  formation?: string | null
  status?: string | null
}

export function Toolbar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: keyof WellFilters, value: string) => {
    const queryString = createQueryString(name, value === 'all' ? null : value)
    router.push(pathname + '?' + queryString)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 w-full border-b">
      <Select
        onValueChange={(value: string) => updateFilter('camp', value)}
        value={searchParams.get('camp') ?? 'all'}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Camp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Camps</SelectItem>
          <SelectItem value="midland">Midland</SelectItem>
          <SelectItem value="delaware">Delaware</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value: string) => updateFilter('formation', value)}
        value={searchParams.get('formation') ?? 'all'}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Formation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Formations</SelectItem>
          <SelectItem value="spraberry">Spraberry</SelectItem>
          <SelectItem value="wolfcamp">Wolfcamp</SelectItem>
          <SelectItem value="bone-spring">Bone Spring</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value: string) => updateFilter('status', value)}
        value={searchParams.get('status') ?? 'all'}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="operational">Operational</SelectItem>
          <SelectItem value="fault">Fault</SelectItem>
          <SelectItem value="pending-repair">Pending Repair</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 