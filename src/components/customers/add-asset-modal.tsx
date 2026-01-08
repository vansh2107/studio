
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
import { Loader2, X } from 'lucide-react';
import { Client, FamilyMember } from '@/lib/types';
import { familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import { ASSET_TYPES, GENERAL_INSURANCE_CATEGORIES, GENERAL_INSURANCE_POLICY_TYPES } from '@/lib/asset-form-types';
import { GeneralInsuranceFields } from './asset-forms/general-insurance-fields';
import { PhysicalToDematFields } from './asset-forms/physical-to-demat-fields';
import { BondFields } from './asset-forms/bond-fields';
import { FDFields } from './asset-forms/fd-fields';
import { PPFFields } from './asset-forms/ppf-fields';
import { cn } from '@/lib/utils';

const assetFormSchema = z.object({
  familyHead: z.string().min(1, 'Family head is required'),
  assetType: z.string().min(1, 'Asset type is required'),
  // General Insurance
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
  // Physical to Demat
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
  // Bonds
  b_isin: z.string().optional(),
  b_issuer: z.string().optional(),
  b_bondPrice: z.number().optional(),
  b_bondUnit: z.number().optional(),
  b_bondAmount: z.number().optional(),
  b_purchaseDate: z.string().optional(),
  b_maturityDate: z.string().optional(),
  b_nomineeName: z.string().optional(),
  b_nameOfFamilyMember: z.string().optional(),
  // FD
  fd_familyMemberName: z.string().optional(),
  fd_purchaseDate: z.string().optional(),
  fd_maturityDate: z.string().optional(),
  fd_issuer: z.string().optional(),
  fd_interest: z.number().optional(),
  fd_period: z.string().optional(),
  // PPF
  ppf_familyMemberName: z.string().optional(),
  ppf_contributedAmount: z.number().optional(),
  ppf_balance: z.number().optional(),
  ppf_bankName: z.string().optional(),
  ppf_openingDate: z.string().optional(),
  ppf_matureDate: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetFormSchema>;

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyHeads: Client[];
}

export function AddAssetModal({
  isOpen,
  onClose,
  familyHeads,
}: AddAssetModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {},
  });

  const selectedFamilyHead = watch('familyHead');
  const selectedAssetType = watch('assetType');

  const familyMembers = useMemo(() => {
    if (!selectedFamilyHead) return [];
    const head = familyHeads.find(fh => fh.id === selectedFamilyHead);
    const members = mockFamilyMembers.filter(
      (fm) => fm.clientId === selectedFamilyHead
    );
    return head ? [head, ...members] : members;
  }, [selectedFamilyHead, familyHeads]);
  
    if (!isOpen) return null;

  const handleSave = (data: AssetFormData) => {
    setIsSaving(true);
    console.log('Form data:', data);
    // No actual saving logic, this is a prototype
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={cn(
            "bg-card rounded-xl p-6 w-full shadow-lg border relative flex flex-col transition-all duration-300 ease-in-out",
            selectedAssetType
              ? "max-w-[80vw] h-[90vh]"
              : "max-w-xl"
          )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 close-icon"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold">Add New Asset</h2>
            <p className="text-sm text-muted-foreground">Select a family and asset type to begin.</p>
        </div>

        <form onSubmit={handleSubmit(handleSave)} className="flex-grow flex flex-col overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b mb-4 flex-shrink-0">
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
          
          <div className="flex-grow overflow-y-auto pr-2 -mr-2">
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
          </div>
          
          <div className="flex justify-end gap-2 pt-6 mt-auto flex-shrink-0">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Asset'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
