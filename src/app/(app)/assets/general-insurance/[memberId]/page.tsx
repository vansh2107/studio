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

// Mock data for General Insurance details with Policy Number
const mockGeneralInsuranceDetails = [
  { policyNumber: 'GI001', policyName: 'Car Insurance', policyType: 'Motor', insurer: 'Bajaj Allianz', premium: 12000, sumAssured: 500000, expiryDate: '2026-10-20' },
  { policyNumber: 'GI002', policyName: 'Health Insurance', policyType: 'Health', insurer: 'Apollo Munich', premium: 8000, sumAssured: 300000, expiryDate: '2027-03-15' },
  { policyNumber: 'GI003', policyName: 'Home Insurance', policyType: 'Property', insurer: 'ICICI Lombard', premium: 5000, sumAssured: 2000000, expiryDate: '2028-01-01' },
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

export default function GeneralInsuranceDetailsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const member = useMemo(() => {
    const allMembers = [...clients, ...familyMembers];
    return allMembers.find(m => m.id === memberId);
  }, [memberId]);

  const generalInsuranceByPolicy = useMemo(() => {
    const grouped = new Map<string, typeof mockGeneralInsuranceDetails>();
    mockGeneralInsuranceDetails.forEach(policy => {
      if (!grouped.has(policy.policyNumber)) {
        grouped.set(policy.policyNumber, []);
      }
      grouped.get(policy.policyNumber)?.push(policy);
    });
    return Array.from(grouped.entries()).map(([policyNumber, policies]) => ({
      policyNumber,
      policies,
      totalPremium: policies.reduce((sum, p) => sum + p.premium, 0),
      totalSumAssured: policies.reduce((sum, p) => sum + p.sumAssured, 0),
    }));
  }, []);

  const handleCardClick = useCallback((policyNumber: string) => {
    setSelectedPolicy(policyNumber);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedPolicy(null);
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
      <h1 className="text-3xl font-bold font-headline">General Insurance Details for {member.name}</h1>
      <p className="text-muted-foreground">Detailed breakdown of general insurance policies.</p>

      {!selectedPolicy ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalInsuranceByPolicy.map((policyGroup, index) => (
            <Card
              key={policyGroup.policyNumber}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              onClick={() => handleCardClick(policyGroup.policyNumber)}
              style={{
                transform: `scale(1)`, // Initial scale
                transition: 'transform 0.3s ease-in-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-600 opacity-20"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-white drop-shadow-md text-2xl">Policy: {policyGroup.policyNumber}</CardTitle>
                <CardDescription className="text-gray-200">Total Premium: {formatter.format(policyGroup.totalPremium)}</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-100">Total Sum Assured: {formatter.format(policyGroup.totalSumAssured)}</p>
                <p className="text-gray-100">{policyGroup.policies.length} policies</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="animate-in slide-in-from-left-0 fade-in-0 duration-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Policy: {selectedPolicy}</CardTitle>
              <CardDescription>Detailed view of policy {selectedPolicy}</CardDescription>
            </div>
            <Button onClick={handleBackClick} variant="outline">
              Back to Policy List
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Policy Type</TableHead>
                  <TableHead>Insurer</TableHead>
                  <TableHead className="text-right">Premium</TableHead>
                  <TableHead className="text-right">Sum Assured</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {generalInsuranceByPolicy.find(policyGroup => policyGroup.policyNumber === selectedPolicy)?.policies.map((policy, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{policy.policyName}</TableCell>
                    <TableCell>{policy.policyType}</TableCell>
                    <TableCell>{policy.insurer}</TableCell>
                    <TableCell className="text-right">{formatter.format(policy.premium)}</TableCell>
                    <TableCell className="text-right">{formatter.format(policy.sumAssured)}</TableCell>
                    <TableCell>{formatDate(policy.expiryDate)}</TableCell>
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