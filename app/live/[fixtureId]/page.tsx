'use client';
import { LiveFeedPage } from '@/components/live-feed-page';
import { useFixtureStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { apiV2 } from '@/lib/api-v2';

interface LiveFeedPageProps {
  params: {
    fixtureId: string;
  };
}

interface FixtureDetails {
  competitionName: string;
  matchName: string;
  startDateUtc: string;
  venueName?: string;
  roundName?: string;
}

export default function LiveFeedPageWrapper({ params }: LiveFeedPageProps) {
  const router = useRouter();
  const fixtureStore = useFixtureStore();
  const [isLoading, setIsLoading] = useState(true);
  const [localFixtureDetails, setLocalFixtureDetails] = useState<FixtureDetails | null>(null);
  
  useEffect(() => {
    const fetchFixtureDetails = async () => {
      setIsLoading(true);
      
      // Önce store'dan kontrol et
      const storeDetails = fixtureStore.getFixtureDetails(params.fixtureId);
      
      if (storeDetails) {
        setLocalFixtureDetails(storeDetails);
        // Ayrıca localStorage'a da kaydet (sayfa yenilendiğinde kullanılabilmesi için)
        try {
          localStorage.setItem(`fixture_${params.fixtureId}`, JSON.stringify(storeDetails));
        } catch (error) {
          console.error('LocalStorage error:', error);
        }
        setIsLoading(false);
        return;
      }
      
      // Store'da yoksa localStorage'dan kontrol et
      try {
        const savedDetails = localStorage.getItem(`fixture_${params.fixtureId}`);
        if (savedDetails) {
          const parsedDetails = JSON.parse(savedDetails);
          // Eksik alanları kontrol et
          if (!parsedDetails.competitionName || !parsedDetails.matchName || !parsedDetails.startDateUtc) {
            // Eksik alanlar varsa API'dan almayı dene
            throw new Error('Incomplete fixture details in localStorage');
          }
          setLocalFixtureDetails(parsedDetails);
          // Store'a da kaydet
          fixtureStore.setFixtureDetails(params.fixtureId, parsedDetails);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('LocalStorage error:', error);
      }
      
      // Hiçbir yerde yoksa API'dan almayı dene - önce V2 API'yi dene
      try {
        const fixture = await apiV2.getFixture(params.fixtureId);
        if (fixture) {
          const details = {
            competitionName: fixture.competition.name,
            matchName: fixture.name,
            startDateUtc: fixture.startDate,
            venueName: fixture.venue?.name,
            roundName: fixture.round?.name
          };
          
          // Hem state'e hem store'a hem de localStorage'a kaydet
          setLocalFixtureDetails(details);
          fixtureStore.setFixtureDetails(params.fixtureId, details);
          localStorage.setItem(`fixture_${params.fixtureId}`, JSON.stringify(details));
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('V2 API error:', error);
        
        // V2 API başarısızsa eski API'yi dene
        try {
          const fixture = await api.getFixture(params.fixtureId);
          if (fixture) {
            const details = {
              competitionName: fixture.competitionName,
              matchName: fixture.name,
              startDateUtc: fixture.startDateUtc
            };
            
            // Hem state'e hem store'a hem de localStorage'a kaydet
            setLocalFixtureDetails(details);
            fixtureStore.setFixtureDetails(params.fixtureId, details);
            localStorage.setItem(`fixture_${params.fixtureId}`, JSON.stringify(details));
            setIsLoading(false);
            return;
          }
        } catch (oldApiError) {
          console.error('Old API error:', oldApiError);
        }
      }
      
      // Hiçbir şekilde bulunamadıysa ana sayfaya yönlendir
      router.push('/');
    };
    
    fetchFixtureDetails();
  }, [params.fixtureId, fixtureStore, router]);
  
  // Fixture detayları yüklenirken loading göster
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Fixture detayları yoksa null dön (yönlendirme useEffect içinde yapılıyor)
  if (!localFixtureDetails) return null;

  // Konsola yazdırarak değerleri kontrol et
  console.log('Rendering LiveFeedPage with details:', {
    fixtureId: params.fixtureId,
    competitionName: localFixtureDetails.competitionName,
    matchName: localFixtureDetails.matchName,
    startDateUtc: localFixtureDetails.startDateUtc
  });

  return (
    <LiveFeedPage 
      fixtureId={params.fixtureId}
      competitionName={localFixtureDetails.competitionName}
      matchName={localFixtureDetails.matchName}
      startDateUtc={localFixtureDetails.startDateUtc}
      venueName={localFixtureDetails.venueName}
      roundName={localFixtureDetails.roundName}
    />
  );
} 