'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode; // Expecting the <code className="language-..."> element
}

// Helper to extract raw code string from potentially complex children
function getCodeString(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (Array.isArray(children)) {
    return children.map(getCodeString).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    // The direct child should be the <code> element
    return getCodeString(children.props.children);
  }
  return '';
}

export function CodeBlock({ children }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Extract the raw code string from the children (which is the <code> element)
  const rawCode = getCodeString(children);

  // Calculate line numbers
  const lines = rawCode.split('\n');
  // Remove trailing empty line if present
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }
  const lineCount = lines.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
    <div className="not-prose relative group bg-[#F9FAFB] dark:bg-[#1F2937] rounded-lg my-6 overflow-hidden text-sm shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-black/50 p-1 rounded-md"
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </Button>
      <div className="flex">
        <div className="flex-shrink-0 py-3 pl-4 pr-3 text-right text-gray-400 dark:text-gray-500 select-none bg-gray-100/50 dark:bg-gray-800/30 font-mono">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="flex-1 overflow-x-auto py-3 px-4 font-mono">
          {children}
        </div>
      </div>
    </div>
  );
} 