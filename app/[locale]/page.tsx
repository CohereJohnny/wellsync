'use client';

import { Suspense, useState } from 'react';
import TransformerGrid from '@/components/TransformerGrid';
import { TransformerTableView } from '@/components/transformer-table-view';
import { MapViewDashboard } from '@/components/dashboard/map-view-dashboard';
import { ViewType, TransformerFilters } from '@/components/toolbar-transformer';
import { TransformerToolbar } from '@/components/toolbar-transformer';
import { FaultSimulationDialog } from '@/components/fault-simulation-dialog';
import { Transformer } from '@/lib/types';

// Define the props for the DashboardPage
interface DashboardPageProps {
  params: { locale: string };
  searchParams?: { 
    view?: ViewType;
    substation?: string;
    type?: string;
    status?: string;
  }; 
}

// Server Component for the Dashboard
export default function DashboardPage({ params, searchParams }: DashboardPageProps) {
  // Always default to Centerpoint transformer view
  const currentView = searchParams?.view || 'card';
  
  // State for the centralized Fault Simulation Dialog
  const [faultDialogState, setFaultDialogState] = useState<{ isOpen: boolean; transformer: Transformer | null }>({ 
    isOpen: false, 
    transformer: null 
  });

  // Function to open the dialog
  const openFaultDialog = (transformer: Transformer | null) => {
    console.log("Opening fault dialog for transformer:", transformer?.id || 'Toolbar Trigger');
    setFaultDialogState({ isOpen: true, transformer });
  };

  // Function to close the dialog
  const closeFaultDialog = () => {
    setFaultDialogState({ isOpen: false, transformer: null });
  };

  // Construct filters object from searchParams
  const filters: TransformerFilters = {
    substation: searchParams?.substation,
    type: searchParams?.type,
    status: searchParams?.status,
  };

  // Conditionally render the view component
  const renderView = () => {
    switch (currentView) {
      case 'table':
        return (
          <Suspense fallback={<div>Loading Table...</div>}>
            {/* Pass openFaultDialog down */}
            <TransformerTableView openFaultDialog={openFaultDialog} />
          </Suspense>
        );
      case 'map':
        return (
          <Suspense fallback={<div>Loading Map...</div>}>
            <MapViewDashboard filters={filters} openFaultDialog={openFaultDialog} />
          </Suspense>
        );
      case 'card':
      default:
        return (
          <Suspense fallback={<div>Loading Grid...</div>}>
            {/* Pass openFaultDialog down */}
            <TransformerGrid openFaultDialog={openFaultDialog} />
          </Suspense>
        );
    }
  };

  return (
    // Outer full-width wrapper
    <div className="w-full">
      {/* Sticky Toolbar wrapper - full width, below header */}
      <div className="sticky top-16 z-40 w-full border-b bg-background backdrop-blur supports-backdrop-blur:bg-background/95">
        <TransformerToolbar openFaultDialog={openFaultDialog} />
      </div>
      {/* Container for the main content (Grid, Table, Map) */}
      <div className="container mx-auto px-4 py-6">
        {renderView()}
      </div>
      <FaultSimulationDialog 
        isOpen={faultDialogState.isOpen}
        onOpenChange={(open) => { if (!open) closeFaultDialog(); }}
        initialWell={faultDialogState.transformer}
      />
    </div>
  );
} 