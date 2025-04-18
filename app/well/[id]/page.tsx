import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { WellDetail } from '@/components/well-detail'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BackButton } from '@/components/back-button'

interface WellPageProps {
  params: {
    id: string
  }
}

export default async function WellPage({ params }: WellPageProps) {
  // Validate id parameter
  if (!params.id || isNaN(parseInt(params.id))) {
    notFound()
  }

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <WellDetail wellId={parseInt(params.id)} />
      </Suspense>
    </main>
  )
}

export function generateMetadata({ params }: WellPageProps) {
  return {
    title: `Well ${params.id} Details - WellSync AI`,
  }
} 