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

// Mock data for PPF details with Bank Name
const mockPpfDetails = [
  { bankName: 'SBI', accountHolder: 'John Doe', accountNumber: '123456789', openingDate: '2010-01-15', maturityDate: '2025-01-15', value: 500000, interestRate: 7.1 },
  { bankName: 'HDFC Bank', accountHolder: 'John Doe', accountNumber: '987654321', openingDate: '2012-03-01', maturityDate: '2027-03-01', value: 750000, interestRate: 7.1 },
  { bankName: 'ICICI Bank', accountHolder: 'Jane Doe', accountNumber: '112233445', openingDate: '2015-06-20', maturityDate: '2030-06-20', value: 300000, interestRate: 7.1 },
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

export default function PpfDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

  const ppfByBank = useMemo(() => {
    const grouped = new Map<string, typeof mockPpfDetails>();
    mockPpfDetails.forEach(ppf => {
      if (!grouped.has(ppf.bankName)) {
        grouped.set(ppf.bankName, []);
      }
      grouped.get(ppf.bankName)?.push(ppf);
    });
    return Array.from(grouped.entries()).map(([bankName, ppfs]) => ({
      bankName,
      ppfs,
      totalValue: ppfs.reduce((sum, p) => sum + p.value, 0),
    }));
  }, []);

  const handleCardClick = useCallback((bankName: string) => {
    setSelectedBank(bankName);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedBank(null);
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
      <h1 className="text-3xl font-bold font-headline">PPF Details for {member.name}</h1>
      <p className="text-muted-foreground">Detailed breakdown of PPF investments.</p>

      {!selectedBank ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ppfByBank.map((bank, index) => (
            <Card
              key={bank.bankName}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => handleCardClick(bank.bankName)}
              style={{
                transform: `scale(1)`, // Initial scale
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-20"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow-md text-2xl">{bank.bankName}</CardTitle>
                <CardDescription className="text-gray-200">Total Value: {formatter.format(bank.totalValue)}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-100">{bank.ppfs.length} PPF accounts</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in slide-in-from-left-0 fade-in-0 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedBank} PPF Accounts</CardTitle>
              <CardDescription>Detailed view of PPF accounts held with {selectedBank}</CardDescription>
            </div>
            <Button onClick={handleBackClick} variant="outline">
              Back to Bank List
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Holder</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Opening Date</TableHead>
                  <TableHead>Maturity Date</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Interest Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ppfByBank.find(bank => bank.bankName === selectedBank)?.ppfs.map((ppf, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ppf.accountHolder}</TableCell>
                    <TableCell>{ppf.accountNumber}</TableCell>
                    <TableCell>{formatDate(ppf.openingDate)}</TableCell>
                    <TableCell>{formatDate(ppf.maturityDate)}</TableCell>
                    <TableCell className="text-right">{formatter.format(ppf.value)}</TableCell>
                    <TableCell className="text-right">{ppf.interestRate}%</TableCell>
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