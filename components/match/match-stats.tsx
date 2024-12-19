import { 
  Target, 
  Circle, 
  Flag, 
  Square,
  AlertTriangle 
} from 'lucide-react';

interface MatchStatsProps {
  matchData: any;
}

export function MatchStats({ matchData }: MatchStatsProps) {
  const actions = matchData.actions;

  // Calculate shots
  const homeShots = [
    ...(actions.shotsOnTarget || []),
    ...(actions.shotsOffTarget || []),
    ...(actions.shotsOffWoodwork || []),
    ...(actions.blockedShots || [])
  ].filter(shot => shot.team === 'Home').length;

  const awayShots = [
    ...(actions.shotsOnTarget || []),
    ...(actions.shotsOffTarget || []),
    ...(actions.shotsOffWoodwork || []),
    ...(actions.blockedShots || [])
  ].filter(shot => shot.team === 'Away').length;

  // Shots on goal (shotsOnTarget)
  const homeShotsOnGoal = (actions.shotsOnTarget || []).filter((shot: { team: string; }) => shot.team === 'Home').length;
  const awayShotsOnGoal = (actions.shotsOnTarget || []).filter((shot: { team: string; }) => shot.team === 'Away').length;

  // Corners
  const homeCorners = (actions.corners || []).filter((corner: { team: string; }) => corner.team === 'Home').length;
  const awayCorners = (actions.corners || []).filter((corner: { team: string; }) => corner.team === 'Away').length;

  // Red cards
  const homeRedCards = (actions.straightRedCards || []).filter((card: { team: string; }) => card.team === 'Home').length;
  const awayRedCards = (actions.straightRedCards || []).filter((card: { team: string; }) => card.team === 'Away').length;

  // Yellow cards
  const homeYellowCards = (actions.yellowCards || []).filter((card: { team: string; }) => card.team === 'Home').length;
  const awayYellowCards = (actions.yellowCards || []).filter((card: { team: string; }) => card.team === 'Away').length;

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
  }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="w-16 text-center font-bold">{homeCount}</div>
      <div className="flex items-center gap-2 flex-1 justify-center">
        <Icon className={`w-4 h-4 ${iconColor || ''}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="w-16 text-center font-bold">{awayCount}</div>
    </div>
  );

  return (
    <div className="space-y-1 py-4 border-t border-border px-4">
      <StatRow 
        icon={Target} 
        label="Shots" 
        homeCount={homeShots} 
        awayCount={awayShots} 
      />
      <StatRow 
        icon={Circle} 
        label="Shots on Goal" 
        homeCount={homeShotsOnGoal} 
        awayCount={awayShotsOnGoal} 
      />
      <StatRow 
        icon={Flag} 
        label="Corners" 
        homeCount={homeCorners} 
        awayCount={awayCorners} 
      />
      <StatRow 
        icon={Square} 
        label="Red Cards" 
        homeCount={homeRedCards} 
        awayCount={awayRedCards}
        iconColor="bg-red-500 text-red-500"
      />
      <StatRow 
        icon={Square} 
        label="Yellow Cards" 
        homeCount={homeYellowCards} 
        awayCount={awayYellowCards}
        iconColor="bg-yellow-500 text-yellow-500"
      />
    </div>
  );
}