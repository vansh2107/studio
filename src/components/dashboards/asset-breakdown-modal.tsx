'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Asset, AssetCategory, FamilyMember } from '@/lib/types';
import { X, User as UserIcon } from 'lucide-react';

interface AssetBreakdownModalProps {
  category: AssetCategory;
  assets: Asset[];
  familyMembers: FamilyMember[];
  onClose: () => void;
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function AssetBreakdownModal({
  category,
  assets,
  familyMembers,
  onClose,
}: AssetBreakdownModalProps) {
  const breakdown = useMemo(() => {
    const categoryAssets = assets.filter(asset => asset.category === category);
    
    const memberData = new Map<string, { count: number; totalValue: number }>();

    categoryAssets.forEach(asset => {
      const current = memberData.get(asset.ownerMemberId) || { count: 0, totalValue: 0 };
      current.count += 1;
      current.totalValue += asset.value;
      memberData.set(asset.ownerMemberId, current);
    });

    const tableData = Array.from(memberData.entries()).map(([memberId, data]) => {
      const member = familyMembers.find(fm => fm.id === memberId);
      return {
        memberId,
        memberName: member?.name || 'Unknown Member',
        ...data,
      };
    });

    const totals = {
      count: tableData.reduce((sum, item) => sum + item.count, 0),
      value: tableData.reduce((sum, item) => sum + item.totalValue, 0),
    };

    return { tableData, totals };
  }, [category, assets, familyMembers]);


  return (
    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4 relative">
       <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
            <X className="h-4 w-4" />
        </Button>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {category} – Family Breakdown
        </h2>
        <p className="text-sm text-muted-foreground">
          Distribution of {category} assets across family members.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family Member</TableHead>
                <TableHead className="text-right">Number of Assets</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.tableData.map(item => (
                <TableRow key={item.memberId}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.memberName}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{breakdown.totals.count} assets</TableCell>
                <TableCell className="text-right font-bold">{formatter.format(breakdown.totals.value)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-6">
         <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
