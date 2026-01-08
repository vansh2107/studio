
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddAssetModal } from '@/components/customers/add-asset-modal';
import { PlusCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { getAllClients } from '@/lib/mock-data';
import type { Asset } from '@/lib/types';
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

export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const familyHeads = getAllClients();
  const { toast } = useToast();

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

  const handleSaveAsset = (asset: Asset) => {
    if (editingAsset) {
      setAssets(prev => prev.map(a => (a.id === asset.id ? asset : a)));
      toast({ title: 'Success', description: 'Asset has been updated.' });
    } else {
      setAssets(prev => [...prev, asset]);
      toast({ title: 'Success', description: 'Asset has been created.' });
    }
    closeModal();
  };
  
  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };
  
  const handleView = (asset: Asset) => {
    setViewingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!deletingAsset) return;
    setAssets(prev => prev.filter(a => a.id !== deletingAsset.id));
    toast({ title: 'Success', description: 'Asset has been deleted.', variant: 'destructive' });
    setDeletingAsset(null);
  };

  const openModal = () => {
    setEditingAsset(null);
    setViewingAsset(null);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    setViewingAsset(null);
  }


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
          <Button onClick={openModal}>
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
                         <Button variant="ghost" size="icon" onClick={() => handleView(asset)}><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}><Edit className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingAsset(asset)}><Trash2 className="h-4 w-4" /></Button>
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
          onClose={closeModal}
          familyHeads={familyHeads}
          onSave={handleSaveAsset}
          assetToEdit={editingAsset || viewingAsset}
          isViewMode={!!viewingAsset}
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
    </>
  );
}
