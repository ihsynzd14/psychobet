import { memo } from 'react';

interface TeamInfo {
  sourceId: string;
  sourceName: string;
  strip: {
    color1: {
      r: number;
      g: number;
      b: number;
    };
    color2: {
      r: number;
      g: number;
      b: number;
    };
  };
}

interface MatchHeaderProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
}

const rgbToHex = (r: number, g: number, b: number): string => (
  '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
);

const TeamColorCircle = ({ color1, color2, title }: { color1: string; color2: string; title: string }) => (
  <div className="relative w-8 h-8" title={title}>
    <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="absolute inset-0 w-1/2 h-full" style={{ backgroundColor: color1 }} />
      <div className="absolute inset-0 w-1/2 h-full left-1/2" style={{ backgroundColor: color2 }} />
    </div>
  </div>
);

export const MatchHeader = memo<MatchHeaderProps>(({ homeTeam, awayTeam }) => {
  // Tek seferlik renk dönüşümleri
  const homeColor1 = rgbToHex(homeTeam.strip.color1.r, homeTeam.strip.color1.g, homeTeam.strip.color1.b);
  const homeColor2 = rgbToHex(homeTeam.strip.color2.r, homeTeam.strip.color2.g, homeTeam.strip.color2.b);
  const awayColor1 = rgbToHex(awayTeam.strip.color1.r, awayTeam.strip.color1.g, awayTeam.strip.color1.b);
  const awayColor2 = rgbToHex(awayTeam.strip.color2.r, awayTeam.strip.color2.g, awayTeam.strip.color2.b);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Home Team */}
      <div className="flex items-center gap-3 flex-1">
        <TeamColorCircle color1={homeColor1} color2={homeColor2} title="Home Team" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {homeTeam.sourceName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Home Team
          </p>
        </div>
      </div>

      {/* VS */}
      <div className="px-4">
        <span className="text-lg font-bold text-gray-400 dark:text-gray-500">VS</span>
      </div>

      {/* Away Team */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-right">
            {awayTeam.sourceName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
            Away Team
          </p>
        </div>
        <TeamColorCircle color1={awayColor1} color2={awayColor2} title="Away Team" />
      </div>
    </div>
  );
}); 