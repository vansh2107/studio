
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
  bondPrice: z.number().nonnegative().optional(),
  bondUnit: z.number().nonnegative().optional(),
  bondAmount: z.number().nonnegative().optional(),
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
    sumAssured: z.string().optional(),
    priceWithoutGST: z.string().optional(),
    priceWithGST: z.string().optional(),
    eligiblePremium: z.string().optional(),
    referenceAgent: z.string().optional(),
});

const physicalToDematSchema = z.object({
    clientName: z.string(),
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
    familyName: z.string().optional(),
    contributedAmount: z.number().min(0, "Value cannot be negative").optional(),
    balance: z.number().min(0, "Value cannot be negative").optional(),
    bankName: z.string().optional(),
    openingDate: z.string().optional(),
    matureDate: z.string().optional(),
});

const stocksSchema = z.object({
    holderName: z.string(),
    jointHolder1: z.string().optional(),
    jointHolder2: z.string().optional(),
    dpId: z.string(),
    dpName: z.string(),
    bankName: z.string(),
    bankAccountNumber: z.string(),
    mobileNumber: z.string(),
    emailAddress: z.string().optional(),
    nominees: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        allocation: z.number().min(0).max(100),
        dateOfBirth: z.string().optional(),
    })).optional(),
});

// Dynamic schema based on assetType
const assetFormSchema = baseSchema.superRefine((data, ctx) => {
    switch (data.assetType) {
        case 'BONDS':
            bondSchema.parse(data);
            break;
        case 'FIXED DEPOSITS':
            fdSchema.parse(data);
            break;
        case 'PPF':
            ppfSchema.parse(data);
            break;
        case 'STOCKS':
            stocksSchema.parse(data);
            break;
        case 'PHYSICAL TO DEMAT':
            physicalToDematSchema.parse(data);
            break;
        case 'GENERAL INSURANCE':
            generalInsuranceSchema.parse(data);
            break;
        default:
            // No extra validation for other types
            break;
    }
});


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
    unregister,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(assetFormSchema),
    shouldUnregister: true,
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
          { id: head.id, name: `${head.firstName} ${head.lastName} (Head)` } as FamilyMember,
          ...members,
        ]
      : members;
  }, [familyHeadId, familyHeads]);

  /* ---------------------------- SAVE ------------------------------- */

  const onSubmit = (data: FormData) => {
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
            {assetToEdit ? 'Edit Asset' : 'Add Asset'}
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
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
                familyMembers={familyMembers}
                errors={errors}
                unregister={unregister}
              />
            )}

            {assetType === 'BONDS' && (
              <BondFields
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
                familyMembers={familyMembers}
                errors={errors}
              />
            )}

            {assetType === 'FIXED DEPOSITS' && (
              <FDFields
                control={control}
                register={register}
                familyMembers={familyMembers}
                errors={errors}
              />
            )}

            {assetType === 'PPF' && (
              <PPFFields
                control={control}
                register={register}
                familyMembers={familyMembers}
                errors={errors}
              />
            )}

            {assetType === 'STOCKS' && (
              <StocksFields
                control={control}
                register={register}
                watch={watch}
                setValue={setValue}
                familyMembers={familyMembers}
                errors={errors}
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

      {isUploadModalOpen && (
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
