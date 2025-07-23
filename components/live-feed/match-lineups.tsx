import { memo } from 'react';
import { TeamLineup } from './types';

interface MatchLineupsProps {
  homeTeamLineup: TeamLineup;
  awayTeamLineup: TeamLineup;
  events?: any[]; // Add events prop to track substitutions
}

// Define a type for substitution status
type SubstitutionStatus = 'in' | 'out' | null;

const PlayerRow = memo(({ 
  player, 
  isHome, 
  substitutionStatus 
}: { 
  player: TeamLineup['startingOnPitch'][0]; 
  isHome: boolean;
  substitutionStatus: SubstitutionStatus;
}) => {
  // Determine text color based on substitution status
  const textColorClass = substitutionStatus === 'in' 
    ? 'text-green-600 dark:text-green-400 font-medium' 
    : substitutionStatus === 'out' 
      ? 'text-red-600 dark:text-red-400 font-medium' 
      : '';

  return (
    <div className={`flex items-center gap-1 py-0.5 px-1 text-[11px] ${isHome ? 'justify-start' : 'justify-end'} ${textColorClass}`}>
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
  );
});

PlayerRow.displayName = 'PlayerRow';

const TeamLineupSection = memo(({ 
  lineup, 
  isHome, 
  type,
  events,
  team
}: { 
  lineup: TeamLineup; 
  isHome: boolean; 
  type: 'starting' | 'bench';
  events?: any[];
  team: 'Home' | 'Away';
}) => {
  const players = type === 'starting' ? lineup.startingOnPitch : lineup.startingBench;
  
  // Find substitution events for this team
  const getSubstitutionStatus = (player: TeamLineup['startingOnPitch'][0]): SubstitutionStatus => {
    if (!events || events.length === 0) return null;
    
    // Check if player was substituted in
    const subIn = events.find(e => 
      e.type === 'substitution' && 
      e.team === team && 
      e.details.playerOn?.internalId === player.internalId
    );
    
    if (subIn) return 'in';
    
    // Check if player was substituted out
    const subOut = events.find(e => 
      e.type === 'substitution' && 
      e.team === team && 
      e.details.playerOff?.internalId === player.internalId
    );
    
    if (subOut) return 'out';
    
    return null;
  };
  
  return (
    <div className={`flex-1 ${isHome ? 'pr-1' : 'pl-1'}`}>
      <div className={`flex flex-col ${isHome ? 'items-start' : 'items-end'}`}>
        {players.map((player) => (
          <PlayerRow 
            key={`${player.internalId}-${player.position}-${Date.now()}`} 
            player={player} 
            isHome={isHome}
            substitutionStatus={getSubstitutionStatus(player)}
          />
        ))}
      </div>
    </div>
  );
});

TeamLineupSection.displayName = 'TeamLineupSection';

export const MatchLineups = function MatchLineups({ homeTeamLineup, awayTeamLineup, events = [] }: MatchLineupsProps) {
  // Use timestamp-based key to ensure fresh renders
  const refreshKey = `${Date.now()}-${Math.random()}`;

  return (
    <div className="flex flex-col gap-3 px-2" key={refreshKey}>
      <div>
        <div className="flex items-start mb-1">
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1">Starting XI</div>
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1 text-right">Starting XI</div>
        </div>
        <div className="flex">
          <TeamLineupSection 
            lineup={homeTeamLineup} 
            isHome={true} 
            type="starting" 
            events={events}
            team="Home"
          />
          <div className="mx-2 h-full border-r border-gray-200 dark:border-gray-700" />
          <TeamLineupSection 
            lineup={awayTeamLineup} 
            isHome={false} 
            type="starting" 
            events={events}
            team="Away"
          />
        </div>
      </div>

      <div>
        <div className="flex items-start mb-1">
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1">Substitutions</div>
          <div className="text-[10px] font-medium text-gray-500 uppercase flex-1 text-right">Substitutions</div>
        </div>
        <div className="flex">
          <TeamLineupSection 
            lineup={homeTeamLineup} 
            isHome={true} 
            type="bench" 
            events={events}
            team="Home"
          />
          <div className="mx-2 h-full border-r border-gray-200 dark:border-gray-700" />
          <TeamLineupSection 
            lineup={awayTeamLineup} 
            isHome={false} 
            type="bench" 
            events={events}
            team="Away"
          />
        </div>
      </div>
    </div>
  );
}; 