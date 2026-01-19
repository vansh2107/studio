
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
  PlusCircle,
  Trash2,
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
import { MutualFundsFields } from './asset-forms/mutual-funds-fields';
import { LifeInsuranceFields } from './asset-forms/life-insurance-fields';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JointHolderFields } from './asset-forms/joint-holder-fields';
import { Label } from '../ui/label';
import { DOC_UPLOAD_CATEGORIES } from '@/lib/constants';
import { Input } from '../ui/input';

const jointHolderSchema = z.object({
  name: z.string().min(1, 'Joint holder name is required.'),
});

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


const generalInsuranceSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("GENERAL INSURANCE"),
  generalInsurance: z.object({
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
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
  })
});

const physicalToDematSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("PHYSICAL TO DEMAT"),
  physicalToDemat: z.object({
      clientName: z.string().min(1, "Client name is required."),
      mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
      emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
      nameOnShare: z.string().optional(),
      folioNumber: z.string().optional(),
      companyName: z.string().optional(),
      rtaName: z.string().optional(),
      quantity: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      marketPrice: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      totalValue: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
  })
});

const bondsSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("BONDS"),
  bonds: z.object({
      familyMember: z.string().min(1, "Family member is required."),
      mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^[0-9]{10}$/, "Mobile number must contain only digits"),
      emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
      issuer: z.string().min(1, "Issuer is required."),
      isin: z.string().optional(),
      bondPrice: z.preprocess((a) => (a === '' ? undefined : parseFloat(String(a))), z.number().min(0).optional()),
      bondUnit: z.preprocess((a) => (a === '' ? undefined : parseInt(String(a), 10)), z.number().int().min(1).optional()),
      bondAmount: z.number().min(0).optional(),
      purchaseDate: z.string().optional(),
      maturityDate: z.string().optional(),
      nominees: nomineesArraySchema,
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
  })
});

const fdSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("FIXED DEPOSITS"),
  fixedDeposits: z.object({
      investorName: z.string().min(1, "Investor name is required"),
      companyName: z.string().min(1, "Company/Bank Name is required."),
      mobileNumber: z.string().length(10, "Mobile number must be exactly 10 digits").regex(/^[0-9]{10}$/, "Mobile number must contain only digits"),
      emailAddress: z.string().email("Invalid email address").optional().or(z.literal("")),
      fdName: z.string().optional(),
      fdNumber: z.string().optional(),
      depositedAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      periodMonth: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().min(0).max(999).optional()),
      periodDays: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().min(0).max(365).optional()),
      interestRate: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().min(0).max(100).optional()),
      maturityAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      purchaseDate: z.string().optional(),
      maturityDate: z.string().optional(),
      nominees: nomineesArraySchema,
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
  })
});

const ppfSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("PPF"),
  ppf: z.object({
      familyMemberName: z.string().min(1, "Family member is required."),
      bankName: z.string().min(1, "Bank name is required."),
      bankAccountNumber: z.string().min(1, 'Bank account number is required'),
      contributedAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      balance: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
      openingDate: z.string().optional(),
      matureDate: z.string().optional(),
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
      nominees: nomineesArraySchema,
  })
});

const stocksSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("STOCKS"),
  stocks: z.object({
      holderName: z.string().min(1, "Holder name is required."),
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
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
  })
});

const lifeInsuranceSchema = z.object({
    familyHead: z.string().min(1, "Family Head is required."),
    assetType: z.literal("LIFE INSURANCE"),
    lifeInsurance: z.object({
        familyMember: z.string().min(1, "Family member is required."),
        company: z.string().min(1, "Company is required."),
        policyNumber: z.string().min(1, "Policy Number is required."),
        planName: z.string().optional(),
        sumAssured: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
        premiumAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
        policyStartDate: z.string().optional(),
        policyEndDate: z.string().optional(),
        nominees: nomineesArraySchema,
        jointHolders: z.array(jointHolderSchema).max(3).optional(),
    })
});

const mutualFundsSchema = z.object({
  familyHead: z.string().min(1, "Family Head is required."),
  assetType: z.literal("MUTUAL FUNDS"),
  mutualFunds: z.object({
      familyMember: z.string().min(1, "Family member is required."),
      folioNumber: z.string().min(1, "Folio number is required."),
      amc: z.string().min(1, "AMC is required."),
      schemeName: z.string().min(1, "Scheme name is required."),
      investedAmount: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().min(0, "Must be positive").optional()),
      nominees: nomineesArraySchema,
      jointHolders: z.array(jointHolderSchema).max(3).optional(),
  })
});


const assetFormSchema = z.discriminatedUnion("assetType", [
  generalInsuranceSchema,
  physicalToDematSchema,
  bondsSchema,
  fdSchema,
  ppfSchema,
  stocksSchema,
  lifeInsuranceSchema,
  mutualFundsSchema,
]);


type FormData = z.infer<typeof assetFormSchema>;

interface UploadItem {
  id: number;
  file: File | null;
}

function DocumentUploadSection({ onUpload }: { onUpload: (files: File[]) => void }) {
  const [documents, setDocuments] = useState<UploadItem[]>([{ id: Date.now(), file: null }]);

  const handleAddRow = () => {
    setDocuments([...documents, { id: Date.now(), file: null }]);
  };

  const handleRemoveRow = (id: number) => {
    if (documents.length > 1) {
      setDocuments(documents.filter(item => item.id !== id));
    } else {
      setDocuments([{ id: Date.now(), file: null }])
    }
  };
  
  const handleUpdate = (id: number, value: File | null) => {
    setDocuments(documents.map(item => (item.id === id ? { ...item, file: value } : item)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0] || null;
    handleUpdate(id, file);
  };
  
  // This is a dummy onUpload for now as we are not saving the files yet
  useEffect(() => {
    const validFiles = documents.map(d => d.file).filter((f): f is File => f !== null);
    onUpload(validFiles);
  }, [documents, onUpload]);


  return (
    <div className="space-y-4 pt-4 border-t mt-6">
        <h3 className="font-semibold text-lg">Document Upload</h3>
        {documents.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2 items-center">
            <div className="space-y-1">
              {index === 0 && <Label>File</Label>}
              <Input type="file" onChange={e => handleFileChange(e, item.id)} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveRow(item.id)}
              className="text-destructive hover:text-destructive self-end"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddRow}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Another Document
        </Button>
    </div>
  );
}


