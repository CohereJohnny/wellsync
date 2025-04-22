import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import { Well } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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

// TODO: Add React.memo if performance issues arise
export function WellCard({ well }: WellCardProps) {
  const router = useRouter();

  // Determine badge variant based on status
  // Assign appropriate background colors based on the design spec
  const badgeBgColor = well.status.toLowerCase() === "operational" ? "bg-green-500" : "bg-red-500"; // #22C55E and #EF4444
  const textColor = "text-white"; // White text for badges
  const badgePadding = "px-2 py-1";
  const textSize = "text-sm";
  const fontWeight = "font-medium";
  const badgeShape = "rounded";

  const handleClick = () => {
    router.push(`/well/${well.id}`);
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
          {/* Title Style: text-lg, font-bold, text-navy-900 (#1E3A8A -> blue-800) */}
          <CardTitle className="text-lg font-bold text-blue-800">{well.name}</CardTitle>
          {/* Badge Style: Specific bg, white text, padding, size, font weight, shape */}
          <Badge className={cn(badgeBgColor, textColor, badgePadding, textSize, fontWeight, badgeShape)}>
            {well.status}
          </Badge>
        </div>
      </CardHeader>
      {/* Content contains Camp and Formation */}
      <CardContent className="p-0"> {/* Remove default padding */} 
        {/* Camp/Formation Style: text-sm, text-gray-600 (#6B7280) */}
        <p className="text-sm text-gray-600">Camp: {well.camp}</p>
        <p className="text-sm text-gray-600">Formation: {well.formation}</p>
      </CardContent>
    </Card>
  );
}

WellCard.displayName = 'WellCard';

export default WellCard; 