'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { setApiChannel as setApiV2Channel } from '@/lib/api-v2';
import { setApiChannel as setApiChannel } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Server, Radio } from 'lucide-react';

interface ChannelSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fixtureId: string | number;
}

export function ChannelSelectionDialog({
  isOpen,
  onClose,
  fixtureId,
}: ChannelSelectionDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<'A' | 'B'>('A');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChannelSelect = async () => {
    try {
      setIsLoading(true);
      // Set the channel for both APIs
      setApiV2Channel(selectedChannel);
      setApiChannel(selectedChannel);
      
      console.log(`Channel ${selectedChannel} selected for both APIs`);
      
      // Close the dialog
      onClose();
      
      // Navigate to the fixture page
      router.push(`/live/${fixtureId}`);
    } catch (error) {
      console.error('Error selecting channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Select Channel</DialogTitle>
          <DialogDescription>
            Choose which backend channel to use for this fixture
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={selectedChannel}
            onValueChange={(value) => setSelectedChannel(value as 'A' | 'B')}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <RadioGroupItem value="A" id="channel-a" />
              <Label htmlFor="channel-a" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Channel A (Default)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Server at 51.89.167.87:3000
                    </p>
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
              <RadioGroupItem value="B" id="channel-b" />
              <Label htmlFor="channel-b" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                    <Radio className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Channel B (Backup)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Server at 51.89.167.87:3003
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleChannelSelect} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
