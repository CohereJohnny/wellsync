'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { Transformer } from '@/lib/types';

interface TransformerCardProps {
  transformer: Transformer;
  openFaultDialog: (transformer: Transformer) => void;
  onCreateSR: (id: string) => void;
  onZoomToTransformer?: (id: string) => void;
}

export function TransformerCard({ 
  transformer, 
  openFaultDialog, 
  onCreateSR, 
  onZoomToTransformer 
}: TransformerCardProps): JSX.Element {
  const tStatus = useTranslations('transformerStatus');
  const tCard = useTranslations('transformerCard');
  const router = useRouter();
  const pathname = usePathname();

  // Get current status from transformer object
  const currentStatus = transformer.status || 'Operational';

  // Define badge colors based on status
  const getBadgeClasses = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'operational') {
      return 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium';
    } else if (lowerStatus === 'fault') {
      return 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium';
    } else if (lowerStatus === 'pendingrepair' || lowerStatus === 'pending repair') {
      return 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium';
    } else {
      return 'bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium';
    }
  };

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
    router.push(`/${locale}/transformer/${transformer.id}`);
  }, [router, locale, transformer.id]);

  // Context menu handlers
  const handleContextMenuViewDetails = useCallback(() => {
    // Navigate directly using router
    router.push(`/${locale}/transformer/${transformer.id}`);
  }, [router, locale, transformer.id]);

  // Trigger Fault: Calls the prop passed from TransformerGrid
  const handleContextMenuTriggerFault = useCallback(() => {
    openFaultDialog(transformer);
  }, [openFaultDialog, transformer]);

  // Create SR: Calls the prop passed from TransformerGrid
  const handleContextMenuCreateSR = useCallback(() => {
    onCreateSR(transformer.id);
  }, [onCreateSR, transformer.id]);

  // Zoom To Transformer: Calls the prop passed from TransformerGrid (optional)
  const handleContextMenuZoomToTransformer = useCallback(() => {
    onZoomToTransformer?.(transformer.id); 
  }, [onZoomToTransformer, transformer.id]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card 
          className="bg-white shadow-sm rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer h-full flex flex-col"
          onClick={handleClick}
        >
          <CardHeader className="p-0 pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-900 truncate" title={transformer.name}>{transformer.name}</CardTitle>
              <span className={cn(getBadgeClasses(currentStatus), "ml-2 flex-shrink-0")}>
                {getStatusText(currentStatus)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <p className="text-sm font-normal text-gray-600">{tCard('substationLabel')}: {transformer.substation || 'N/A'}</p>
            <p className="text-sm font-normal text-gray-600">{tCard('typeLabel')}: {transformer.type || 'N/A'}</p>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleContextMenuViewDetails}>{tCard('viewDetails')}</ContextMenuItem>
        <ContextMenuItem onClick={handleContextMenuTriggerFault}>{tCard('triggerFault')}</ContextMenuItem>
        <ContextMenuItem onClick={handleContextMenuCreateSR}>{tCard('createSR')}</ContextMenuItem>
        {onZoomToTransformer && (
          <ContextMenuItem onClick={handleContextMenuZoomToTransformer}>{tCard('zoomTo')}</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
} 