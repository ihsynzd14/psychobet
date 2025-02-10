import { memo } from 'react';
import { TeamLineup } from './types';

interface MatchLineupsProps {
  homeTeamLineup: TeamLineup;
  awayTeamLineup: TeamLineup;
}

const PlayerRow = memo(({ player, isHome }: { player: TeamLineup['startingOnPitch'][0]; isHome: boolean }) => (
  <div className={`flex items-center gap-1 py-0.5 px-1 text-[11px] ${isHome ? 'justify-start' : 'justify-end'}`}>
    {isHome ? (
      <>
        <span className="w-4 h-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-[10px] shrink-0">
          {player.shirtNumber}
        </span>
        <span className="truncate max-w-[120px]">{player.sourceName}</span>
      </>
    ) : (
      <>
        <span className="truncate max-w-[120px]">{player.sourceName}</span>
        <span className="w-4 h-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-[10px] shrink-0">
          {player.shirtNumber}
        </span>
      </>
    )}
  </div>
));

PlayerRow.displayName = 'PlayerRow';

const TeamLineupSection = memo(({ lineup, isHome, type }: { lineup: TeamLineup; isHome: boolean; type: 'starting' | 'bench' }) => {
  const players = type === 'starting' ? lineup.startingOnPitch : lineup.startingBench;
  
  return (
    <div className={`flex-1 ${isHome ? 'pr-1' : 'pl-1'}`}>
      <div className={`flex flex-col ${isHome ? 'items-start' : 'items-end'}`}>
        {players.map((player) => (
          <PlayerRow key={player.internalId} player={player} isHome={isHome} />
        ))}
      </div>
    </div>
  );
});

TeamLineupSection.displayName = 'TeamLineupSection';

export const MatchLineups = memo(function MatchLineups({ homeTeamLineup, awayTeamLineup }: MatchLineupsProps) {
  return (
    <div className="flex flex-col gap-3 px-2">
      <div>
        <div className="flex items-start mb-1">
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1">Starting XI</div>
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1 text-right">Starting XI</div>
        </div>
        <div className="flex">
          <TeamLineupSection lineup={homeTeamLineup} isHome={true} type="starting" />
          <div className="mx-2 h-full border-r border-gray-200 dark:border-gray-700" />
          <TeamLineupSection lineup={awayTeamLineup} isHome={false} type="starting" />
        </div>
      </div>

      <div>
        <div className="flex items-start mb-1">
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1">Substitutions</div>
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1 text-right">Substitutions</div>
        </div>
        <div className="flex">
          <TeamLineupSection lineup={homeTeamLineup} isHome={true} type="bench" />
          <div className="mx-2 h-full border-r border-gray-200 dark:border-gray-700" />
          <TeamLineupSection lineup={awayTeamLineup} isHome={false} type="bench" />
        </div>
      </div>
    </div>
  );
}); 