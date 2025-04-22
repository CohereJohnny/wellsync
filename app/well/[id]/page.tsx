import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/server'
import { WellDetail } from '@/components/well-detail'

interface WellPageProps {
  params: {
    id: string
  }
}

export default async function WellPage({ params }: WellPageProps) {
  const { data: well, error: wellError } = await supabaseAdmin
    .from('wells')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: faults, error: faultsError } = await supabaseAdmin
    .from('faults')
    .select('*')
    .eq('well_id', params.id)
    .order('timestamp', { ascending: false })

  if (wellError || !well) {
    notFound()
  }

  return (
    <main className="container mx-auto py-6">
      <WellDetail 
        wellId={params.id} 
        initialWell={well} 
        initialFaults={faults || []} 
      />
    </main>
  )
}

export function generateMetadata({ params }: WellPageProps) {
  return {
    title: `Well ${params.id} Details - WellSync AI`,
  }
} 