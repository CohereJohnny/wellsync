'use client';

import { Suspense, useState } from 'react';
import WellGrid from '@/components/WellGrid';
import { WellTableView } from '@/components/well-table-view';
import { MapViewDashboard } from '@/components/dashboard/map-view-dashboard';
import { ViewType, WellFilters, Toolbar } from '@/components/toolbar';
import { FaultSimulationDialog } from '@/components/fault-simulation-dialog';
import { Well } from '@/lib/types';

// Define the props for the DashboardPage
interface DashboardPageProps {
  params: { locale: string };
  searchParams?: { 
    view?: ViewType;
    camp?: string;
    formation?: string;
    status?: string;
  }; 
}

// Server Component for the Dashboard
export default function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const currentView = searchParams?.view || 'card';
  
  // State for the centralized Fault Simulation Dialog
  const [faultDialogState, setFaultDialogState] = useState<{ isOpen: boolean; well: Well | null }>({ 
    isOpen: false, 
    well: null 
  });

  // Function to open the dialog
  const openFaultDialog = (well: Well | null) => {
    console.log("Opening fault dialog for well:", well?.id || 'Toolbar Trigger');
    setFaultDialogState({ isOpen: true, well });
  };

  // Function to close the dialog
  const closeFaultDialog = () => {
    setFaultDialogState({ isOpen: false, well: null });
  };

  // Construct filters object from searchParams
  const filters: WellFilters = {
    camp: searchParams?.camp,
    formation: searchParams?.formation,
    status: searchParams?.status,
  };

  // Conditionally render the view component
  const renderView = () => {
    switch (currentView) {
      case 'table':
        return (
          <Suspense fallback={<div>Loading Table...</div>}>
            {/* Pass openFaultDialog down */}
            <WellTableView openFaultDialog={openFaultDialog} />
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
            <WellGrid openFaultDialog={openFaultDialog} />
          </Suspense>
        );
    }
  };

  return (
    // Outer full-width wrapper
    <div className="w-full">
      {/* Sticky Toolbar wrapper - full width, below header */}
      <div className="sticky top-16 z-40 w-full border-b bg-background backdrop-blur supports-backdrop-blur:bg-background/95">
        <Toolbar openFaultDialog={openFaultDialog} />
      </div>
      {/* Container for the main content (Grid, Table, Map) */}
      <div className="container mx-auto px-4 py-6">
        {renderView()}
      </div>
      <FaultSimulationDialog 
        isOpen={faultDialogState.isOpen}
        onOpenChange={(open) => { if (!open) closeFaultDialog(); }}
        initialWell={faultDialogState.well}
      />
    </div>
  );
} 