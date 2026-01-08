
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task, TaskStatus } from '@/hooks/use-tasks';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TASK_CATEGORIES,
  MUTUAL_FUND_SERVICES,
  AMC_NAMES,
  INSURANCE_SERVICES,
  INSURANCE_COMPANIES,
  FINANCIAL_SERVICES,
  REINVESTMENT_REASONS,
  BOND_SUB_CATEGORIES,
  BOND_TRANSACTION_TYPES,
  FIXED_DEPOSIT_SUB_CATEGORIES,
  PPF_SUB_CATEGORIES,
  GENERAL_INSURANCE_SERVICES,
  GENERAL_INSURANCE_TYPES
} from '@/lib/constants';
import { getAllClients, getAllAssociates, getAllRMs, familyMembers as mockFamilyMembers, getAllAdmins } from '@/lib/mock-data';
import { Combobox } from '@/components/ui/combobox';
import { format, parse, parseISO } from 'date-fns';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { BondDetails, FixedDepositDetails, PpfDetails, GeneralInsuranceDetails } from '@/lib/types';

/* ---------- VALIDATION ---------- */

const numberField = z.preprocess(
  (a) => {
    if (a === '' || a === null || a === undefined) return undefined;
    const parsed = parseFloat(String(a));
    return isNaN(parsed) ? undefined : parsed;
  },
  z.number().positive("Amount must be positive").optional()
);

const baseTaskSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  category: z.string().min(1, 'Category is required'),
  rmName: z.string().optional(),
  serviceableRM: z.string().optional(),
  dueDate: z.string().min(1, 'Due date and time are required'),
  description: z.string().max(300, 'Description cannot exceed 300 characters.').optional(),
});

const mutualFundSchema = z.object({
  familyHead: z.string(),
  service: z.string().min(1, "Service is required"),
  folioNo: z.string().min(1, "Folio No. is required"),
  nameOfAMC: z.string().min(1, "Name of AMC is required"),
  amount: z.number().positive("Amount must be positive"),
  documentStatus: z.enum(["Received", "Pending"]),
  signatureStatus: z.enum(["Done", "Pending"]),
  amcSubmissionStatus: z.enum(["Done", "Pending"]),
});

