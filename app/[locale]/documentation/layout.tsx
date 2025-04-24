'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Bookmark } from 'lucide-react';

interface DocumentationLayoutProps {
  children: React.ReactNode;
}

// Navigation items are rendered using translations in the component
const documentationSections = [
  {
    titleKey: 'gettingStarted',
    items: [
      { titleKey: 'introduction', href: '/documentation' },
      { titleKey: 'components', href: '/documentation/components' },
    ]
  },
  {
    titleKey: 'apiReference',
    items: [
      { titleKey: 'chatApi', href: '/documentation/api-chat' },
      { titleKey: 'ordersApi', href: '/documentation/api-orders' },
      { titleKey: 'dispatchesApi', href: '/documentation/api-dispatches' },
      { titleKey: 'searchFaultsApi', href: '/documentation/api-search-faults' },
      { titleKey: 'searchFaultsRpc', href: '/documentation/rpc-search-faults' },
    ]
  },
  {
    titleKey: 'backendSystems',
    items: [
      { titleKey: 'semanticSearch', href: '/documentation/semantic-search-backend' },
      { titleKey: 'toolSchemas', href: '/documentation/tool-schemas' },
    ]
  },
  {
    titleKey: 'resources',
    items: [
      { titleKey: 'demoScript', href: '/documentation/demo-script' },
    ]
  }
];

export default function DocumentationLayout({ children }: DocumentationLayoutProps) {
  const t = useTranslations('documentation');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'gettingStarted': true, // Open by default
    'apiReference': true,
    'backendSystems': true,
    'resources': true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isCurrentPage = (href: string) => {
    return pathname === `/${locale}${href}`;
  };

  // Map internal keys to display titles using translations
  const getTitleForKey = (key: string) => {
    try {
      return t(`navigation.${key}`);
    } catch (error) {
      // Fallback to capitalized key if translation is missing
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 pt-16">
      {/* Container with max width to center content */}
      <div className="max-w-6xl mx-auto flex w-full px-4">
        {/* Floating Left Navigation Box */}
        <div className="w-60 flex-shrink-0 mr-8">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700 p-4 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex items-center mb-4">
              <Bookmark className="h-4 w-4 text-blue-500 mr-2" />
              <h1 className="text-sm font-bold text-gray-800 dark:text-white">{t('navigation.title')}</h1>
            </div>

            <nav className="space-y-1">
              {documentationSections.map((section) => (
                <div key={section.titleKey} className="mb-3">
                  <button
                    onClick={() => toggleSection(section.titleKey)}
                    className="flex items-center justify-between w-full px-2 py-1.5 text-left text-gray-700 dark:text-gray-200 font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-sm">{getTitleForKey(section.titleKey)}</span>
                    {expandedSections[section.titleKey] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {expandedSections[section.titleKey] && (
                    <div className="mt-1 ml-2 space-y-1">
                      {section.items.map((item) => {
                        const active = isCurrentPage(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={`/${locale}${item.href}`}
                            className={`flex items-center px-2 py-1.5 text-xs rounded-md ${
                              active
                                ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <FileText className="h-3 w-3 mr-1.5" />
                            {getTitleForKey(item.titleKey)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 py-6">
          <div className="max-w-4xl">
            <div className="prose prose-blue dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 