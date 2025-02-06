import { Activity, Goal, CreditCard, Repeat, Target, Ban, Flag, Timer,
  AlertTriangle, CornerUpRight, AlertCircle, Save, X, RefreshCw, Shield,
  Video, MessageCircle, Flame, ArrowRight, Info, 
  Award} from 'lucide-react';
import { MatchEvent } from './types';
import { useMemo } from 'react';

interface EventViewProps {
  event: MatchEvent;
}

const getEventIconColor = (type: string, event?: MatchEvent): string => {
  // Free Kick Types
  if (type === 'freeKick') {
    const dangerState = event?.details.dangerState;
    if (dangerState?.includes('DangerousAttackingFreeKick')) {
      return 'text-red-600 dark:text-red-400';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-green-600 dark:text-green-400';
  }

  // Throw In Types
  if (type === 'throwIn') {
    const throwInState = event?.details.throwInState;
    if (throwInState === 'DangerousAttack') {
      return 'text-red-600 dark:text-red-400';
    } else if (throwInState === 'Attack') {
      return 'text-orange-600 dark:text-orange-400';
    }
    return 'text-green-600 dark:text-green-400';
  }

  // Danger States
  if (type === 'dangerState') {
    const dangerState = event?.details.dangerState;
    if (dangerState?.includes('DangerousAttack')) {
      return 'text-red-600 dark:text-red-400';
    } else if (dangerState?.includes('Attack')) {
      return 'text-orange-600 dark:text-orange-400';
    } else if (dangerState === 'CornerDanger') {
      return 'text-red-600 dark:text-red-400';
    } else if (dangerState === 'Penalty') {
      return 'text-red-600 dark:text-red-400';
    }  
    else if (dangerState?.includes('Corner')) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-green-600 dark:text-green-400';
  }

  // Other Events
  switch (type) {
    case 'goal':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'yellowCard':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'redCard':
    case 'secondYellow':
      return 'text-red-600 dark:text-red-400';
    case 'substitution':
      return 'text-blue-600 dark:text-blue-400';
    case 'shotOnTarget':
      return 'text-purple-600 dark:text-purple-400';
    case 'shotOffTarget':
    case 'shotBlocked':
      return 'text-gray-600 dark:text-gray-400';
    case 'cornerAwarded':
    case 'cornerTaken':
      return 'text-blue-600 dark:text-blue-400';
    case 'penalty':
      return 'text-red-600 dark:text-red-400';
    case 'var':
      return 'text-purple-600 dark:text-purple-400';
    case 'foul':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'phaseChange':
      return 'text-green-600 dark:text-green-400';
    case 'woodwork':
      return 'text-orange-600 dark:text-orange-400';
    case 'goalKick':
      return 'text-green-600 dark:text-green-400';
    case 'offsides':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'kickOff':
      return 'text-blue-600 dark:text-blue-400';
    case 'systemMessage':
      const messageType = event?.details.messageType;
      if (messageType === 'warning') return 'text-yellow-600 dark:text-yellow-400';
      if (messageType === 'error') return 'text-red-600 dark:text-red-400';
      if (messageType === 'success') return 'text-green-600 dark:text-green-400';
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getEventIcon = (type: string, event?: MatchEvent) => {
  switch (type) {
    case 'goal':
      return <Goal className="w-5 h-5" />;
    case 'yellowCard':
      return <CreditCard className="w-5 h-5" />;
    case 'secondYellow':
      return <CreditCard className="w-5 h-5" />;
    case 'redCard':
      return <CreditCard className="w-5 h-5" />;
    case 'bookingState':
      const state = event?.details?.bookingState;
      if (state === 'YellowCardDanger') {
        return <CreditCard className="w-5 h-5" />;
      } else if (state === 'RedCardDanger') {
        return <CreditCard className="w-5 h-5" />;
      }
      return <CreditCard className="w-5 h-5" />;
    case 'substitution':
      return <Repeat className="w-5 h-5" />;
    case 'shotOnTarget':
      return <Target className="w-5 h-5" />;
    case 'shotOffTarget':
      return <X className="w-5 h-5" />;
    case 'shotBlocked':
      return <Shield className="w-5 h-5" />;
    case 'cornerAwarded':
    case 'cornerTaken':
      return <CornerUpRight className="w-5 h-5" />;
    case 'penalty':
      return <AlertTriangle className="w-5 h-5" />;
    case 'foul':
      return <AlertCircle className="w-5 h-5" />;
    case 'var':
      return <Video className="w-5 h-5" />;
    case 'phaseChange':
      return <RefreshCw className="w-5 h-5" />;
    case 'freeKick': {
      return <Target className="w-5 h-5" />;
    }
    case 'dangerState':
      if(event?.details.dangerState?.includes('Corner')) {
        return <Award className="w-5 h-5" />;
      }
      return <Flame className="w-5 h-5" />;
    case 'throwIn':
      return <ArrowRight className="w-5 h-5" />;
    case 'woodwork':
      return <Target className="w-5 h-5" />;
    case 'goalKick':
      return <ArrowRight className="w-5 h-5" />;
    case 'offsides':
      return <Flag className="w-5 h-5" />;
    case 'kickOff':
      return <Timer className="w-5 h-5" />;
    case 'systemMessage':
      const messageType = event?.details?.messageType;
      if (messageType === 'warning') return <AlertTriangle className="w-5 h-5" />;
      if (messageType === 'error') return <X className="w-5 h-5" />;
      if (messageType === 'success') return <Shield className="w-5 h-5" />;
      return <Info className="w-5 h-5" />;
    default:
      return <Activity className="w-5 h-5" />;
  }
};

const getEventTitle = (event: MatchEvent): string => {
  switch (event.type) {
    case 'goal':
      return `GOAL! ${event.details.isOwnGoal ? '(Own Goal)' : ''} ${event.details.wasPenalty ? '(Penalty)' : ''}`;
    case 'yellowCard':
      return 'Yellow Card';
    case 'secondYellow':
      return 'Second Yellow Card - RED';
    case 'redCard':
      return 'Red Card';
    case 'bookingState':
      const state = event.details.bookingState;
      if (state === 'YellowCardDanger') {
        return 'Yellow Card Risk';
      } else if (state === 'RedCardDanger') {
        return 'Red Card Risk';
      }
      return 'Card Risk Ended';
    case 'substitution':
      return 'Substitution';
    case 'shotOnTarget':
      return 'Shot on Target';
    case 'shotOffTarget':
      return 'Shot off Target';
    case 'shotBlocked':
      return 'Shot Blocked';
    case 'cornerAwarded':
      return 'Corner Awarded';
    case 'cornerTaken':
      return 'Corner Taken';
    case 'penalty':
      return `Penalty - ${event.details.outcome || 'Pending'}`;
    case 'foul':
      return 'Foul';
    case 'var':
      return `VAR Review - ${event.details.reason || ''}`;
    case 'phaseChange':
      return `${event.details.currentPhase} Started`;
    case 'throwIn':
      const throwInState = event.details.throwInState;
      if (throwInState === 'DangerousAttack') return 'Throw In Dangerous Attack';
      if (throwInState === 'Attack') return 'Throw In Attack';
      return 'Throw In Safe';
    case 'freeKick': {
      return 'Free Kick - Safe';
    }
    case 'dangerState': {
      const dangerTexts: Record<string, string> = {
        'Safe': 'Safe',
        'Attack': 'Attack',
        'DangerousAttack': 'Dangerous Attack',
        'FreeKick': 'Free Kick - Safe',
        'AttackingFreeKick': 'Free Kick - Attack',
        'DangerousFreeKick': 'Free Kick - Dangerous Attack',
        'CornerDanger': 'Corner Risk',
        'Penalty': 'Penalty Risk',
        'Corner': 'Corner Awarded - Confirmed',
        'Goal': 'Goal',
      };
      return `${dangerTexts[event.details.dangerState || 'Safe']}`;
    }
    case 'woodwork':
      return 'Hit the Woodwork!';
    case 'goalKick':
      return 'Goal Kick';
    case 'offsides':
      return 'Offside';
    case 'kickOff':
      return 'Kick Off';
    case 'systemMessage':
      return event.details.message || 'System Message';
    default:
      return event.type;
  }
};

const getEventColor = (type: string, event?: MatchEvent): string => {
  // Free Kick Types
  if (type === 'freeKick') {
    const dangerState = event?.details.dangerState;
    if (dangerState?.includes('DangerousAttackingFreeKick')) {
      return 'bg-red-200 dark:bg-red-900';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'bg-orange-200 dark:bg-orange-900';
    }
    return 'bg-green-200 dark:bg-green-900';
  }

  // Throw In Types
  if (type === 'throwIn') {
    const throwInState = event?.details.throwInState;
    if (throwInState === 'DangerousAttack') {
      return 'bg-red-200 dark:bg-red-900';
    } else if (throwInState === 'Attack') {
      return 'bg-orange-200 dark:bg-orange-900';
    }
    return 'bg-green-200 dark:bg-green-900';
  }

  // Danger States
  if (type === 'dangerState') {
    const dangerState = event?.details.dangerState;
    if (dangerState?.includes('DangerousAttack')) {
      return 'bg-red-200 dark:bg-red-900';
    } else if (dangerState?.includes('Attack')) {
      return 'bg-orange-200 dark:bg-orange-900';
    } else if (dangerState === 'CornerDanger') {
      return 'bg-red-200 dark:bg-red-900';
    } else if (dangerState?.includes('Corner')) {
      return 'bg-green-200 dark:bg-green-900';
    }
    return 'bg-green-200 dark:bg-green-900';
  }

  // Other Events
  switch (type) {
    case 'goal':
      return 'bg-emerald-200 dark:bg-emerald-900';
    case 'yellowCard':
      return 'bg-yellow-200 dark:bg-yellow-900';
    case 'redCard':
    case 'secondYellow':
      return 'bg-red-200 dark:bg-red-900';
    case 'substitution':
      return 'bg-blue-200 dark:bg-blue-900';
    case 'shotOnTarget':
      return 'bg-purple-200 dark:bg-purple-900';
    case 'shotOffTarget':
    case 'shotBlocked':
      return 'bg-gray-200 dark:bg-gray-700';
    case 'cornerAwarded':
    case 'cornerTaken':
      return 'bg-blue-200 dark:bg-blue-900';
    case 'penalty':
      return 'bg-red-200 dark:bg-red-900';
    case 'var':
      return 'bg-purple-200 dark:bg-purple-900';
    case 'foul':
      return 'bg-yellow-200 dark:bg-yellow-900';
    case 'phaseChange':
      return 'bg-green-200 dark:bg-green-900';
    case 'throwIn':
      return 'bg-blue-200 dark:bg-blue-900';
    case 'woodwork':
      return 'bg-orange-200 dark:bg-orange-900';
    case 'goalKick':
      return 'bg-green-200 dark:bg-green-900';
    case 'offsides':
      return 'bg-yellow-200 dark:bg-yellow-900';
    case 'kickOff':
      return 'bg-blue-200 dark:bg-blue-900';
    case 'systemMessage':
      const messageType = event?.details.messageType;
      if (messageType === 'warning') return 'bg-yellow-200 dark:bg-yellow-900';
      if (messageType === 'error') return 'bg-red-200 dark:bg-red-900';
      if (messageType === 'success') return 'bg-green-200 dark:bg-green-900';
      return 'bg-blue-200 dark:bg-blue-900';
    default:
      return 'bg-gray-200 dark:bg-gray-700';
  }
};

const getEventBackgroundColor = (event: MatchEvent): string => {
  // Free Kick Types
  if (event.type === 'freeKick') {
    const dangerState = event.details.dangerState;
    if (dangerState?.includes('DangerousAttackingFreeKick')) {
      return 'bg-gradient-to-r from-white to-red-200 dark:from-gray-900 dark:to-red-950';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'bg-gradient-to-r from-white to-orange-200 dark:from-gray-900 dark:to-orange-950';
    } 
    return 'bg-gradient-to-r from-white to-green-200 dark:from-gray-900 dark:to-green-950';
  }

  // Throw In Types
  if (event.type === 'throwIn') {
    const throwInState = event.details.throwInState;
    if (throwInState === 'DangerousAttack') {
      return 'bg-gradient-to-r from-white to-red-200 dark:from-gray-900 dark:to-red-950';
    } else if (throwInState === 'Attack') {
      return 'bg-gradient-to-r from-white to-orange-200 dark:from-gray-900 dark:to-orange-950';
    }
    return 'bg-gradient-to-r from-white to-green-200 dark:from-gray-900 dark:to-green-950';
  }

  // Danger States
  if (event.type === 'dangerState') {
    const dangerState = event.details.dangerState;
    if (dangerState?.includes('DangerousAttack')) {
      return 'bg-red-100 dark:bg-red-950';
    } else if (dangerState?.includes('Attack')) {
      return 'bg-orange-100 dark:bg-orange-950';
    } else if (dangerState === 'CornerDanger') {
      return 'bg-red-100 dark:from-gray-900 dark:to-red-950';
    } else if (dangerState?.includes('Corner')) {
      return 'bg-green-100';
    }
    return 'bg-green-50 dark:bg-green-950';
  }

  // Other Events
  switch (event.type) {
    case 'goal':
      return 'bg-emerald-50 dark:bg-emerald-950';
    case 'yellowCard':
      return 'bg-yellow-50 dark:bg-yellow-950';
    case 'redCard':
    case 'secondYellow':
      return 'bg-red-50 dark:bg-red-950';
    case 'substitution':
      return 'bg-blue-50 dark:bg-blue-950';
    case 'shotOnTarget':
      return 'bg-purple-50 dark:bg-purple-950';
    case 'shotOffTarget':
    case 'shotBlocked':
      return 'bg-gray-100 dark:bg-gray-800';
    case 'cornerAwarded':
    case 'cornerTaken':
      return 'bg-blue-50 dark:bg-blue-950';
    case 'penalty':
      return 'bg-red-50 dark:bg-red-950';
    case 'var':
      return 'bg-purple-50 dark:bg-purple-950';
    case 'foul':
      return 'bg-yellow-50 dark:bg-yellow-950';
    case 'phaseChange':
      return 'bg-green-50 dark:bg-green-950';
    case 'throwIn':
      return 'bg-blue-50 dark:bg-blue-950';
    case 'woodwork':
      return 'bg-orange-50 dark:bg-orange-950';
    case 'goalKick':
      return 'bg-green-50 dark:bg-green-950';
    case 'offsides':
      return 'bg-yellow-50 dark:bg-yellow-950';
    case 'kickOff':
      return 'bg-blue-50 dark:bg-blue-950';
    case 'systemMessage':
      const messageType = event.details.messageType;
      if (messageType === 'warning') return 'bg-yellow-50 dark:bg-yellow-950';
      if (messageType === 'error') return 'bg-red-50 dark:bg-red-950';
      if (messageType === 'success') return 'bg-green-50 dark:bg-green-950';
      return 'bg-blue-50 dark:bg-blue-950';
    default:
      return 'bg-gray-50 dark:bg-gray-900';
  }
};

const getEventBorderColor = (event: MatchEvent): string => {
  // Free Kick Types
  if (event.type === 'freeKick') {
    const dangerState = event.details.dangerState;
    if (dangerState?.includes('DangerousAttackingFreeKick')) {
      return 'border-red-200 dark:border-red-800';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'border-orange-200 dark:border-orange-800';
    }
    return 'border-green-200 dark:border-green-800';
  }

  // Throw In Types
  if (event.type === 'throwIn') {
    const throwInState = event.details.throwInState;
    if (throwInState === 'DangerousAttack') {
      return 'border-red-200 dark:border-red-800';
    } else if (throwInState === 'Attack') {
      return 'border-orange-200 dark:border-orange-800';
    }
    return 'border-green-200 dark:border-green-800';
  }

  // Danger States
  if (event.type === 'dangerState') {
    const dangerState = event.details.dangerState;
    if (dangerState?.includes('DangerousAttack')) {
      return 'border-red-200 dark:border-red-800';
    } else if (dangerState?.includes('Attack')) {
      return 'border-orange-200 dark:border-orange-800';
    } else if (dangerState === 'CornerDanger') {
      return 'border-red-200 dark:border-red-800';
    } else if (dangerState?.includes('Corner')) {
      return 'border-green-200 dark:border-green-800';
    }
    return 'border-green-200 dark:border-green-800';
  }

  // Other Events
  switch (event.type) {
    case 'goal':
      return 'border-emerald-200 dark:border-emerald-800';
    case 'yellowCard':
      return 'border-yellow-200 dark:border-yellow-800';
    case 'redCard':
    case 'secondYellow':
      return 'border-red-200 dark:border-red-800';
    case 'substitution':
      return 'border-blue-200 dark:border-blue-800';
    case 'shotOnTarget':
      return 'border-purple-200 dark:border-purple-800';
    case 'shotOffTarget':
    case 'shotBlocked':
      return 'border-gray-200 dark:border-gray-700';
    case 'cornerAwarded':
    case 'cornerTaken':
      return 'border-blue-200 dark:border-blue-800';
    case 'penalty':
      return 'border-red-200 dark:border-red-800';
    case 'var':
      return 'border-purple-200 dark:border-purple-800';
    case 'phaseChange':
      return 'border-green-200 dark:border-green-800';
    case 'throwIn':
      return 'border-blue-200 dark:border-blue-800';
    case 'woodwork':
      return 'border-orange-200 dark:border-orange-800';
    case 'goalKick':
      return 'border-green-200 dark:border-green-800';
    case 'offsides':
      return 'border-yellow-200 dark:border-yellow-800';
    case 'kickOff':
      return 'border-blue-200 dark:border-blue-800';
    case 'systemMessage':
      const messageType = event.details.messageType;
      if (messageType === 'warning') return 'border-yellow-200 dark:border-yellow-800';
      if (messageType === 'error') return 'border-red-200 dark:border-red-800';
      if (messageType === 'success') return 'border-green-200 dark:border-green-800';
      return 'border-blue-200 dark:border-blue-800';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
};

export const EventView: React.FC<EventViewProps> = ({ event }) => {
  const isHomeTeam = event.team === 'Home';
  const isAwayTeam = event.team === 'Away';
  const isSystemMessage = event.team === 'System';

  // Memoize colors for better performance
  const colors = useMemo(() => ({
    background: getEventBackgroundColor(event),
    border: getEventBorderColor(event),
    icon: getEventIconColor(event.type, event),
    iconBg: getEventColor(event.type, event)
  }), [
    event.id, 
    event.type, 
    event.details?.dangerState, 
    event.details?.messageType,
    event.details?.bookingState
  ]);

  return (
    <div className={`flex w-full ${
      isSystemMessage ? 'py-0.5 justify-center' : 'py-1.5'
    } ${
      isHomeTeam ? 'justify-start' : isAwayTeam ? 'justify-end' : ''
    }`}>
      <div className={`
        flex items-start gap-2 
        ${isSystemMessage ? 'w-[60%] py-1' : 'w-[48%] p-2'}
        ${isAwayTeam && !isSystemMessage ? 'flex-row text-right' : 'flex-row'}
        ${isSystemMessage ? 'justify-center text-center' : ''}
        ${colors.background}
        rounded-md border-2 ${colors.border}
        ${isSystemMessage ? 'bg-opacity-80' : ''}
      `}>
        <div className={`
          ${isSystemMessage ? 'p-1' : 'p-1.5'} 
          rounded-md shrink-0
          ${colors.iconBg}
          ${colors.icon}
        `}>
          {getEventIcon(event.type, event)}
        </div>
        
        <div className={`flex-1 min-w-0 ${isSystemMessage ? 'flex items-center justify-center' : ''}`}>
          <div className={`flex items-center gap-1 ${isSystemMessage ? 'mb-0 text-xs' : 'mb-0.5 text-sm'} font-medium text-gray-900 dark:text-white ${isSystemMessage ? 'justify-center' : isAwayTeam ? 'justify-start' : 'justify-start'}`}>
            {getEventTitle(event)}
          </div>
          {!isSystemMessage && (
            <div className={`text-xs text-gray-500 dark:text-gray-400 tabular-nums ${isAwayTeam ? 'text-right' : 'text-right'}`}>
              {event.phase} - {event.timeElapsed}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 