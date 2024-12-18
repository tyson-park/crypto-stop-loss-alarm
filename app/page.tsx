'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">코인 손절 알람기</h1>
      
      <div className="relative">
        <Input 
          type="text" 
          placeholder="Search..." 
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-primary">손절가</h2>
          <p>stop loss price</p>
        </div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-primary">현재가</h2>
          <p>current price</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="default">알림 신청</Button>
      </div>
    </div>
  )
}

