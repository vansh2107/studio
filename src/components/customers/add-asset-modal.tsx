
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Upload } from 'lucide-react';
import { Client, FamilyMember, Asset } from '@/lib/types';
import { familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import { ASSET_TYPES } from '@/lib/asset-form-types';
import { GeneralInsuranceFields } from './asset-forms/general-insurance-fields';
import { PhysicalToDematFields } from './asset-forms/physical-to-demat-fields';
import { BondFields } from './asset-forms/bond-fields';
import { FDFields } from './asset-forms/fd-fields';
import { PPFFields } from './asset-forms/ppf-fields';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UploadDocModal } from '../doc-vault/upload-doc-modal';

const baseAssetSchema = z.object({
  familyHead: z.string().min(1, 'Family head is required'),
  assetType: z.string().min(1, 'Asset type is required'),
});

// Schemas for each asset type (simplified for brevity)
const generalInsuranceSchema = z.object({
  gi_familyMember: z.string().optional(),
  gi_category: z.string().optional(),
  gi_issuer: z.string().optional(),
  gi_planName: z.string().optional(),
  gi_policyNumber: z.string().optional(),
  gi_policyType: z.string().optional(),
  gi_policyStartDate: z.string().optional(),
  gi_policyIssueDate: z.string().optional(),
  gi_policyEndDate: z.string().optional(),
  gi_vehicleRegNumber: z.string().optional(),
  gi_sumAssured: z.string().optional(),
  gi_priceWithoutGST: z.string().optional(),
  gi_priceWithGST: z.string().optional(),
  gi_eligiblePremium: z.string().optional(),
  gi_referenceAgent: z.string().optional(),
});

const physicalToDematSchema = z.object({
  p2d_folioNumber: z.string().optional(),
  p2d_nameOnShare: z.string().optional(),
  p2d_jointHolder1: z.string().optional(),
  p2d_jointHolder2: z.string().optional(),
  p2d_jointHolder3: z.string().optional(),
  p2d_companyName: z.string().optional(),
  p2d_rtaName: z.string().optional(),
  p2d_quantity: z.number().optional(),
  p2d_marketPrice: z.number().optional(),
  p2d_totalValue: z.number().optional(),
});

const bondSchema = z.object({
  b_isin: z.string().optional(),
  b_issuer: z.string().optional(),
  b_bondPrice: z.number().optional(),
  b_bondUnit: z.number().optional(),
  b_bondAmount: z.number().optional(),
  b_purchaseDate: z.string().optional(),
  b_maturityDate: z.string().optional(),
  b_nomineeName: z.string().optional(),
  b_nameOfFamilyMember: z.string().optional(),
});

const fdSchema = z.object({
  fd_companyName: z.string().optional(),
  fd_investorName: z.string().optional(),
  fd_fdName: z.string().optional(),
  fd_fdNumber: z.string().optional(),
  fd_depositedAmount: z.string().optional(),
  fd_periodMonth: z.string().optional(),
  fd_periodDays: z.string().optional(),
  fd_interestRate: z.string().optional(),
  fd_maturityAmount: z.string().optional(),
  fd_purchaseDate: z.string().optional(),
  fd_maturityDate: z.string().optional(),
});

const ppfSchema = z.object({
  ppf_familyMemberName: z.string().optional(),
  ppf_contributedAmount: z.number().optional(),
  ppf_balance: z.number().optional(),
  ppf_bankName: z.string().optional(),
  ppf_openingDate: z.string().optional(),
  ppf_matureDate: z.string().optional(),
});

// Combined schema
const assetFormSchema = baseAssetSchema.merge(generalInsuranceSchema).merge(physicalToDematSchema).merge(bondSchema).merge(fdSchema).merge(ppfSchema);
type AssetFormData = z.infer<typeof assetFormSchema>;

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyHeads: Client[];
  onSave: (asset: Asset) => void;
}

