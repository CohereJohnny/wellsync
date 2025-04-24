'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

interface DocSearchResult {
  title: string;
  slug: string;
  excerpt: string;
  matches: number;
}

export function SearchDocs() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('documentation.search');

  // Function to search the docs (client-side only implementation)
  const searchDocs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just search in a predefined list
      const docEntries = [
        { 
          title: 'Components', 
          slug: 'components',
          content: 'Overview of the UI components used in the WellSync application. Includes information about button, card, and form components.' 
        },
        { 
          title: 'Chat API', 
          slug: 'api-chat',
          content: 'API documentation for the AI chat functionality. Includes endpoints for sending and receiving messages.' 
        },
        { 
          title: 'Orders API', 
          slug: 'api-orders',
          content: 'API documentation for the parts ordering system. Includes endpoints for creating and tracking orders.' 
        },
        { 
          title: 'Dispatches API', 
          slug: 'api-dispatches',
          content: 'API documentation for the parts dispatch system. Includes endpoints for tracking dispatched parts.' 
        },
        { 
          title: 'Search Faults API', 
          slug: 'api-search-faults',
          content: 'API documentation for the fault search functionality. Includes endpoints for searching historical faults.' 
        },
        { 
          title: 'Search Faults RPC', 
          slug: 'rpc-search-faults',
          content: 'RPC documentation for the fault search functionality. Includes details about the RPC methods.' 
        },
        { 
          title: 'Semantic Search', 
          slug: 'semantic-search-backend',
          content: 'Documentation for the semantic search backend. Includes details about the embedding models and search algorithms.' 
        },
        { 
          title: 'Tool Schemas', 
          slug: 'tool-schemas',
          content: 'Documentation for the AI tool schemas. Includes details about the available tools and their parameters.' 
        },
        { 
          title: 'Demo Script', 
          slug: 'demo-script',
          content: 'Script for demonstrating the WellSync application. Includes step-by-step instructions for a live demo.' 
        },
      ];

      // Simple search function that counts matches
      const searchResults = docEntries
        .map(entry => {
          const titleMatches = (entry.title.toLowerCase().match(new RegExp(searchQuery.toLowerCase(), 'g')) || []).length;
          const contentMatches = (entry.content.toLowerCase().match(new RegExp(searchQuery.toLowerCase(), 'g')) || []).length;
          const totalMatches = titleMatches + contentMatches;
          
          return {
            title: entry.title,
            slug: entry.slug,
            excerpt: entry.content.substring(0, 100) + '...',
            matches: totalMatches
          };
        })
        .filter(result => result.matches > 0)
        .sort((a, b) => b.matches - a.matches);

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search query change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchDocs(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, searchDocs]);

  // Handle result selection
  const handleResultSelect = (slug: string) => {
    setIsOpen(false);
    router.push(`/${locale}/documentation/${slug}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full md:w-60 justify-between text-gray-500">
          <div className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            <span>{t('placeholder')}</span>
          </div>
          <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
            {t('keyboardShortcut')}
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
          <Input
            placeholder={t('placeholder')}
            className="flex h-12 flex-1 border-0 focus-visible:ring-0 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="h-6 w-6 p-0 rounded-md"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto p-4">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result) => (
                <button
                  key={result.slug}
                  className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleResultSelect(result.slug)}
                >
                  <h4 className="text-sm font-medium">{result.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {result.excerpt}
                  </p>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="py-8 text-center text-gray-500">
              <p>{t('noResults')} "{query}"</p>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>{t('typeToSearch')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 