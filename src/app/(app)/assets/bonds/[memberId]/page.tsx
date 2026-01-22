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

// Mock data for Bonds details with Issuer
const mockBondDetails = [
  { issuer: 'Government of India', bondName: '7.26% GS 2032', faceValue: 1000, quantity: 100, currentValue: 102000, maturityDate: '2032-08-14' },
  { issuer: 'NABARD', bondName: 'NABARD Bonds', faceValue: 10000, quantity: 10, currentValue: 105000, maturityDate: '2028-01-25' },
  { issuer: 'Reliance Industries', bondName: 'Reliance NCD', faceValue: 5000, quantity: 20, currentValue: 101000, maturityDate: '2027-06-30' },
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

export default function BondDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [selectedIssuer, setSelectedIssuer] = useState<string | null>(null);

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

  const bondsByIssuer = useMemo(() => {
    const grouped = new Map<string, typeof mockBondDetails>();
    mockBondDetails.forEach(bond => {
      if (!grouped.has(bond.issuer)) {
        grouped.set(bond.issuer, []);
      }
      grouped.get(bond.issuer)?.push(bond);
    });
    return Array.from(grouped.entries()).map(([issuer, bonds]) => ({
      issuer,
      bonds,
      totalValue: bonds.reduce((sum, b) => sum + b.currentValue, 0),
    }));
  }, []);

  const handleCardClick = useCallback((issuer: string) => {
    setSelectedIssuer(issuer);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedIssuer(null);
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
      <h1 className="text-3xl font-bold font-headline">Bond Details for {member.name}</h1>
      <p className="text-muted-foreground">Detailed breakdown of bond investments.</p>

      {!selectedIssuer ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bondsByIssuer.map((bondGroup, index) => (
            <Card
              key={bondGroup.issuer}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => handleCardClick(bondGroup.issuer)}
              style={{
                transform: `scale(1)`, // Initial scale
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-700 opacity-20"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow-md text-2xl">Issuer: {bondGroup.issuer}</CardTitle>
                <CardDescription className="text-gray-200">Total Value: {formatter.format(bondGroup.totalValue)}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-100">{bondGroup.bonds.length} bonds</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in slide-in-from-left-0 fade-in-0 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Issuer: {selectedIssuer}</CardTitle>
              <CardDescription>Detailed view of bonds from {selectedIssuer}</CardDescription>
            </div>
            <Button onClick={handleBackClick} variant="outline">
              Back to Issuer List
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bond Name</TableHead>
                  <TableHead>Face Value</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead>Maturity Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bondsByIssuer.find(bondGroup => bondGroup.issuer === selectedIssuer)?.bonds.map((bond, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{bond.bondName}</TableCell>
                    <TableCell>{formatter.format(bond.faceValue)}</TableCell>
                    <TableCell>{bond.quantity}</TableCell>
                    <TableCell className="text-right">{formatter.format(bond.currentValue)}</TableCell>
                    <TableCell>{formatDate(bond.maturityDate)}</TableCell>
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