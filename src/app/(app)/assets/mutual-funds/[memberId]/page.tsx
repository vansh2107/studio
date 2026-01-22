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

// Mock data for Mutual Funds details with Folio Number
const mockMutualFundDetails = [
  { folioNumber: 'FOLIO001', fundName: 'Reliance Large Cap Fund', scheme: 'Growth', nav: 250, units: 1000, currentValue: 250000, purchaseDate: '2018-05-10' },
  { folioNumber: 'FOLIO001', fundName: 'HDFC Mid-Cap Opportunities Fund', scheme: 'Growth', nav: 120, units: 1500, currentValue: 180000, purchaseDate: '2019-02-20' },
  { folioNumber: 'FOLIO002', fundName: 'ICICI Prudential Bluechip Fund', scheme: 'Growth', nav: 60, units: 5000, currentValue: 300000, purchaseDate: '2017-11-01' },
  { folioNumber: 'FOLIO003', fundName: 'SBI Equity Hybrid Fund', scheme: 'Growth', nav: 300, units: 800, currentValue: 240000, purchaseDate: '2020-09-15' },
];

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function MutualFundDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [selectedFolio, setSelectedFolio] = useState<string | null>(null);

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

  const mutualFundsByFolio = useMemo(() => {
    const grouped = new Map<string, typeof mockMutualFundDetails>();
    mockMutualFundDetails.forEach(mf => {
      if (!grouped.has(mf.folioNumber)) {
        grouped.set(mf.folioNumber, []);
      }
      grouped.get(mf.folioNumber)?.push(mf);
    });
    return Array.from(grouped.entries()).map(([folioNumber, mfs]) => ({
      folioNumber,
      mfs,
      totalValue: mfs.reduce((sum, mf) => sum + mf.currentValue, 0),
    }));
  }, []);

  const handleCardClick = useCallback((folioNumber: string) => {
    setSelectedFolio(folioNumber);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedFolio(null);
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
      <h1 className="text-3xl font-bold font-headline">Mutual Fund Details for {member.name}</h1>
      <p className="text-muted-foreground">Detailed breakdown of mutual fund investments.</p>

      {!selectedFolio ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mutualFundsByFolio.map((folio, index) => (
            <Card
              key={folio.folioNumber}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => handleCardClick(folio.folioNumber)}
              style={{
                transform: `scale(1)`, // Initial scale
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-20"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow-md text-2xl">Folio: {folio.folioNumber}</CardTitle>
                <CardDescription className="text-gray-200">Total Value: {formatter.format(folio.totalValue)}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-100">{folio.mfs.length} unique funds</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in slide-in-from-left-0 fade-in-0 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Folio: {selectedFolio}</CardTitle>
              <CardDescription>Detailed view of mutual funds in Folio {selectedFolio}</CardDescription>
            </div>
            <Button onClick={handleBackClick} variant="outline">
              Back to Folio List
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Scheme</TableHead>
                  <TableHead>NAV</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead>Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mutualFundsByFolio.find(folio => folio.folioNumber === selectedFolio)?.mfs.map((mf, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{mf.fundName}</TableCell>
                    <TableCell>{mf.scheme}</TableCell>
                    <TableCell>{mf.nav}</TableCell>
                    <TableCell>{mf.units}</TableCell>
                    <TableCell className="text-right">{formatter.format(mf.currentValue)}</TableCell>
                    <TableCell>{formatDate(mf.purchaseDate)}</TableCell>
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