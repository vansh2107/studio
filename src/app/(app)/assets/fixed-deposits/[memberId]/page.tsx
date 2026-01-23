'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, mockFixedDepositDetails } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { InteractiveAssetCardViewer } from '@/components/dashboards/InteractiveAssetCardViewer';

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

const CardFront = ({ item, isExpanded }: { item: GroupedFDs; isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 to-gray-500", isExpanded && "rounded-xl")}>
        <CardHeader>
            <CardTitle className="text-3xl font-bold">{item.fdName}</CardTitle>
            <CardDescription className="text-blue-100">{item.fds.length} assets in this FD</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-blue-100">Total Value</p>
            <p className="text-4xl font-semibold">{formatter.format(item.totalAmount)}</p>
            {!isExpanded && <p className="text-sm mt-2 text-blue-200">Click to view details</p>}
        </CardContent>
    </Card>
);

const CardBack = ({ item }: { item: GroupedFDs }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>{item.fdName} Portfolio</CardTitle>
            <CardDescription>Detailed breakdown of fixed deposit holdings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
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
                    {item.fds.map((fd, index) => (
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
    </div>
);

type GroupedFDs = {
  fdName: string;
  fds: (typeof mockFixedDepositDetails);
  totalAmount: number;
};

export default function FixedDepositDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;

    const member = useMemo(() => {
        const allMembers = [...clients, ...familyMembers];
        return allMembers.find(m => m.id === memberId);
    }, [memberId]);

    const fdsByFdName = useMemo(() => {
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

    if (!member) {
        return (
            <Card>
                <CardHeader><CardTitle>Member not found</CardTitle></CardHeader>
                <CardContent><p>The requested details could not be loaded.</p></CardContent>
            </Card>
        );
    }
    
    if (fdsByFdName.length === 0) {
        return (
            <div className="space-y-6 p-4">
                <h1 className="text-3xl font-bold font-headline">Fixed Deposit Details for {member.name}</h1>
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No fixed deposit assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">Fixed Deposit Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of fixed deposits.</p>
            <InteractiveAssetCardViewer<GroupedFDs>
              items={fdsByFdName}
              renderCardFront={(item, isExpanded) => <CardFront item={item} isExpanded={isExpanded} />}
              renderCardBack={(item) => <CardBack item={item} />}
              layoutIdPrefix="fd-card"
            />
        </div>
    );
}
