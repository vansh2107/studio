
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

/* ----------------------------- SCHEMAS ----------------------------- */

const numberField = z.preprocess(
    (val) => (val === "" || val === null ? undefined : parseFloat(String(val))),
    z.number().min(0, "Value cannot be negative").optional()
);

// Individual schemas for each asset type
const baseAssetSchema = z.object({
  familyHead: z.string().min(1, 'Family Head is required'),
  assetType: z.string().min(1, 'Asset Type is required'),
});

const bondFieldsSchema = z.object({
  familyMember: z.string().min(1, "Family member is required"),
  issuer: z.string().min(1, "Issuer is required"),
  isin: z.string().optional(),
  bondPrice: numberField,
  bondUnit: numberField,
  bondAmount: numberField,
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
  nomineeName: z.string().optional(),
});

const generalInsuranceFieldsSchema = z.object({
  familyMember: z.string().min(1, "Family member is required"),
  issuer: z.string().min(1, "Issuer is required."),
  category: z.string().optional(),
  planName: z.string().optional(),
  policyNumber: z.string().optional(),
  policyType: z.string().optional(),
  policyStartDate: z.string().optional(),
  policyIssueDate: z.string().optional(),
  policyEndDate: z.string().optional(),
  vehicleRegNumber: z.string().optional(),
  sumAssured: numberField,
  priceWithoutGST: numberField,
  priceWithGST: numberField,
  eligiblePremium: numberField,
  referenceAgent: z.string().optional(),
});

const physicalToDematFieldsSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  folioNumber: z.string().optional(),
  nameOnShare: z.string().optional(),
  jointHolders: z.array(z.object({ name: z.string() })).max(3).optional(),
  companyName: z.string().optional(),
  rtaName: z.string().optional(),
  quantity: numberField,
  marketPrice: numberField,
  totalValue: numberField,
});

const fdFieldsSchema = z.object({
  investorName: z.string().min(1, "Investor name is required"),
  companyName: z.string().optional(),
  fdName: z.string().optional(),
  fdNumber: z.string().optional(),
  depositedAmount: z.string().optional(),
  periodMonth: z.string().optional(),
  periodDays: z.string().optional(),
  interestRate: z.string().optional(),
  maturityAmount: z.string().optional(),
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
});

const ppfFieldsSchema = z.object({
  familyMemberName: z.string().min(1, "Family member is required"),
  contributedAmount: numberField,
  balance: numberField,
  bankName: z.string().optional(),
  openingDate: z.string().optional(),
  matureDate: z.string().optional(),
});

const stocksFieldsSchema = z.object({
  holderName: z.string().min(1, "Holder name is required."),
  jointHolders: z.array(z.object({ name: z.string() })).max(3).optional(),
  dpId: z.string().min(1, "DPID is required."),
  dpName: z.string().min(1, "DP Name is required."),
  bankName: z.string().min(1, "Bank name is required."),
  bankAccountNumber: z.string().min(1, "Bank account number is required."),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits."),
  emailAddress: z.string().email().optional(),
  nominees: z.array(z.object({
    name: z.string().min(1, "Nominee name is required."),
    relationship: z.string().min(1, "Relationship is required."),
    allocation: z.number().min(0).max(100),
    dateOfBirth: z.string().optional(),
  })).max(3).optional(),
});

const assetFormSchema = z.discriminatedUnion("assetType", [
  baseAssetSchema.extend({ assetType: z.literal("BONDS"), bonds: bondFieldsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("GENERAL INSURANCE"), generalInsurance: generalInsuranceFieldsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("PHYSICAL TO DEMAT"), physicalToDemat: physicalToDematFieldsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("FIXED DEPOSITS"), fixedDeposits: fdFieldsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("PPF"), ppf: ppfFieldsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("STOCKS"), stocks: stocksFieldsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("LIFE INSURANCE") }),
  baseAssetSchema.extend({ assetType: z.literal("MUTUAL FUNDS") }),
  baseAssetSchema.extend({ assetType: z.literal(""), bonds: z.undefined(), generalInsurance: z.undefined(), physicalToDemat: z.undefined(), fixedDeposits: z.undefined(), ppf: z.undefined(), stocks: z.undefined() }),
  baseAssetSchema.extend({ assetType: z.literal(undefined), bonds: z.undefined(), generalInsurance: z.undefined(), physicalToDemat: z.undefined(), fixedDeposits: z.undefined(), ppf: z.undefined(), stocks: z.undefined()  }),
]);


type FormData = z.infer<typeof assetFormSchema>;

/* --------------------------- COMPONENT ----------------------------- */

