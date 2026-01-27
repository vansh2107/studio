
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { familyMembers, clients, mockStockDetails } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { InteractiveAssetCardViewer } from '@/components/dashboards/InteractiveAssetCardViewer';
import Image from 'next/image';
import { TrendingUp } from 'lucide-react';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const CardFront = ({ dp, isExpanded = false }: { dp: DpData, isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 to-orange-400", isExpanded && "rounded-xl")}>
        <CardHeader className="flex flex-row justify-between items-start gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-semibold">Stocks</CardTitle>
                    <CardDescription className="text-blue-100 pt-1">{dp.stocks.length} assets</CardDescription>
                </div>
            </div>
            <div className="text-right min-w-0">
                 <h3 className="text-lg font-bold truncate">{dp.dpName}</h3>
                 <p className="text-sm opacity-80 truncate">{dp.dpId}</p>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-blue-100">Total Value</p>
            <p className="text-4xl font-semibold">{formatter.format(dp.totalValue)}</p>
            {!isExpanded && <p className="text-sm mt-2 text-blue-200">Click to view details</p>}
        </CardContent>
    </Card>
);

const CardBack = ({ dp }: { dp: DpData }) => (
    <div className="w-full h-full flex flex-col text-card-foreground bg-card rounded-xl">
        <CardHeader>
            <CardTitle>{dp.dpName} Portfolio</CardTitle>
            <CardDescription>Detailed breakdown of stock holdings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Script Name</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Purchase Value</TableHead>
                        <TableHead className="text-right">Current Value</TableHead>
                        <TableHead className="text-right">Profit / Loss</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {dp.stocks.map((stock, index) => {
                        const totalPurchaseValue = stock.purchaseValue * stock.quantity;
                        const totalCurrentValue = stock.currentMarketValue * stock.quantity;
                        const profitLoss = totalCurrentValue - totalPurchaseValue;
                        const isProfit = profitLoss >= 0;
                        return (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{stock.scriptName}</TableCell>
                                <TableCell className="text-right">{stock.quantity}</TableCell>
                                <TableCell className="text-right">{formatter.format(totalPurchaseValue)}</TableCell>
                                <TableCell className="text-right">{formatter.format(totalCurrentValue)}</TableCell>
                                <TableCell className={cn("text-right font-semibold", isProfit ? "text-green-600" : "text-red-600")}>
                                    {formatter.format(profitLoss)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    </div>
);


type DpData = {
    dpName: string;
    dpId: string;
    stocks: (typeof mockStockDetails);
    totalValue: number;
};

export default function StockDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;

    const member = useMemo(() => {
        const allPossibleMembers = [...clients, ...familyMembers];
        const foundMember = allPossibleMembers.find(m => m.id === memberId);
        
        // The member might not have a `name` property if it's from the `clients` array initially.
        if (foundMember && !foundMember.name) {
            return {
                ...foundMember,
                name: `${foundMember.firstName} ${foundMember.lastName}`
            };
        }
        return foundMember;
    }, [memberId]);

    const stocksByDp = useMemo(() => {
        const grouped = new Map<string, typeof mockStockDetails>();
        mockStockDetails.forEach(stock => {
            if (!grouped.has(stock.dpName)) {
                grouped.set(stock.dpName, []);
            }
            grouped.get(stock.dpName)?.push(stock);
        });
        const dpidMap: { [key: string]: string } = {
            'Zerodha': 'IN300095',
            'Upstox': 'IN300214',
            'ICICI Direct': 'IN300118',
            'HDFC Securities': 'IN300183'
        };
        return Array.from(grouped.entries()).map(([dpName, stocks]) => ({
            dpName,
            dpId: dpidMap[dpName] || 'IN' + Math.floor(100000 + Math.random() * 900000),
            stocks,
            totalValue: stocks.reduce((sum, s) => sum + s.currentMarketValue * s.quantity, 0),
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
    
    if (stocksByDp.length === 0) {
        return (
            <div className="space-y-6 p-4">
                <h1 className="text-3xl font-bold font-headline">Stock Details for {member.name}</h1>
                 <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No stock assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">Stock Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of stock portfolio.</p>

            <InteractiveAssetCardViewer<DpData>
                items={stocksByDp}
                memberName={member.name}
                renderCardFront={(item, isExpanded) => <CardFront dp={item} isExpanded={isExpanded} />}
                renderCardBack={(item) => <CardBack dp={item} />}
                layoutIdPrefix="stock-card"
            />
        </div>
    );
}
