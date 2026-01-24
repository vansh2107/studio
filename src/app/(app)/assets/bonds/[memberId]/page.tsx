
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, mockBondDetails } from '@/lib/mock-data';
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

const CardFront = ({ item, isExpanded }: { item: GroupedBonds; isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 to-yellow-400", isExpanded && "rounded-xl")}>
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center font-bold text-2xl">
                    {item.issuer.charAt(0)}
                </div>
                <div>
                    <CardTitle className="text-2xl font-semibold">{item.issuer}</CardTitle>
                    {item.bondName && <p className="text-sm text-white/70">Bond: {item.bondName}</p>}
                </div>
            </div>
            <CardDescription className="text-blue-100 pt-2">{item.bonds.length} assets in this issuer</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-blue-100">Total Value</p>
            <p className="text-4xl font-semibold">{formatter.format(item.totalValue)}</p>
            {!isExpanded && <p className="text-sm mt-2 text-blue-200">Click to view details</p>}
        </CardContent>
    </Card>
);

const CardBack = ({ item }: { item: GroupedBonds }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>{item.issuer} Portfolio</CardTitle>
            <CardDescription>Detailed breakdown of bond holdings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
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
                    {item.bonds.map((bond, index) => (
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
    </div>
);

type GroupedBonds = {
  issuer: string;
  bondName: string;
  bonds: (typeof mockBondDetails);
  totalValue: number;
};

export default function BondDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;

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
            bondName: bonds[0]?.bondName || 'N/A',
            bonds,
            totalValue: bonds.reduce((sum, b) => sum + b.currentValue, 0),
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
    
    if (bondsByIssuer.length === 0) {
        return (
            <div className="space-y-6 p-4">
                 <h1 className="text-3xl font-bold font-headline">Bond Details for {member.name}</h1>
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No bond assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">Bond Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of bond investments.</p>
            <InteractiveAssetCardViewer<GroupedBonds>
              items={bondsByIssuer}
              renderCardFront={(item, isExpanded) => <CardFront item={item} isExpanded={isExpanded} />}
              renderCardBack={(item) => <CardBack item={item} />}
              layoutIdPrefix="bond-card"
            />
        </div>
    );
}
