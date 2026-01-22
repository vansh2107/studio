'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';
import { familyMembers, clients } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
  { dpName: 'Zerodha', scriptName: 'ICICI Bank', purchaseValue: 900, quantity: 200, currentMarketValue: 950, profitLoss: 50 },
  { dpName: 'Groww', scriptName: 'Hindustan Unilever', purchaseValue: 2500, quantity: 80, currentMarketValue: 2600, profitLoss: 100 },
];

export default function StockDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [selectedDp, setSelectedDp] = useState<string | null>(null);

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
    setSelectedDp(dpName);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedDp(null);
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

      {!selectedDp ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocksByDp.map((dp, index) => (
            <Card
              key={dp.dpName}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => handleCardClick(dp.dpName)}
              style={{
                transform: `scale(1)`, // Initial scale
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow-md text-2xl">{dp.dpName}</CardTitle>
                <CardDescription className="text-gray-200">Total Value: {formatter.format(dp.totalValue)}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-100">{dp.stocks.length} unique stocks</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in slide-in-from-left-0 fade-in-0 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedDp} Portfolio</CardTitle>
              <CardDescription>Detailed view of stocks held with {selectedDp}</CardDescription>
            </div>
            <Button onClick={handleBackClick} variant="outline">
              Back to DP List
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Script Name</TableHead>
                  <TableHead className="text-right">Purchase Value</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Current Market Value</TableHead>
                  <TableHead className="text-right">Profit/Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocksByDp.find(dp => dp.dpName === selectedDp)?.stocks.map((stock, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stock.scriptName}</TableCell>
                    <TableCell className="text-right">{formatter.format(stock.purchaseValue)}</TableCell>
                    <TableCell className="text-right">{stock.quantity}</TableCell>
                    <TableCell className="text-right">{formatter.format(stock.currentMarketValue)}</TableCell>
                    <TableCell className="text-right" style={{ color: stock.profitLoss >= 0 ? 'green' : 'red' }}>
                      {formatter.format(stock.profitLoss)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}