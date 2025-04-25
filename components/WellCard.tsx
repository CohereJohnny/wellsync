'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import { Well } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useSupabase } from "@/context/supabase-context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { AlertTriangle, FileText, PlusCircle, ZoomIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WellCardProps {
  well: Well;
  openFaultDialog: (well: Well) => void;
  onCreateSR: (wellId: string) => void;
  onZoomToWell?: (wellId: string) => void;
}

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: WellCardProps, nextProps: WellCardProps) => {
  return (
    prevProps.well.id === nextProps.well.id &&
    prevProps.well.status === nextProps.well.status &&
    prevProps.well.name === nextProps.well.name &&
    prevProps.well.camp === nextProps.well.camp &&
    prevProps.well.formation === nextProps.well.formation
  );
};

// Helper function for badge classes - similar to the one in WellTableView
const getBadgeClasses = (status: string) => {
  const lowerStatus = status?.toLowerCase() || '';
  const bgColor = lowerStatus === 'operational' ? 'bg-green-500' :
                  lowerStatus === 'fault' ? 'bg-red-500' :
                  'bg-yellow-500'; // Default/Pending color
  return cn('text-white px-2 py-1 text-xs font-medium rounded', bgColor);
};

// TODO: Add React.memo if performance issues arise
export function WellCard({ 
  well, 
  openFaultDialog, 
  onCreateSR, 
  onZoomToWell 
}: WellCardProps): JSX.Element {
  const tStatus = useTranslations('wellStatus');
  const tCard = useTranslations('wellCard');
  const tContextMenu = useTranslations('wellCardContextMenu');
  const supabase = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState(well.status);

  useEffect(() => {
    setCurrentStatus(well.status); // Update status if prop changes

    const channel = supabase
      .channel(`well-status-changes-${well.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'wells', filter: `id=eq.${well.id}` },
        (payload) => {
          if (payload.new && payload.new.status) {
            console.log(`Realtime update for Well ${well.id}: New status ${payload.new.status}`);
            setCurrentStatus(payload.new.status);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to status changes for Well ${well.id}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Subscription error for Well ${well.id}:`, status, err);
        } else {
           console.log(`Subscription status for Well ${well.id}:`, status);
        }
      });

    // Cleanup function to remove the channel subscription
    return () => {
      console.log(`Cleaning up WellCard subscription for Well ${well.id}...`);
      supabase.removeChannel(channel);
      console.log(`Channel removal status: ${channel.state}`);
    };
  }, [well.id, well.status, supabase]);

  // Get translated status text
  const getStatusText = (status: string) => {
    const lowerStatus = status?.toLowerCase().replace(/\s+/g, '') || '';
    if (lowerStatus === 'operational' || lowerStatus === 'fault' || lowerStatus === 'pendingrepair') {
      return tStatus(lowerStatus as 'operational' | 'fault' | 'pendingrepair');
    }
    return status;
  };

  // Get locale once
  const locale = pathname.split('/')[1];

  // Main card click handler (already navigates)
  const handleClick = useCallback(() => {
    router.push(`/${locale}/well/${well.id}`);
  }, [router, locale, well.id]);

  // Context menu handlers
  const handleContextMenuViewDetails = useCallback(() => {
    // Navigate directly using router
    router.push(`/${locale}/well/${well.id}`);
  }, [router, locale, well.id]);

  // Trigger Fault: Calls the prop passed from WellGrid
  const handleContextMenuTriggerFault = useCallback(() => {
    openFaultDialog(well);
  }, [openFaultDialog, well]);

  // Create SR: Calls the prop passed from WellGrid
  const handleContextMenuCreateSR = useCallback(() => {
    onCreateSR(well.id);
  }, [onCreateSR, well.id]);

  // Zoom To Well: Calls the prop passed from WellGrid (optional)
  const handleContextMenuZoomToWell = useCallback(() => {
    onZoomToWell?.(well.id); 
  }, [onZoomToWell, well.id]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card 
          className="bg-white shadow-sm rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer h-full flex flex-col"
          onClick={handleClick}
        >
          <CardHeader className="p-0 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-900 truncate" title={well.name}>{well.name}</CardTitle>
              <span className={cn(getBadgeClasses(currentStatus), "ml-2 flex-shrink-0")}>
                {getStatusText(currentStatus)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <p className="text-sm font-normal text-gray-600">{tCard('campLabel')}: {well.camp || 'N/A'}</p>
            <p className="text-sm font-normal text-gray-600">{tCard('formationLabel')}: {well.formation || 'N/A'}</p>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-white dark:bg-gray-800">
        <ContextMenuItem onClick={handleContextMenuViewDetails} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>{tContextMenu('viewDetails')}</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleContextMenuTriggerFault} className="cursor-pointer">
          <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
          <span>{tContextMenu('triggerFault')}</span>
        </ContextMenuItem>
        {onZoomToWell && (
          <ContextMenuItem onClick={handleContextMenuZoomToWell} className="cursor-pointer">
            <ZoomIn className="mr-2 h-4 w-4" />
            <span>{tContextMenu('zoomToWell')}</span>
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={handleContextMenuCreateSR} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4 text-blue-500" />
          <span>{tContextMenu('createSR')}</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// WellCard.displayName = 'WellCard';

export default WellCard; 