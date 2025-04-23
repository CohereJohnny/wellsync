import Image from "next/image"; 
import WellGrid from "@/components/WellGrid";
import { WellTableView } from '@/components/well-table-view';
// Toolbar is now in the layout
// import { Toolbar } from "@/components/toolbar";
import { Suspense } from "react";

// Define props, including locale from params
interface HomePageProps {
  params: { locale: string }; // Locale is now part of params
  searchParams?: { 
    view?: 'card' | 'table';
    camp?: string;
    formation?: string;
    status?: string;
   };
}

// Note: This component doesn't need to be async unless awaiting searchParams
// And searchParams might need Promise type for Next 15 (though we reverted)
// Let's keep it simple for now, assuming Next 14 behaviour after dependency revert.
export default function HomePage({ searchParams, params }: HomePageProps) {
  const currentView = searchParams?.view === 'table' ? 'table' : 'card';

  // locale param is available via params.locale if needed

  return (
    // No <main> tag needed as it's in the locale layout
    <div className="flex-1 container mx-auto p-8">
      {/* Toolbar removed as it's in the layout */}
      <Suspense>
        {currentView === 'card' ? (
          <WellGrid />
        ) : (
          <WellTableView />
        )}
      </Suspense>
    </div>
  );
} 