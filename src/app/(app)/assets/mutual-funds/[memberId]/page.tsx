
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, mockMutualFundDetails } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { InteractiveAssetCardViewer } from '@/components/dashboards/InteractiveAssetCardViewer';
import { AMC_NAMES } from '@/lib/constants';
import Image from 'next/image';
import { Landmark } from 'lucide-react';

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

const CardFront = ({ item, isExpanded }: { item: GroupedMFs; isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 to-orange-400", isExpanded && "rounded-xl")}>
        <CardHeader className="flex flex-row justify-between items-start">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Landmark className="h-6 w-6 text-white" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-semibold">Mutual Funds</CardTitle>
                    <CardDescription className="text-blue-100 pt-1">{item.mfs.length} assets</CardDescription>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                 <h3 className="text-lg font-bold">{item.amc}</h3>
                 <p className="text-sm opacity-80">{item.folioNumber}</p>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-blue-100">Total Value</p>
            <p className="text-4xl font-semibold">{formatter.format(item.totalValue)}</p>
            {!isExpanded && <p className="text-sm mt-2 text-blue-200">Click to view details</p>}
        </CardContent>
    </Card>
);

const CardBack = ({ item }: { item: GroupedMFs }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>{item.folioNumber} Portfolio</CardTitle>
            <CardDescription>Detailed breakdown of mutual fund holdings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
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
                    {item.mfs.map((mf, index) => (
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
    </div>
);

type GroupedMFs = {
  folioNumber: string;
  amc: string;
  mfs: (typeof mockMutualFundDetails);
  totalValue: number;
};

export default function MutualFundDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;

    const member = useMemo(() => {
        const allMembers = [...clients, ...familyMembers];
        return allMembers.find(m => m.id === memberId);
    }, [memberId]);

    const mfsByFolio = useMemo(() => {
        const grouped = new Map<string, typeof mockMutualFundDetails>();
        mockMutualFundDetails.forEach(mf => {
            if (!grouped.has(mf.folioNumber)) {
                grouped.set(mf.folioNumber, []);
            }
            grouped.get(mf.folioNumber)?.push(mf);
        });
        return Array.from(grouped.entries()).map(([folioNumber, mfs]) => {
            const amc = AMC_NAMES.find(name => mfs[0]?.fundName.startsWith(name)) || 'N/A';
            return {
                folioNumber,
                amc,
                mfs,
                totalValue: mfs.reduce((sum, mf) => sum + mf.currentValue, 0),
            }
        });
    }, []);

    if (!member) {
        return (
            <Card>
                <CardHeader><CardTitle>Member not found</CardTitle></CardHeader>
                <CardContent><p>The requested details could not be loaded.</p></CardContent>
            </Card>
        );
    }

    if (mfsByFolio.length === 0) {
        return (
             <div className="space-y-6 p-4">
                <h1 className="text-3xl font-bold font-headline">Mutual Fund Details for {member.name}</h1>
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No mutual fund assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">Mutual Fund Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of mutual fund investments.</p>
            <InteractiveAssetCardViewer<GroupedMFs>
              items={mfsByFolio}
              renderCardFront={(item, isExpanded) => <CardFront item={item} isExpanded={isExpanded} />}
              renderCardBack={(item) => <CardBack item={item} />}
              layoutIdPrefix="mf-card"
            />
        </div>
    );
}
