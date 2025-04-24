'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronRight, FileText, Book } from 'lucide-react';

interface DocumentationLayoutProps {
  children: React.ReactNode;
}

// The structure of our documentation
const documentationNavigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/documentation' },
      { title: 'Components', href: '/documentation/components' },
    ]
  },
  {
    title: 'API Reference',
    items: [
      { title: 'Chat API', href: '/documentation/api-chat' },
      { title: 'Orders API', href: '/documentation/api-orders' },
      { title: 'Dispatches API', href: '/documentation/api-dispatches' },
      { title: 'Search Faults API', href: '/documentation/api-search-faults' },
      { title: 'Search Faults RPC', href: '/documentation/rpc-search-faults' },
    ]
  },
  {
    title: 'Backend Systems',
    items: [
      { title: 'Semantic Search', href: '/documentation/semantic-search-backend' },
      { title: 'Tool Schemas', href: '/documentation/tool-schemas' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { title: 'Demo Script', href: '/documentation/demo-script' },
    ]
  }
];

export default function DocumentationLayout({ children }: DocumentationLayoutProps) {
  const t = useTranslations('common.navigation');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Getting Started': true, // Open by default
    'API Reference': true,
    'Backend Systems': true,
    'Resources': true,
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

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-20 left-4 z-50 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-blue-500 text-white"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 pt-16 left-0 z-40 w-64 transform bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full px-4 py-6 overflow-y-auto">
          <div className="flex items-center mb-8 px-2">
            <Book className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('documentation')}</h1>
          </div>

          <nav className="space-y-1">
            {documentationNavigation.map((section) => (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-2 py-2 text-left text-gray-700 dark:text-gray-200 font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span>{section.title}</span>
                  {expandedSections[section.title] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {expandedSections[section.title] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.items.map((item) => {
                      const active = isCurrentPage(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={`/${locale}${item.href}`}
                          className={`flex items-center px-2 py-2 text-sm rounded-md ${
                            active
                              ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 font-medium'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {item.title}
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
      <main className={`flex-1 pt-16 px-4 md:px-8 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-64'
      }`}>
        <div className="max-w-4xl mx-auto py-8">
          <div className="prose prose-blue dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 