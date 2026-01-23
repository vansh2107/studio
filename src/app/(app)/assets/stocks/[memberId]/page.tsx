
'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { familyMembers, clients, mockStockDetails } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const CardFront = ({ dp, isExpanded = false }: { dp: DpData, isExpanded?: boolean }) => (
    <Card className={cn("h-full w-full flex flex-col justify-between text-white shadow-lg bg-gradient-to-br from-blue-700 via-blue-500 to-orange-400", isExpanded && "rounded-xl")}>
        <CardHeader>
            <CardTitle className="text-3xl font-bold">{dp.dpName}</CardTitle>
            <CardDescription className="text-blue-100">{dp.stocks.length} assets in this DP</CardDescription>
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
        <CardFooter className="justify-center text-xs text-muted-foreground p-2">
            Click to flip back
        </CardFooter>
    </div>
);


type DpData = {
    dpName: string;
    stocks: (typeof mockStockDetails);
    totalValue: number;
};

export default function StockDetailsPage() {
    const params = useParams();
    const memberId = params.memberId as string;
    const [selectedDp, setSelectedDp] = useState<DpData | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const member = useMemo(() => {
        const allMembers = [...clients, ...familyMembers];
        return allMembers.find(m => m.id === memberId);
    }, [memberId]);

    const stocksByDp = useMemo(() => {
        const grouped = new Map<string, typeof mockStockDetails>();
        mockStockDetails.forEach(stock => {
            if (!grouped.has(stock.dpName)) {
                grouped.set(stock.dpName, []);
            }
            grouped.get(stock.dpName)?.push(stock);
        });
        return Array.from(grouped.entries()).map(([dpName, stocks]) => ({
            dpName,
            stocks,
            totalValue: stocks.reduce((sum, s) => sum + s.currentMarketValue * s.quantity, 0),
        }));
    }, []);

    const handleCardClick = (dp: DpData) => {
        setSelectedDp(dp);
        setIsFlipped(false);
    };

    const handleClose = () => {
        setSelectedDp(null);
        setIsFlipped(false);
    };

    if (!member) {
        return (
            <Card>
                <CardHeader><CardTitle>Member not found</CardTitle></CardHeader>
                <CardContent><p>The requested details could not be loaded.</p></CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold font-headline">Stock Details for {member.name}</h1>
            <p className="text-muted-foreground">Detailed breakdown of stock portfolio.</p>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stocksByDp.map((dp) => (
                    <motion.div
                        key={dp.dpName}
                        layoutId={`card-container-${dp.dpName}`}
                        onClick={() => handleCardClick(dp)}
                        className="cursor-pointer h-56"
                        whileHover={{ scale: 1.03 }}
                    >
                        <CardFront dp={dp} />
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {selectedDp && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-[8000] p-4"
                        onClick={handleClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            layoutId={`card-container-${selectedDp.dpName}`}
                            className="w-[85vw] h-[75vh] relative"
                            onClick={(e) => e.stopPropagation()}
                            style={{ perspective: 1000 }}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleClose}
                                className="absolute top-2 right-2 z-[60] bg-black/30 hover:bg-black/50 text-white hover:text-white rounded-full close-icon"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <motion.div
                                className="w-full h-full cursor-pointer"
                                style={{ transformStyle: 'preserve-3d' }}
                                onClick={() => setIsFlipped(!isFlipped)}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            >
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                >
                                    <CardFront dp={selectedDp} isExpanded />
                                </motion.div>
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                    <CardBack dp={selectedDp} />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {stocksByDp.length === 0 && (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>No stock assets found for {member.name}.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