export function AddAssetModal({
  isOpen,
  onClose,
  familyHeads,
  onSave,
  assetToEdit,
  isViewMode = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  familyHeads: Client[];
  onSave: (asset: Asset) => void;
  assetToEdit?: Asset | null;
  isViewMode?: boolean;
}) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const getInitialValues = (asset: Asset | null | undefined): Partial<FormData> => {
    if (!asset) return { familyHead: '', assetType: ''};
    return {
      familyHead: asset.familyHeadId,
      assetType: asset.assetType,
      bonds: asset.bonds,
      fixedDeposits: asset.fixedDeposits,
      ppf: asset.ppf,
      stocks: asset.stocks,
      physicalToDemat: asset.physicalToDemat,
      generalInsurance: asset.generalInsurance,
    };
  }

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(assetFormSchema),
    shouldUnregister: false,
    defaultValues: getInitialValues(assetToEdit)
  });

  const assetType = watch('assetType');
  const familyHeadId = watch('familyHead');

  /* ------------------------- FAMILY MEMBERS ------------------------ */

  const familyMembers = useMemo(() => {
    if (!familyHeadId) return [];
    const head = familyHeads.find(h => h.id === familyHeadId);
    const members = mockFamilyMembers.filter(m => m.clientId === familyHeadId);

    const all = head
      ? [
          { id: head.id, name: `${head.firstName} ${head.lastName} (Head)`, firstName: head.firstName, lastName: head.lastName, relation: 'Head' } as unknown as FamilyMember,
          ...members,
        ]
      : members;
      
    return all.sort((a,b) => a.name.localeCompare(b.name));
  }, [familyHeadId, familyHeads]);
  
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'assetType') {
        const { familyHead, assetType } = value;
        reset({
          familyHead,
          assetType,
        } as any);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, reset]);

  /* ---------------------------- SAVE ------------------------------- */

  const onSubmit = (data: FormData) => {
    setIsSaving(true);
    const head = familyHeads.find(h => h.id === data.familyHead);
    if (!head || !data.assetType) return;

    let assetPayload: Partial<Asset> = {};

    switch (data.assetType) {
        case 'BONDS':
            assetPayload.bonds = data.bonds;
            break;
        case 'GENERAL INSURANCE':
            assetPayload.generalInsurance = data.generalInsurance;
            break;
        case 'PHYSICAL TO DEMAT':
            assetPayload.physicalToDemat = data.physicalToDemat;
            break;
        case 'FIXED DEPOSITS':
            assetPayload.fixedDeposits = data.fixedDeposits;
            break;
        case 'PPF':
            assetPayload.ppf = data.ppf;
            break;
        case 'STOCKS':
            assetPayload.stocks = data.stocks;
            break;
    }

    const asset: Asset = {
      id: assetToEdit?.id ?? `asset-${Date.now()}`,
      familyHeadId: head.id,
      familyHeadName: `${head.firstName} ${head.lastName}`,
      assetType: data.assetType,
      ...assetPayload
    };

    setTimeout(() => {
      onSave(asset);
      setIsSaving(false);
      toast({ title: 'Saved', description: 'Asset saved (prototype)' });
    }, 500);
  };

  if (!isOpen) return null;

  /* ----------------------------- UI ------------------------------- */

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <fieldset
        disabled={isViewMode}
        className={cn(
          'bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh] overflow-hidden',
          assetType ? 'w-4/5' : 'w-2/5'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4"
          >
            <X />
          </Button>
          <h2 className="font-semibold text-lg">
            {isViewMode ? 'View Asset' : assetToEdit ? 'Edit Asset' : 'Add Asset'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top selectors */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="familyHead"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!assetToEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Family Head" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyHeads.map(h => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.firstName} {h.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="assetType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!assetToEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Asset Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map(a => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Conditional Forms */}
            {assetType === 'GENERAL INSURANCE' && (
              <GeneralInsuranceFields
                control={control}
                errors={errors.generalInsurance}
                familyMembers={familyMembers}
              />
            )}
            
            {assetType === 'PHYSICAL TO DEMAT' && (
              <PhysicalToDematFields
                register={register}
                errors={errors.physicalToDemat}
                control={control}
                familyMembers={familyMembers}
              />
            )}

            {assetType === 'BONDS' && (
              <BondFields
                register={register}
                errors={errors.bonds}
                control={control}
                familyMembers={familyMembers}
                setValue={setValue}
                watch={watch}
              />
            )}

            {assetType === 'FIXED DEPOSITS' && (
              <FDFields
                register={register}
                errors={errors.fixedDeposits}
                control={control}
                familyMembers={familyMembers}
              />
            )}

            {assetType === 'PPF' && (
              <PPFFields
                register={register}
                errors={errors.ppf}
                control={control}
                familyMembers={familyMembers}
              />
            )}

            {assetType === 'STOCKS' && (
              <StocksFields
                control={control}
                register={register}
                errors={errors.stocks}
                familyMembers={familyMembers}
              />
            )}

            {assetType && !isViewMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Asset
              </Button>
            )}
          </div>
        </form>
      </fieldset>

      {isUploadModalOpen && familyMembers.length > 0 && (
        <UploadDocModal
          member={familyMembers[0]}
          onClose={() => setIsUploadModalOpen(false)}
          onSave={() => setIsUploadModalOpen(false)}
          initialCategory={assetType}
        />
      )}
    </div>
  );
}

    