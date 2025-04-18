import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge"; 
import { Well } from '@/lib/types'; 

interface WellCardProps {
  well: Well;
}

export default function WellCard({ well }: WellCardProps) {
  // Determine badge variant based on status
  const badgeVariant = well.status === "Operational" ? "default" : "destructive";
  // Assign appropriate background colors based on Shadcn theme variables or custom Tailwind colors
  const badgeBgColor = well.status === "Operational" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600";

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
} 