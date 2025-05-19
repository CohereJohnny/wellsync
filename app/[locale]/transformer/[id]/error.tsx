'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TransformerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Transformer page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-2xl w-full text-center">
        <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
        <p className="mb-4">
          There was an error loading the transformer details. Please try again.
        </p>
        <p className="text-sm mb-6 text-red-600 bg-red-100 p-2 rounded overflow-auto">
          {error.message || 'Unknown error occurred'}
        </p>
        <Button onClick={reset} variant="outline" className="mx-auto">
          Try again
        </Button>
      </div>
    </div>
  );
} 