'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { useState, useEffect, KeyboardEvent } from 'react'
import { useSearchParams } from 'next/navigation'

interface StopLossData {
  ticker: string;
  currentPrice: number;
  recentPivotLow: number;
  atr: number;
  swingLowMinusATR: number;
}

export default function Home() {
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get('ticker') || 'KRW-BTC'; // Default to KRW-BTC
  
  const [ticker, setTicker] = useState(initialTicker);
  const [data, setData] = useState<StopLossData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stop-loss?ticker=${symbol.toUpperCase()}`);
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        setError(result.error || 'API request failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data on initial load if a ticker is provided
    if (ticker) {
      fetchData(ticker);
    }
  }, [ticker]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchData(ticker);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">코인 손절 알람기</h1>
      
      <div className="relative">
        <Input 
          type="text" 
          placeholder="Search..." 
          className="pl-10"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-primary">손절가</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {data && <p>{data.swingLowMinusATR.toFixed(2)}</p>}
        </div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-primary">현재가</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {data && <p>{data.currentPrice.toFixed(2)}</p>}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="default" onClick={() => fetchData(ticker)}>알림 신청</Button>
      </div>
    </div>
  )
}