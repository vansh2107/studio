
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LifeInsuranceDetails } from '@/lib/types';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

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

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{value ?? 'N/A'}</p>
    </div>
);

// Mock data for life insurance policies
const mockLifeInsurancePolicies: LifeInsuranceDetails[] = [
    { company: 'LIC', policyNumber: '987654321', planName: 'Jeevan Anand', sumAssured: 1000000, premiumAmount: 25000, policyStartDate: '2015-06-01', policyEndDate: '2040-06-01' },
    { company: 'HDFC Life', policyNumber: '123456789', planName: 'Click 2 Protect', sumAssured: 5000000, premiumAmount: 15000, policyStartDate: '2020-01-10', policyEndDate: '2050-01-10' },
    { company: 'ICICI Prudential', policyNumber: '456789123', planName: 'iProtect Smart', sumAssured: 2500000, premiumAmount: 18000, policyStartDate: '2018-11-20', policyEndDate: '2048-11-20' },
];

export default function LifeInsuranceDetailsPage() {
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
          Life Insurance Details for {member.name}
        </h1>
        <p className="text-muted-foreground">
          Detailed breakdown of life insurance policies.
        </p>
      </div>

      {mockLifeInsurancePolicies.map((policy, index) => (
         <Card key={index}>
            <CardHeader>
                <CardTitle>{policy.planName} - {policy.company}</CardTitle>
                <CardDescription>Policy No: {policy.policyNumber}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailItem label="Sum Assured" value={formatter.format(policy.sumAssured || 0)} />
                    <DetailItem label="Premium" value={formatter.format(policy.premiumAmount || 0)} />
                    <DetailItem label="Start Date" value={formatDate(policy.policyStartDate)} />
                    <DetailItem label="End Date" value={formatDate(policy.policyEndDate)} />
                </div>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}
