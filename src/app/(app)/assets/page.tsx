
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddAssetModal } from '@/components/customers/add-asset-modal';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { getAllClients } from '@/lib/mock-data';
import type { Client, Asset } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const familyHeads = getAllClients();

  const handleSaveAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
    setIsModalOpen(false);
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
      default:
        return '—';
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Asset Management</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Assets</CardTitle>
            <CardDescription>A list of all assets created for clients.</CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Asset Type</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.familyHeadName}</TableCell>
                      <TableCell>{asset.assetType}</TableCell>
                      <TableCell>{getAssetName(asset)}</TableCell>
                      <TableCell>{getAssetAmount(asset)}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No assets created yet.</p>
                <p className="text-sm">Click "Add Asset" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <AddAssetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          familyHeads={familyHeads}
          onSave={handleSaveAsset}
        />
      )}
    </>
  );
}
