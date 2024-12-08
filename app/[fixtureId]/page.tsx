import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

// Correctly import the FixturePage component
const FixturePage = dynamic(() => import('@/components/fixture-page'), {
  ssr: false,
  loading: () => <Skeleton className="h-screen w-full" />
});

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { fixtureId: string } }) {
  return {
    title: `Match ${params.fixtureId} - Live Football`,
    description: `Live football match details and updates for match ${params.fixtureId}`
  };
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <FixturePage />
    </Suspense>
  );
}