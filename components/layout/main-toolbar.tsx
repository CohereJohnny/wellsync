'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import { useTranslation } from 'react-i18next' // Remove old hook
import { useTranslations } from 'next-intl'; // Import next-intl hook
import { cn } from '@/lib/utils'
import { Fuel } from 'lucide-react'
import { LanguageSwitcher } from '../language-switcher'
import { Toolbar } from "../toolbar" // Import the Toolbar component
import { ThemeSwitcher } from '@/components/docs/theme-switcher'

const navigationItems = [
  { key: 'dashboard', href: '/' },
  { key: 'inventory', href: '/inventory' },
  { key: 'settings', href: '/settings' },
  { key: 'documentation', href: '/documentation' },
]

export function MainToolbar() {
  const t = useTranslations('navigation'); // Initialize translation hook with namespace
  const pathname = usePathname()

  const getActiveLocalePrefix = () => {
    const segments = pathname.split('/');
    if (segments.length > 1 && ('en' === segments[1] || 'es' === segments[1])) {
      return `/${segments[1]}`;
    }
    return '/en';
  };

  const localePrefix = getActiveLocalePrefix();
  
  // Check if the current path is the dashboard/home page
  const isDashboardPage = () => {
    // Match paths like /en/, /es/, /pt/, etc.
    return pathname === `${localePrefix}/` || pathname === localePrefix;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#1E3A8A] text-white shadow-md">
        <div className="container mx-auto flex h-full items-center justify-between px-6">
          <Link href={`${localePrefix}/`} className="flex items-center gap-2 text-lg font-semibold">
            <Fuel className="h-5 w-5" />
            {t('title')}
          </Link>

          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              {navigationItems.map((item) => {
                const localizedHref = item.href === '/' ? `${localePrefix}/` : `${localePrefix}${item.href}`;
                const isActive = pathname === localizedHref;
                const itemName = t(item.key);
                return (
                  <Link
                    key={item.key}
                    href={localizedHref}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-white',
                      isActive
                        ? 'text-white underline underline-offset-4'
                        : 'text-gray-300 hover:text-gray-100'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {itemName}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>
      {/* Only render the Toolbar on the dashboard/home page */}
      {isDashboardPage() && (
        <div className="pt-16">
          <Toolbar />
        </div>
      )}
    </>
  )
} 