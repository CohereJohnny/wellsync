import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { TableOfContents } from '@/components/docs/table-of-contents';

interface DocPageParams {
  params: {
    locale: string;
    slug: string;
  };
}

// Function to convert kebab case to title case
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Function to load markdown content
async function getDocContent(slug: string): Promise<string | null> {
  const fileMappings: Record<string, string> = {
    'components': 'components.md',
    'api-chat': 'api_chat.md',
    'api-orders': 'api_orders.md',
    'api-dispatches': 'api_dispatches.md',
    'api-search-faults': 'api_search_faults.md',
    'rpc-search-faults': 'rpc_search_faults.md',
    'semantic-search-backend': 'semantic_search_backend.md',
    'tool-schemas': 'tool_schemas.md',
    'demo-script': 'demo_script.md',
  };

  const fileName = fileMappings[slug];
  if (!fileName) return null;

  const filePath = path.join(process.cwd(), 'docs', fileName);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
  } catch (error) {
    console.error(`Error reading file for slug ${slug}:`, error);
    return null;
  }
}

// Navigation data for next/previous page links
const navigationOrder = [
  'components',
  'api-chat',
  'api-orders',
  'api-dispatches',
  'api-search-faults',
  'rpc-search-faults',
  'semantic-search-backend',
  'tool-schemas',
  'demo-script',
];

export default async function DocPage({ params }: DocPageParams) {
  const { locale, slug } = params;
  const t = await getTranslations({ locale, namespace: 'common' });
  
  // Get the markdown content
  const content = await getDocContent(slug);
  
  if (!content) {
    notFound();
  }
  
  // Get navigation indices
  const currentIndex = navigationOrder.indexOf(slug);
  const prevSlug = currentIndex > 0 ? navigationOrder[currentIndex - 1] : null;
  const nextSlug = currentIndex < navigationOrder.length - 1 ? navigationOrder[currentIndex + 1] : null;
  
  // Convert to title for navigation display
  const prevTitle = prevSlug ? toTitleCase(prevSlug) : '';
  const nextTitle = nextSlug ? toTitleCase(nextSlug) : '';

  return (
    <div className="flex flex-col md:flex-row">
      {/* Main content area with markdown */}
      <div className="flex-1 min-w-0">
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold mb-6">{toTitleCase(slug)}</h1>
          </div>
          
          <div className="markdown-content">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
            >
              {content}
            </Markdown>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-16 pt-6 border-t border-gray-200 dark:border-gray-700">
            {prevSlug ? (
              <Link
                href={`/${locale}/documentation/${prevSlug}`}
                className="flex items-center text-blue-500 hover:text-blue-600 no-underline"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>{prevTitle}</span>
              </Link>
            ) : (
              <div></div>
            )}
            
            {nextSlug ? (
              <Link
                href={`/${locale}/documentation/${nextSlug}`}
                className="flex items-center text-blue-500 hover:text-blue-600 no-underline"
              >
                <span>{nextTitle}</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Table of contents sidebar */}
      <div className="hidden md:block w-64 ml-8 flex-shrink-0">
        <TableOfContents />
      </div>
    </div>
  );
} 