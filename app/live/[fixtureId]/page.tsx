'use client';
import { LiveFeedPage } from '@/components/live-feed-page';

interface LiveFeedPageProps {
  params: {
    fixtureId: string;
  };
}

export default function Page({ params }: LiveFeedPageProps) {
  return <LiveFeedPage fixtureId={params.fixtureId} />;
} 