const insuranceSchema = z.object({
  familyHead: z.string(),
  typeOfService: z.string().optional(),
  associate: z.string(),
  policyNo: z.string().min(1, "Policy No. is required"),
  company: z.string().min(1, "Company is required"),
  
  insuranceType: z.enum(['Financial', 'Non-Financial']),
  financialService: z.string().optional(),
  nonFinancialDate: z.string().optional(),

  maturityDueDate: z.string().optional(),
  maturityAmount: numberField,

  deathClaimProcessDate: z.string().optional(),
  surrenderProcessDate: z.string().optional(),

  amountStatus: z.enum(["Credited", "Pending"]).optional(),
  
  receivedDate: z.string().optional(),
  receivedAmount: numberField,
  reinvestmentStatus: z.string().optional(),
  reinvestmentApproxDate: z.string().optional(),
  reinvestmentReason: z.string().optional(),

}).superRefine((data, ctx) => {
  if (data.insuranceType === 'Non-Financial') {
    if (!data.typeOfService) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Service is required for Non-Financial types.", path: ["typeOfService"] });
    }
    if (!data.nonFinancialDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date is required for Non-Financial types.", path: ["nonFinancialDate"] });
    }
  }

  if (data.insuranceType === 'Financial') {
    if (!data.financialService) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Financial Service is required.", path: ["financialService"] });
    }

    if (data.financialService === 'Maturity') {
      if (!data.maturityDueDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maturity Due Date is required.", path: ["maturityDueDate"] });
      if (!data.maturityAmount) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maturity Amount is required.", path: ["maturityAmount"] });
    }
    if (data.financialService === 'Death Claim') {
      if (!data.deathClaimProcessDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Death Claim Process Date is required.", path: ["deathClaimProcessDate"] });
    }
    if (data.financialService === 'Surrender') {
      if (!data.surrenderProcessDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surrender Process Date is required.", path: ["surrenderProcessDate"] });
    }
    
    if (data.amountStatus === 'Credited') {
      if (!data.receivedDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Received Date is required.", path: ["receivedDate"] });
      if (!data.receivedAmount) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Received Amount is required.", path: ["receivedAmount"] });
      if (!data.reinvestmentStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Re-investment Status is required.", path: ["reinvestmentStatus"] });

      if (data.reinvestmentStatus === 'Pending') {
        if (!data.reinvestmentApproxDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Approx Date is required.", path: ["reinvestmentApproxDate"] });
      }
      if (data.reinvestmentStatus === 'No') {
        if (!data.reinvestmentReason) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Reason is required.", path: ["reinvestmentReason"] });
      }
    }
  }
});

const bondDetailsSchema = z.object({
    subCategory: z.string().min(1, 'Sub-category is required'),
    isin: z.string().min(1, 'ISIN is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    bondPrice: z.number().positive('Bond Price must be positive'),
    bondUnit: z.number().int().positive('Bond Unit must be a positive integer'),
    bondAmount: z.number(),
    purchaseDate: z.string().min(1, 'Purchase Date is required'),
    maturityDate: z.string().min(1, 'Maturity Date is required'),
    transactionType: z.string().min(1, 'Transaction Type is required'),
    nomineeName: z.string().min(1, 'Nominee Name is required'),
    familyMemberName: z.string().min(1, 'Family Member Name is required'),
});

const fixedDepositDetailsSchema = z.object({
    subCategory: z.string().min(1, 'Sub-category is required'),
    familyMemberName: z.string().min(1, 'Family Member Name is required'),
    issuer: z.string().min(1, 'Issuer/Company is required'),
    purchaseDate: z.string().min(1, 'Date of Purchase is required'),
    maturityDate: z.string().min(1, 'Date of Maturity is required'),
    interest: z.number().positive('Interest must be greater than 0'),
    period: z.string().regex(/^\d{8}$/, 'Period must be in DDMMYYYY format'),
}).refine(data => new Date(data.maturityDate) > new Date(data.purchaseDate), {
    message: "Date of Maturity must be after Date of Purchase",
    path: ["maturityDate"],
});

const ppfDetailsSchema = z.object({
    subCategory: z.string().min(1, 'Sub-category is required'),
    familyMemberName: z.string().min(1, 'Family Member Name is required'),
    bankName: z.string().min(1, 'Bank Name is required'),
    contributedAmount: z.number().positive('Contributed Amount must be positive'),
    balance: z.number().positive('Balance must be positive'),
    openingDate: z.string().min(1, 'Date of Opening is required'),
    matureDate: z.string().min(1, 'Date of Mature is required'),
});

const generalInsuranceDetailsSchema = z.object({
    serviceSubCategory: z.string().min(1, 'Service Sub-Category is required'),
    insuranceType: z.string().min(1, 'Insurance Type is required'),
    familyMemberName: z.string().min(1, 'Family Member Name is required'),
    company: z.string().min(1, 'Company is required'),
    premiumAmount: z.number().positive('Premium Amount must be positive').optional(),
    description: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.serviceSubCategory === 'RENEWAL' && !data.premiumAmount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Premium Amount is required for renewals.',
            path: ['premiumAmount'],
        });
    }
});


const taskSchema = baseTaskSchema.extend({
  mutualFund: mutualFundSchema.optional(),
  insurance: insuranceSchema.optional(),
  bondDetails: bondDetailsSchema.optional(),
  fixedDeposit: fixedDepositDetailsSchema.optional(),
  ppf: ppfDetailsSchema.optional(),
  generalInsurance: generalInsuranceDetailsSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.category === 'Mutual Funds' && !data.mutualFund) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Mutual Fund details are required.",
      path: ["mutualFund"],
    });
  }
  if (data.category === 'Life Insurance' && !data.insurance) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Insurance details are required.",
      path: ["insurance"],
    });
  }
  if (data.category === 'Bonds' && !data.bondDetails) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bond details are required.", path: ["bondDetails"] });
  }
  if (data.category === 'Fixed Deposit' && !data.fixedDeposit) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fixed Deposit details are required.", path: ["fixedDeposit"] });
  }
   if (data.category === 'PPF' && !data.ppf) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "PPF details are required.", path: ["ppf"] });
  }
   if (data.category === 'General Insurance' && !data.generalInsurance) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "General Insurance details are required.", path: ["generalInsurance"] });
  }
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
}

const sortedMutualFundServices = [...MUTUAL_FUND_SERVICES]
  .slice()
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

const sortedNonFinancialInsuranceServices = [...INSURANCE_SERVICES]
  .filter(service => !FINANCIAL_SERVICES.includes(service as any))
  .slice()
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

