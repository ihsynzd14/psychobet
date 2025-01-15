import { Cloud, Wind, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MatchConditionsProps {
  systemMessages: Array<{
    message: string;
    timestamp: string;
  }>;
}

export function MatchConditions({ systemMessages }: MatchConditionsProps) {
  const conditions = systemMessages
    .filter(msg => msg.message.toLowerCase().startsWith('wind:') || 
                  msg.message.toLowerCase().startsWith('weather:') ||
                  msg.message.toLowerCase().includes('pitch'))
    .reduce((acc, msg) => {
      if (msg.message.toLowerCase().includes('pitch is')) {
        acc['pitch'] = msg.message.replace('Pitch is', '').trim();
      } else {
        const [type, ...value] = msg.message.split(':').map(s => s.trim());
        acc[type.toLowerCase()] = value.join(':').trim();
      }
      return acc;
    }, {} as Record<string, string>);

  if (!Object.keys(conditions).length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {conditions.wind && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Wind className="w-4 h-4" />
          {conditions.wind}
        </Badge>
      )}
      {conditions.weather && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Cloud className="w-5 h-5" />
          {conditions.weather}
        </Badge>
      )}
      {conditions.pitch && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Ruler className="w-4 h-4" />
          {conditions.pitch}
        </Badge>
      )}
    </div>
  );
}