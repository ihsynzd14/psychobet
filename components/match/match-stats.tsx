import { 
  Target, 
  Circle, 
  Flag, 
  Square,
  AlertTriangle,
  ArrowUpRight,
  Swords,
  ArrowRight,
  ArrowLeft,
  UserMinus,
  Goal,
  Percent
} from 'lucide-react';
import { useMemo } from 'react';

interface MatchStatsProps {
  matchData: any;
}

export function MatchStats({ matchData }: MatchStatsProps) {
  const actions = matchData.actions;
  const statistics = matchData.statistics || { possession: { home: 50, away: 50 } };

  // Memoize all calculations
  const stats = useMemo(() => {
    // Shots calculations in one pass
    const shotStats = {
      home: { total: 0, onTarget: 0, offTarget: 0, woodwork: 0, blocked: 0 },
      away: { total: 0, onTarget: 0, offTarget: 0, woodwork: 0, blocked: 0 }
    };

    // Process shots in one pass
    (actions.shotsOnTarget || []).forEach((shot: { team: string }) => {
      if (shot.team === 'Home') {
        shotStats.home.onTarget++;
        shotStats.home.total++;
      } else {
        shotStats.away.onTarget++;
        shotStats.away.total++;
      }
    });

    (actions.shotsOffTarget || []).forEach((shot: { team: string }) => {
      if (shot.team === 'Home') {
        shotStats.home.offTarget++;
        shotStats.home.total++;
      } else {
        shotStats.away.offTarget++;
        shotStats.away.total++;
      }
    });

    (actions.shotsOffWoodwork || []).forEach((shot: { team: string }) => {
      if (shot.team === 'Home') {
        shotStats.home.woodwork++;
        shotStats.home.total++;
      } else {
        shotStats.away.woodwork++;
        shotStats.away.total++;
      }
    });

    (actions.blockedShots || []).forEach((shot: { team: string }) => {
      if (shot.team === 'Home') {
        shotStats.home.blocked++;
        shotStats.home.total++;
      } else {
        shotStats.away.blocked++;
        shotStats.away.total++;
      }
    });

    // Process danger states in one pass
    const dangerStats = {
      home: { attacks: 0, dangerousAttacks: 0, dangerousFreekicks: 0, attackingFreekicks: 0 },
      away: { attacks: 0, dangerousAttacks: 0, dangerousFreekicks: 0, attackingFreekicks: 0 }
    };

    (actions.dangerStateChanges || []).forEach((state: { dangerState: string; dangerStateDisplay: string }) => {
      switch (state.dangerState) {
        case 'HomeAttack':
          dangerStats.home.attacks++;
          break;
        case 'AwayAttack':
          dangerStats.away.attacks++;
          break;
        case 'HomeDangerousAttack':
          dangerStats.home.dangerousAttacks++;
          break;
        case 'AwayDangerousAttack':
          dangerStats.away.dangerousAttacks++;
          break;
        case 'HomeAttackingFreeKick':
          dangerStats.home.attackingFreekicks++;
          break;
        case 'AwayAttackingFreeKick':
          dangerStats.away.attackingFreekicks++;
          break;
      }

      if (state.dangerState === 'HomeDangerousFreeKick') {
        dangerStats.home.dangerousFreekicks++;
      } else if (state.dangerState === 'AwayDangerousFreeKick') {
        dangerStats.away.dangerousFreekicks++;
      }
    });

    // Process other stats in one pass
    const otherStats = {
      home: { throwIns: 0, offsides: 0, goalkicks: 0, subs: 0, corners: 0, redCards: 0, yellowCards: 0 },
      away: { throwIns: 0, offsides: 0, goalkicks: 0, subs: 0, corners: 0, redCards: 0, yellowCards: 0 }
    };

    (actions.throwIns || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.throwIns++;
      else otherStats.away.throwIns++;
    });

    (actions.offsides || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.offsides++;
      else otherStats.away.offsides++;
    });

    (actions.goalKicks || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.goalkicks++;
      else otherStats.away.goalkicks++;
    });

    (actions.substitutions || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.subs++;
      else otherStats.away.subs++;
    });

    (actions.corners || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.corners++;
      else otherStats.away.corners++;
    });

    (actions.straightRedCards || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.redCards++;
      else otherStats.away.redCards++;
    });

    (actions.yellowCards || []).forEach((item: { team: string }) => {
      if (item.team === 'Home') otherStats.home.yellowCards++;
      else otherStats.away.yellowCards++;
    });

    return {
      shots: shotStats,
      danger: dangerStats,
      other: otherStats
    };
  }, [actions]); // Only recalculate when actions change

  const StatRow = ({ 
    icon: Icon, 
    label, 
    homeCount, 
    awayCount, 
    iconColor 
  }: { 
    icon: any, 
    label: string, 
    homeCount: number, 
    awayCount: number,
    iconColor?: string
  }) => {
    const total = homeCount + awayCount;
    const homePercentage = total > 0 ? (homeCount / total) * 100 : 50;
    const awayPercentage = total > 0 ? (awayCount / total) * 100 : 50;

    return (
      <div className="relative h-6 flex items-center text-xs hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
        <div className="absolute inset-0 flex">
          <div 
            className="bg-blue-300/50 dark:bg-blue-900/30 transition-all duration-300" 
            style={{ width: `${homePercentage}%` }}
          />
          <div 
            className="bg-red-300/50 dark:bg-red-900/30 transition-all duration-300" 
            style={{ width: `${awayPercentage}%` }}
          />
        </div>

        <div className="relative flex items-center justify-between w-full px-3 py-0.5">
          <div className="w-8 font-medium text-[#1565c0] dark:text-blue-400">
            {homeCount}
          </div>
          
          <div className="flex items-center gap-1 font-medium text-[10px] text-gray-700 dark:text-gray-300">
            <Icon className="w-3 h-3" />
            {label}
          </div>
          
          <div className="w-8 text-right font-medium text-[#c62828] dark:text-red-400">
            {awayCount}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-t border-border dark:border-gray-800">
      <h2 className="p-3 text-sm font-normal">STATISTICS</h2>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        <StatRow 
          icon={Percent} 
          label="Possession" 
          homeCount={statistics.possession.home} 
          awayCount={statistics.possession.away} 
        />
        <StatRow 
          icon={Target} 
          label="Shots" 
          homeCount={stats.shots.home.total} 
          awayCount={stats.shots.away.total} 
        />
        <StatRow 
          icon={Circle} 
          label="On Target" 
          homeCount={stats.shots.home.onTarget} 
          awayCount={stats.shots.away.onTarget} 
        />
        <StatRow 
          icon={AlertTriangle} 
          label="Off Target" 
          homeCount={stats.shots.home.offTarget} 
          awayCount={stats.shots.away.offTarget} 
        />
        <StatRow 
          icon={AlertTriangle} 
          label="Woodwork" 
          homeCount={stats.shots.home.woodwork} 
          awayCount={stats.shots.away.woodwork} 
        />
        <StatRow 
          icon={AlertTriangle} 
          label="Blocked" 
          homeCount={stats.shots.home.blocked} 
          awayCount={stats.shots.away.blocked} 
        />
        <StatRow 
          icon={ArrowUpRight} 
          label="Attacks" 
          homeCount={stats.danger.home.attacks} 
          awayCount={stats.danger.away.attacks} 
        />
        <StatRow 
          icon={Swords} 
          label="Dng. Attack" 
          homeCount={stats.danger.home.dangerousAttacks} 
          awayCount={stats.danger.away.dangerousAttacks} 
        />
        <StatRow 
          icon={ArrowRight} 
          label="Dng. Free" 
          homeCount={stats.danger.home.dangerousFreekicks} 
          awayCount={stats.danger.away.dangerousFreekicks} 
        />
        <StatRow 
          icon={ArrowRight} 
          label="Att. Kick" 
          homeCount={stats.danger.home.attackingFreekicks} 
          awayCount={stats.danger.away.attackingFreekicks} 
        />
        <StatRow 
          icon={ArrowLeft} 
          label="Throw In" 
          homeCount={stats.other.home.throwIns} 
          awayCount={stats.other.away.throwIns} 
        />
        <StatRow 
          icon={Flag} 
          label="Offside" 
          homeCount={stats.other.home.offsides} 
          awayCount={stats.other.away.offsides} 
        />
        <StatRow 
          icon={Goal} 
          label="Goal Kick" 
          homeCount={stats.other.home.goalkicks} 
          awayCount={stats.other.away.goalkicks} 
        />
        <StatRow 
          icon={UserMinus} 
          label="Sub" 
          homeCount={stats.other.home.subs} 
          awayCount={stats.other.away.subs} 
        />
        <StatRow 
          icon={Flag} 
          label="Corner" 
          homeCount={stats.other.home.corners} 
          awayCount={stats.other.away.corners} 
        />
        <StatRow 
          icon={Square} 
          label="Red" 
          homeCount={stats.other.home.redCards} 
          awayCount={stats.other.away.redCards} 
        />
        <StatRow 
          icon={Square} 
          label="Yellow" 
          homeCount={stats.other.home.yellowCards} 
          awayCount={stats.other.away.yellowCards} 
        />
      </div>
    </div>
  );
}