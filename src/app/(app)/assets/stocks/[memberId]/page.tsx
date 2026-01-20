
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Mock data for stock details
const mockStockDetails = [
  { scriptName: 'Reliance Industries', purchaseValue: 2800, quantity: 100 },
  { scriptName: 'Tata Consultancy Services', purchaseValue: 3500, quantity: 50 },
  { scriptName: 'HDFC Bank', purchaseValue: 1500, quantity: 150 },
  { scriptName: 'Infosys', purchaseValue: 1400, quantity: 120 },
];

export default function StockDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

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
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">
          Stock Details for {member.name}
        </h1>
        <p className="text-muted-foreground">
          Detailed breakdown of stock portfolio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Portfolio</CardTitle>
          <CardDescription>This is a detailed view of the stocks held by {member.name}. Market values are for demonstration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Script Name</TableHead>
                <TableHead className="text-right">Purchase Value</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStockDetails.map((stock, index) => {
                const marketValue = stock.purchaseValue * (1 + (Math.random() - 0.4)) * stock.quantity;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{stock.scriptName}</TableCell>
                    <TableCell className="text-right">{formatter.format(stock.purchaseValue)}</TableCell>
                    <TableCell className="text-right">{stock.quantity}</TableCell>
                    <TableCell className="text-right">{formatter.format(marketValue)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
