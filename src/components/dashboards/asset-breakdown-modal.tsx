
'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DashboardAsset, AssetCategory, FamilyMember, Document } from '@/lib/types';
import { X, User as UserIcon, FileText, ArrowLeft } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// This will be the view that shows the document list for a member
function DocumentDetailView({ memberData, category, onBack }: { memberData: any; category: AssetCategory; onBack: () => void; }) {
  return (
    <div>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
        <div className='flex items-center gap-2'>
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Documents for {memberData.memberName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Category: {category}
            </p>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberData.docs.length > 0 ? (
                memberData.docs.map((doc: Document) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={1} className="h-24 text-center">
                    No documents available for this member in this category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// This will be the main view with the asset breakdown table
function AssetBreakdownView({
  category,
  assets,
  familyMembers,
  documents,
  onViewDocs,
}: {
  category: AssetCategory;
  assets: DashboardAsset[];
  familyMembers: FamilyMember[];
  documents: Document[];
  onViewDocs: (memberData: any) => void;
}) {
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
                          onClick={() => onViewDocs(item)}
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
         <Button variant="outline" onClick={onViewDocs.bind(null, null)}>Close</Button>
      </div>
    </TooltipProvider>
  );
}

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
  const [viewingMemberDocs, setViewingMemberDocs] = useState<any | null>(null);

  const handleClose = () => {
    setViewingMemberDocs(null);
    onClose();
  };

  const handleBack = () => {
    setViewingMemberDocs(null);
  };
  
  return (
    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4 relative">
       <Button variant="ghost" size="icon" onClick={handleClose} className="absolute top-0 right-0 close-icon z-10">
            <X className="h-4 w-4" />
        </Button>
      
      {viewingMemberDocs ? (
        <DocumentDetailView 
          memberData={viewingMemberDocs} 
          category={category}
          onBack={handleBack} 
        />
      ) : (
        <AssetBreakdownView 
          category={category}
          assets={assets}
          familyMembers={familyMembers}
          documents={documents}
          onViewDocs={setViewingMemberDocs}
        />
      )}
    </div>
  );
}
