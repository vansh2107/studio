
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DashboardAsset, AssetCategory, FamilyMember, Document, Client } from '@/lib/types';
import { X, User as UserIcon } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
  familyMembers: (FamilyMember | Client)[];
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
      dpCount?: number;
      ppfCount?: number;
      folioCount?: number;
      policyCount?: number;
      fdCount?: number;
      bondsCount?: number;
    }>();

    categoryAssets.forEach(asset => {
      const current = data.get(asset.ownerMemberId) || {
        assets: [],
        totalValue: 0,
        totalPremium: 0,
        totalSumAssured: 0,
        dpCount: 0,
        ppfCount: 0,
        folioCount: 0,
        policyCount: 0,
        fdCount: 0,
        bondsCount: 0,
      };
      current.assets.push(asset);
      current.totalValue += asset.value;
      if (asset.premiumAmount) {
        current.totalPremium = (current.totalPremium || 0) + asset.premiumAmount;
      }
      if (asset.sumAssured) {
        current.totalSumAssured = (current.totalSumAssured || 0) + asset.sumAssured;
      }
      switch (category) {
        case 'Fixed Deposits':
          current.fdCount = (current.fdCount || 0) + 1;
          break;
        case 'Stocks':
          current.dpCount = (current.dpCount || 0) + 1; // Assuming each asset corresponds to one DP for now
          break;
        case 'PPF':
          current.ppfCount = (current.ppfCount || 0) + 1; // Assuming each asset corresponds to one PPF for now
          break;
        case 'Mutual Funds':
          current.folioCount = (current.folioCount || 0) + 1; // Assuming each asset corresponds to one folio for now
          break;
        case 'Life Insurance':
        case 'General Insurance':
          current.policyCount = (current.policyCount || 0) + 1; // Assuming each asset corresponds to one policy for now
          break;
        case 'Bonds':
          current.bondsCount = (current.bondsCount || 0) + 1; // Assuming each asset corresponds to one bond for now
          break;
      }
      data.set(asset.ownerMemberId, current);
    });

    return Array.from(data.entries()).map(([memberId, data]) => {
      const member = familyMembers.find(fm => fm.id === memberId);
      return {
        memberId,
        memberName: member?.name || 'Unassigned',
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
    const totalValue = categoryAssets.reduce((sum, asset) => sum + (asset.premiumAmount || asset.value), 0);

    switch (category) {
      case 'Stocks':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>DP Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/stocks/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell>{item.dpCount || 0}</TableCell>
                  <TableCell className="text-right">
                    {formatter.format(item.totalValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      case 'PPF':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>PPF Count</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/ppf/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell>{item.ppfCount || 0}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      case 'Mutual Funds':
         return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>Folio Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/mutual-funds/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell>{item.folioCount || 0}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      case 'Life Insurance':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead className="text-right">Policy Count</TableHead>
                <TableHead className="text-right">Premium Amount</TableHead>
                <TableHead className="text-right">Sum Assured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/life-insurance/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell className="text-right">
                        {item.assets.length}
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
                <TableHead>Policy Count</TableHead>
                <TableHead className="text-right">Premium Amount</TableHead>
                <TableHead className="text-right">Sum Assured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/general-insurance/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell>{item.policyCount || 0}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalPremium || 0)}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalSumAssured || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(lifeInsuranceTotals?.totalPremium || 0)}</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(lifeInsuranceTotals?.totalSumAssured || 0)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      case 'Fixed Deposits':
        const totalFDs = memberData.reduce((sum, item) => sum + (item.fdCount || 0), 0);
        const totalFDValue = memberData.reduce((sum, item) => sum + item.totalValue, 0);
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
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/fixed-deposits/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell className="text-right">{item.fdCount || 0}</TableCell>
                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
             <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{totalFDs}</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(totalFDValue)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      case 'Bonds':
         return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead>Bonds Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {memberData.map(item => {
                return (
                  <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/bonds/${item.memberId}`)}>
                    <TableCell>{item.memberName}</TableCell>
                    <TableCell>{item.bondsCount || 0}</TableCell>
                    <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={2} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      default:
        return <p>No specific view for this category yet.</p>;
    }
  };

  return (
    <TooltipProvider>
      <DialogHeader className="p-6 pb-4 text-center sm:text-left">
        <DialogTitle>{category} – Family Breakdown</DialogTitle>
        <DialogDescription>
          Distribution of {category} assets across family members.
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex-grow overflow-y-auto px-6">
        <Card>
            <CardContent className="p-0">
            {renderContent()}
            </CardContent>
        </Card>
      </div>
      
      <DialogFooter className="p-6 pt-4 border-t">
         <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </TooltipProvider>
  );
}
