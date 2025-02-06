import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';

interface RealTimeFeedModalProps {
  fixtureId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RealTimeFeedModal({ fixtureId, isOpen, onClose }: RealTimeFeedModalProps) {
  const [feedData, setFeedData] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen || !fixtureId) return;

    const socket = api.subscribeToFixture(fixtureId, (data) => {
      setFeedData((prev) => [...prev, data].slice(-50)); // Son 50 veriyi tut
    });

    return () => {
      socket?.();
    };
  }, [fixtureId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Real-Time Veri Akışı - Maç #{fixtureId}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-2">
            {feedData.map((data, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Genius TS: {new Date(data._geniusTs).toLocaleTimeString()}</span>
                  <span>Backend TS: {new Date(data._backendTs).toLocaleTimeString()}</span>
                </div>
                <div className="mt-2 font-mono text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(data.raw, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
            {feedData.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Veri bekleniyor...
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 