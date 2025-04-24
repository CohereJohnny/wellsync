'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TableOfContentsProps {
  className?: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const t = useTranslations('documentation.tableOfContents');

  // Extract headings from the page
  useEffect(() => {
    const article = document.querySelector('.prose');
    if (!article) return;

    // Find all h2 and h3 elements in the article
    const elements = Array.from(article.querySelectorAll('h2, h3'));
    
    const extractedHeadings: Heading[] = elements
      .filter(el => el.id) // Only consider elements with IDs
      .map(el => ({
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      }));

    setHeadings(extractedHeadings);
  }, []);

  // Setup intersection observer to track active heading
  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      // Find the entries that are currently visible on the page
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      // If there are visible entries, update the active ID to the first one
      if (visibleEntries.length > 0) {
        const firstVisible = visibleEntries[0];
        setActiveId(firstVisible.target.id);
      }
    };

    // Create our observer
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: '0px 0px -80% 0px', // Consider an element visible when it's in the top 20% of the viewport
      threshold: 0.1,
    });

    // Observe all the headings
    const elements = document.querySelectorAll('h2, h3');
    elements.forEach(el => {
      if (el.id && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      // Cleanup observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  // No headings, don't render
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto", className)}>
      <div className="mb-4 text-sm font-medium">{t('title')}</div>
      <nav>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={cn(
                heading.level === 3 && "ml-4",
                "transition-colors"
              )}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "inline-block hover:text-blue-600 dark:hover:text-blue-500",
                  activeId === heading.id 
                    ? "text-blue-600 dark:text-blue-500 font-medium" 
                    : "text-gray-600 dark:text-gray-400"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: 'smooth'
                  });
                  setActiveId(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 