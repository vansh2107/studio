
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
import { StocksFields } from './asset-forms/stocks-fields';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UploadDocModal } from '../doc-vault/upload-doc-modal';

const baseAssetSchema = z.object({
  familyHead: z.string().min(1, 'Family head is required'),
  assetType: z.string().min(1, 'Asset type is required'),
});

// Schemas for each asset type
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

const stocksSchema = z.object({
    holderName: z.string().min(1, 'Holder name is required'),
    jointHolder1: z.string().optional(),
    jointHolder2: z.string().optional(),
    dpId: z.string().min(1, 'DPID is required'),
    dpName: z.string().min(1, 'DP Name is required'),
    bankName: z.string().min(1, 'Bank Name is required'),
    bankAccountNumber: z.string().min(1, 'Bank Account Number is required'),
    mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
    emailAddress: z.string().email('Invalid email address').optional().or(z.literal('')),
    nominees: z.array(z.object({
        name: z.string().min(1, 'Nominee name is required'),
        relationship: z.string().min(1, 'Relationship is required'),
        allocation: z.number().min(0.1, 'Allocation must be > 0').max(100, 'Allocation cannot exceed 100'),
        dateOfBirth: z.string().optional(),
    })).optional()
}).refine(data => {
    if (!data.nominees || data.nominees.length === 0) return true; // Validation passes if no nominees
    const totalAllocation = data.nominees.reduce((acc, nominee) => acc + (nominee.allocation || 0), 0);
    return totalAllocation === 100;
}, {
    message: 'Total allocation for nominees must be exactly 100%',
    path: ['nominees'],
});


// Combined schema
const assetFormSchema = baseAssetSchema.merge(generalInsuranceSchema).merge(physicalToDematSchema).merge(bondSchema).merge(fdSchema).merge(ppfSchema).merge(z.object({stocks: stocksSchema.optional()}));
type AssetFormData = z.infer<typeof assetFormSchema>;

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyHeads: Client[];
  onSave: (asset: Asset) => void;
  assetToEdit?: Asset | null;
  isViewMode?: boolean;
}

