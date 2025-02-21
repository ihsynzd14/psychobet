import { useMemo } from 'react';
import { MatchEvent } from './types';
import React from 'react';

interface MatchStatsProps {
  events: MatchEvent[];
  possession?: {
    home: number;
    away: number;
  };
}

interface TeamStats {
  shots: number;
  shotsOn: number;
  shotsOff: number;
  shotsWW: number;
  shotsBlocked: number;
  attacks: number;
  dangerousAttacks: number;
  penalties: number;
  missedPenalties: number;
  dangerousFreeKicks: number;
  attackingFreeKicks: number;
  yellowCards: number;
  redCards: number;
  corners: number;
  throwIns: number;
  offsides: number;
  goalKicks: number;
  substitutions: number;
  possession: number;
}

const initialStats: TeamStats = {
  shots: 0,
  shotsOn: 0,
  shotsOff: 0,
  shotsWW: 0,
  shotsBlocked: 0,
  attacks: 0,
  dangerousAttacks: 0,
  penalties: 0,
  missedPenalties: 0,
  dangerousFreeKicks: 0,
  attackingFreeKicks: 0,
  yellowCards: 0,
  redCards: 0,
  corners: 0,
  throwIns: 0,
  offsides: 0,
  goalKicks: 0,
  substitutions: 0,
  possession: 0,
};

// Optimized StatRow with memo for better performance
const StatRow = React.memo(({ label, home, away }: { label: string; home: number; away: number }) => {
  const total = home + away;
  const homeWidth = total === 0 ? 50 : (home / total) * 100;
  
  return (
    <div className="relative h-6">
      <div className="grid grid-cols-3 text-sm relative z-10 text-xs">
        <div className="text-right pr-3 py-1.5 font-normal">{home}</div>
        <div className="text-center py-1.5 text-gray-600 truncate">{label}</div>
        <div className="text-left pl-3 py-1.5 font-normal">{away}</div>
      </div>
      
      {/* Optimized progress bars */}
      <div className="absolute inset-0 flex">
        <div 
          className="h-full bg-[#94EBFC]"
          style={{ width: `${homeWidth}%` }}
        />
        <div 
          className="h-full bg-[#E0FE67]"
          style={{ width: `${100 - homeWidth}%` }}
        />
      </div>
    </div>
  );
});

StatRow.displayName = 'StatRow';

export function MatchStats({ events, possession }: MatchStatsProps) {
  const { homeStats, awayStats } = useMemo(() => {
    const home = { ...initialStats };
    const away = { ...initialStats };

    // Possession verilerini ekle
    if (possession) {
      home.possession = possession.home;
      away.possession = possession.away;
    }

    // Optimized event processing
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const stats = event.team === 'Home' ? home : away;
      
      switch (event.type) {
        case 'shotOnTarget':
          stats.shots++;
          stats.shotsOn++;
          break;
        case 'shotOffTarget':
          stats.shots++;
          stats.shotsOff++;
          break;
        case 'shotBlocked':
          stats.shots++;
          stats.shotsBlocked++;
          break;
        case 'shotWoodwork':
          stats.shots++;
          stats.shotsWW++;
          break;
        case 'dangerState':
          const state = event.details.dangerState;
          if (state?.includes('DangerousFreeKick')) {
            stats.dangerousFreeKicks++;
          } else if (state?.includes('AttackingFreeKick')) {
            stats.attackingFreeKicks++;
          } else if (state?.includes('DangerousAttack')) {
            stats.dangerousAttacks++;
          } else if (state?.includes('Attack') && !state.includes('Free')) {
            stats.attacks++;
          }
          break;
        case 'cornerAwarded':
        case 'cornerTaken':
          if (event.details.status === 'awarded') {
            stats.corners++;
          }
          break;
        case 'penalty': stats.penalties++; break;
        case 'missedPenalty': stats.missedPenalties++; break;
        case 'yellowCard': stats.yellowCards++; break;
        case 'redCard': stats.redCards++; break;
        case 'throwIn': stats.throwIns++; break;
        case 'offside': stats.offsides++; break;
        case 'goalKick': stats.goalKicks++; break;
        case 'substitution': stats.substitutions++; break;
      }
    }

    return { homeStats: home, awayStats: away };
  }, [events]);

  return (
    <div className="bg-white divide-y divide-gray-100">
      <StatRow label="Possession %" home={homeStats.possession} away={awayStats.possession} />
      <StatRow label="Shots" home={homeStats.shots} away={awayStats.shots} />
      <StatRow label="Shots On" home={homeStats.shotsOn} away={awayStats.shotsOn} />
      <StatRow label="Shots Off" home={homeStats.shotsOff} away={awayStats.shotsOff} />
      <StatRow label="Shots WW" home={homeStats.shotsWW} away={awayStats.shotsWW} />
      <StatRow label="Shots Blocked" home={homeStats.shotsBlocked} away={awayStats.shotsBlocked} />
      <StatRow label="Attacks" home={homeStats.attacks} away={awayStats.attacks} />
      <StatRow label="Dangerous Attacks" home={homeStats.dangerousAttacks} away={awayStats.dangerousAttacks} />
      <StatRow label="Corners" home={homeStats.corners} away={awayStats.corners} />
      <StatRow label="Penalties" home={homeStats.penalties} away={awayStats.penalties} />
      <StatRow label="Missed Penalties" home={homeStats.missedPenalties} away={awayStats.missedPenalties} />
      <StatRow label="Dangerous FreeKicks" home={homeStats.dangerousFreeKicks} away={awayStats.dangerousFreeKicks} />
      <StatRow label="Attacking FreeKicks" home={homeStats.attackingFreeKicks} away={awayStats.attackingFreeKicks} />
      <StatRow label="Yellow Cards" home={homeStats.yellowCards} away={awayStats.yellowCards} />
      <StatRow label="Red Cards" home={homeStats.redCards} away={awayStats.redCards} />
      <StatRow label="Throw Ins" home={homeStats.throwIns} away={awayStats.throwIns} />
      <StatRow label="Offsides" home={homeStats.offsides} away={awayStats.offsides} />
      <StatRow label="Goal Kicks" home={homeStats.goalKicks} away={awayStats.goalKicks} />
      <StatRow label="Substitutions" home={homeStats.substitutions} away={awayStats.substitutions} />
    </div>
  );
}