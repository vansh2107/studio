

'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddAssetModal } from '@/components/customers/add-asset-modal';
import { PlusCircle, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { getAllClients, getClientsForAssociate, getAssociatesForRM, getRMsForAdmin } from '@/lib/mock-data';
import { useAssets, type Asset } from '@/hooks/use-assets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrentUser } from '@/hooks/use-current-user';

const ExpandedAssetDetails = ({ asset, onEdit }: { asset: Asset; onEdit: (asset: Asset) => void }) => {
  const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="text-sm text-foreground">{children || '—'}</div>
    </div>
  );
  
  const Section = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-primary">{title}</h4>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {children}
      </div>
    </div>
  );

  const formatCurrency = (amount?: string | number) => {
    if (amount === undefined || amount === null || amount === '') return '—';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numAmount);
  };
  
  const details: any =
    asset.assetType === 'STOCKS' ? asset.stocks :
    asset.assetType === 'FIXED DEPOSITS' ? asset.fixedDeposits :
    asset.assetType === 'BONDS' ? asset.bonds :
    asset.assetType === 'PPF' ? asset.ppf :
    asset.assetType === 'MUTUAL FUNDS' ? asset.mutualFunds :
    asset.assetType === 'LIFE INSURANCE' ? asset.lifeInsurance :
    asset.assetType === 'GENERAL INSURANCE' ? asset.generalInsurance :
    asset.assetType === 'PHYSICAL TO DEMAT' ? asset.physicalToDemat :
    null;

  const hasAssetSpecificDetails = (details !== null) || (asset.assetType === 'STOCKS' && asset.stocks);

  return (
    <div className="bg-muted/30 p-6 relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="absolute top-4 right-4 bg-background"
        onClick={() => onEdit(asset)}
      >
        <Edit className="mr-2 h-4 w-4" />
        Edit Asset
      </Button>
      
      <Section title="Asset Information">
        <DetailItem label="Asset Type">{asset.assetType}</DetailItem>
        <DetailItem label="Family Head">{asset.familyHeadName}</DetailItem>
      </Section>

      <div className="my-6 border-t border-gray-200" />

      {asset.assetType === 'STOCKS' && asset.stocks && (
        <Section title="Stocks Details">
          <DetailItem label="Holder Name">{asset.stocks.holderName}</DetailItem>
          <DetailItem label="DPID">{asset.stocks.dpId}</DetailItem>
          <DetailItem label="DP Name">{asset.stocks.dpName}</DetailItem>
          <DetailItem label="Bank Name">{asset.stocks.bankName}</DetailItem>
          <DetailItem label="Bank Account">{asset.stocks.bankAccountNumber}</DetailItem>
          <DetailItem label="Mobile">{asset.stocks.mobileNumber}</DetailItem>
          <DetailItem label="Email">{asset.stocks.emailAddress}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'FIXED DEPOSITS' && asset.fixedDeposits && (
        <Section title="Fixed Deposit Details">
          <DetailItem label="Holder Name">{asset.fixedDeposits.holderName}</DetailItem>
          <DetailItem label="Bank/Company">{asset.fixedDeposits.companyName}</DetailItem>
          <DetailItem label="FD Name">{asset.fixedDeposits.fdName}</DetailItem>
          <DetailItem label="FD Number">{asset.fixedDeposits.fdNumber}</DetailItem>
          <DetailItem label="Deposited Amount">{formatCurrency(asset.fixedDeposits.depositedAmount)}</DetailItem>
          <DetailItem label="Maturity Amount">{formatCurrency(asset.fixedDeposits.maturityAmount)}</DetailItem>
          <DetailItem label="Period">{asset.fixedDeposits.periodMonth}m {asset.fixedDeposits.periodDays}d</DetailItem>
          <DetailItem label="Interest Rate">{asset.fixedDeposits.interestRate}%</DetailItem>
          <DetailItem label="Purchase Date">{asset.fixedDeposits.purchaseDate}</DetailItem>
          <DetailItem label="Maturity Date">{asset.fixedDeposits.maturityDate}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'BONDS' && asset.bonds && (
        <Section title="Bonds Details">
          <DetailItem label="Holder Name">{asset.bonds.holderName}</DetailItem>
          <DetailItem label="Issuer">{asset.bonds.issuer}</DetailItem>
          <DetailItem label="ISIN">{asset.bonds.isin}</DetailItem>
          <DetailItem label="Bond Price">{formatCurrency(asset.bonds.bondPrice)}</DetailItem>
          <DetailItem label="Bond Units">{asset.bonds.bondUnit}</DetailItem>
          <DetailItem label="Bond Amount">{formatCurrency(asset.bonds.bondAmount)}</DetailItem>
          <DetailItem label="Purchase Date">{asset.bonds.purchaseDate}</DetailItem>
          <DetailItem label="Maturity Date">{asset.bonds.maturityDate}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'PPF' && asset.ppf && (
        <Section title="PPF Details">
          <DetailItem label="Holder Name">{asset.ppf.holderName}</DetailItem>
          <DetailItem label="Bank Name">{asset.ppf.bankName}</DetailItem>
          <DetailItem label="Account Number">{asset.ppf.bankAccountNumber}</DetailItem>
          <DetailItem label="Contributed Amount">{formatCurrency(asset.ppf.contributedAmount)}</DetailItem>
          <DetailItem label="Balance">{formatCurrency(asset.ppf.balance)}</DetailItem>
          <DetailItem label="Opening Date">{asset.ppf.openingDate}</DetailItem>
          <DetailItem label="Mature Date">{asset.ppf.matureDate}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'MUTUAL FUNDS' && asset.mutualFunds && (
        <Section title="Mutual Funds Details">
          <DetailItem label="Holder Name">{asset.mutualFunds.holderName}</DetailItem>
          <DetailItem label="Folio Number">{asset.mutualFunds.folioNumber}</DetailItem>
          <DetailItem label="AMC">{asset.mutualFunds.amc}</DetailItem>
          <DetailItem label="Scheme Name">{asset.mutualFunds.schemeName}</DetailItem>
          <DetailItem label="Invested Amount">{formatCurrency(asset.mutualFunds.investedAmount)}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'LIFE INSURANCE' && asset.lifeInsurance && (
        <Section title="Life Insurance Details">
          <DetailItem label="Holder Name">{asset.lifeInsurance.holderName}</DetailItem>
          <DetailItem label="Company">{asset.lifeInsurance.company}</DetailItem>
          <DetailItem label="Policy Number">{asset.lifeInsurance.policyNumber}</DetailItem>
          <DetailItem label="Plan Name">{asset.lifeInsurance.planName}</DetailItem>
          <DetailItem label="Sum Assured">{formatCurrency(asset.lifeInsurance.sumAssured)}</DetailItem>
          <DetailItem label="Premium Amount">{formatCurrency(asset.lifeInsurance.premiumAmount)}</DetailItem>
          <DetailItem label="Policy Start Date">{asset.lifeInsurance.policyStartDate}</DetailItem>
          <DetailItem label="Policy End Date">{asset.lifeInsurance.policyEndDate}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'GENERAL INSURANCE' && asset.generalInsurance && (
        <Section title="General Insurance Details">
          <DetailItem label="Holder Name">{asset.generalInsurance.holderName}</DetailItem>
          <DetailItem label="Category">{asset.generalInsurance.category}</DetailItem>
          <DetailItem label="Issuer">{asset.generalInsurance.issuer}</DetailItem>
          <DetailItem label="Plan Name">{asset.generalInsurance.planName}</DetailItem>
          <DetailItem label="Policy Number">{asset.generalInsurance.policyNumber}</DetailItem>
          <DetailItem label="Sum Assured">{formatCurrency(asset.generalInsurance.sumAssured)}</DetailItem>
          <DetailItem label="Policy Start Date">{asset.generalInsurance.policyStartDate}</DetailItem>
          <DetailItem label="Policy End Date">{asset.generalInsurance.policyEndDate}</DetailItem>
        </Section>
      )}

      {asset.assetType === 'PHYSICAL TO DEMAT' && asset.physicalToDemat && (
        <Section title="Physical to Demat Details">
          <DetailItem label="Holder Name">{asset.physicalToDemat.holderName}</DetailItem>
          <DetailItem label="Company Name">{asset.physicalToDemat.companyName}</DetailItem>
          <DetailItem label="Folio Number">{asset.physicalToDemat.folioNumber}</DetailItem>
          <DetailItem label="Quantity">{asset.physicalToDemat.quantity}</DetailItem>
          <DetailItem label="Market Price">{formatCurrency(asset.physicalToDemat.marketPrice)}</DetailItem>
          <DetailItem label="Total Value">{formatCurrency(asset.physicalToDemat.totalValue)}</DetailItem>
        </Section>
      )}

      {hasAssetSpecificDetails && <div className="my-6 border-t border-gray-200" />}

      {details && (details.jointHolders?.length > 0 || details.nominees?.length > 0) && (
        <>
            <div className="mt-6">
                <h4 className="text-md font-semibold text-primary mb-4">Ownership Details</h4>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joint Holders</p>
                        {details.jointHolders?.length > 0 ? (
                            <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                                {details.jointHolders.map((holder: { name: string }, index: number) => (
                                    <li key={index}>{holder.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">—</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nominees</p>
                        {details.nominees?.length > 0 ? (
                             <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                                {details.nominees.map((nominee: { name: string; allocation?: number }, index: number) => (
                                    <li key={index}>
                                        {nominee.name}
                                        {nominee.allocation != null ? ` (${nominee.allocation}%)` : ''}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">—</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="my-6 border-t border-gray-200" />
        </>
      )}
    </div>
  );
};

export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { assets, addAsset, updateAsset, deleteAsset } = useAssets();
  const { effectiveUser, hasPermission } = useCurrentUser();
  const { toast } = useToast();

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const canCreate = hasPermission('ASSETS', 'create');

  const familyHeads = useMemo(() => {
    if (!effectiveUser) return [];
    
    switch(effectiveUser.role) {
      case 'SUPER_ADMIN':
        return getAllClients();
      case 'ADMIN': {
        const rms = getRMsForAdmin(effectiveUser.id);
        const associates = rms.flatMap(rm => getAssociatesForRM(rm.id));
        return associates.flatMap(assoc => getClientsForAssociate(assoc.id));
      }
      case 'RM': {
        const associates = getAssociatesForRM(effectiveUser.id);
        return associates.flatMap(assoc => getClientsForAssociate(assoc.id));
      }
      case 'ASSOCIATE':
        return getClientsForAssociate(effectiveUser.id);
      case 'CUSTOMER':
        return getAllClients().filter(c => c.id === effectiveUser.id);
      default:
        return [];
    }
  }, [effectiveUser]);

  const filteredAssets = useMemo(() => {
    if (!effectiveUser) return [];
    
    const scopedClientIds = new Set(familyHeads.map(c => c.id));
    return assets.filter(asset => scopedClientIds.has(asset.familyHeadId));
  }, [assets, familyHeads, effectiveUser]);

  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset) {
      updateAsset(asset);
      toast({ title: 'Success', description: 'Asset has been updated.' });
    } else {
      addAsset(asset);
      toast({ title: 'Success', description: 'Asset has been created.' });
    }
    closeModal();
  };
  
  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!deletingAsset) return;
    deleteAsset(deletingAsset.id);
    toast({ title: 'Success', description: 'Asset has been deleted.', variant: 'destructive' });
    setDeletingAsset(null);
  };

  const openModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
  }

  const toggleExpandRow = (assetId: string) => {
    setExpandedRow(current => (current === assetId ? null : assetId));
  };


  const getAssetName = (asset: Asset) => {
    switch (asset.assetType) {
      case 'GENERAL INSURANCE':
        return asset.generalInsurance?.planName || 'N/A';
      case 'PHYSICAL TO DEMAT':
        return asset.physicalToDemat?.companyName || 'N/A';
      case 'BONDS':
        return asset.bonds?.issuer || 'N/A';
      case 'FIXED DEPOSITS':
        return asset.fixedDeposits?.fdName || 'N/A';
      case 'PPF':
        return asset.ppf?.bankName || 'N/A';
      case 'STOCKS':
        return asset.stocks?.dpName || 'N/A';
      case 'MUTUAL FUNDS':
        return asset.mutualFunds?.schemeName || 'N/A';
      case 'LIFE INSURANCE':
        return asset.lifeInsurance?.policyNumber || 'N/A';
      default:
        return 'N/A';
    }
  }

  const getAssetAmount = (asset: Asset) => {
    const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    switch (asset.assetType) {
      case 'GENERAL INSURANCE':
        return formatter.format(Number(asset.generalInsurance?.sumAssured || 0));
      case 'PHYSICAL TO DEMAT':
        return formatter.format(Number(asset.physicalToDemat?.totalValue || 0));
      case 'BONDS':
        return formatter.format(Number(asset.bonds?.bondAmount || 0));
      case 'FIXED DEPOSITS':
        return formatter.format(Number(asset.fixedDeposits?.depositedAmount || 0));
      case 'PPF':
        return formatter.format(Number(asset.ppf?.balance || 0));
      case 'MUTUAL FUNDS':
        return formatter.format(Number(asset.mutualFunds?.investedAmount || 0));
      case 'LIFE INSURANCE':
        return formatter.format(Number(asset.lifeInsurance?.sumAssured || 0));
      default:
        return '—';
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Asset Management</h1>
          {canCreate && (
            <Button onClick={openModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Assets</CardTitle>
            <CardDescription>A list of all assets created for clients.</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAssets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Asset Type</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const isExpanded = expandedRow === asset.id;
                    
                    return (
                      <React.Fragment key={asset.id}>
                        <TableRow className={cn(isExpanded && 'bg-muted/50')}>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => toggleExpandRow(asset.id)}>
                              <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{asset.familyHeadName}</TableCell>
                          <TableCell>{asset.assetType}</TableCell>
                          <TableCell>{getAssetName(asset)}</TableCell>
                          <TableCell>{getAssetAmount(asset)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit Asset</p></TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingAsset(asset)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Delete Asset</p></TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={6}>
                              <ExpandedAssetDetails asset={asset} onEdit={handleEdit} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No assets created yet.</p>
                {canCreate && <p className="text-sm">Click "Add Asset" to get started.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <AddAssetModal
          isOpen={isModalOpen}
          onClose={closeModal}
          familyHeads={familyHeads}
          onSave={handleSaveAsset}
          assetToEdit={editingAsset}
        />
      )}
      
      <AlertDialog open={!!deletingAsset} onOpenChange={(open) => !open && setDeletingAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the asset. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