export function CreateTaskModal({ onClose, onSave, task }: CreateTaskModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!task;

  const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];
  const isTerminal = isEditMode && task ? terminalStatuses.includes(task.status) : false;

  const allRms = useMemo(() => getAllRMs().map(rm => ({ label: `${rm.name} (RM)`, value: rm.id })), []);

  const clientOptions = useMemo(() => {
    const heads = getAllClients().map(c => ({
      label: `${c.firstName} ${c.lastName} (Head)`,
      value: c.id,
      relation: 'Head'
    }));

    const members = mockFamilyMembers.map(m => ({
      label: `${m.firstName} ${m.lastName} (${m.relation})`,
      value: m.id,
      clientId: m.clientId,
      relation: m.relation,
    }));

    return [...heads, ...members].sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      clientName: '',
      category: '',
      rmName: '',
      serviceableRM: '',
      dueDate: '',
      description: '',
      insurance: {
        insuranceType: 'Non-Financial',
        amountStatus: 'Pending',
      }
    },
  });

  const selectedCategory = watch('category');
  const clientNameValue = watch('clientName');
  const descriptionValue = watch('description') || '';
  const insuranceType = watch('insurance.insuranceType');
  const financialService = watch('insurance.financialService');
  const amountStatus = watch('insurance.amountStatus');
  const reinvestmentStatus = watch('insurance.reinvestmentStatus');
  const bondPrice = watch('bondDetails.bondPrice');
  const bondUnit = watch('bondDetails.bondUnit');
  const generalInsuranceService = watch('generalInsurance.serviceSubCategory');


  /* ---------- AUTO-CALCULATION & POPULATION ---------- */

  useEffect(() => {
      if (typeof bondPrice === 'number' && typeof bondUnit === 'number') {
          setValue('bondDetails.bondAmount', bondPrice * bondUnit, { shouldValidate: true });
      }
  }, [bondPrice, bondUnit, setValue]);
  
  const { familyHead, assignedAssociate, assignedRM, assignedAdmin } = useMemo(() => {
    if (!clientNameValue) return { familyHead: null, assignedAssociate: null, assignedRM: null, assignedAdmin: null };

    const selectedOption = clientOptions.find(opt => opt.value === clientNameValue);
    if (!selectedOption) return { familyHead: null, assignedAssociate: null, assignedRM: null, assignedAdmin: null };

    const headId = 'clientId' in selectedOption ? selectedOption.clientId : selectedOption.value;
    const head = getAllClients().find(c => c.id === headId);
    if (!head) return { familyHead: null, assignedAssociate: null, assignedRM: null, assignedAdmin: null };

    const associate = getAllAssociates().find(a => a.id === head.associateId);
    const rm = associate ? getAllRMs().find(r => r.id === associate.rmId) : undefined;
    const admin = rm ? getAllAdmins().find(adm => adm.id === rm.adminId) : undefined;

    return { familyHead: head, assignedAssociate: associate, assignedRM: rm, assignedAdmin: admin };
  }, [clientNameValue, clientOptions]);

  const familyHeadName = familyHead ? `${familyHead.firstName} ${familyHead.lastName}` : '';
  const associateName = assignedAssociate?.name || 'N/A';
  const rmName = assignedRM?.name || 'No RM assigned';

  useEffect(() => {
    setValue('rmName', rmName, { shouldValidate: true });
    
    const memberName = clientOptions.find(c => c.value === clientNameValue)?.label || '';

    if (familyHeadName && selectedCategory === 'Mutual Funds')
      setValue('mutualFund.familyHead', familyHeadName, { shouldValidate: true });

    if (familyHeadName && selectedCategory === 'Life Insurance')
      setValue('insurance.familyHead', familyHeadName, { shouldValidate: true });

    if (associateName && selectedCategory === 'Life Insurance')
      setValue('insurance.associate', associateName, { shouldValidate: true });
    
    if (memberName && selectedCategory === 'Bonds')
      setValue('bondDetails.familyMemberName', memberName, { shouldValidate: true });

    if (memberName && selectedCategory === 'Fixed Deposit')
      setValue('fixedDeposit.familyMemberName', memberName, { shouldValidate: true });
    
    if (memberName && selectedCategory === 'PPF')
      setValue('ppf.familyMemberName', memberName, { shouldValidate: true });
    
    if (memberName && selectedCategory === 'General Insurance')
      setValue('generalInsurance.familyMemberName', memberName, { shouldValidate: true });

  }, [familyHeadName, associateName, rmName, selectedCategory, setValue, clientNameValue, clientOptions]);

  /* ---------- CATEGORY CHANGE HANDLING ---------- */

  useEffect(() => {
    // When category changes, we initialize the relevant sub-object if it doesn't exist
    // but we don't clear other sub-objects to preserve data if user switches back.
    if (selectedCategory === 'Life Insurance' && !watch('insurance')) {
      setValue('insurance', {
        insuranceType: 'Non-Financial',
        amountStatus: 'Pending',
        familyHead: familyHeadName,
        associate: associateName,
        policyNo: '',
        company: '',
      });
    }
  }, [selectedCategory, setValue, watch, familyHeadName, associateName]);


  /* ---------- LOAD EXISTING TASK ---------- */

  useEffect(() => {
    if (task) {
      // Create a mutable copy of the task to format dates
      const taskData: Partial<TaskFormData> = { ...task };

      const formatDateForInput = (dateString?: string | null, type: 'datetime' | 'date' = 'date') => {
        if (!dateString) return '';
        try {
          const date = parseISO(dateString);
          if (isNaN(date.getTime())) { // Try another format for older data
             const parsed = new Date(dateString.replace(/-/g, '/'));
             if (isNaN(parsed.getTime())) return dateString; // give up
             return type === 'datetime' ? format(parsed, "yyyy-MM-dd'T'HH:mm") : format(parsed, "yyyy-MM-dd");
          }
          return type === 'datetime' ? format(date, "yyyy-MM-dd'T'HH:mm") : format(date, "yyyy-MM-dd");
        } catch {
          return dateString; // Return original if parsing fails
        }
      };

      taskData.dueDate = formatDateForInput(task.dueDate, 'datetime');
      if (taskData.insurance) {
          taskData.insurance.nonFinancialDate = formatDateForInput(task.insurance.nonFinancialDate);
          taskData.insurance.maturityDueDate = formatDateForInput(task.insurance.maturityDueDate);
          taskData.insurance.deathClaimProcessDate = formatDateForInput(task.insurance.deathClaimProcessDate);
          taskData.insurance.surrenderProcessDate = formatDateForInput(task.insurance.surrenderProcessDate);
          taskData.insurance.receivedDate = formatDateForInput(task.insurance.receivedDate);
          taskData.insurance.reinvestmentApproxDate = formatDateForInput(task.insurance.reinvestmentApproxDate);
      }
      if (taskData.bondDetails) {
          taskData.bondDetails.purchaseDate = formatDateForInput(task.bondDetails.purchaseDate);
          taskData.bondDetails.maturityDate = formatDateForInput(task.bondDetails.maturityDate);
      }
       if (taskData.fixedDeposit) {
          taskData.fixedDeposit.purchaseDate = formatDateForInput(task.fixedDeposit.purchaseDate);
          taskData.fixedDeposit.maturityDate = formatDateForInput(task.fixedDeposit.maturityDate);
      }
      if (taskData.ppf) {
          taskData.ppf.openingDate = formatDateForInput(task.ppf.openingDate);
          taskData.ppf.matureDate = formatDateForInput(task.ppf.matureDate);
      }
      
      reset(taskData as TaskFormData);
    } else {
      reset({
        clientName: '',
        category: '',
        rmName: '',
        serviceableRM: '',
        dueDate: '',
        description: '',
        mutualFund: undefined,
        insurance: { insuranceType: 'Non-Financial', amountStatus: 'Pending' },
        bondDetails: undefined,
        fixedDeposit: undefined,
        ppf: undefined,
        generalInsurance: undefined,
      });
    }
  }, [task, reset]);

  /* ---------- SAVE ---------- */

  const processSave = (data: TaskFormData) => {
    setIsSaving(true);
    
    // Use a short timeout to simulate async operation
    setTimeout(() => {
      const selectedClient = clientOptions.find(c => c.value === data.clientName);

      const submissionData: Task = {
        ...(task || {}), // Start with existing task data if in edit mode
        ...data, // Overwrite with new form data
        id: task?.id || `task-${Date.now()}`,
        createDate: task?.createDate || new Date().toISOString(),
        status: task?.status || 'Pending',
        clientId: selectedClient?.value || 'N/A',
        clientName: selectedClient?.label || data.clientName,
        familyHeadId: familyHead?.id,
        associateId: assignedAssociate?.id,
        rmId: assignedRM?.id,
        adminId: assignedAdmin?.id,
        dueDate: new Date(data.dueDate).toISOString(), // Ensure ISO format
      };

      // Clean up objects for other categories
      if (submissionData.category !== 'Mutual Funds') delete submissionData.mutualFund;
      if (submissionData.category !== 'Life Insurance') delete submissionData.insurance;
      if (submissionData.category !== 'Bonds') delete submissionData.bondDetails;
      if (submissionData.category !== 'Fixed Deposit') delete submissionData.fixedDeposit;
      if (submissionData.category !== 'PPF') delete submissionData.ppf;
      if (submissionData.category !== 'General Insurance') delete submissionData.generalInsurance;

      onSave(submissionData);

      toast({
        title: isEditMode ? 'Task Updated' : 'Task Created',
        description: `The task for "${submissionData.clientName}" has been successfully saved.`,
      });

      setIsSaving(false);
    }, 400);
  };

  /* ---------- UI ---------- */

  return (
    <div className="relative p-1 max-h-[80vh] overflow-y-auto pr-4 -mr-4">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 z-[1002] close-icon">
        <X className="h-4 w-4" />
      </Button>

      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold">
          {isEditMode ? 'Edit Task' : 'Create Task Manually'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isTerminal
            ? 'This task is locked and cannot be edited.'
            : isEditMode
            ? 'Update the details for this task.'
            : 'Fill in the details to create a new task.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(processSave)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="space-y-1">
            <Label htmlFor="clientName">Client Name</Label>
            <Controller
              name="clientName"
              control={control}
              render={({ field }) => (
                <Combobox
                  options={clientOptions}
                  value={field.value}
                  onChange={(value) => setValue('clientName', value, { shouldValidate: true })}
                  placeholder="Select Client"
                  searchPlaceholder="Search clients..."
                  emptyText="No matching clients."
                  disabled={isEditMode}
                />
              )}
            />
            {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isTerminal || isEditMode}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="rmName">Assigned RM</Label>
            <Input id="rmName" {...register('rmName')} readOnly disabled />
          </div>

          <div className="space-y-1">
            <Label htmlFor="serviceableRM">Serviceable RM (Optional)</Label>
            <Controller
              name="serviceableRM"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? undefined} disabled={isTerminal}>
                  <SelectTrigger id="serviceableRM">
                    <SelectValue placeholder="Select Serviceable RM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {allRms.map(rm => (
                      <SelectItem key={rm.value} value={rm.label}>{rm.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dueDate">Due Date & Time</Label>
            <Input id="dueDate" type="datetime-local" {...register('dueDate')} disabled={isTerminal} />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>
        </div>

        {selectedCategory === 'Mutual Funds' && (
          <div className="space-y-4 pt-4">
            <Separator />
            <h3 className="text-md font-semibold">Mutual Fund Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Family Head</Label>
                <Input {...register('mutualFund.familyHead')} readOnly value={familyHeadName} />
              </div>

              <div className="space-y-1">
                <Label>Service</Label>
                <Controller
                  name="mutualFund.service"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                      <SelectContent>
                        {sortedMutualFundServices.map(service => (
                          <SelectItem key={service} value={service}>{service}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                 {errors.mutualFund?.service && <p className="text-sm text-destructive">{errors.mutualFund.service.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Folio No.</Label>
                <Input {...register('mutualFund.folioNo')} />
                {errors.mutualFund?.folioNo && <p className="text-sm text-destructive">{errors.mutualFund.folioNo.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Name of AMC</Label>
                <Controller
                  name="mutualFund.nameOfAMC"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={AMC_NAMES.map(a => ({ label: a, value: a }))}
                      value={field.value}
                      onChange={(v) => setValue('mutualFund.nameOfAMC', v, { shouldValidate: true })}
                      placeholder="Select AMC"
                    />
                  )}
                />
                {errors.mutualFund?.nameOfAMC && <p className="text-sm text-destructive">{errors.mutualFund.nameOfAMC.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Amount</Label>
                <Input type="number" {...register('mutualFund.amount', { valueAsNumber: true })} />
                {errors.mutualFund?.amount && <p className="text-sm text-destructive">{errors.mutualFund.amount.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Document Status</Label>
                <Controller
                  name="mutualFund.documentStatus"
                  control={control}
                  defaultValue="Pending"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label>Signature Status</Label>
                <Controller
                  name="mutualFund.signatureStatus"
                  control={control}
                  defaultValue="Pending"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label>Document Submitted to AMC</Label>
                <Controller
                  name="mutualFund.amcSubmissionStatus"
                  control={control}
                  defaultValue="Pending"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'Life Insurance' && (
          <div className="space-y-4 pt-4">
            <Separator />
            <h3 className="text-md font-semibold">Insurance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Common Fields */}
              <div className="space-y-1">
                <Label>Family Head</Label>
                <Input {...register('insurance.familyHead')} readOnly value={familyHeadName} />
              </div>
              <div className="space-y-1">
                <Label>Associate</Label>
                <Input {...register('insurance.associate')} readOnly value={associateName} />
              </div>
              <div className="space-y-1">
                <Label>Policy No.</Label>
                <Input {...register('insurance.policyNo')} />
                {errors.insurance?.policyNo && <p className="text-sm text-destructive">{errors.insurance.policyNo.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Company</Label>
                <Controller
                  name="insurance.company"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      options={INSURANCE_COMPANIES.map(c => ({ label: c, value: c }))}
                      value={field.value}
                      onChange={(v) => setValue('insurance.company', v, { shouldValidate: true })}
                      placeholder="Select Company"
                    />
                  )}
                />
                {errors.insurance?.company && <p className="text-sm text-destructive">{errors.insurance.company.message}</p>}
              </div>

              {/* Type Switcher */}
              <div className="md:col-span-2">
                <Label>Type</Label>
                <Controller
                  name="insurance.insuranceType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Non-Financial" id="non-financial" />
                        <Label htmlFor="non-financial">Non-Financial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Financial" id="financial" />
                        <Label htmlFor="financial">Financial</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Non-Financial Flow */}
              {insuranceType === 'Non-Financial' && (
                <>
                  <div className="space-y-1">
                    <Label>Service</Label>
                    <Controller
                      name="insurance.typeOfService"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                          <SelectContent>
                            {sortedNonFinancialInsuranceServices.map(service => (
                              <SelectItem key={service} value={service}>{service}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.insurance?.typeOfService && <p className="text-sm text-destructive">{errors.insurance.typeOfService.message}</p>}
                  </div>
                   <div className="space-y-1">
                    <Label>Date</Label>
                    <Input type="date" {...register('insurance.nonFinancialDate')} />
                    {errors.insurance?.nonFinancialDate && <p className="text-sm text-destructive">{errors.insurance.nonFinancialDate.message}</p>}
                  </div>
                </>
              )}

              {/* Financial Flow */}
              {insuranceType === 'Financial' && (
                <>
                  <div className="md:col-span-2">
                    <Label>Financial Service</Label>
                    <Controller
                      name="insurance.financialService"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger><SelectValue placeholder="Select Financial Service" /></SelectTrigger>
                          <SelectContent>
                            {FINANCIAL_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.insurance?.financialService && <p className="text-sm text-destructive">{errors.insurance.financialService.message}</p>}
                  </div>
                  
                  {/* Financial Service: Maturity */}
                  {financialService === 'Maturity' && (
                    <>
                      <div className="space-y-1">
                        <Label>Maturity Due Date</Label>
                        <Input type="date" {...register('insurance.maturityDueDate')} />
                        {errors.insurance?.maturityDueDate && <p className="text-sm text-destructive">{errors.insurance.maturityDueDate.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label>Maturity Amount</Label>
                        <Input type="number" {...register('insurance.maturityAmount', { valueAsNumber: true })} />
                        {errors.insurance?.maturityAmount && <p className="text-sm text-destructive">{errors.insurance.maturityAmount.message}</p>}
                      </div>
                    </>
                  )}

                   {/* Financial Service: Death Claim */}
                  {financialService === 'Death Claim' && (
                     <div className="space-y-1">
                        <Label>Death Claim Process Date</Label>
                        <Input type="date" {...register('insurance.deathClaimProcessDate')} />
                        {errors.insurance?.deathClaimProcessDate && <p className="text-sm text-destructive">{errors.insurance.deathClaimProcessDate.message}</p>}
                     </div>
                  )}

                  {/* Financial Service: Surrender */}
                  {financialService === 'Surrender' && (
                     <div className="space-y-1">
                        <Label>Surrender Process Date</Label>
                        <Input type="date" {...register('insurance.surrenderProcessDate')} />
                        {errors.insurance?.surrenderProcessDate && <p className="text-sm text-destructive">{errors.insurance.surrenderProcessDate.message}</p>}
                     </div>
                  )}

                  {/* Common Amount Status for Financial */}
                   <div className="md:col-span-2">
                        <Label>Amount Status</Label>
                        <Controller
                          name="insurance.amountStatus"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 mt-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Pending" id="pending" /><Label htmlFor="pending">Pending</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Credited" id="credited" /><Label htmlFor="credited">Received</Label></div>
                            </RadioGroup>
                          )}
                        />
                   </div>

                   {/* If Amount Received */}
                   {amountStatus === 'Credited' && (
                    <>
                        <div className="md:col-span-2"><Separator /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                        <div className="space-y-1">
                          <Label>Received Date</Label>
                          <Input type="date" {...register('insurance.receivedDate')} />
                          {errors.insurance?.receivedDate && <p className="text-sm text-destructive">{errors.insurance.receivedDate.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Label>Received Amount</Label>
                          <Input type="number" {...register('insurance.receivedAmount', { valueAsNumber: true })} />
                          {errors.insurance?.receivedAmount && <p className="text-sm text-destructive">{errors.insurance.receivedAmount.message}</p>}
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label>Re-Investment Status</Label>
                          <Controller
                            name="insurance.reinvestmentStatus"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.insurance?.reinvestmentStatus && <p className="text-sm text-destructive">{errors.insurance.reinvestmentStatus.message}</p>}
                        </div>
                        
                        {reinvestmentStatus === 'Pending' && (
                          <div className="space-y-1">
                            <Label>Approx Date</Label>
                            <Input type="date" {...register('insurance.reinvestmentApproxDate')} />
                             {errors.insurance?.reinvestmentApproxDate && <p className="text-sm text-destructive">{errors.insurance.reinvestmentApproxDate.message}</p>}
                          </div>
                        )}
                        {reinvestmentStatus === 'No' && (
                          <div className="space-y-1">
                            <Label>Reason</Label>
                             <Controller
                                name="insurance.reinvestmentReason"
                                control={control}
                                render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                                    <SelectContent>
                                    {REINVESTMENT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                )}
                            />
                            {errors.insurance?.reinvestmentReason && <p className="text-sm text-destructive">{errors.insurance.reinvestmentReason.message}</p>}
                          </div>
                        )}
                        </div>
                     </>
                   )}
                </>
              )}
            </div>
          </div>
        )}

        {selectedCategory === 'Bonds' && (
            <div className="space-y-4 pt-4">
                <Separator />
                <h3 className="text-md font-semibold">Bond Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Sub-Category</Label>
                        <Controller name="bondDetails.subCategory" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger>
                                <SelectContent>
                                    {BOND_SUB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.bondDetails?.subCategory && <p className="text-sm text-destructive">{errors.bondDetails.subCategory.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label>Name of Family Member</Label>
                        <Input {...register('bondDetails.familyMemberName')} readOnly />
                    </div>
                    <div className="space-y-1">
                        <Label>ISIN</Label>
                        <Input {...register('bondDetails.isin')} />
                        {errors.bondDetails?.isin && <p className="text-sm text-destructive">{errors.bondDetails.isin.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Issuer</Label>
                        <Input {...register('bondDetails.issuer')} />
                        {errors.bondDetails?.issuer && <p className="text-sm text-destructive">{errors.bondDetails.issuer.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Bond Price</Label>
                        <Input type="number" step="0.01" {...register('bondDetails.bondPrice', { valueAsNumber: true })} />
                        {errors.bondDetails?.bondPrice && <p className="text-sm text-destructive">{errors.bondDetails.bondPrice.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Bond Unit</Label>
                        <Input type="number" {...register('bondDetails.bondUnit', { valueAsNumber: true })} />
                        {errors.bondDetails?.bondUnit && <p className="text-sm text-destructive">{errors.bondDetails.bondUnit.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label>Bond Amount</Label>
                        <Input {...register('bondDetails.bondAmount')} readOnly disabled />
                    </div>
                    <div className="space-y-1">
                        <Label>Purchase Date</Label>
                        <Input type="date" {...register('bondDetails.purchaseDate')} />
                        {errors.bondDetails?.purchaseDate && <p className="text-sm text-destructive">{errors.bondDetails.purchaseDate.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label>Maturity Date</Label>
                        <Input type="date" {...register('bondDetails.maturityDate')} />
                        {errors.bondDetails?.maturityDate && <p className="text-sm text-destructive">{errors.bondDetails.maturityDate.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label>Transaction Type</Label>
                        <Controller name="bondDetails.transactionType" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    {BOND_TRANSACTION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.bondDetails?.transactionType && <p className="text-sm text-destructive">{errors.bondDetails.transactionType.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Nominee Name</Label>
                        <Input {...register('bondDetails.nomineeName')} />
                        {errors.bondDetails?.nomineeName && <p className="text-sm text-destructive">{errors.bondDetails.nomineeName.message}</p>}
                    </div>
                </div>
            </div>
        )}

        {selectedCategory === 'Fixed Deposit' && (
            <div className="space-y-4 pt-4">
                <Separator />
                <h3 className="text-md font-semibold">Fixed Deposit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Sub-Category</Label>
                        <Controller name="fixedDeposit.subCategory" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger>
                                <SelectContent>
                                    {FIXED_DEPOSIT_SUB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.fixedDeposit?.subCategory && <p className="text-sm text-destructive">{errors.fixedDeposit.subCategory.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label>Family Member Name</Label>
                        <Input {...register('fixedDeposit.familyMemberName')} readOnly />
                    </div>
                     <div className="space-y-1">
                        <Label>Issuer (Company)</Label>
                        <Input {...register('fixedDeposit.issuer')} />
                        {errors.fixedDeposit?.issuer && <p className="text-sm text-destructive">{errors.fixedDeposit.issuer.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Date of Purchase</Label>
                        <Input type="date" {...register('fixedDeposit.purchaseDate')} />
                        {errors.fixedDeposit?.purchaseDate && <p className="text-sm text-destructive">{errors.fixedDeposit.purchaseDate.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Date of Maturity</Label>
                        <Input type="date" {...register('fixedDeposit.maturityDate')} />
                        {errors.fixedDeposit?.maturityDate && <p className="text-sm text-destructive">{errors.fixedDeposit.maturityDate.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Interest (%)</Label>
                        <Input type="number" step="0.01" {...register('fixedDeposit.interest', { valueAsNumber: true })} />
                        {errors.fixedDeposit?.interest && <p className="text-sm text-destructive">{errors.fixedDeposit.interest.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Period (DDMMYYYY)</Label>
                        <Input {...register('fixedDeposit.period')} maxLength={8} />
                        {errors.fixedDeposit?.period && <p className="text-sm text-destructive">{errors.fixedDeposit.period.message}</p>}
                    </div>
                </div>
            </div>
        )}
        
        {selectedCategory === 'PPF' && (
            <div className="space-y-4 pt-4">
                <Separator />
                <h3 className="text-md font-semibold">PPF Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Sub-Category</Label>
                        <Controller name="ppf.subCategory" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger>
                                <SelectContent>
                                    {PPF_SUB_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.ppf?.subCategory && <p className="text-sm text-destructive">{errors.ppf.subCategory.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Family Member Name</Label>
                        <Input {...register('ppf.familyMemberName')} readOnly />
                    </div>
                    <div className="space-y-1">
                        <Label>Bank Name</Label>
                        <Input {...register('ppf.bankName')} />
                        {errors.ppf?.bankName && <p className="text-sm text-destructive">{errors.ppf.bankName.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Contributed Amount</Label>
                        <Input type="number" {...register('ppf.contributedAmount', { valueAsNumber: true })} />
                        {errors.ppf?.contributedAmount && <p className="text-sm text-destructive">{errors.ppf.contributedAmount.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Balance</Label>
                        <Input type="number" {...register('ppf.balance', { valueAsNumber: true })} />
                        {errors.ppf?.balance && <p className="text-sm text-destructive">{errors.ppf.balance.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Date of Opening</Label>
                        <Input type="date" {...register('ppf.openingDate')} />
                        {errors.ppf?.openingDate && <p className="text-sm text-destructive">{errors.ppf.openingDate.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Date of Mature</Label>
                        <Input type="date" {...register('ppf.matureDate')} />
                        {errors.ppf?.matureDate && <p className="text-sm text-destructive">{errors.ppf.matureDate.message}</p>}
                    </div>
                </div>
            </div>
        )}

        {selectedCategory === 'General Insurance' && (
            <div className="space-y-4 pt-4">
                <Separator />
                <h3 className="text-md font-semibold">General Insurance Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Service Sub-Category</Label>
                        <Controller name="generalInsurance.serviceSubCategory" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                                <SelectContent>
                                    {GENERAL_INSURANCE_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.generalInsurance?.serviceSubCategory && <p className="text-sm text-destructive">{errors.generalInsurance.serviceSubCategory.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label>Insurance Type</Label>
                        <Controller name="generalInsurance.insuranceType" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    {GENERAL_INSURANCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.generalInsurance?.insuranceType && <p className="text-sm text-destructive">{errors.generalInsurance.insuranceType.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label>Family Member Name</Label>
                        <Input {...register('generalInsurance.familyMemberName')} readOnly />
                    </div>
                    <div className="space-y-1">
                        <Label>Company</Label>
                        <Input {...register('generalInsurance.company')} />
                        {errors.generalInsurance?.company && <p className="text-sm text-destructive">{errors.generalInsurance.company.message}</p>}
                    </div>
                    {generalInsuranceService === 'RENEWAL' && (
                       <div className="space-y-1">
                            <Label>Premium Amount</Label>
                            <Input type="number" {...register('generalInsurance.premiumAmount', { valueAsNumber: true })} />
                            {errors.generalInsurance?.premiumAmount && <p className="text-sm text-destructive">{errors.generalInsurance.premiumAmount.message}</p>}
                        </div>
                    )}
                    <div className="md:col-span-2 space-y-1">
                        <Label>Description / Remark</Label>
                        <Textarea {...register('generalInsurance.description')} />
                    </div>
                </div>
            </div>
        )}

        <div className="space-y-1">
          <Label>Description (Optional)</Label>
          <Textarea {...register('description')} maxLength={300} disabled={isTerminal}/>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{errors.description?.message}</span>
            <span>{descriptionValue.length} / 300</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {!isTerminal && (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Save Task'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
