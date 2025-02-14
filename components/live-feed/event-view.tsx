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
  // Booking States
  if (type === 'bookingState') {
    const state = event?.details.bookingState;
    if (state === 'YellowCardDanger') {
      return 'text-yellow-600 dark:text-yellow-400';
    } else if (state === 'RedCardDanger') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  }

  // Danger States
  if (type === 'dangerState') {
    const dangerState = event?.details.dangerState;
    if (dangerState === 'Safe' || 
        dangerState === 'Attack' || 
        dangerState === 'DangerousAttack') {
      return 'text-gray-400 dark:text-gray-500';
    }
    if (dangerState?.includes('DangerousFreeKick')) {
      return 'text-red-600 dark:text-red-400';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'text-orange-600 dark:text-orange-400';
    } else if (dangerState === 'FreeKick') {
      return 'text-green-600 dark:text-green-400';
    } else if (dangerState?.includes('DangerousAttack')) {
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
    if (throwInState === 'Dangerous') {
      return 'text-red-600 dark:text-red-400';
    } else if (throwInState === 'Attack') {
      return 'text-orange-600 dark:text-orange-400';
    } else if (throwInState === null) {
      return 'text-gray-600 dark:text-gray-400';
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
    case 'shotOffWoodwork':
      return 'text-orange-600 dark:text-orange-400';
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
    case 'stoppageTime':
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
      if (event?.details.dangerState === 'Safe' || 
          event?.details.dangerState === 'Attack' ||
          event?.details.dangerState === 'DangerousAttack') {
        return null;
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
    case 'stoppageTime':
      return <Timer className="w-5 h-5" />;
    case 'shotOffWoodwork':
      return <Target className="w-5 h-5" />;
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
      return `${event.details.phaseTitle}`;
    case 'throwIn':
      const throwInState = event.details.throwInState;
      if (throwInState) {
        return `Throw In ${throwInState}`;
      }
      return 'Throw In';
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
    case 'stoppageTime':
      return `Stoppage Time - ${event.details.addedMinutes} min`;
    case 'shotOffWoodwork':
      return 'Shot Off Woodwork';
    default:
      return event.type;
  }
};

const getEventColor = (type: string, event?: MatchEvent): string => {
  // Booking States
  if (type === 'bookingState') {
    const state = event?.details.bookingState;
    if (state === 'YellowCardDanger') {
      return 'bg-yellow-200 dark:bg-yellow-900';
    } else if (state === 'RedCardDanger') {
      return 'bg-red-200 dark:bg-red-900';
    }
    return 'bg-gray-200 dark:bg-gray-700';
  }

  // Danger States
  if (type === 'dangerState') {
    const dangerState = event?.details.dangerState;
    if (dangerState === 'Safe' || 
        dangerState === 'Attack' || 
        dangerState === 'DangerousAttack') {
      return 'bg-gray-100 dark:bg-gray-800';
    }
    if (dangerState?.includes('DangerousFreeKick')) {
      return 'bg-red-300 dark:bg-red-900';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'bg-orange-300 dark:bg-orange-900';
    } else if (dangerState === 'FreeKick') {
      return 'bg-green-300 dark:bg-green-900';
    } else if (dangerState?.includes('DangerousAttack')) {
      return 'bg-red-300 dark:bg-red-900';
    } else if (dangerState?.includes('Attack')) {
      return 'bg-orange-300 dark:bg-orange-900';
    } else if (dangerState === 'CornerDanger') {
      return 'bg-red-200 dark:bg-red-900';
    } else if (dangerState === 'Penalty') {
      return 'bg-red-200 dark:bg-red-900';
    }  
    else if (dangerState?.includes('Corner')) {
      return 'bg-green-200 dark:bg-green-900';
    }
    return 'bg-green-300 dark:bg-green-900';
  }

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
    if (throwInState === 'Dangerous') {
      return 'bg-red-200 dark:bg-red-900';
    } else if (throwInState === 'Attack') {
      return 'bg-orange-200 dark:bg-orange-900';
    } else if (throwInState === null) {
      return 'bg-gray-200 dark:bg-gray-700';
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
    case 'shotOffWoodwork':
      return 'bg-orange-200 dark:bg-orange-900';
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
    case 'stoppageTime':
      return 'bg-blue-200 dark:bg-blue-900';
    default:
      return 'bg-gray-200 dark:bg-gray-700';
  }
};

const getEventBackgroundColor = (event: MatchEvent): string => {
  // Booking States
  if (event.type === 'bookingState') {
    const state = event.details.bookingState;
    if (state === 'YellowCardDanger') {
      return 'bg-yellow-100 dark:bg-yellow-950';
    } else if (state === 'RedCardDanger') {
      return 'bg-red-100 dark:bg-red-950';
    }
    return 'bg-gray-50 dark:bg-gray-900';
  }

  // Danger States
  if (event.type === 'dangerState') {
    const dangerState = event.details.dangerState;
    if (dangerState === 'Safe' || 
        dangerState === 'Attack' || 
        dangerState === 'DangerousAttack') {
      return 'bg-white dark:bg-gray-900';
    }
    if (dangerState?.includes('DangerousFreeKick')) {
      return 'bg-gradient-to-r from-white to-red-200 dark:from-gray-900 dark:to-red-950';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'bg-gradient-to-r from-white to-orange-200 dark:from-gray-900 dark:to-orange-950';
    } else if (dangerState === 'FreeKick') {
      return 'bg-gradient-to-r from-white to-green-200 dark:from-gray-900 dark:to-green-950';
    } else if (dangerState?.includes('DangerousAttack')) {
      return 'bg-red-200 dark:bg-red-950';  
    } else if (dangerState?.includes('Attack')) {
      return 'bg-orange-200 dark:bg-orange-950';
    } else if (dangerState === 'CornerDanger') {
      return 'bg-red-100 dark:from-gray-900 dark:to-red-950';
    } else if (dangerState === 'Penalty') {
      return 'bg-red-200 dark:bg-red-950';
    }  
    else if (dangerState?.includes('Corner')) {
      return 'bg-green-100';
    }
    return 'bg-green-100 dark:bg-green-950';
  }

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
    if (throwInState === 'Dangerous') {
      return 'bg-gradient-to-r from-white to-red-200 dark:from-gray-900 dark:to-red-950';
    } else if (throwInState === 'Attack') {
      return 'bg-gradient-to-r from-white to-orange-200 dark:from-gray-900 dark:to-orange-950';
    } else if (throwInState === null) {
      return 'bg-gray-200 dark:bg-gray-700';
    }
    return 'bg-gradient-to-r from-white to-green-200 dark:from-gray-900 dark:to-green-950';
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
    case 'shotOffWoodwork':
      return 'bg-orange-50 dark:bg-orange-950';
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
    case 'stoppageTime':
      return 'bg-white dark:bg-blue-950';
    default:
      return 'bg-gray-50 dark:bg-gray-900';
  }
};

const getEventBorderColor = (event: MatchEvent): string => {
  // Booking States
  if (event.type === 'bookingState') {
    const state = event.details.bookingState;
    if (state === 'YellowCardDanger') {
      return 'border-yellow-300 dark:border-yellow-800';
    } else if (state === 'RedCardDanger') {
      return 'border-red-300 dark:border-red-800';
    }
    return 'border-gray-200 dark:border-gray-700';
  }

  // Danger States
  if (event.type === 'dangerState') {
    const dangerState = event.details.dangerState;
    if (dangerState === 'Safe') {
      return 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-3 before:bg-green-500 dark:before:bg-green-600 border-gray-200 dark:border-gray-700';
    } else if (dangerState === 'Attack') {
      return 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-3 before:bg-orange-500 dark:before:bg-orange-600 border-gray-200 dark:border-gray-700';
    } else if (dangerState === 'DangerousAttack') {
      return 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-3 before:bg-red-600 dark:before:bg-red-700 border-gray-200 dark:border-gray-700';
    }
    if (dangerState?.includes('DangerousFreeKick')) {
      return 'border-red-300 dark:border-red-800';
    } else if (dangerState?.includes('AttackingFreeKick')) {
      return 'border-orange-300 dark:border-orange-800';
    } else if (dangerState === 'FreeKick') {
      return 'border-green-300 dark:border-green-800';
    } else if (dangerState?.includes('DangerousAttack')) {
      return 'border-red-300 dark:border-red-800';
    } else if (dangerState?.includes('Attack')) {
      return 'border-orange-300 dark:border-orange-800';
    } else if (dangerState === 'CornerDanger') {
      return 'border-red-200 dark:border-red-800';
    } else if (dangerState === 'Penalty') {
      return 'border-red-200 dark:border-red-800';
    }  
    else if (dangerState?.includes('Corner')) {
      return 'border-green-200 dark:border-green-800';
    }
    return 'border-green-300 dark:border-green-800';
  }

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
    if (throwInState === 'Dangerous') {
      return 'border-red-200 dark:border-red-800';
    } else if (throwInState === 'Attack') {
      return 'border-orange-200 dark:border-orange-800';
    } else if (throwInState === null) {
      return 'border-gray-200 dark:border-gray-700';
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
    case 'shotOffWoodwork':
      return 'border-orange-200 dark:border-orange-800';
    case 'cornerAwarded':
    case 'cornerTaken':
      return 'border-blue-200 dark:border-blue-800';
    case 'penalty':
      return 'border-red-200 dark:border-red-800';
    case 'var':
      return 'border-purple-200 dark:border-purple-800';
    case 'foul':
      return 'border-yellow-200 dark:border-yellow-800';
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
    case 'stoppageTime':
      return 'border-blue-200 dark:border-blue-800';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
};

export const EventView: React.FC<EventViewProps> = ({ event }) => {
  const isHomeTeam = event.team === 'Home';
  const isAwayTeam = event.team === 'Away';
  const isSystemMessage = event.team === 'System';
  const isBookingState = event.type === 'bookingState';
  const isPhaseChange = event.type === 'phaseChange';
  const isStoppageTime = event.type === 'stoppageTime';

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
    event.details?.bookingState,
    event.details?.throwInState
  ]);

  return (
    <div className={`flex w-full p-2 ${
      isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'py-0.5 justify-center' : 'py-1.5'
    } ${
      isHomeTeam ? 'justify-start' : isAwayTeam ? 'justify-end' : ''
    }`}>
      <div className={`
        flex items-start gap-2 relative
        ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'w-[28%] py-1' : 'w-[36%] p-2'}
        ${isAwayTeam && !isSystemMessage && !isBookingState && !isPhaseChange && !isStoppageTime ? 'flex-row text-right' : 'flex-row'}
        ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'justify-center text-center' : ''}
        ${colors.background}
        rounded-md border-2 ${colors.border}
        ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'bg-opacity-80' : ''}
        overflow-hidden
      `}>
        <div className={`
          ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'p-1' : 'p-1.5'} 
          rounded-md shrink-0
          ${colors.iconBg}
          ${colors.icon}
        `}>
          {getEventIcon(event.type, event)}
        </div>
        
        <div className={`flex-1 min-w-0 ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'flex items-center justify-center' : ''}`}>
          <div className={`flex items-center gap-1 ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'mb-0 text-xs' : 'mb-0.5 text-sm'} font-medium text-gray-900 dark:text-white ${isSystemMessage || isBookingState || isPhaseChange || isStoppageTime ? 'justify-center' : isAwayTeam ? 'justify-start' : 'justify-start'}`}>
            {getEventTitle(event)}
          </div>
          {!isSystemMessage && !isBookingState && !isPhaseChange && !isStoppageTime && (
            <div className={`text-xs text-gray-500 dark:text-gray-400 tabular-nums ${isAwayTeam ? 'text-right' : 'text-right'}`}>
              {event.phase} - {event.timeElapsed}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 