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
  // Validate id parameter - check if it's a valid UUID format
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!params.id || !UUID_REGEX.test(params.id)) {
    notFound()
  }

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <WellDetail wellId={params.id} />
      </Suspense>
    </main>
  )
}

export function generateMetadata({ params }: WellPageProps) {
  return {
    title: `Well ${params.id} Details - WellSync AI`,
  }
} 