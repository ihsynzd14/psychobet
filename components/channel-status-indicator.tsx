'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { apiV2 } from '@/lib/api-v2';
import { api } from '@/lib/api';
import { Radio, Server } from 'lucide-react';

export function ChannelStatusIndicator() {
  const [activeChannel, setActiveChannel] = useState<{ 
    channel: 'A' | 'B' | null, 
    url: string,
    socketUrl?: string
  }>({ 
    channel: null, 
    url: '',
    socketUrl: ''
  });

  // Get the active channel on component mount and when it changes
  useEffect(() => {
    const apiV2Channel = apiV2.getActiveChannel();
    const apiChannel = api.getActiveChannel();
    
    // Use apiV2 channel as the primary indicator, but show both URLs if they differ
    setActiveChannel({
      channel: apiV2Channel.channel,
      url: apiV2Channel.url,
      socketUrl: apiChannel.socketUrl
    });
    
    // Check for channel changes every 2 seconds
    const intervalId = setInterval(() => {
      const currentApiV2Channel = apiV2.getActiveChannel();
      const currentApiChannel = api.getActiveChannel();
      
      if (currentApiV2Channel.channel !== activeChannel.channel) {
        setActiveChannel({
          channel: currentApiV2Channel.channel,
          url: currentApiV2Channel.url,
          socketUrl: currentApiChannel.socketUrl
        });
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  // If no channel is selected, don't show anything
  if (!activeChannel.channel) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`px-2 py-0.5 flex items-center gap-1.5 cursor-help ${
              activeChannel.channel === 'A'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
            }`}
          >
            {activeChannel.channel === 'A' ? (
              <Server className="h-3 w-3" />
            ) : (
              <Radio className="h-3 w-3" />
            )}
            <span className="text-xs font-medium">
              Channel {activeChannel.channel}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 max-w-xs">
            <p>API: {activeChannel.url}</p>
            {activeChannel.socketUrl && (
              <p>Socket: {activeChannel.socketUrl}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
