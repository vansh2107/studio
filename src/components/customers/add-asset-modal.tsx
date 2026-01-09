
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

const baseSchema = z.object({
  familyHead: z.string().min(1),
  assetType: z.string().min(1),
});

const bondSchema = z.object({
  isin: z.string().optional(),
  issuer: z.string().optional(),
  bondPrice: z.number().min(0, "Value cannot be negative").optional(),
  bondUnit: z.number().min(0, "Value cannot be negative").optional(),
  bondAmount: z.number().min(0, "Value cannot be negative").optional(),
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
  nomineeName: z.string().optional(),
  familyMember: z.string().optional(),
});

const generalInsuranceSchema = z.object({
    familyMember: z.string().optional(),
    category: z.string().optional(),
    issuer: z.string().min(1, "Issuer is required."),
    planName: z.string().optional(),
    policyNumber: z.string().optional(),
    policyType: z.string().optional(),
    policyStartDate: z.string().optional(),
    policyIssueDate: z.string().optional(),
    policyEndDate: z.string().optional(),
    vehicleRegNumber: z.string().optional(),
    sumAssured: z.string().min(0, "Value cannot be negative").optional(),
    priceWithoutGST: z.string().min(0, "Value cannot be negative").optional(),
    priceWithGST: z.string().min(0, "Value cannot be negative").optional(),
    eligiblePremium: z.string().min(0, "Value cannot be negative").optional(),
    referenceAgent: z.string().optional(),
});

const physicalToDematSchema = z.object({
    clientName: z.string().optional(),
    folioNumber: z.string().optional(),
    nameOnShare: z.string().optional(),
    jointHolder1: z.string().optional(),
    jointHolder2: z.string().optional(),
    jointHolder3: z.string().optional(),
    companyName: z.string().optional(),
    rtaName: z.string().optional(),
    quantity: z.number().min(0, "Value cannot be negative").optional(),
    marketPrice: z.number().min(0, "Value cannot be negative").optional(),
    totalValue: z.number().min(0, "Value cannot be negative").optional(),
});

