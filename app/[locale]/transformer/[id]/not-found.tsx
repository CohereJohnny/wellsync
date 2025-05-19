import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TransformerNotFound() {
  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-lg max-w-2xl w-full text-center">
        <h2 className="text-xl font-semibold mb-4">Transformer Not Found</h2>
        <p className="mb-6">
          The transformer you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild variant="outline" className="mx-auto">
          <Link href="/en">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
} 