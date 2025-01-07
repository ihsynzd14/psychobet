import { AlertCircleIcon, ArrowLeft, Trophy, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export function MatchUnavailable() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-900">
      {/* Animated Soccer Balls Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="soccer-ball-1 absolute w-32 h-32 opacity-10" />
        <div className="soccer-ball-2 absolute w-24 h-24 opacity-10" />
        <div className="soccer-ball-3 absolute w-40 h-40 opacity-10" />
        <style jsx>{`
          @keyframes float1 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(100px, -100px) rotate(180deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
          }
          @keyframes float2 {
            0% { transform: translate(-50px, -50px) rotate(0deg); }
            50% { transform: translate(150px, 100px) rotate(-180deg); }
            100% { transform: translate(-50px, -50px) rotate(-360deg); }
          }
          @keyframes float3 {
            0% { transform: translate(100px, 100px) rotate(0deg); }
            50% { transform: translate(-100px, 50px) rotate(180deg); }
            100% { transform: translate(100px, 100px) rotate(360deg); }
          }
          .soccer-ball-1 {
            top: 20%;
            left: 20%;
            background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.2), transparent);
            border-radius: 50%;
            animation: float1 15s infinite ease-in-out;
          }
          .soccer-ball-2 {
            top: 60%;
            right: 25%;
            background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.15), transparent);
            border-radius: 50%;
            animation: float2 20s infinite ease-in-out;
          }
          .soccer-ball-3 {
            bottom: 10%;
            left: 40%;
            background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.25), transparent);
            border-radius: 50%;
            animation: float3 18s infinite ease-in-out;
          }
        `}</style>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative overflow-hidden group">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Decorative Glow Effects */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          
          <div className="flex flex-col items-center space-y-8 relative z-10">
            {/* Header with Trophy Icon */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
              </div>
              <Badge 
                variant="outline" 
                className="px-4 py-1.5 bg-blue-500/10 text-blue-500 border-blue-500/20"
              >
                Match Status
              </Badge>
            </div>

            {/* Status Icon with Animation */}
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-16 h-16 text-blue-400" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">Match Unavailable</h3>
              <p className="text-gray-400 max-w-sm">
                We couldn't load the match data at this moment. The game might be temporarily unavailable.
              </p>
            </div>

            <div className="w-full space-y-3">
              <Button 
                onClick={() => router.push('/')}
                className="bg-blue-950 w-full group hover:bg-blue-900 text-blue-100 flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg border border-blue-800"
              >
                <ArrowLeft className="w-4 h-4 group-hover:animate-pulse" />
                Return to Fixtures
              </Button>
              <p className="text-xs text-center text-gray-500">
                You will be redirected to the fixtures page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 