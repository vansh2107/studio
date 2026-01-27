
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, mockPpfDetails } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { InteractiveAssetCardViewer } from '@/components/dashboards/InteractiveAssetCardViewer';
import Image from 'next/image';
import { PiggyBank } from 'lucide-react';

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

const CardFront = ({ item, isExpanded }: { item: GroupedPpfs; isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 to-orange-400", isExpanded && "rounded-xl")}>
        <CardHeader className="flex flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-semibold">PPF</CardTitle>
                    <CardDescription className="text-blue-100 pt-1">{item.ppfs.length} assets</CardDescription>
                </div>
            </div>
            <div className="text-right min-w-0">
                 <h3 className="text-lg font-bold truncate">{item.bankName}</h3>
                 {item.accountNumber && <p className="text-sm opacity-80 truncate">{item.accountNumber}</p>}
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-blue-100">Total Value</p>
            <p className="text-4xl font-semibold">{formatter.format(item.totalValue)}</p>
            {!isExpanded && <p className="text-sm mt-2 text-blue-200">Click to view details</p>}
        </CardContent>
    </Card>
);

const CardBack = ({ item }: { item: GroupedPpfs }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>{item.bankName} Portfolio</CardTitle>
            <CardDescription>Detailed breakdown of PPF holdings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
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
                    {item.ppfs.map((ppf, index) => (
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
    </div>
);

type GroupedPpfs = {
  bankName: string;
  accountNumber?: string;
  ppfs: (typeof mockPpfDetails);
  totalValue: number;
};

export default function PpfDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;

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
            accountNumber: ppfs[0]?.accountNumber,
            ppfs,
            totalValue: ppfs.reduce((sum, p) => sum + p.value, 0),
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
    
    if (ppfByBank.length === 0) {
        return (
            <div className="space-y-6 p-4">
                <h1 className="text-3xl font-bold font-headline">PPF Details for {member.name}</h1>
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No PPF assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">PPF Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of PPF investments.</p>
            <InteractiveAssetCardViewer<GroupedPpfs>
              items={ppfByBank}
              renderCardFront={(item, isExpanded) => <CardFront item={item} isExpanded={isExpanded} />}
              renderCardBack={(item) => <CardBack item={item} />}
              layoutIdPrefix="ppf-card"
            />
        </div>
    );
}
