
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, mockGeneralInsuranceDetails } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { InteractiveAssetCardViewer } from '@/components/dashboards/InteractiveAssetCardViewer';
import Image from 'next/image';

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

const CardFront = ({ item, isExpanded }: { item: GroupedPolicies; isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 to-orange-400", isExpanded && "rounded-xl")}>
        <CardHeader>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center font-bold text-2xl">
                    {item.policyNumber.charAt(0)}
                </div>
                <div>
                    <CardTitle className="text-2xl font-semibold">{item.policyNumber}</CardTitle>
                    {item.insurer && <p className="text-sm text-white/70">Insurer: {item.insurer}</p>}
                </div>
            </div>
            <CardDescription className="text-blue-100 pt-2">{item.policies.length} assets in this policy</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-blue-100">Total Premium</p>
            <p className="text-4xl font-semibold">{formatter.format(item.totalPremium)}</p>
            {!isExpanded && <p className="text-sm mt-2 text-blue-200">Click to view details</p>}
        </CardContent>
    </Card>
);

const CardBack = ({ item }: { item: GroupedPolicies }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>{item.policyNumber} Portfolio</CardTitle>
            <CardDescription>Detailed breakdown of general insurance holdings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
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
                    {item.policies.map((policy, index) => (
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
    </div>
);

type GroupedPolicies = {
  policyNumber: string;
  insurer: string;
  policies: (typeof mockGeneralInsuranceDetails);
  totalPremium: number;
};

export default function GeneralInsuranceDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;

    const member = useMemo(() => {
        const allMembers = [...clients, ...familyMembers];
        return allMembers.find(m => m.id === memberId);
    }, [memberId]);

    const policiesByNumber = useMemo(() => {
        const grouped = new Map<string, typeof mockGeneralInsuranceDetails>();
        mockGeneralInsuranceDetails.forEach(policy => {
            if (!grouped.has(policy.policyNumber)) {
                grouped.set(policy.policyNumber, []);
            }
            grouped.get(policy.policyNumber)?.push(policy);
        });
        return Array.from(grouped.entries()).map(([policyNumber, policies]) => ({
            policyNumber,
            insurer: policies[0]?.insurer || 'N/A',
            policies,
            totalPremium: policies.reduce((sum, p) => sum + p.premium, 0),
        }));
    }, []);

    if (!member) {
        return (
            <Card>
                <CardHeader><CardTitle>Member not found</CardTitle></CardHeader>
                <CardContent><p>The requested details could not be loaded.</p></CardContent>
            </Card>
        );
    }
    
    if (policiesByNumber.length === 0) {
        return (
             <div className="space-y-6 p-4">
                <h1 className="text-3xl font-bold font-headline">General Insurance Details for {member.name}</h1>
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No general insurance assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">General Insurance Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of general insurance policies.</p>
            <InteractiveAssetCardViewer<GroupedPolicies>
              items={policiesByNumber}
              renderCardFront={(item, isExpanded) => <CardFront item={item} isExpanded={isExpanded} />}
              renderCardBack={(item) => <CardBack item={item} />}
              layoutIdPrefix="gi-card"
            />
        </div>
    );
}
