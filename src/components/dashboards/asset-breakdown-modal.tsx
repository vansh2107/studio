
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
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

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

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function ModalDialog({ isOpen, onClose, children }: ModalDialogProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(16px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose} // Close when clicking on the overlay
        >
          <motion.div
            className="relative w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={e => e.stopPropagation()} // Prevent click from closing modal
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface AssetBreakdownModalProps {
  category: AssetCategory;
  assets: DashboardAsset[];
  familyMembers: (FamilyMember | Client)[];
  documents: Document[];
  isOpen: boolean; // Add isOpen prop
  onClose: () => void;
}

export function AssetBreakdownModal({
  category,
  assets,
  familyMembers,
  onClose,
  isOpen
}: AssetBreakdownModalProps) {
  const router = useRouter();

  const categoryAssets = useMemo(() => {
    return assets.filter(asset => asset.category === category);
  }, [category, assets]);

  const totalAssetCount = categoryAssets.length;

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

      if (asset.category === 'General Insurance') {
        current.totalPremium = (current.totalPremium || 0) + asset.value;
      } else if (asset.premiumAmount) {
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

  const renderContent = () => {
    const totalValue = categoryAssets.reduce((sum, asset) => sum + (asset.premiumAmount || asset.value), 0);

    switch (category) {
      case 'Stocks':
        const totalDPCount = memberData.reduce((sum, item) => sum + (item.dpCount || 0), 0);
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead className="text-right">DP Count</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/stocks/${item.memberId}`)}>
                  <TableCell>{item.memberName}</TableCell>
                  <TableCell className="text-right">{item.dpCount || 0}</TableCell>
                  <TableCell className="text-right">
                    {formatter.format(item.totalValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{totalDPCount}</TableCell>
                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        );
      case 'PPF':
        const totalPPFCount = memberData.reduce((sum, item) => sum + (item.ppfCount || 0), 0);
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holder Name</TableHead>
                <TableHead className="text-right">PPF Count</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {memberData.map(item => (
                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/ppf/${item.memberId}`)}>

                  <TableCell>{item.memberName}</TableCell>

                  <TableCell className="text-right">{item.ppfCount || 0}</TableCell>

                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>

                </TableRow>

              ))}

            </TableBody>

            <TableFooter>

                <TableRow>

                    <TableCell className="font-bold">Total</TableCell>

                    <TableCell className="text-right font-bold">{totalPPFCount}</TableCell>

                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>

                </TableRow>

            </TableFooter>

          </Table>

        );

      case 'Mutual Funds':

         const totalFolioCount = memberData.reduce((sum, item) => sum + (item.folioCount || 0), 0);

         return (

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Holder Name</TableHead>

                <TableHead className="text-right">Folio Count</TableHead>

                <TableHead className="text-right">Total Value</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

               {memberData.map(item => (

                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/mutual-funds/${item.memberId}`)}>

                  <TableCell>{item.memberName}</TableCell>

                  <TableCell className="text-right">{item.folioCount || 0}</TableCell>

                  <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>

                </TableRow>

              ))}

            </TableBody>

            <TableFooter>

                <TableRow>

                    <TableCell className="font-bold">Total</TableCell>

                    <TableCell className="text-right font-bold">{totalFolioCount}</TableCell>

                    <TableCell className="text-right font-bold">{formatter.format(totalValue)}</TableCell>

                </TableRow>

            </TableFooter>

          </Table>

        );

      case 'Life Insurance':

        const lifeInsuranceTotals = {

            totalPremium: categoryAssets.reduce((sum, asset) => sum + (asset.premiumAmount || 0), 0),

            totalSumAssured: categoryAssets.reduce((sum, asset) => sum + (asset.sumAssured || 0), 0),

        };

        const totalLIPolicyCount = memberData.reduce((sum, item) => sum + (item.policyCount || 0), 0);

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

                    <TableCell className="font-bold">Total</TableCell>

                    <TableCell className="text-right font-bold">{totalLIPolicyCount}</TableCell>

                    <TableCell className="text-right font-bold">{formatter.format(lifeInsuranceTotals.totalPremium)}</TableCell>

                    <TableCell className="text-right font-bold">{formatter.format(lifeInsuranceTotals.totalSumAssured)}</TableCell>

                </TableRow>

            </TableFooter>

          </Table>

        );

       case 'General Insurance':
        const generalInsuranceTotals = {
            totalPremium: categoryAssets.reduce((sum, asset) => sum + asset.value, 0),
            totalSumAssured: categoryAssets.reduce((sum, asset) => sum + (asset.sumAssured || 0), 0),
        };

        const totalGIPolicyCount = memberData.reduce((sum, item) => sum + (item.policyCount || 0), 0);

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

                <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/general-insurance/${item.memberId}`)}>

                  <TableCell>{item.memberName}</TableCell>

                  <TableCell className="text-right">{item.policyCount || 0}</TableCell>

                  <TableCell className="text-right">{formatter.format(item.totalPremium || 0)}</TableCell>

                  <TableCell className="text-right">{formatter.format(item.totalSumAssured || 0)}</TableCell>

                </TableRow>

              ))}

            </TableBody>

            <TableFooter>

                <TableRow>

                    <TableCell className="font-bold">Total</TableCell>

                    <TableCell className="text-right font-bold">{totalGIPolicyCount}</TableCell>

                    <TableCell className="text-right font-bold">{formatter.format(generalInsuranceTotals.totalPremium)}</TableCell>

                    <TableCell className="text-right font-bold">{formatter.format(generalInsuranceTotals.totalSumAssured)}</TableCell>

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

         const totalBondsCount = memberData.reduce((sum, item) => sum + (item.bondsCount || 0), 0);

         return (

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Holder Name</TableHead>

                <TableHead className="text-right">Bonds Count</TableHead>

                <TableHead className="text-right">Total Value</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

               {memberData.map(item => {

                return (

                  <TableRow key={item.memberId} className="cursor-pointer" onClick={() => router.push(`/assets/bonds/${item.memberId}`)}>

                    <TableCell>{item.memberName}</TableCell>

                    <TableCell className="text-right">{item.bondsCount || 0}</TableCell>

                    <TableCell className="text-right">{formatter.format(item.totalValue)}</TableCell>

                  </TableRow>

                );

              })}

            </TableBody>

            <TableFooter>

                <TableRow>

                    <TableCell className="font-bold">Total</TableCell>

                    <TableCell className="text-right font-bold">{totalBondsCount}</TableCell>

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

    <ModalDialog isOpen={isOpen} onClose={onClose}>

      <TooltipProvider>

        <div className="flex items-center justify-between p-6 pb-4 border-b">

          <div className="text-2xl font-bold">{category} – Family Breakdown</div>

          <Button variant="ghost" size="icon" onClick={onClose}>

            <X className="h-5 w-5" />

          </Button>

        </div>



        <div className="flex-grow overflow-y-auto p-6">

          <Card>

              <CardContent className="p-0">

              {renderContent()}

              </CardContent>

          </Card>

        </div>



        <div className="p-6 pt-4 border-t flex justify-end">

           <Button variant="outline" onClick={onClose}>Close</Button>

        </div>

      </TooltipProvider>

    </ModalDialog>

  );

}
