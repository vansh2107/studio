
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

const baseSchema = z.object({
  familyHead: z.string().min(1, 'Family Head is required'),
  assetType: z.string().min(1, 'Asset Type is required'),
});

const bondSchema = baseSchema.extend({
  assetType: z.literal("BONDS"),
  isin: z.string().optional(),
  issuer: z.string().min(1, "Issuer is required"),
  bondPrice: numberField.optional(),
  bondUnit: numberField.optional(),
  bondAmount: numberField.optional(),
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
  nomineeName: z.string().optional(),
  familyMember: z.string().min(1, "Family member is required"),
});

const generalInsuranceSchema = baseSchema.extend({
  assetType: z.literal("GENERAL INSURANCE"),
  familyMember: z.string().min(1, "Family member is required"),
  category: z.string().optional(),
  issuer: z.string().min(1, "Issuer is required."),
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

const physicalToDematSchema = baseSchema.extend({
  assetType: z.literal("PHYSICAL TO DEMAT"),
  clientName: z.string().min(1, "Client name is required"),
  folioNumber: z.string().optional(),
  nameOnShare: z.string().optional(),
  jointHolders: z.array(z.object({ name: z.string() })).optional(),
  companyName: z.string().optional(),
  rtaName: z.string().optional(),
  quantity: numberField,
  marketPrice: numberField,
  totalValue: numberField,
});

const fdSchema = baseSchema.extend({
  assetType: z.literal("FIXED DEPOSITS"),
  companyName: z.string().optional(),
  investorName: z.string().min(1, "Investor name is required"),
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

const ppfSchema = baseSchema.extend({
  assetType: z.literal("PPF"),
  familyMemberName: z.string().min(1, "Family member is required"),
  contributedAmount: numberField,
  balance: numberField,
  bankName: z.string().optional(),
  openingDate: z.string().optional(),
  matureDate: z.string().optional(),
});

const stocksSchema = baseSchema.extend({
  assetType: z.literal("STOCKS"),
  holderName: z.string().min(1, "Holder name is required."),
  jointHolders: z.array(z.object({ name: z.string() })).optional(),
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

const emptySchema = z.object({
  familyHead: z.string(),
  assetType: z.string(),
});

const assetFormSchema = z.discriminatedUnion("assetType", [
  bondSchema,
  generalInsuranceSchema,
  physicalToDematSchema,
  fdSchema,
  ppfSchema,
  stocksSchema,
  baseSchema.extend({ assetType: z.literal("LIFE INSURANCE") }),
  baseSchema.extend({ assetType: z.literal("MUTUAL FUNDS") }),
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
  
  const getInitialValues = (asset: Asset | null | undefined) => {
    if (!asset) return { familyHead: '', assetType: ''};
    return {
        familyHead: asset.familyHeadId,
        assetType: asset.assetType,
        ...asset.bonds,
        ...asset.fixedDeposits,
        ...asset.ppf,
        ...asset.stocks,
        ...asset.physicalToDemat,
        ...asset.generalInsurance,
    }
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

    return head
      ? [
          { id: head.id, name: `${head.firstName} ${head.lastName} (Head)`, firstName: head.firstName, lastName: head.lastName, relation: 'Head' } as unknown as FamilyMember,
          ...members,
        ]
      : members;
  }, [familyHeadId, familyHeads]);
  
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'assetType') {
        const familyHeadValue = value.familyHead;
        const assetTypeValue = value.assetType;
        reset({
          familyHead: familyHeadValue,
          assetType: assetTypeValue,
        } as any);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, reset]);

  /* ---------------------------- SAVE ------------------------------- */

  const onSubmit = (data: FormData) => {
    setIsSaving(true);
    const head = familyHeads.find(h => h.id === data.familyHead);
    if (!head) return;

    let assetPayload: Partial<Asset> = {};

    switch (data.assetType) {
        case 'BONDS':
            assetPayload.bonds = { isin: data.isin, issuer: data.issuer, bondPrice: data.bondPrice, bondUnit: data.bondUnit, bondAmount: data.bondAmount, purchaseDate: data.purchaseDate, maturityDate: data.maturityDate, nomineeName: data.nomineeName, familyMember: data.familyMember };
            break;
        case 'GENERAL INSURANCE':
            assetPayload.generalInsurance = { familyMember: data.familyMember, category: data.category, issuer: data.issuer, planName: data.planName, policyNumber: data.policyNumber, policyType: data.policyType, policyStartDate: data.policyStartDate, policyIssueDate: data.policyIssueDate, policyEndDate: data.policyEndDate, vehicleRegNumber: data.vehicleRegNumber, sumAssured: data.sumAssured, priceWithoutGST: data.priceWithoutGST, priceWithGST: data.priceWithGST, eligiblePremium: data.eligiblePremium, referenceAgent: data.referenceAgent };
            break;
        case 'PHYSICAL TO DEMAT':
            assetPayload.physicalToDemat = { clientName: data.clientName, folioNumber: data.folioNumber, nameOnShare: data.nameOnShare, jointHolders: data.jointHolders, companyName: data.companyName, rtaName: data.rtaName, quantity: data.quantity, marketPrice: data.marketPrice, totalValue: data.totalValue };
            break;
        case 'FIXED DEPOSITS':
            assetPayload.fixedDeposits = { companyName: data.companyName, investorName: data.investorName, fdName: data.fdName, fdNumber: data.fdNumber, depositedAmount: data.depositedAmount, periodMonth: data.periodMonth, periodDays: data.periodDays, interestRate: data.interestRate, maturityAmount: data.maturityAmount, purchaseDate: data.purchaseDate, maturityDate: data.maturityDate };
            break;
        case 'PPF':
            assetPayload.ppf = { familyMemberName: data.familyMemberName, contributedAmount: data.contributedAmount, balance: data.balance, bankName: data.bankName, openingDate: data.openingDate, matureDate: data.matureDate };
            break;
        case 'STOCKS':
            assetPayload.stocks = { holderName: data.holderName, jointHolders: data.jointHolders, dpId: data.dpId, dpName: data.dpName, bankName: data.bankName, bankAccountNumber: data.bankAccountNumber, mobileNumber: data.mobileNumber, emailAddress: data.emailAddress, nominees: data.nominees };
            break;
    }

    const asset: Asset = {
      id: assetToEdit?.id ?? `asset-${Date.now()}`,
      familyHeadId: head.id,
      familyHeadName: `${head.firstName} ${head.lastName}`,
      assetType: data.assetType as Asset['assetType'],
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
          'bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh]',
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
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
