import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';
import Link from 'next/link';

// This file allows you to provide custom React components
// to be used in MDX files.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override the default components with custom styling
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-blue-500">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-400 border-b pb-1">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mt-4 mb-2 text-blue-300">{children}</h3>
    ),
    a: ({ children, href }) => {
      const isExternal = href?.startsWith('http');
      if (isExternal) {
        return (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {children}
          </a>
        );
      }
      return href ? (
        <Link 
          href={href}
          className="text-blue-600 hover:underline"
        >
          {children}
        </Link>
      ) : null;
    },
    img: (props) => {
      // Create a copy of props without the alt to avoid duplication
      const { alt, ...rest } = props as ImageProps;
      return (
        <Image
          className="rounded-md my-6"
          sizes="100vw"
          style={{ width: '100%', height: 'auto', maxWidth: '800px' }}
          alt={alt || 'Documentation image'}
          {...rest}
        />
      );
    },
    code: ({ children, className }) => {
      // Handle inline code blocks
      if (!className) {
        return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded font-mono text-sm">{children}</code>;
      }
      
      // Larger code blocks are handled by rehype-highlight
      return (
        <code className={className}>
          {children}
        </code>
      );
    },
    pre: (props) => (
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto my-4 text-sm">
        {props.children}
      </pre>
    ),
    // Add your custom components
    ...components,
  };
} 