import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import { Well } from '@/lib/types'; 

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

const WellCard = React.memo(({ well }: WellCardProps) => {
  // Add console log to track re-renders
  console.log('WellCard rendering for:', well.name, 'Status:', well.status);

  // Determine badge variant based on status
  const badgeVariant = well.status.toLowerCase() === "operational" ? "default" : "destructive";
  // Assign appropriate background colors based on Shadcn theme variables or custom Tailwind colors
  const badgeBgColor = well.status.toLowerCase() === "operational" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";

  return (
    <Card className="hover:scale-[1.03] transition-transform duration-200 ease-in-out cursor-pointer shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-navy-900">{well.name}</CardTitle>
          <Badge variant={badgeVariant} className={`text-white ${badgeBgColor}`}>
            {well.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Camp: {well.camp}</p>
        <p className="text-sm text-gray-600">Formation: {well.formation}</p>
        {/* Add more details if needed later */}
      </CardContent>
    </Card>
  );
}, arePropsEqual);

WellCard.displayName = 'WellCard';

export default WellCard; 