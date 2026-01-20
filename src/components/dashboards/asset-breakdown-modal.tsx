
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DashboardAsset, AssetCategory, FamilyMember, Document } from '@/lib/types';
import { X, User as UserIcon } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

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
  onClose,
}: AssetBreakdownModalProps) {
  const router = useRouter();

  const categoryAssets = useMemo(() => {
    return assets.filter(asset => asset.category === category);
  }, [category, assets]);

  const memberData = useMemo(() => {
    const data = new Map<string, {
      assets: DashboardAsset[];
      totalValue: number;
      totalPremium?: number;
      totalSumAssured?: number;
      fdCount?: number;
    }>();

    categoryAssets.forEach(asset => {
      const current = data.get(asset.ownerMemberId) || { assets: [], totalValue: 0, totalPremium: 0, totalSumAssured: 0, fdCount: 0 };
      current.assets.push(asset);
      current.totalValue += asset.value;
      if (asset.premiumAmount) {
        current.totalPremium = (current.totalPremium || 0) + asset.premiumAmount;
      }
      if (asset.sumAssured) {
        current.totalSumAssured = (current.totalSumAssured || 0) + asset.sumAssured;
      }
      if (category === 'Fixed Deposits') {
        current.fdCount = (current.fdCount || 0) + 1;
      }
      data.set(asset.ownerMemberId, current);
    });

    return Array.from(data.entries()).map(([memberId, data]) => {
      const member = familyMembers.find(fm => fm.id === memberId);
      return {
        memberId,
        memberName: member?.name || 'Unknown Member',
        ...data,
      };
    });
  }, [categoryAssets, familyMembers, category]);
  
  const lifeInsuranceTotals = useMemo(() => {
    if (category !== 'Life Insurance') return null;
    return {
      totalPremium: categoryAssets.reduce((sum, asset) => sum + (asset.premiumAmount || 0), 0),
      totalSumAssured: categoryAssets.reduce((sum, asset) => sum + (asset.sumAssured || 0), 0),
    };
  }, [category, categoryAssets]);

  const renderContent = () => {
    switch (category) {
      case 'Stocks':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>DP Name</TableHead>
                <TableHead>DP ID</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryAssets.map(asset => {
                const member = familyMembers.find(fm => fm.id === asset.ownerMemberId);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{member?.name || 'Unknown'}</TableCell>
                    <TableCell>{asset.dpName || 'N/A'}</TableCell>
                    <TableCell>{asset.dpId || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/assets/stocks/${asset.ownerMemberId}`} target="_blank" className="text-primary hover:underline">
                        {formatter.format(asset.value)}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case 'PPF':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Opening Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {categoryAssets.map(asset => {
                const member = familyMembers.find(fm => fm.id === asset.ownerMemberId);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{member?.name || 'Unknown'}</TableCell>
                    <TableCell>{asset.bankName || 'N/A'}</TableCell>
                    <TableCell>{formatDate(asset.accountOpeningDate)}</TableCell>
                    <TableCell className="text-right">{formatter.format(asset.value)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case 'Mutual Funds':
         return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>Folio Number</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {categoryAssets.map(asset => {
                const member = familyMembers.find(fm => fm.id === asset.ownerMemberId);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{member?.name || 'Unknown'}</TableCell>
                    <TableCell>{asset.folioNumber || 'N/A'}</TableCell>
                    <TableCell className="text-right">{formatter.format(asset.value)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case 'Life Insurance':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead className="text-right">Number of Assets</TableHead>
                <TableHead className="text-right">Premium Amount</TableHead>
                <TableHead className="text-right">Sum Assured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberData.map(item => (
                <TableRow key={item.memberId}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell className="text-right">
                     <Link href={`/assets/life-insurance/${item.memberId}`} target="_blank" className="text-primary hover:underline">
                        {item.assets.length}
                     </Link>
                  </TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalPremium || 0)}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalSumAssured || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(lifeInsuranceTotals?.totalPremium || 0)}</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(lifeInsuranceTotals?.totalSumAssured || 0)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
       case 'General Insurance':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>Policy Name</TableHead>
                <TableHead>Type of Policy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {categoryAssets.map(asset => {
                const member = familyMembers.find(fm => fm.id === asset.ownerMemberId);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{member?.name || 'Unknown'}</TableCell>
                    <TableCell>{asset.policyName || 'N/A'}</TableCell>
                    <TableCell>{asset.policyType || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case 'Fixed Deposits':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead className="text-right">Number of FDs</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberData.map(item => (
                <TableRow key={item.memberId}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell className="text-right">{item.fdCount || 0}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case 'Bonds':
         return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>Issuer Name</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {categoryAssets.map(asset => {
                const member = familyMembers.find(fm => fm.id === asset.ownerMemberId);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>{member?.name || 'Unknown'}</TableCell>
                    <TableCell>{asset.issuerName || 'N/A'}</TableCell>
                    <TableCell className="text-right">{formatter.format(asset.value)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      default:
        return <p>No specific view for this category yet.</p>;
    }
  };

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
              {renderContent()}
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-6">
             <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </TooltipProvider>
    </div>
  );
}
