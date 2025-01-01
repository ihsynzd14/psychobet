import { 
  Trophy, Flag, AlertTriangle, Shield, FileWarningIcon,
  ArrowLeftRight, MessageSquare, LucideRectangleVertical,
  Goal, CornerUpRight, Footprints, PlayCircle, Target,
  XCircle, ShieldOff, BatteryWarning, Clock, Repeat, Info,
  Timer // Added for stoppage time
} from 'lucide-react';

export const getEventIcon = (type: string, dangerState?: string) => {
  // Handle danger states
  if (dangerState?.includes('Safe')) return <Shield className="h-5 w-5 text-green-500" />;
  if (dangerState?.includes('Dangerous')) return <AlertTriangle className="h-5 w-5 text-red-500" />;
  if (dangerState?.includes('Attack')) return <Target className="h-5 w-5 text-orange-500" />;
  if (dangerState?.includes('FreeKick')) return <BatteryWarning className="h-5 w-5 text-blue-500" />;

  const iconMap: Record<string, JSX.Element> = {
    goal: <Goal className="h-5 w-5 text-green-500" />,
    offside: <Flag className="h-5 w-5 text-yellow-500" />, // Updated color for offsides
    foul: <FileWarningIcon className="h-5 w-5 text-red-500" />,
    substitution: <ArrowLeftRight className="h-5 w-5 text-green-500" />,
    yellowcard: <LucideRectangleVertical className="h-5 w-5 text-yellow-500" />,
    redcard: <LucideRectangleVertical className="h-5 w-5 text-red-500" />,
    corner: <CornerUpRight className="h-5 w-5 text-blue-500" />,
    throwin: <Footprints className="h-5 w-5 text-gray-500" />,
    phasechange: <PlayCircle className="h-5 w-5 text-blue-500" />,
    systemmessages: <MessageSquare className="h-5 w-5 text-blue-500" />,
    shotontarget: <Target className="h-5 w-5 text-green-500" />,
    shotofftarget: <XCircle className="h-5 w-5 text-red-500" />,
    blockedshot: <ShieldOff className="h-5 w-5 text-orange-500" />,
    goalkick: <Repeat className="h-5 w-5 text-gray-500" />,
    clockaction: <Clock className="h-5 w-5 text-gray-500" />,
    stoppageTimeAnnouncements: <Timer className="h-5 w-5 text-blue-500" />,
    offsides: <Flag className="h-5 w-5 text-yellow-500" />
  };

  return iconMap[type.toLowerCase()] || <Info className="h-5 w-5 text-gray-500" />;
};