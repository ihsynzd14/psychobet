import { 
  Trophy, AlertTriangle, Shield, FileWarningIcon,
  ArrowLeftRight, MessageSquare,
  Footprints, PlayCircle, Target,
  XCircle, Swords, BatteryWarning, Clock, Repeat, Info,Sword, 
  Timer
} from 'lucide-react';
import Image from 'next/image';

export const getEventIcon = (type: string, dangerState?: string) => {
  // Handle danger states
  if (dangerState?.includes('Safe')) return <Shield className="h-5 w-5 text-green-500" />;
  if (dangerState?.includes('Dangerous')) return  <Swords className="h-5 w-5 text-red-500" />;
  if (dangerState?.includes('Attack')) return <Sword className="h-5 w-5 text-orange-400" />;
  if (dangerState?.includes('FreeKick')) return <Image src="/img/freeKick.png" alt="freeKick" width={23} height={23} />;

  const iconMap: Record<string, JSX.Element> = {
    goals: <Image src="/img/goal.png" alt="Goal" width={20} height={20} />,
    substitutions: <ArrowLeftRight className="h-5 w-5 text-green-500" />,
    yellowCards: <Image src="/img/yellow.png" alt="Yellow Card" width={15} height={5} />,
    straightRedCards: <Image src="/img/red.png" alt="Red Card" width={20} height={20} />,
    corners: <Image src="/img/corner.png" alt="Corner" width={20} height={20} />,
    throwIns: <Footprints className="h-5 w-5 text-gray-500" />,
    phaseChanges: <PlayCircle className="h-5 w-5 text-blue-500" />,
    systemMessages: <MessageSquare className="h-5 w-5 text-blue-500" />,
    shotsOnTarget: <Target className="h-5 w-5 text-green-500" />,
    shotsOffTarget: <Image src="/img/shotOffs.png" alt="Shot Off Target" width={20} height={20} />,
    shotsOffWoodwork: <Image src="/img/woodwork.png" alt="Blocked Shot" width={20} height={20} />,
    blockedShots: <Image src="/img/blocked.png" alt="Blocked Shot" width={20} height={20} />,
    goalKicks: <Image src="/img/kickOff.png" alt="Goal Kick" width={22} height={22} />,
    clockActions: <Clock className="h-5 w-5 text-gray-500" />,
    stoppageTimeAnnouncements: <Timer className="h-5 w-5 text-blue-500" />,
    offsides: <Image src="/img/offside.png" alt="Offside" width={20} height={20} />,
    varStateChanges: <Image src="/img/var.png" alt="VAR" width={20} height={20} />
  };

  return iconMap[type] || <Info className="h-5 w-5 text-gray-500" />;
};