export function AddAssetModal({
  isOpen,
  onClose,
  familyHeads,
  onSave,
  assetToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  familyHeads: Client[];
  onSave: (asset: Asset) => void;
  assetToEdit?: Asset | null;
}) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const defaultFormValues = useMemo(() => {
    if (assetToEdit) {
      const { id, familyHeadId, familyHeadName, ...restOfAsset } = assetToEdit;
      return {
        familyHead: familyHeadId,
        ...(restOfAsset as any),
      };
    }
    return {
      familyHead: '',
      assetType: undefined,
    };
  }, [assetToEdit]);

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
    defaultValues: defaultFormValues,
    shouldUnregister: false,
    mode: 'onSubmit',
  });

  const assetType = watch('assetType');
  const familyHeadId = watch('familyHead');

  useEffect(() => {
    reset(defaultFormValues);
  }, [assetToEdit, reset, defaultFormValues]);


  const familyMembers = useMemo(() => {
    if (!familyHeadId) return [];
    const head = familyHeads.find((h) => h.id === familyHeadId);
    return head ? [{
      ...head,
      id: head.id,
      firstName: head.firstName,
      lastName: head.lastName,
      clientId: head.id,
      relation: 'Head'
    } as Client, ...mockFamilyMembers.filter(m => m.clientId === familyHeadId)] : [];
  }, [familyHeadId, familyHeads]);
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      const head = familyHeads.find(h => h.id === data.familyHead);
      if (!head) {
        toast({ 
          title: 'Error', 
          description: 'Please select a valid family head.',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }

      const newAsset: Asset = {
        id: assetToEdit?.id ?? crypto.randomUUID(),
        familyHeadId: head.id,
        familyHeadName: `${head.firstName} ${head.lastName}`,
        ...data
      };
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(newAsset);
      setIsSaving(false);
      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to save asset. Please try again.',
        variant: 'destructive'
      });
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div
        className={cn(
          'bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh] overflow-hidden',
          'w-full max-w-4xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn('absolute top-4 right-4 close-icon')}
          >
            <X />
          </Button>
          <h2 className="font-semibold text-lg">
            {assetToEdit ? 'Edit Asset' : 'Add Asset'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
            {Object.keys(errors).length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="font-semibold text-sm text-destructive mb-2">Please fix the following errors:</p>
                <ul className="text-sm text-destructive space-y-1">
                  {Object.entries(errors).map(([key, value]: any) => {
                    const renderError = (err: any, fieldName: string = ''): React.ReactNode => {
                      if (!err) return null;
                      if (err.message) {
                        return <li key={fieldName}>{fieldName ? `• ${fieldName}: ${err.message}` : `• ${err.message}`}</li>;
                      }
                      if (typeof err === 'object') {
                        return Object.entries(err).map(([nestedKey, nestedValue]: any) => {
                          const fullFieldName = fieldName ? `${fieldName}.${nestedKey}` : nestedKey;
                          return renderError(nestedValue, fullFieldName);
                        });
                      }
                      return null;
                    };
                    return renderError(value, key);
                  })}
                </ul>
              </div>
            )}
            <fieldset disabled={false} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <Controller
                  name="familyHead"
                  control={control}
                  render={({ field }) => {
                    const selectedHead = familyHeads.find(h => h.id === field.value);
                    return (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Family Head</label>
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={!!assetToEdit}>
                          <SelectTrigger>
                            <SelectValue placeholder="Family Head">
                              {selectedHead ? `${selectedHead.firstName} ${selectedHead.lastName}` : 'Family Head'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {familyHeads.map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.firstName} {h.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.familyHead && <p className="text-sm text-destructive mt-1">{errors.familyHead.message}</p>}
                      </div>
                    );
                  }}
                />
                <Controller
                  name="assetType"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Asset Type</label>
                      <Select onValueChange={(value) => {
                        const currentFamilyHead = getValues('familyHead');
                        reset({
                          familyHead: currentFamilyHead,
                          assetType: value as any,
                        });
                      }} value={field.value || ''} disabled={!!assetToEdit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Asset Type">
                            {field.value || 'Asset Type'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_TYPES.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.assetType && <p className="text-sm text-destructive mt-1">{errors.assetType.message}</p>}
                    </div>
                  )}
                />
              </div>

              {assetType === 'GENERAL INSURANCE' && <GeneralInsuranceFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              {assetType === 'PHYSICAL TO DEMAT' && <PhysicalToDematFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} setValue={setValue} />}
              {assetType === 'BONDS' && <BondFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              {assetType === 'FIXED DEPOSITS' && <FDFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              {assetType === 'PPF' && <PPFFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              {assetType === 'STOCKS' && <StocksFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              {assetType === 'MUTUAL FUNDS' && <MutualFundsFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              {assetType === 'LIFE INSURANCE' && <LifeInsuranceFields control={control} register={register} errors={errors as any} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />}
              
               {assetType && !showDocuments && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDocuments(true)}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Document
                </Button>
              )}

              {showDocuments && <DocumentUploadSection onUpload={setUploadedFiles} />}
            </fieldset>
          </div>

          <div className="p-6 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Asset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

    
