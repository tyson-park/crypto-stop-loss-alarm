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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDiscordPopupOpen, setIsDiscordPopupOpen] = useState<boolean>(false);
  const [discordId, setDiscordId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

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

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "discord") {
      setIsDiscordPopupOpen(true);
    } else {
      setIsDiscordPopupOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!data) return;

    const interval = (document.getElementById('interval-select') as HTMLSelectElement).value;
    const method = (document.getElementById('method-select') as HTMLSelectElement).value;

    const message = `ticker: ${ticker}, stop-loss price: ${data.swingLowMinusATR.toFixed(2)}, interval: ${interval}, method: ${method}`;

    setStatus('Sending...');

    try {
      const response = await fetch('/api/discord/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: discordId, message }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('Message sent successfully!');
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus('An unexpected error occurred.');
      console.error(error);
    }
  };

  return (
    <div className="flex space-y-6">
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
        <Button variant="default" onClick={() => setIsModalOpen(true)}>알림 신청</Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative mr-4">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">알람 신청</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">종목명</label>
                <p className="w-full p-2 border rounded bg-gray-100">{ticker}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">가격 확인 주기</label>
                <select className="w-full p-2 border rounded" id="interval-select">
                  <option value="every-minute" selected>Every Minute</option>
                  <option value="every-second">Every Second</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">알람 방법</label>
                <select className="w-full p-2 border rounded" id="method-select" onChange={handleMethodChange}>
                  <option value="">Select Option 3</option>
                  <option value="discord">디스코드</option>
                  {/* Add more options as needed */}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="default" onClick={handleSubmit}>Submit</Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">{status}</p>
          </div>
        </div>
      )}

      {isDiscordPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsDiscordPopupOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Enter Discord ID</h2>
            <Input 
              type="text" 
              placeholder="Discord ID" 
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="mt-4 flex justify-end">
              <Button variant="default" onClick={() => setIsDiscordPopupOpen(false)}>저장</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}