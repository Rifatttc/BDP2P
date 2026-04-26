import { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FirestoreHealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkHealth = async () => {
    setIsRetrying(true);
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      setIsHealthy(true);
      setError(null);
    } catch (err: any) {
      console.error("Health check failed:", err);
      setIsHealthy(false);
      if (err.code === 'unavailable') {
        setError("Network Error: Could not reach the Cloud Firestore backend.");
      } else {
        setError(err.message || "Unknown connectivity error");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (isHealthy === true || isHealthy === null) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] p-4 animate-in slide-in-from-top duration-500">
      <div className="max-w-lg mx-auto bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <WifiOff className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Offline Mode Active</span>
            <span className="text-[11px] text-white/60 font-medium leading-tight max-w-[200px]">
              {error}
            </span>
          </div>
        </div>
        <Button 
          onClick={checkHealth} 
          disabled={isRetrying}
          variant="outline" 
          size="sm" 
          className="h-9 px-4 rounded-full border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 font-bold text-[10px] uppercase tracking-widest"
        >
          {isRetrying ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Retry Sync"}
        </Button>
      </div>
    </div>
  );
}
