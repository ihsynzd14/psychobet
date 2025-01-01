import { FeedManagement } from '@/components/feed-management';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <FeedManagement />
      </div>
    </main>
  );
}