export function AddAssetModal({
  isOpen,
  onClose,
  familyHeads,
  onSave,
}: AddAssetModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      familyHead: '',
      assetType: '',
      gi_familyMember: '',
      gi_category: '',
      gi_issuer: '',
      gi_planName: '',
      gi_policyNumber: '',
      gi_policyType: '',
      gi_policyStartDate: '',
      gi_policyIssueDate: '',
      gi_policyEndDate: '',
      gi_vehicleRegNumber: '',
      gi_sumAssured: '',
      gi_priceWithoutGST: '',
      gi_priceWithGST: '',
      gi_eligiblePremium: '',
      gi_referenceAgent: '',
    },
  });

  const selectedFamilyHead = watch('familyHead');
  const selectedAssetType = watch('assetType');

  const familyMembers = useMemo(() => {
    if (!selectedFamilyHead) return [];
    const head = familyHeads.find(fh => fh.id === selectedFamilyHead);
    const members = mockFamilyMembers.filter(
      (fm) => fm.clientId === selectedFamilyHead
    );
    // Combine head and members for dropdowns
    const allMembers = head ? [
        { id: head.id, name: `${head.firstName} ${head.lastName} (Head)` } as unknown as FamilyMember, 
        ...members.map(m => ({ ...m, name: `${m.firstName} ${m.lastName} (${m.relation})` }))
    ] : members;

    return allMembers;
  }, [selectedFamilyHead, familyHeads]);
  
  if (!isOpen) return null;

  const handleSave = (data: AssetFormData) => {
    setIsSaving(true);

    const familyHead = familyHeads.find(h => h.id === data.familyHead);
    if (!familyHead) {
        toast({ title: "Error", description: "Selected family head not found.", variant: 'destructive'});
        setIsSaving(false);
        return;
    }
    
    // This is a prototype save. It creates a structured Asset object.
    const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        familyHeadId: familyHead.id,
        familyHeadName: `${familyHead.firstName} ${familyHead.lastName}`,
        assetType: data.assetType as Asset['assetType'],
        generalInsurance: data.assetType === 'GENERAL INSURANCE' ? {
            familyMember: data.gi_familyMember,
            category: data.gi_category,
            issuer: data.gi_issuer,
            planName: data.gi_planName,
            policyNumber: data.gi_policyNumber,
            policyType: data.gi_policyType,
            policyStartDate: data.gi_policyStartDate,
            policyIssueDate: data.gi_policyIssueDate,
            policyEndDate: data.gi_policyEndDate,
            vehicleRegNumber: data.gi_vehicleRegNumber,
            sumAssured: data.gi_sumAssured,
            priceWithoutGST: data.gi_priceWithoutGST,
            priceWithGST: data.gi_priceWithGST,
            eligiblePremium: data.gi_eligiblePremium,
            referenceAgent: data.gi_referenceAgent
        } : undefined,
        physicalToDemat: data.assetType === 'PHYSICAL TO DEMAT' ? {
            folioNumber: data.p2d_folioNumber,
            nameOnShare: data.p2d_nameOnShare,
            jointHolder1: data.p2d_jointHolder1,
            jointHolder2: data.p2d_jointHolder2,
            jointHolder3: data.p2d_jointHolder3,
            companyName: data.p2d_companyName,
            rtaName: data.p2d_rtaName,
            quantity: data.p2d_quantity,
            marketPrice: data.p2d_marketPrice,
            totalValue: data.p2d_totalValue
        } : undefined,
        bonds: data.assetType === 'BONDS' ? {
            isin: data.b_isin,
            issuer: data.b_issuer,
            bondPrice: data.b_bondPrice,
            bondUnit: data.b_bondUnit,
            bondAmount: data.b_bondAmount,
            purchaseDate: data.b_purchaseDate,
            maturityDate: data.b_maturityDate,
            nomineeName: data.b_nomineeName,
            nameOfFamilyMember: data.b_nameOfFamilyMember
        } : undefined,
        fixedDeposits: data.assetType === 'FIXED DEPOSITS' ? {
            companyName: data.fd_companyName,
            investorName: data.fd_investorName,
            fdName: data.fd_fdName,
            fdNumber: data.fd_fdNumber,
            depositedAmount: data.fd_depositedAmount,
            periodMonth: data.fd_periodMonth,
            periodDays: data.fd_periodDays,
            interestRate: data.fd_interestRate,
            maturityAmount: data.fd_maturityAmount,
            purchaseDate: data.fd_purchaseDate,
            maturityDate: data.fd_maturityDate,
        } : undefined,
        ppf: data.assetType === 'PPF' ? {
            familyName: data.ppf_familyMemberName,
            contributedAmount: data.ppf_contributedAmount,
            balance: data.ppf_balance,
            bankName: data.ppf_bankName,
            openingDate: data.ppf_openingDate,
            matureDate: data.ppf_matureDate
        } : undefined,
    };
    
    setTimeout(() => {
      onSave(newAsset);
      toast({ title: 'Success', description: 'Asset has been saved locally.'});
      setIsSaving(false);
    }, 1000);
  };
  
  const handleSaveUploads = (uploadedFiles: { category: string; file: File }[]) => {
    // This is a prototype and does not persist the documents yet.
    toast({ title: 'Success', description: `${uploadedFiles.length} document(s) have been "uploaded".` });
    setIsUploadModalOpen(false);
  };

  return (
    <>
        <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
        >
        <div
            className={cn(
                "bg-card rounded-xl shadow-lg border relative flex flex-col transition-all duration-300 ease-in-out w-full max-h-[90vh]",
                selectedAssetType ? "max-w-[80vw]" : "max-w-xl"
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-6 flex-shrink-0 relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 close-icon"
                >
                    <X className="h-4 w-4" />
                </Button>
                
                <h2 className="text-lg font-semibold">Add New Asset</h2>
                <p className="text-sm text-muted-foreground">Select a family and asset type to begin.</p>
            </div>

            <div className="flex-1 min-h-0">
                <form onSubmit={handleSubmit(handleSave)} className="flex flex-col h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 px-6 border-b mb-4 flex-shrink-0">
                        <div>
                            <Label>Family Head</Label>
                            <Controller
                                name="familyHead"
                                control={control}
                                render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select Family Head" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {familyHeads.map((head) => (
                                        <SelectItem key={head.id} value={head.id}>
                                        {head.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                )}
                            />
                            {errors.familyHead && <p className="text-sm text-destructive">{errors.familyHead.message}</p>}
                        </div>
                        <div>
                            <Label>Asset</Label>
                            <Controller
                                name="assetType"
                                control={control}
                                render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select Asset Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {ASSET_TYPES.map((asset) => (
                                        <SelectItem key={asset} value={asset}>
                                        {asset}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                )}
                            />
                            {errors.assetType && <p className="text-sm text-destructive">{errors.assetType.message}</p>}
                        </div>
                    </div>
                
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {selectedAssetType === 'GENERAL INSURANCE' && (
                        <GeneralInsuranceFields control={control} errors={errors} familyMembers={familyMembers} />
                        )}
                        {selectedAssetType === 'PHYSICAL TO DEMAT' && (
                            <PhysicalToDematFields register={register} errors={errors} control={control} setValue={setValue} watch={watch} />
                        )}
                        {selectedAssetType === 'BONDS' && (
                            <BondFields register={register} errors={errors} control={control} familyMembers={familyMembers} setValue={setValue} watch={watch} />
                        )}
                        {selectedAssetType === 'FIXED DEPOSITS' && (
                            <FDFields register={register} errors={errors} control={control} familyMembers={familyMembers} />
                        )}
                        {selectedAssetType === 'PPF' && (
                            <PPFFields register={register} errors={errors} control={control} familyMembers={familyMembers} />
                        )}
                        
                        {selectedAssetType && (
                            <div className="mt-6 border-t pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                </Button>
                            </div>
                        )}
                    </div>
                
                    <div className="flex justify-end gap-2 p-6 flex-shrink-0 border-t">
                        <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Asset'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
        </div>

        {isUploadModalOpen && selectedFamilyHead && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
                <div className="bg-card rounded-xl p-6 w-full max-w-2xl shadow-lg border relative" onClick={(e) => e.stopPropagation()}>
                    <UploadDocModal 
                        member={familyMembers.find(m => m.id === selectedFamilyHead)!}
                        onClose={() => setIsUploadModalOpen(false)}
                        onSave={handleSaveUploads}
                        initialCategory={selectedAssetType || 'General'}
                    />
                </div>
            </div>
        )}
    </>
  );
}
