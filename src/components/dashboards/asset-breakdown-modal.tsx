
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DashboardAsset, AssetCategory, FamilyMember, Document } from '@/lib/types';
import { X, User as UserIcon, FileText } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

interface AssetBreakdownModalProps {
  category: AssetCategory;
  assets: DashboardAsset[];
  familyMembers: FamilyMember[];
  documents: Document[];
  onClose: () => void;
}

export function AssetBreakdownModal({
  category,
  assets,
  familyMembers,
  documents,
  onClose,
}: AssetBreakdownModalProps) {
  const router = useRouter();

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
      const memberDocs = documents.filter(doc => doc.memberId === memberId && doc.category === category);
      
      return {
        memberId,
        memberName: member?.name || 'Unknown Member',
        clientId: member?.clientId,
        ...data,
        docs: memberDocs,
        docCount: memberDocs.length,
      };
    });

    const totals = {
      count: tableData.reduce((sum, item) => sum + item.count, 0),
      value: tableData.reduce((sum, item) => sum + item.totalValue, 0),
    };

    return { tableData, totals };
  }, [category, assets, familyMembers, documents]);

  return (
    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4 relative">
       <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 close-icon z-10">
            <X className="h-4 w-4" />
        </Button>
      
        <TooltipProvider>
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
                    <TableHead className="text-center">Documents</TableHead>
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
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={item.docCount === 0}
                              onClick={() => {
                                if (item.docCount > 0 && item.clientId) {
                                  router.push(`/documents/${item.memberId}?clientId=${item.clientId}`);
                                }
                              }}
                              className="h-8 w-8"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.docCount > 0 ? `View ${item.docCount} document(s)` : 'No documents available'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
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
        </TooltipProvider>
    </div>
  );
}