export function AddAssetModal({
  isOpen,
  onClose,
  familyHeads,
  onSave,
  assetToEdit,
  isViewMode = false,
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
    reset,
    unregister,
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
      stocks: {
        holderName: '',
        jointHolder1: '',
        jointHolder2: '',
        dpId: '',
        dpName: '',
        bankName: '',
        bankAccountNumber: '',
        mobileNumber: '',
        emailAddress: '',
        nominees: [{ name: '', relationship: '', allocation: 100, dateOfBirth: '' }]
      }
    },
  });

  const selectedFamilyHead = watch('familyHead');
  const selectedAssetType = watch('assetType');

  useEffect(() => {
    if (assetToEdit) {
      const defaultVals: any = {
          familyHead: assetToEdit.familyHeadId,
          assetType: assetToEdit.assetType,
          gi_familyMember: assetToEdit.generalInsurance?.familyMember,
          gi_category: assetToEdit.generalInsurance?.category,
          gi_issuer: assetToEdit.generalInsurance?.issuer,
          gi_planName: assetToEdit.generalInsurance?.planName,
          gi_policyNumber: assetToEdit.generalInsurance?.policyNumber,
          gi_policyType: assetToEdit.generalInsurance?.policyType,
          gi_policyStartDate: assetToEdit.generalInsurance?.policyStartDate,
          gi_policyIssueDate: assetToEdit.generalInsurance?.policyIssueDate,
          gi_policyEndDate: assetToEdit.generalInsurance?.policyEndDate,
          gi_vehicleRegNumber: assetToEdit.generalInsurance?.vehicleRegNumber,
          gi_sumAssured: assetToEdit.generalInsurance?.sumAssured,
          gi_priceWithoutGST: assetToEdit.generalInsurance?.priceWithoutGST,
          gi_priceWithGST: assetToEdit.generalInsurance?.priceWithGST,
          gi_eligiblePremium: assetToEdit.generalInsurance?.eligiblePremium,
          gi_referenceAgent: assetToEdit.generalInsurance?.referenceAgent,
          p2d_folioNumber: assetToEdit.physicalToDemat?.folioNumber,
          p2d_nameOnShare: assetToEdit.physicalToDemat?.nameOnShare,
          p2d_jointHolder1: assetToEdit.physicalToDemat?.jointHolder1,
          p2d_jointHolder2: assetToEdit.physicalToDemat?.jointHolder2,
          p2d_jointHolder3: assetToEdit.physicalToDemat?.jointHolder3,
          p2d_companyName: assetToEdit.physicalToDemat?.companyName,
          p2d_rtaName: assetToEdit.physicalToDemat?.rtaName,
          p2d_quantity: assetToEdit.physicalToDemat?.quantity,
          p2d_marketPrice: assetToEdit.physicalToDemat?.marketPrice,
          p2d_totalValue: assetToEdit.physicalToDemat?.totalValue,
          b_isin: assetToEdit.bonds?.isin,
          b_issuer: assetToEdit.bonds?.issuer,
          b_bondPrice: assetToEdit.bonds?.bondPrice,
          b_bondUnit: assetToEdit.bonds?.bondUnit,
          b_bondAmount: assetToEdit.bonds?.bondAmount,
          b_purchaseDate: assetToEdit.bonds?.purchaseDate,
          b_maturityDate: assetToEdit.bonds?.maturityDate,
          b_nomineeName: assetToEdit.bonds?.nomineeName,
          b_nameOfFamilyMember: assetToEdit.bonds?.nameOfFamilyMember,
          fd_companyName: assetToEdit.fixedDeposits?.companyName,
          fd_investorName: assetToEdit.fixedDeposits?.investorName,
          fd_fdName: assetToEdit.fixedDeposits?.fdName,
          fd_fdNumber: assetToEdit.fixedDeposits?.fdNumber,
          fd_depositedAmount: assetToEdit.fixedDeposits?.depositedAmount,
          fd_periodMonth: assetToEdit.fixedDeposits?.periodMonth,
          fd_periodDays: assetToEdit.fixedDeposits?.periodDays,
          fd_interestRate: assetToEdit.fixedDeposits?.interestRate,
          fd_maturityAmount: assetToEdit.fixedDeposits?.maturityAmount,
          fd_purchaseDate: assetToEdit.fixedDeposits?.purchaseDate,
          fd_maturityDate: assetToEdit.fixedDeposits?.maturityDate,
          ppf_familyMemberName: assetToEdit.ppf?.familyName,
          ppf_contributedAmount: assetToEdit.ppf?.contributedAmount,
          ppf_balance: assetToEdit.ppf?.balance,
          ppf_bankName: assetToEdit.ppf?.bankName,
          ppf_openingDate: assetToEdit.ppf?.openingDate,
          ppf_matureDate: assetToEdit.ppf?.matureDate,
          stocks: assetToEdit.stocks
      };
      reset(defaultVals);
    } else {
        // Reset to default when creating a new asset
         reset({
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
            p2d_folioNumber: '',
            p2d_nameOnShare: '',
            p2d_jointHolder1: '',
            p2d_jointHolder2: '',
            p2d_jointHolder3: '',
            p2d_companyName: '',
            p2d_rtaName: '',
            stocks: {
                holderName: '',
                jointHolder1: '',
                jointHolder2: '',
                dpId: '',
                dpName: '',
                bankName: '',
                bankAccountNumber: '',
                mobileNumber: '',
                emailAddress: '',
                nominees: [{ name: '', relationship: '', allocation: 100, dateOfBirth: '' }]
            }
        });
    }
  }, [assetToEdit, reset]);

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
    
    const newAsset: Asset = {
        id: assetToEdit?.id || `asset-${Date.now()}`,
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
        stocks: data.assetType === 'STOCKS' ? data.stocks : undefined,
    };
    
    setTimeout(() => {
      onSave(newAsset);
      setIsSaving(false);
    }, 1000);
  };
  
  const handleSaveUploads = (uploadedFiles: { category: string; file: File }[]) => {
    toast({ title: 'Success', description: `${uploadedFiles.length} document(s) have been "uploaded".` });
    setIsUploadModalOpen(false);
  };

  const formTitle = isViewMode ? "View Asset" : (assetToEdit ? "Edit Asset" : "Add New Asset");
  const formDescription = isViewMode ? "Viewing asset details." : "Select a family and asset type to begin.";


  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <fieldset
          disabled={isViewMode}
          className={cn(
            "bg-card rounded-xl shadow-lg border relative flex flex-col transition-all duration-300 ease-in-out w-full max-h-[90vh]",
            selectedAssetType ? "max-w-4xl" : "max-w-xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 flex-shrink-0 relative border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 close-icon"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-semibold">{formTitle}</h2>
            <p className="text-sm text-muted-foreground">{formDescription}</p>
          </div>

          <form onSubmit={handleSubmit(handleSave)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b mb-4">
                  <div>
                      <Label>Family Head</Label>
                      <Controller
                          name="familyHead"
                          control={control}
                          render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode || !!assetToEdit}>
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={isViewMode || !!assetToEdit}>
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
              
              {selectedAssetType === 'GENERAL INSURANCE' && (
                <GeneralInsuranceFields control={control} errors={errors} familyMembers={familyMembers} />
              )}
              {selectedAssetType === 'PHYSICAL TO DEMAT' && (
                  <PhysicalToDematFields register={register} errors={errors} control={control} setValue={setValue} watch={watch} unregister={unregister} />
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
              {selectedAssetType === 'STOCKS' && (
                  <StocksFields control={control} errors={errors} register={register} watch={watch} />
              )}
              
              
              {selectedAssetType && !isViewMode && (
                  <div className="mt-6 border-t pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Document
                      </Button>
                  </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 p-6 flex-shrink-0 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                {isViewMode ? 'Close' : 'Cancel'}
              </Button>
              {!isViewMode && (
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Asset'}
                </Button>
              )}
            </div>
          </form>
        </fieldset>
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
