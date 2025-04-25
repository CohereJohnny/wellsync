'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Well } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu" // Import ContextMenu components
import { AlertTriangle, FileText, PlusCircle, ZoomIn } from 'lucide-react'; // Import icons

interface MapWellListItemProps {
  well: Well;
  openFaultDialog: (well: Well) => void;
  onZoomToWell: (wellId: string) => void;
}

// Function to get status indicator color (similar to marker color)
const getStatusColor = (status: string): string => {
  const lowerStatus = status?.toLowerCase() || '';
  if (lowerStatus === 'operational') return 'bg-green-500';
  if (lowerStatus === 'fault') return 'bg-red-500';
  if (lowerStatus === 'pending repair' || lowerStatus === 'pendingrepair') return 'bg-yellow-500';
  return 'bg-gray-400'; // Default color
};

export function MapWellListItem({ well, openFaultDialog, onZoomToWell }: MapWellListItemProps) {
  const tActions = useTranslations('toolbar.actions');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // --- Action Handlers ---
  const handleViewDetails = () => {
    router.push(`/${locale}/well/${well.id}`);
  };

  const handleContextMenuTriggerFault = () => {
    openFaultDialog(well);
  };

  const handleCreateSR = () => {
    // TODO: Implement Service Request creation logic
    console.log(`Create SR clicked for well: ${well.id}`);
    alert(`Create SR action not yet implemented for ${well.name}`);
  };

  // --- Action Handler for Zoom (restored for context menu) ---
  const handleZoomTo = () => {
    onZoomToWell(well.id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <li 
          className="p-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-between gap-2"
          onClick={() => onZoomToWell(well.id)}
          onDoubleClick={handleViewDetails}
          key={well.id}
        >
          <div className="flex-1 min-w-0"> 
            <p className="font-medium truncate" title={well.name}>{well.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={`${well.camp || 'N/A'} / ${well.formation || 'N/A'}`}>
              {well.camp || 'N/A'} / {well.formation || 'N/A'}
            </p>
          </div>
          <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", getStatusColor(well.status))} title={well.status}></div>
        </li>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-white dark:bg-gray-800">
        <ContextMenuItem onClick={handleViewDetails} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>View Details</span> 
        </ContextMenuItem>
        <ContextMenuItem onClick={handleContextMenuTriggerFault} className="cursor-pointer">
          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
          <span>{tActions('triggerFault')}</span> 
        </ContextMenuItem>
        <ContextMenuItem onClick={handleZoomTo} className="cursor-pointer"> 
          <ZoomIn className="mr-2 h-4 w-4" />
          <span>Zoom to Well</span> 
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCreateSR} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
          <span>Create SR</span> 
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 