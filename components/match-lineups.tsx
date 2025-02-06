import { FC } from 'react';

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

interface LineupData {
  starters: Player[];
  bench: Player[];
}

interface LineupUpdate {
  team: string;
  lineup: LineupData;
}

interface LineupsViewProps {
  lineupUpdates: LineupUpdate[];
}

export const LineupsView: FC<LineupsViewProps> = ({ lineupUpdates }) => {
  if (!lineupUpdates || lineupUpdates.length === 0) return null;

  const homeLineup = lineupUpdates.find(update => update.team === 'Home')?.lineup;
  const awayLineup = lineupUpdates.find(update => update.team === 'Away')?.lineup;

  if (!homeLineup || !awayLineup) return null;

  const renderPlayerList = (players: Player[]) => {
    return players.map((player) => (
      <div key={player.id} className="flex items-center gap-2 text-xs whitespace-nowrap overflow-hidden">
        <span className="w-5 text-center font-medium shrink-0">{player.number}</span>
        <span className="flex-1 truncate">{player.name}</span>
      </div>
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mt-4">
      <h2 className="text-sm font-normal mb-2">LINEUPS</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Starting XI */}
        <div>
          <h3 className="text-[10px] uppercase font-medium mb-1 text-green-600 dark:text-green-400">starting xi</h3>
          {renderPlayerList(homeLineup.starters)}
        </div>
        <div>
          <h3 className="text-[10px] uppercase font-medium mb-1 text-green-600 dark:text-green-400">starting xi</h3>
          {renderPlayerList(awayLineup.starters)}
        </div>

        {/* Substitutes */}
        <div className="mt-2">
          <h3 className="text-[10px] uppercase font-medium mb-1 text-blue-600 dark:text-blue-400">substitutes</h3>
          {renderPlayerList(homeLineup.bench)}
        </div>
        <div className="mt-2">
          <h3 className="text-[10px] uppercase font-medium mb-1 text-blue-600 dark:text-blue-400">substitutes</h3>
          {renderPlayerList(awayLineup.bench)}
        </div>
      </div>
    </div>
  );
}; 