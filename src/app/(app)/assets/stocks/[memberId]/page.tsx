'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { familyMembers, clients } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Mock data for stock details with DP Name
const mockStockDetails = [
  { dpName: 'Zerodha', scriptName: 'Reliance Industries', purchaseValue: 2800, quantity: 100, currentMarketValue: 3000, profitLoss: 200 },
  { dpName: 'Zerodha', scriptName: 'Tata Consultancy Services', purchaseValue: 3500, quantity: 50, currentMarketValue: 3600, profitLoss: 100 },
  { dpName: 'Upstox', scriptName: 'HDFC Bank', purchaseValue: 1500, quantity: 150, currentMarketValue: 1600, profitLoss: 150 },
  { dpName: 'Upstox', scriptName: 'Infosys', purchaseValue: 1400, quantity: 120, currentMarketValue: 1450, profitLoss: 50 },
  { dpName: 'Groww', scriptName: 'ICICI Bank', purchaseValue: 900, quantity: 200, currentMarketValue: 950, profitLoss: 50 },
  { dpName: 'Groww', scriptName: 'Hindustan Unilever', purchaseValue: 2500, quantity: 80, currentMarketValue: 2600, profitLoss: 100 },
];

export default function StockDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

  const stocksByDp = useMemo(() => {
    const grouped = new Map<string, typeof mockStockDetails>();
    mockStockDetails.forEach(stock => {
      if (!grouped.has(stock.dpName)) {
        grouped.set(stock.dpName, []);
      }
      grouped.get(stock.dpName)?.push(stock);
    });
    return Array.from(grouped.entries()).map(([dpName, stocks]) => ({
      dpName,
      stocks,
      totalValue: stocks.reduce((sum, s) => sum + s.currentMarketValue * s.quantity, 0),
    }));
  }, []);

  const handleCardClick = useCallback((dpName: string) => {
    setFlippedCard(prev => (prev === dpName ? null : dpName));
  }, []);

  if (!member) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Member not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested details could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold font-headline">Stock Details for {member.name}</h1>
      <p className="text-muted-foreground">Detailed breakdown of stock portfolio.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [perspective:1000px]">
        {stocksByDp.map((dp) => (
          <motion.div
            key={dp.dpName}
            onClick={() => handleCardClick(dp.dpName)}
            className={cn(
              "transition-opacity duration-300",
              flippedCard && flippedCard !== dp.dpName && "opacity-50"
            )}
          >
            <motion.div
                className="relative h-56 w-full cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flippedCard === dp.dpName ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: !flippedCard ? 1.05 : 1, zIndex: flippedCard ? 0 : 10 }}
            >
                {/* Front of Card */}
                <div 
                    className="absolute inset-0"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <Card className="h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-indigo-600 to-purple-700">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{dp.dpName}</CardTitle>
                            <CardDescription className="text-indigo-200">{dp.stocks.length} unique stocks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-indigo-200">Total Value</p>
                            <p className="text-3xl font-semibold">{formatter.format(dp.totalValue)}</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Back of Card */}
                <div 
                    className="absolute inset-0"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <Card className="h-full w-full flex flex-col bg-gradient-to-br from-purple-800 to-indigo-700 text-white p-0 overflow-hidden">
                         <CardHeader className="p-4 flex-shrink-0">
                            <CardTitle className="text-xl font-bold">{dp.dpName} Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0">
                            <ScrollArea className="h-full">
                                <Table className="text-xs">
                                    <TableHeader>
                                        <TableRow className="border-white/20 hover:bg-transparent">
                                            <TableHead className="text-white">Script</TableHead>
                                            <TableHead className="text-white text-right">Qty</TableHead>
                                            <TableHead className="text-white text-right">Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dp.stocks.map((stock, index) => (
                                            <TableRow key={index} className="border-white/10 hover:bg-white/10">
                                                <TableCell className="font-medium">{stock.scriptName}</TableCell>
                                                <TableCell className="text-right">{stock.quantity}</TableCell>
                                                <TableCell className="text-right">{formatter.format(stock.currentMarketValue * stock.quantity)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      {stocksByDp.length === 0 && (
         <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
                <p>No stock assets found for {member.name}.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