const fdSchema = z.object({
    companyName: z.string().optional(),
    investorName: z.string().optional(),
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

const ppfSchema = z.object({
    familyMemberName: z.string().optional(),
    contributedAmount: z.number().min(0, "Value cannot be negative").optional(),
    balance: z.number().min(0, "Value cannot be negative").optional(),
    bankName: z.string().optional(),
    openingDate: z.string().optional(),
    matureDate: z.string().optional(),
});

const stocksSchema = z.object({
    holderName: z.string().min(1, "Holder name is required."),
    jointHolder1: z.string().optional(),
    jointHolder2: z.string().optional(),
    dpId: z.string().min(1, "DPID is required."),
    dpName: z.string().min(1, "DP Name is required."),
    bankName: z.string().min(1, "Bank name is required."),
    bankAccountNumber: z.string().min(1, "Bank account number is required."),
    mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits."),
    emailAddress: z.string().email().optional(),
    nominees: z.array(z.object({
        name: z.string().min(1, "Nominee name is required."),
        relationship: z.string().min(1, "Relationship is required."),
        allocation: z.number().min(0, "Allocation must be between 0 and 100.").max(100),
        dateOfBirth: z.string().optional(),
    })).min(1, "At least one nominee is required.").optional(),
});


// Combine schemas into a discriminated union
const assetFormSchema = z.discriminatedUnion("assetType", [
  baseSchema.extend({ assetType: z.literal("BONDS"), bonds: bondSchema }),
  baseSchema.extend({ assetType: z.literal("FIXED DEPOSITS"), fixedDeposits: fdSchema }),
  baseSchema.extend({ assetType: z.literal("PPF"), ppf: ppfSchema }),
  baseSchema.extend({ assetType: z.literal("STOCKS"), stocks: stocksSchema }),
  baseSchema.extend({ assetType: z.literal("PHYSICAL TO DEMAT"), physicalToDemat: physicalToDematSchema }),
  baseSchema.extend({ assetType: z.literal("GENERAL INSURANCE"), generalInsurance: generalInsuranceSchema }),
  // Add fallback for types without specific validation
  baseSchema.extend({ assetType: z.literal("LIFE INSURANCE") }),
  baseSchema.extend({ assetType: z.literal("MUTUAL FUNDS") }),
  // Catch-all for when assetType is not yet selected
  baseSchema.extend({ assetType: z.literal("") }),
  baseSchema.extend({ assetType: z.literal(undefined) }),
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
    defaultValues: {
      familyHead: assetToEdit?.familyHeadId || '',
      assetType: assetToEdit?.assetType || '',
      bonds: assetToEdit?.bonds || {},
      fixedDeposits: assetToEdit?.fixedDeposits || {},
      ppf: assetToEdit?.ppf || {},
      stocks: assetToEdit?.stocks || {},
      physicalToDemat: assetToEdit?.physicalToDemat || {},
      generalInsurance: assetToEdit?.generalInsurance || {},
    },
  });

  const assetType = watch('assetType');
  const familyHeadId = watch('familyHead');

  /* ------------------------- FAMILY MEMBERS ------------------------ */

  const familyMembers = useMemo(() => {
    if (!familyHeadId) return [];
    const head = familyHeads.find(h => h.id === familyHeadId);
    const members = mockFamilyMembers.filter(m => m.clientId === familyHeadId);

    return head
      ? [
          { id: head.id, name: `${head.firstName} ${head.lastName} (Head)` } as unknown as FamilyMember,
          ...members,
        ]
      : members;
  }, [familyHeadId, familyHeads]);
  
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'assetType') {
        // Reset other asset fields to avoid carrying over data and validation errors
        reset({
          familyHead: value.familyHead,
          assetType: value.assetType,
          bonds: {},
          fixedDeposits: {},
          ppf: {},
          stocks: {},
          physicalToDemat: {},
          generalInsurance: {},
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, reset]);

  /* ---------------------------- SAVE ------------------------------- */

  const onSubmit = (data: any) => { // Use 'any' to bypass strict discriminated union checks at runtime
    setIsSaving(true);

    const head = familyHeads.find(h => h.id === data.familyHead);
    if (!head) return;

    const asset: Asset = {
      id: assetToEdit?.id ?? `asset-${Date.now()}`,
      familyHeadId: head.id,
      familyHeadName: head.name,
      assetType: data.assetType as Asset['assetType'],
      bonds: data.assetType === 'BONDS' ? data.bonds : undefined,
      fixedDeposits: data.assetType === 'FIXED DEPOSITS' ? data.fixedDeposits : undefined,
      ppf: data.assetType === 'PPF' ? data.ppf : undefined,
      stocks: data.assetType === 'STOCKS' ? data.stocks : undefined,
      physicalToDemat:
        data.assetType === 'PHYSICAL TO DEMAT' ? data.physicalToDemat : undefined,
      generalInsurance:
        data.assetType === 'GENERAL INSURANCE' ? data.generalInsurance : undefined,
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <fieldset
        disabled={isViewMode}
        className={cn(
          'bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh]',
          assetType ? 'w-4/5' : 'w-2/5'
        )}
        onClick={e => e.stopPropagation()}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Top selectors */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="familyHead"
                control={control}
                render={({ field }) => (
                  <Select {...field} disabled={!!assetToEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Family Head" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyHeads.map(h => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
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
                  <Select {...field} disabled={!!assetToEdit}>
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
                errors={errors}
                familyMembers={familyMembers}
              />
            )}
            
            {assetType === 'PHYSICAL TO DEMAT' && (
              <PhysicalToDematFields
                register={register}
                errors={errors}
                control={control}
                familyMembers={familyMembers}
              />
            )}

            {assetType === 'BONDS' && (
              <BondFields
                register={register}
                errors={errors}
                control={control}
                familyMembers={familyMembers}
                setValue={setValue}
                watch={watch}
              />
            )}

            {assetType === 'FIXED DEPOSITS' && (
              <FDFields
                register={register}
                errors={errors}
                control={control}
                familyMembers={familyMembers}
              />
            )}

            {assetType === 'PPF' && (
              <PPFFields
                register={register}
                errors={errors}
                control={control}
                familyMembers={familyMembers}
              />
            )}

            {assetType === 'STOCKS' && (
              <StocksFields
                control={control}
                register={register}
                errors={errors}
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
            <Button variant="outline" onClick={onClose}>
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
