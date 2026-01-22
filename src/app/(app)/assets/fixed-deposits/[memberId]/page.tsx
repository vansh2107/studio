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

// Mock data for Fixed Deposits details with FD Name
const mockFixedDepositDetails = [
  { fdName: 'SBI Tax Saver FD', bankName: 'SBI', amount: 100000, interestRate: 6.5, tenure: '5 Years', maturityDate: '2028-03-01' },
  { fdName: 'HDFC Bank Regular FD', bankName: 'HDFC Bank', amount: 200000, interestRate: 7.0, tenure: '3 Years', maturityDate: '2026-11-10' },
  { fdName: 'ICICI Bank Golden Years FD', bankName: 'ICICI Bank', amount: 150000, interestRate: 7.2, tenure: '2 Years', maturityDate: '2025-07-22' },
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

export default function FixedDepositDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [selectedFd, setSelectedFd] = useState<string | null>(null);

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

  const fixedDepositsByFdName = useMemo(() => {
    const grouped = new Map<string, typeof mockFixedDepositDetails>();
    mockFixedDepositDetails.forEach(fd => {
      if (!grouped.has(fd.fdName)) {
        grouped.set(fd.fdName, []);
      }
      grouped.get(fd.fdName)?.push(fd);
    });
    return Array.from(grouped.entries()).map(([fdName, fds]) => ({
      fdName,
      fds,
      totalAmount: fds.reduce((sum, f) => sum + f.amount, 0),
    }));
  }, []);

  const handleCardClick = useCallback((fdName: string) => {
    setSelectedFd(fdName);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedFd(null);
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
      <h1 className="text-3xl font-bold font-headline">Fixed Deposit Details for {member.name}</h1>
      <p className="text-muted-foreground">Detailed breakdown of fixed deposits.</p>

      {!selectedFd ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixedDepositsByFdName.map((fdGroup, index) => (
            <Card
              key={fdGroup.fdName}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => handleCardClick(fdGroup.fdName)}
              style={{
                transform: `scale(1)`, // Initial scale
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 opacity-20"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow-md text-2xl">FD: {fdGroup.fdName}</CardTitle>
                <CardDescription className="text-gray-200">Total Amount: {formatter.format(fdGroup.totalAmount)}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-100">{fdGroup.fds.length} fixed deposits</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in slide-in-from-left-0 fade-in-0 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">FD: {selectedFd}</CardTitle>
              <CardDescription>Detailed view of fixed deposit {selectedFd}</CardDescription>
            </div>
            <Button onClick={handleBackClick} variant="outline">
              Back to FD List
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Interest Rate</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Maturity Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedDepositsByFdName.find(fdGroup => fdGroup.fdName === selectedFd)?.fds.map((fd, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{fd.bankName}</TableCell>
                    <TableCell className="text-right">{formatter.format(fd.amount)}</TableCell>
                    <TableCell className="text-right">{fd.interestRate}%</TableCell>
                    <TableCell>{fd.tenure}</TableCell>
                    <TableCell>{formatDate(fd.maturityDate)}</TableCell>
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