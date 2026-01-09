
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  X,
  Upload,
} from 'lucide-react';
import { Client, FamilyMember, Asset } from '@/lib/types';
import { familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import { ASSET_TYPES } from '@/lib/asset-form-types';
import { GeneralInsuranceFields } from './asset-forms/general-insurance-fields';
import { PhysicalToDematFields } from './asset-forms/physical-to-demat-fields';
import { BondFields } from './asset-forms/bond-fields';
import { FDFields } from './asset-forms/fd-fields';
import { PPFFields } from './asset-forms/ppf-fields';
import { StocksFields } from './asset-forms/stocks-fields';
import { NomineeFields } from './asset-forms/nominee-fields';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UploadDocModal } from '../doc-vault/upload-doc-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const nomineeSchema = z.object({
  name: z.string().min(1, 'Nominee name is required.'),
  allocation: z.preprocess(
    (a) => (a === '' ? undefined : parseFloat(String(a))),
    z.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100').optional()
  ),
  dateOfBirth: z.string().optional(),
});

const nomineesArraySchema = z.array(nomineeSchema).max(3, 'You can add a maximum of 3 nominees.').optional().superRefine((nominees, ctx) => {
    if (nominees) {
        const totalAllocation = nominees.reduce((acc, nominee) => acc + (nominee.allocation || 0), 0);
        if (totalAllocation > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Total allocation cannot exceed 100%.',
                path: [],
            });
        }
    }
});


const baseAssetSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.enum(ASSET_TYPES)
});

const generalInsuranceSchema = z.object({
  category: z.string().min(1, "Category is required."),
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
  familyMember: z.string().min(1, "Family member is required."),
  nominees: nomineesArraySchema,
});

const physicalToDematSchema = z.object({
  clientName: z.string().min(1, "Client name is required."),
  mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^[0-9]+$/, "Mobile number must contain only digits"),
  emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
  nameOnShare: z.string().optional(),
  folioNumber: z.string().optional(),
  companyName: z.string().optional(),
  rtaName: z.string().optional(),
  quantity: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  marketPrice: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  totalValue: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  jointHolders: z.array(z.object({ name: z.string() })).max(3).optional(),
});

const bondsSchema = z.object({
  familyMember: z.string().min(1, "Family member is required."),
  mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^[0-9]+$/, "Mobile number must contain only digits"),
  emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
  issuer: z.string().min(1, "Issuer is required."),
  isin: z.string().optional(),
  bondPrice: z.preprocess((a) => (a === '' ? undefined : parseFloat(String(a))), z.number().min(0).optional()),
  bondUnit: z.preprocess((a) => (a === '' ? undefined : parseInt(String(a), 10)), z.number().int().min(1).optional()),
  bondAmount: z.number().min(0).optional(),
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
  nominees: nomineesArraySchema,
});

const fdSchema = z.object({
  companyName: z.string().min(1, "Company/Bank Name is required."),
  investorName: z.string().min(1, "Investor name is required"),
  mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^[0-9]+$/, "Mobile number must contain only digits"),
  emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
  fdName: z.string().optional(),
  fdNumber: z.string().optional(),
  depositedAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  periodMonth: z.string().optional(),
  periodDays: z.string().optional(),
  interestRate: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  maturityAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
  nominees: nomineesArraySchema,
});

const ppfSchema = z.object({
  familyMemberName: z.string().min(1, "Family member is required."),
  bankName: z.string().min(1, "Bank name is required."),
  contributedAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  balance: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
  openingDate: z.string().optional(),
  matureDate: z.string().optional(),
  nominees: nomineesArraySchema,
});

const stocksSchema = z.object({
  holderName: z.string().min(1, "Holder name is required."),
  jointHolders: z.array(z.object({ name: z.string() })).max(3).optional(),
  dpId: z.string().min(1, "DPID is required."),
  dpName: z.string().min(1, "DP Name is required."),
  bankName: z.string().min(1, "Bank name is required."),
  bankAccountNumber: z.string().min(1, "Bank Account Number is required."),
  mobileNumber: z
    .string()
    .length(10, { message: "Mobile number must be exactly 10 digits." })
    .regex(/^[0-9]{10}$/, { message: "Mobile number must contain only digits." }),
  emailAddress: z.string().email("Invalid email address.").optional().or(z.literal("")),
  nominees: nomineesArraySchema,
});

const assetFormSchema = z.discriminatedUnion("assetType", [
  baseAssetSchema.extend({ assetType: z.literal("GENERAL INSURANCE"), generalInsurance: generalInsuranceSchema }),
  baseAssetSchema.extend({ assetType: z.literal("PHYSICAL TO DEMAT"), physicalToDemat: physicalToDematSchema }),
  baseAssetSchema.extend({ assetType: z.literal("BONDS"), bonds: bondsSchema }),
  baseAssetSchema.extend({ assetType: z.literal("FIXED DEPOSITS"), fixedDeposits: fdSchema }),
  baseAssetSchema.extend({ assetType: z.literal("PPF"), ppf: ppfSchema }),
  baseAssetSchema.extend({ assetType: z.literal("STOCKS"), stocks: stocksSchema }),
  baseAssetSchema.extend({ assetType: z.literal("LIFE INSURANCE") }),
  baseAssetSchema.extend({ assetType: z.literal("MUTUAL FUNDS") }),
]);


