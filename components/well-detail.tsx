import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface WellDetailProps {
  wellId: string
}

export async function WellDetail({ wellId }: WellDetailProps) {
  const supabase = createClient()
  
  const { data: well, error } = await supabase
    .from('wells')
    .select('*')
    .eq('id', wellId)
    .single()

  if (error || !well) {
    notFound()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Well Information */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{well.name}</h1>
            <Badge variant={well.status === 'active' ? 'default' : 'destructive'}>
              {well.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Camp</h2>
              <p className="text-lg">{well.camp}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Formation</h2>
              <p className="text-lg">{well.formation}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Location</h2>
              <p className="text-lg">{well.location}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Last Updated</h2>
              <p className="text-lg">
                {new Date(well.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Technical Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Depth</h3>
                <p>{well.depth} ft</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Pressure</h3>
                <p>{well.pressure} psi</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Temperature</h3>
                <p>{well.temperature}°F</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Flow Rate</h3>
                <p>{well.flow_rate} bbl/d</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Panel - Chat (Placeholder) */}
      <Card className="p-6">
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Chat panel coming in future sprint
        </div>
      </Card>
    </div>
  )
} 