'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import { Well } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useSupabase } from "@/context/supabase-context";

interface WellCardProps {
  well: Well;
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
export function WellCard({ well }: WellCardProps) {
  const tStatus = useTranslations('wellStatus');
  const tCard = useTranslations('wellCard');
  const supabase = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
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

  const handleClick = () => {
    // Extract the locale from the pathname
    const locale = pathname.split('/')[1]; // Pathname format is "/en/..." or "/es/..."
    router.push(`/${locale}/well/${well.id}`);
  };

  return (
    <Card 
      // Apply design spec styles: bg-white (default for Card), shadow-sm, rounded-lg, p-4, hover effect
      className="bg-white shadow-sm rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer"
      onClick={handleClick}
    >
      {/* Header contains Title and Badge */}
      <CardHeader className="p-0 pb-2"> {/* Remove default padding, add bottom padding */}
        <div className="flex justify-between items-center">
          {/* Title Style: text-xl (H2), font-bold, text-gray-900 (using darker gray instead of navy for consistency) */}
          <CardTitle className="text-xl font-bold text-gray-900">{well.name}</CardTitle>
          <span className={cn(getBadgeClasses(currentStatus), "ml-auto")}>
            {getStatusText(currentStatus)}
          </span>
        </div>
      </CardHeader>
      {/* Content contains Camp and Formation */}
      <CardContent className="p-0"> {/* Remove default padding */} 
        {/* Camp/Formation Style: text-sm (Small), font-normal (Regular) text-gray-600 */}
        <p className="text-sm font-normal text-gray-600">{tCard('campLabel')}: {well.camp}</p>
        <p className="text-sm font-normal text-gray-600">{tCard('formationLabel')}: {well.formation}</p>
      </CardContent>
    </Card>
  );
}

// WellCard.displayName = 'WellCard'; // Remove if not using React.memo directly here

export default WellCard; // Use default export if it's the main export 