import Image from "next/image"; 
import WellGrid from "@/components/WellGrid";
import { WellTableView } from '@/components/well-table-view';
import { Toolbar } from "@/components/toolbar";
import { Suspense } from "react";

// Type for the page props including the locale parameter
export default function HomePage({ 
  searchParams,
  params,
}: { 
  searchParams?: { 
    view?: 'card' | 'table';
    camp?: string;
    formation?: string;
    status?: string;
  }; 
  params: { locale: string };
}) {
  const currentView = searchParams?.view === 'table' ? 'table' : 'card';

  return (
    <div className="flex flex-col">
      <Suspense>
        <Toolbar />
      </Suspense>
      <div className="flex-1 container mx-auto p-8">
        <Suspense>
          {currentView === 'card' ? (
            <WellGrid />
          ) : (
            <WellTableView />
          )}
        </Suspense>
      </div>
    </div>
  );
} 