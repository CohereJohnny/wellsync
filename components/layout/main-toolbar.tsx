'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Fuel } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Inventory', href: '/inventory' },
  { name: 'Settings', href: '/settings' },
  { name: 'Documentation', href: '/documentation' },
]

export function MainToolbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#1E3A8A] text-white shadow-md">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        {/* Logo/Title with Icon */}
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Fuel className="h-5 w-5" />
          WellSync AI
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-white',
                pathname === item.href
                  ? 'text-white'
                  : 'text-gray-300 hover:text-gray-100'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
} 