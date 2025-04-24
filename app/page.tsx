import Image from "next/image"; 
import WellGrid from "@/components/WellGrid";
import { WellTableView } from '@/components/well-table-view';
import { Toolbar } from "@/components/toolbar";
import { Suspense } from "react";

export default function Home({ 
  searchParams, 
}: { 
  searchParams?: { 
    view?: 'card' | 'table';
    camp?: string;
    formation?: string;
    status?: string;
   }; 
}) {
  const currentView = searchParams?.view === 'table' ? 'table' : 'card';

  return (
    <main className="flex flex-col min-h-screen">
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
    </main>
  );
} 