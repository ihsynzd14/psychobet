'use client';
import { LiveFeedPage } from '@/components/live-feed-page';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useFixtureStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { apiV2 } from '@/lib/api-v2';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [localFixtureDetails, setLocalFixtureDetails] = useState<FixtureDetails | null>(null);
  
  useEffect(() => {
    const checkAccessAndFetchDetails = async () => {
      setIsLoading(true);
      
      try {
        // First check if user has access to this fixture
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }
        
        // Check access through our API (checks both direct fixture access and league access)
        const response = await fetch(`/api/fixture-access?fixtureId=${params.fixtureId}`);
        
        if (!response.ok) {
          console.error('Error checking fixture access:', response.status, response.statusText);
          toast({
            title: 'Error',
            description: 'Failed to check fixture access',
            variant: 'destructive',
          });
          router.push('/');
          return;
        }
        
        const accessData = await response.json();
        
        if (!accessData.hasAccess) {
          console.log('User does not have access to fixture:', params.fixtureId);
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
        
        console.log('User has access to fixture:', params.fixtureId);
        
        setHasAccess(true);
        
        // Now fetch fixture details
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
      } catch (error) {
        console.error('Error checking access or fetching fixture details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load fixture data',
          variant: 'destructive',
        });
      }
      
      // Hiçbir şekilde bulunamadıysa ana sayfaya yönlendir
      router.push('/');
    };
    
    checkAccessAndFetchDetails();
  }, [params.fixtureId, fixtureStore, router]);
  
  // Fixture detayları yüklenirken loading göster
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If user doesn't have access, show access denied message
  if (hasAccess === false) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 max-w-md">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to view this fixture. Access can be granted either through direct fixture access or by having access to the fixture's competition/league. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
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
    <ProtectedRoute>
      <LiveFeedPage 
        fixtureId={params.fixtureId}
        competitionName={localFixtureDetails.competitionName}
        matchName={localFixtureDetails.matchName}
        startDateUtc={localFixtureDetails.startDateUtc}
        venueName={localFixtureDetails.venueName}
        roundName={localFixtureDetails.roundName}
      />
    </ProtectedRoute>
  );
}