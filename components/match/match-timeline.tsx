import { ScrollArea } from '@/components/ui/scroll-area';
import { formatTimestamp } from '@/lib/utils';
import { 
  Trophy, 
  Flag, 
  AlertTriangle, 
  Shield, 
  FileWarningIcon, 
  Users, 
  ArrowRightLeft,
  MessageCircle,
  LucideRectangleVertical,
  Goal,
  Ban,
  CornerUpRight,
  Footprints,
  PlayCircle,
  StopCircle,
  Info,
  Target,
  XCircle,
  ShieldOff,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MatchTimelineProps {
  matchData: any;
}

const getEventIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'goal':
      return <Goal className="h-5 w-5 text-green-500" />;
    case 'offside':
      return <Flag className="h-5 w-5 text-blue-500" />;
    case 'foul':
      return <FileWarningIcon className="h-5 w-5 text-red-500" />;
    case 'substitution':
      return <ArrowRightLeft className="h-5 w-5 text-green-500" />;
    case 'lineup':
      return <Users className="h-5 w-5 text-purple-500" />;
    case 'dangerstatechanges':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'possession':
      return <Shield className="h-5 w-5 text-indigo-500" />;
    case 'yellowcard':
      return <LucideRectangleVertical className="h-5 w-5 text-yellow-500" />;
    case 'redcard':
      return <LucideRectangleVertical className="h-5 w-5 text-red-500" />;
    case 'corner':
      return <CornerUpRight className="h-5 w-5 text-blue-500" />;
    case 'throwin':
      return <Footprints className="h-5 w-5 text-gray-500" />;
    case 'phasechange':
      return <PlayCircle className="h-5 w-5 text-blue-500" />;
    case 'systemmessages':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'shotontarget':
      return <Target className="h-5 w-5 text-green-500" />;
    case 'shotofftarget':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'blockedshot':
      return <ShieldOff className="h-5 w-5 text-orange-500" />;
    default:
      return <MessageCircle className="h-5 w-5 text-gray-500" />;
  }
};

const getEventStyle = (type: string, dangerState?: string) => {
  if (dangerState?.includes('Safe')) {
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  }
  if (dangerState?.includes('Dangerous')) {
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }

  switch (type.toLowerCase()) {
    case 'goal':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'yellowcard':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'redcard':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'dangerstatechanges':
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    default:
      return 'bg-card';
  }
};

const SystemMessage = ({ event }: { event: any }) => (
  <div className="col-start-3 col-end-9 mb-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MessageSquare className="h-4 w-4" />
      <time className="text-xs">{formatTimestamp(event.timestamp)}</time>
      <span className="flex-1 text-center font-medium text-foreground">
        {event.message}
      </span>
    </div>
  </div>
);

const PhaseChange = ({ event }: { event: any }) => (
  <div className="col-start-3 col-end-9 mb-4">
    <div className="flex items-center gap-2 text-sm">
      <PlayCircle className="h-4 w-4 text-blue-500" />
      <time className="text-xs text-muted-foreground">{formatTimestamp(event.timestamp)}</time>
      <div className="flex-1 text-center">
        <Badge variant="outline" className="text-xs font-normal">
          {event.previousPhase} → {event.currentPhase}
        </Badge>
      </div>
    </div>
  </div>
);

const TimelineEvent = ({ event, side }: { event: any; side: 'left' | 'right' | 'center' }) => {
  if (event.type === 'systemmessages') {
    return <SystemMessage event={event} />;
  }

  if (event.type === 'phasechange') {
    return <PhaseChange event={event} />;
  }

  const containerClasses = {
    left: 'col-start-1 col-end-6 mr-auto',
    center: 'col-start-3 col-end-9',
    right: 'col-start-6 col-end-11 ml-auto'
  };

  return (
    <div className={`${containerClasses[side]} mb-6 relative`}>
      <div className={`flex flex-col rounded-lg border shadow-sm p-4 ${getEventStyle(event.type, event.dangerState)}`}>
        <div className="flex items-center gap-2 mb-2">
          {getEventIcon(event.type)}
          <time className="text-sm font-medium text-muted-foreground">
            {formatTimestamp(event.timestamp)}
          </time>
          {event.isConfirmed && (
            <Badge variant="outline" className="ml-auto text-xs">
              Confirmed
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            {event.description && (
              <p className="text-sm text-foreground">
                {event.description}
              </p>
            )}
            {event.dangerState && (
              <p className="text-sm font-medium text-foreground">
                {event.dangerState}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {event.phase && (
              <Badge variant="outline" className="text-xs">
                {event.phase} - {event.timeElapsed}
              </Badge>
            )}
            {event.team && (
              <Badge variant="secondary" className="text-xs">
                {event.team} Team
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function MatchTimeline({ matchData }: MatchTimelineProps) {
  // Combine all relevant events
  const allEvents = [
    ...(matchData?.actions?.goals || []).map((e: any) => ({ ...e, type: 'goal' })),
    ...(matchData?.actions?.yellowCards || []).map((e: any) => ({ ...e, type: 'yellowCard' })),
    ...(matchData?.actions?.redCards || []).map((e: any) => ({ ...e, type: 'redCard' })),
    ...(matchData?.actions?.corners || []).map((e: any) => ({ ...e, type: 'corner' })),
    ...(matchData?.actions?.fouls || []).map((e: any) => ({ ...e, type: 'foul', team: e.foulingTeam })),
    ...(matchData?.actions?.throwIns || []).map((e: any) => ({ ...e, type: 'throwIn' })),
    ...(matchData?.actions?.substitutions || []).map((e: any) => ({ ...e, type: 'substitutions' })),
    ...(matchData?.actions?.offsides || []).map((e: any) => ({ ...e, type: 'offside' })),
    ...(matchData?.actions?.dangerStateChanges || []).map((e: any) => ({ 
      ...e, 
      type: 'dangerStateChanges',
      team: e.dangerState?.startsWith('Away') ? 'Away' : e.dangerState?.startsWith('Home') ? 'Home' : null
    })),
    ...(matchData?.actions?.systemMessages || []).map((e: any) => ({ 
      ...e, 
      type: 'systemmessages',
      message: e.message 
    })),
    ...(matchData?.actions?.phaseChanges || []).map((e: any) => ({ 
      ...e, 
      type: 'phaseChange',
      description: `Phase changed from ${e.previousPhase} to ${e.currentPhase}`
    })),
    ...(matchData?.actions?.shotsOnTarget || []).map((e: any) => ({ ...e, type: 'shotOnTarget' })),
    ...(matchData?.actions?.shotsOffTarget || []).map((e: any) => ({ ...e, type: 'shotOffTarget' })),
    ...(matchData?.actions?.blockedShots || []).map((e: any) => ({ ...e, type: 'blockedShot' })),
    ...(matchData?.actions?.shotsOffWoodwork || []).map((e: any) => ({ ...e, type: 'shotOffWoodwork' }))
  ];

  // Sort events by timestamp in descending order (most recent first)
  const sortedEvents = allEvents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <ScrollArea className="h-[600px] w-full pr-4">
      <div className="grid grid-cols-10 gap-4 relative px-4">
        {/* Center line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-border" />
        
        {sortedEvents.map((event, index) => {
          let side: 'left' | 'right' | 'center' = 'center';
          
          if (event.team === 'Home') {
            side = 'left';
          } else if (event.team === 'Away') {
            side = 'right';
          }
          
          return (
            <TimelineEvent 
              key={`${event.type}-${event.id}-${index}`}
              event={event}
              side={side}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}