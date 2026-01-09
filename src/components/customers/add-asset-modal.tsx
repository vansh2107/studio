
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
import { NomineeFields } from './asset-forms/nominee-fields';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { UploadDocModal } from '../doc-vault/upload-doc-modal';

// --- Zod Schemas for each asset type ---

const nomineeSchema = z.object({
  name: z.string().min(1, 'Nominee name is required.'),
  allocation: z.preprocess(
    (a) => (a === '' ? undefined : parseFloat(String(a))),
    z.number().min(0, 'Must be positive').max(100, 'Cannot exceed 100').optional()
  ),
  dateOfBirth: z.string().optional(),
});

const nomineesArraySchema = z.array(nomineeSchema).optional().superRefine((nominees, ctx) => {
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


const bondsSchema = z.object({
  familyMember: z.string().min(1, "Family member is required."),
  issuer: z.string().min(1, "Issuer is required."),
  isin: z.string().optional(),
  bondPrice: z.preprocess((a) => parseFloat(String(a)), z.number().min(0)),
  bondUnit: z.preprocess((a) => parseInt(String(a), 10), z.number().int().min(1)),
  bondAmount: z.number().min(0),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  maturityDate: z.string().min(1, "Maturity date is required"),
  transactionType: z.string().min(1, "Transaction type is required"),
  nominees: nomineesArraySchema,
});

const fdSchema = z.object({
  companyName: z.string().min(1, "Company/Bank Name is required."),
  investorName: z.string().min(1, "Investor name is required"),
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
  jointHolders: z.array(z.object({ name: z.string().optional() })).optional(),
  dpId: z.string().min(1, "DPID is required."),
  dpName: z.string().min(1, "DP Name is required."),
  bankName: z.string().min(1, "Bank name is required."),
  bankAccountNumber: z.string().min(1, "Bank Account Number is required."),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits."),
  emailAddress: z.string().email().optional(),
  nominees: nomineesArraySchema,
});

const physicalToDematSchema = z.object({
    clientName: z.string().min(1, "Client name is required."),
    nameOnShare: z.string().optional(),
    folioNumber: z.string().optional(),
    companyName: z.string().optional(),
    rtaName: z.string().optional(),
    quantity: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
    marketPrice: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
    totalValue: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
    jointHolders: z.array(z.object({ name: z.string().min(1, 'Joint holder name is required') })).optional(),
    nominees: nomineesArraySchema,
});

const generalInsuranceSchema = z.object({
  familyMember: z.string().min(1, "Family member is required."),
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
  nominees: nomineesArraySchema,
});

// Discriminated union for dynamic validation
const assetFormSchema = z.discriminatedUnion("assetType", [
  z.object({ assetType: z.literal("BONDS"), familyHead: z.string().min(1), bonds: bondsSchema }),
  z.object({ assetType: z.literal("FIXED DEPOSITS"), familyHead: z.string().min(1), fixedDeposits: fdSchema }),
  z.object({ assetType: z.literal("PPF"), familyHead: z.string().min(1), ppf: ppfSchema }),
  z.object({ assetType: z.literal("STOCKS"), familyHead: z.string().min(1), stocks: stocksSchema }),
  z.object({ assetType: z.literal("PHYSICAL TO DEMAT"), familyHead: z.string().min(1), physicalToDemat: physicalToDematSchema }),
  z.object({ assetType: z.literal("GENERAL INSURANCE"), familyHead: z.string().min(1), generalInsurance: generalInsuranceSchema }),
  z.object({ assetType: z.literal("LIFE INSURANCE"), familyHead: z.string().min(1) }),
  z.object({ assetType: z.literal("MUTUAL FUNDS"), familyHead: z.string().min(1) }),
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
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      assetType: undefined,
      familyHead: '',
    },
  });

  const assetType = watch('assetType');
  const familyHeadId = watch('familyHead');

  useEffect(() => {
    if (assetToEdit) {
      const defaultData = {
        familyHead: assetToEdit.familyHeadId,
        assetType: assetToEdit.assetType,
        bonds: assetToEdit.bonds,
        fixedDeposits: assetToEdit.fixedDeposits,
        ppf: assetToEdit.ppf,
        stocks: assetToEdit.stocks,
        physicalToDemat: assetToEdit.physicalToDemat,
        generalInsurance: assetToEdit.generalInsurance,
      };
      reset(defaultData as any);
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

    const asset: Asset = {
      id: assetToEdit?.id ?? `asset-${Date.now()}`,
      familyHeadId: head.id,
      familyHeadName: `${head.firstName} ${head.lastName}`,
      assetType: data.assetType,
      bonds: data.assetType === 'BONDS' ? data.bonds : undefined,
      fixedDeposits: data.assetType === 'FIXED DEPOSITS' ? data.fixedDeposits : undefined,
      ppf: data.assetType === 'PPF' ? data.ppf : undefined,
      stocks: data.assetType === 'STOCKS' ? data.stocks : undefined,
      physicalToDemat: data.assetType === 'PHYSICAL TO DEMAT' ? data.physicalToDemat : undefined,
      generalInsurance: data.assetType === 'GENERAL INSURANCE' ? data.generalInsurance : undefined,
    };

    setTimeout(() => {
      onSave(asset);
      setIsSaving(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

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
          assetType ? 'w-4/5' : 'w-2/5'
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
                    <Select {...field} onValueChange={field.onChange} disabled={!!assetToEdit}>
                      <SelectTrigger>
                        <SelectValue placeholder="Family Head" />
                      </SelectTrigger>
                      <SelectContent>
                        {familyHeads.map((h) => (
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
                    <Select {...field} onValueChange={(value) => {
                      const currentFamilyHead = watch('familyHead');
                      const newValues = {
                        assetType: value,
                        familyHead: currentFamilyHead,
                      };
                      reset(newValues as any);
                    }} disabled={!!assetToEdit}>
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

              {assetType === 'BONDS' && <BondFields control={control} register={register} errors={(errors as any).bonds} familyMembers={familyMembers} watch={watch} setValue={setValue} />}
              {assetType === 'FIXED DEPOSITS' && <FDFields control={control} register={register} errors={(errors as any).fixedDeposits} familyMembers={familyMembers} />}
              {assetType === 'PPF' && <PPFFields control={control} register={register} errors={(errors as any).ppf} familyMembers={familyMembers} />}
              {assetType === 'STOCKS' && <StocksFields control={control} register={register} errors={(errors as any).stocks} familyMembers={familyMembers} watch={watch} setValue={setValue} />}
              {assetType === 'PHYSICAL TO DEMAT' && <PhysicalToDematFields control={control} register={register} errors={(errors as any).physicalToDemat} familyMembers={familyMembers} watch={watch} setValue={setValue} />}
              {assetType === 'GENERAL INSURANCE' && <GeneralInsuranceFields control={control} errors={(errors as any)} familyMembers={familyMembers} />}

              {assetType && !['STOCKS', 'PHYSICAL TO DEMAT'].includes(assetType) && (
                <NomineeFields 
                    control={control} 
                    register={register} 
                    errors={(errors as any)?.nominees} 
                    familyMembers={familyMembers} 
                    watch={watch}
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
            </fieldset>
          </div>

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
      </div>

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