type FormData = z.infer<typeof assetFormSchema>;

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
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      familyHead: '',
    },
  });

  const assetType = watch('assetType');
  const familyHeadId = watch('familyHead');

  useEffect(() => {
    if (assetToEdit) {
      const defaultVals: Partial<FormData> = {
        familyHead: assetToEdit.familyHeadId,
        assetType: assetToEdit.assetType,
      };

      switch (assetToEdit.assetType) {
        case 'GENERAL INSURANCE':
          defaultVals.generalInsurance = assetToEdit.generalInsurance;
          break;
        case 'PHYSICAL TO DEMAT':
          defaultVals.physicalToDemat = assetToEdit.physicalToDemat;
          break;
        case 'BONDS':
          defaultVals.bonds = assetToEdit.bonds;
          break;
        case 'FIXED DEPOSITS':
          defaultVals.fixedDeposits = assetToEdit.fixedDeposits;
          break;
        case 'PPF':
          defaultVals.ppf = assetToEdit.ppf;
          break;
        case 'STOCKS':
          defaultVals.stocks = assetToEdit.stocks;
          break;
      }
      
      reset(defaultVals as any);
    } else {
      reset({ familyHead: '', assetType: undefined });
    }
  }, [assetToEdit, reset]);


  const familyMembers = useMemo(() => {
    if (!familyHeadId) return [];
    const head = familyHeads.find((h) => h.id === familyHeadId);
    return head ? [{ id: head.id, name: `${head.firstName} ${head.lastName}`, relation: 'Head' }, ...mockFamilyMembers.filter(m => m.clientId === familyHeadId)] : [];
  }, [familyHeadId, familyHeads]);
  
  const onSubmit = (data: FormData) => {
    setIsSaving(true);
    const head = familyHeads.find(h => h.id === data.familyHead);
    if (!head) {
        setIsSaving(false);
        return;
    };

    let assetSpecificData = {};
    if (data.assetType === 'GENERAL INSURANCE' && data.generalInsurance) {
      assetSpecificData = { generalInsurance: data.generalInsurance };
    } else if (data.assetType === 'PHYSICAL TO DEMAT' && data.physicalToDemat) {
      assetSpecificData = { physicalToDemat: data.physicalToDemat };
    } else if (data.assetType === 'BONDS' && data.bonds) {
      assetSpecificData = { bonds: data.bonds };
    } else if (data.assetType === 'FIXED DEPOSITS' && data.fixedDeposits) {
      assetSpecificData = { fixedDeposits: data.fixedDeposits };
    } else if (data.assetType === 'PPF' && data.ppf) {
      assetSpecificData = { ppf: data.ppf };
    } else if (data.assetType === 'STOCKS' && data.stocks) {
      assetSpecificData = { stocks: data.stocks };
    }

    const newAsset: Asset = {
      id: assetToEdit?.id ?? `asset-${Date.now()}`,
      familyHeadId: head.id,
      familyHeadName: `${head.firstName} ${head.lastName}`,
      assetType: data.assetType,
      ...assetSpecificData
    };
    
    setTimeout(() => {
      onSave(newAsset);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  const currentAssetType = assetToEdit?.assetType || assetType;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh] overflow-hidden',
          'w-full max-w-4xl'
        )}
      >
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
            <fieldset disabled={isViewMode} className="space-y-6">
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
                        {familyHeads.map((h) => (
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
                    <Select onValueChange={(value) => {
                      const currentFamilyHead = getValues('familyHead');
                      reset({
                        familyHead: currentFamilyHead,
                        assetType: value as any,
                      });
                    }} value={field.value} disabled={!!assetToEdit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Asset Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {currentAssetType === 'GENERAL INSURANCE' && (
                <>
                  <GeneralInsuranceFields control={control} register={register} errors={errors?.generalInsurance} familyMembers={familyMembers} />
                  <NomineeFields control={control} errors={errors?.generalInsurance?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
                </>
              )}
              {currentAssetType === 'PHYSICAL TO DEMAT' && <PhysicalToDematFields watch={watch} setValue={setValue} control={control} register={register} errors={errors?.physicalToDemat} familyMembers={familyMembers} />}
              {currentAssetType === 'BONDS' && (
                <>
                  <BondFields control={control} errors={errors?.bonds} familyMembers={familyMembers} />
                  <NomineeFields control={control} errors={errors?.bonds?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
                </>
              )}
              {currentAssetType === 'FIXED DEPOSITS' && (
                 <>
                  <FDFields control={control} errors={errors?.fixedDeposits} familyMembers={familyMembers} />
                  <NomineeFields control={control} errors={errors?.fixedDeposits?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
                </>
              )}
              {currentAssetType === 'PPF' && (
                <>
                  <PPFFields control={control} errors={errors?.ppf} familyMembers={familyMembers} />
                  <NomineeFields control={control} errors={errors?.ppf?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
                </>
              )}
              {currentAssetType === 'STOCKS' && (
                 <>
                  <StocksFields control={control} register={register} errors={errors?.stocks} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
                 </>
              )}
              
              {currentAssetType && !isViewMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              )}
            </fieldset>
          </div>

          <div className="p-6 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Asset
              </Button>
            )}
          </div>
        </form>
      </div>

      {isUploadModalOpen && familyMembers.length > 0 && (
        <UploadDocModal
          member={familyMembers[0] as FamilyMember}
          onClose={() => setIsUploadModalOpen(false)}
          onSave={() => setIsUploadModalOpen(false)}
          initialCategory={assetType}
        />
      )}
    </div>
  );
}
