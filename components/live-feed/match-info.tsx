import { Trophy, Sun, Wind, Waves, Users2, Calendar, ArrowLeft } from 'lucide-react';
import { MatchEvent } from './types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface MatchInfoProps {
  competitionName: string;
  matchName: string;
  startDateUtc: string;
  events: MatchEvent[];
}

export function MatchInfo({ competitionName, matchName, startDateUtc, events }: MatchInfoProps) {
  const router = useRouter();

  // Değerleri kontrol et
  useEffect(() => {
    console.log('MatchInfo rendered with:', {
      competitionName,
      matchName,
      startDateUtc,
      eventsCount: events.length
    });
  }, [competitionName, matchName, startDateUtc, events.length]);

  // Sistem mesajlarını filtrele ve en son durumları al
  const systemInfo = events
    .filter(event => 
      event.type === 'systemMessage' && 
      event.phase === 'PreMatch' &&
      event.details?.message &&
      (
        event.details.message.toLowerCase().includes('weather') ||
        event.details.message.toLowerCase().includes('wind') ||
        event.details.message.toLowerCase().includes('pitch')
      )
    )
    .reduce((acc: { [key: string]: string }, event) => {
      if (!event.details?.message) return acc;
      
      const message = event.details.message.toLowerCase();
      
      if (message.includes('weather')) {
        // İlk harfi büyük yap
        const weatherInfo = event.details.message.replace('Weather:', '').trim();
        acc.weather = weatherInfo.charAt(0).toUpperCase() + weatherInfo.slice(1);
      } else if (message.includes('wind')) {
        const windInfo = event.details.message.replace('Wind:', '').trim();
        acc.wind = windInfo.charAt(0).toUpperCase() + windInfo.slice(1);
      } else if (message.includes('pitch')) {
        const pitchInfo = event.details.message.replace('Pitch is', '').trim();
        acc.pitch = pitchInfo.charAt(0).toUpperCase() + pitchInfo.slice(1);
      }
      
      return acc;
    }, {});

  // startDateUtc değeri geçerli değilse varsayılan bir değer kullan
  const formattedDate = startDateUtc && !isNaN(new Date(startDateUtc).getTime()) 
    ? (() => {
        const date = new Date(startDateUtc);
        // Manuel olarak dd.mm.yyyy formatını oluştur
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başlar
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      })()
    : 'Date not available';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-2 overflow-x-hidden">
          {/* Geri Dönüş Butonu */}
          <button
            onClick={() => router.back()}
            className="p-1 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Turnuva Bilgisi */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="p-1 sm:p-2 rounded-lg bg-amber-500/10">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
            </div>
            <span className="text-xs sm:text-sm font-normal text-gray-600 dark:text-white truncate">
              {competitionName || 'Unknown Competition'}
            </span>
          </div>

       
          {/* Tarih ve Saat */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="p-1 sm:p-2 rounded-lg bg-blue-500/10">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            </div>
            <time className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 tabular-nums font-medium whitespace-nowrap">
              {formattedDate}
            </time>
          </div>

          {/* Saha ve Hava Durumu Bilgileri */}
          <div className="flex flex-nowrap items-center gap-1 sm:gap-2 ml-auto shrink-0">
            {systemInfo.weather && (
              <div className="flex items-center gap-1">
                <div className="p-1 sm:p-2 rounded-lg bg-yellow-500/10">
                  <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[60px] sm:max-w-none">
                  {systemInfo.weather}
                </span>
              </div>
            )}

            {systemInfo.wind && (
              <div className="flex items-center gap-1">
                <div className="p-1 sm:p-2 rounded-lg bg-blue-500/10">
                  <Wind className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[60px] sm:max-w-none">
                  {systemInfo.wind}
                </span>
              </div>
            )}

            {systemInfo.pitch && (
              <div className="flex items-center gap-1">
                <div className="p-1 sm:p-2 rounded-lg bg-green-500/10">
                  <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-[60px] sm:max-w-none">
                  Pitch {systemInfo.pitch}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 