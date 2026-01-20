
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/hooks/use-tasks';
import { TaskStatus, TaskStatus2 } from '@/lib/constants';
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
  GENERAL_INSURANCE_TASK_SERVICES,
  GENERAL_INSURANCE_TASK_SUB_CATEGORIES,
  FD_TASK_SERVICES,
  BONDS_TASK_SERVICES,
  PPF_TASK_SERVICES,
  PHYSICAL_TO_DEMAT_SERVICES,
  TASK_STATUS_2_OPTIONS,
  STOCKS_TASK_SERVICES,
  POLICY_NUMBERS,
  FOLIO_NUMBERS,
  ISIN_NUMBERS,
  DPID_LIST,
  BANK_ACCOUNT_NUMBERS,
} from '@/lib/constants';
import { getAllClients, getAllAssociates, getAllRMs, familyMembers as mockFamilyMembers, getAllAdmins } from '@/lib/mock-data';
import { Combobox } from '@/components/ui/combobox';
import { format, parse, parseISO, isValid } from 'date-fns';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';

/* ---------- VALIDATION HELPERS ---------- */
const isDateInPast = (val: string | undefined) => {
    if (!val) return true;
    const inputDate = parse(val, 'yyyy-MM-dd', new Date());
    if (!isValid(inputDate)) return true;
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
};

const isDateInFuture = (val: string | undefined) => {
    if (!val) return true;
    const inputDate = parse(val, 'yyyy-MM-dd', new Date());
    if (!isValid(inputDate)) return true;
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
};

const isDateTimeInFuture = (val: string) => {
    if (!val) return true;
    const inputDate = new Date(val);
    if (!isValid(inputDate)) return true;
    return inputDate >= new Date();
};


/* ---------- VALIDATION SCHEMAS ---------- */

const numberField = z.preprocess(
  (a) => {
    if (a === '' || a === null || a === undefined) return undefined;
    const parsed = parseFloat(String(a));
    return isNaN(parsed) ? undefined : parsed;
  },
  z.number().nonnegative("Value must be non-negative").optional()
);

const baseTaskSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  clientName: z.string().optional(),
  rmName: z.string().optional(),
  serviceableRM: z.string().optional(),
  dueDate: z.string().min(1, 'Due date and time are required').refine(isDateTimeInFuture, { message: 'Due date cannot be in the past.' }),
  description: z.string().max(300, 'Description cannot exceed 300 characters.').optional(),
  status2: z.string().optional(),
  familyHeadId: z.string().optional(),
  associateId: z.string().optional(),
  rmId: z.string().optional(),
  adminId: z.string().optional(),
});

const mutualFundDetailsSchema = z.object({
  familyHead: z.string(),
  service: z.string().min(1, "Service is required"),
  folioNo: z.string().min(1, "Folio No. is required"),
  nameOfAMC: z.string().min(1, "Name of AMC is required"),
  amount: z.number().nonnegative("Amount must be non-negative"),
  documentStatus: z.enum(["Received", "Pending"]),
  signatureStatus: z.enum(["Done", "Pending"]),
  amcSubmissionStatus: z.enum(["Done", "Pending"]),
});

const insuranceDetailsSchema = z.object({
  familyHead: z.string(),
  associate: z.string(),
  policyNo: z.string().min(1, "Policy No. is required"),
  company: z.string().min(1, "Company is required"),
  
  insuranceType: z.enum(['Financial', 'Non-Financial']),
  typeOfService: z.string().optional(),
  financialService: z.string().optional(),
  nonFinancialDate: z.string().optional().refine(isDateInPast, { message: "Date cannot be in the future." }),

  maturityDueDate: z.string().optional().refine(isDateInFuture, { message: "Date cannot be in the past." }),
  maturityAmount: numberField,

  deathClaimProcessDate: z.string().optional().refine(isDateInPast, { message: "Date cannot be in the future." }),
  surrenderProcessDate: z.string().optional().refine(isDateInPast, { message: "Date cannot be in the future." }),

  amountStatus: z.enum(["Credited", "Pending"]).optional(),
  
  receivedDate: z.string().optional().refine(isDateInPast, { message: "Date cannot be in the future." }),
  receivedAmount: numberField,
  reinvestmentStatus: z.string().optional(),
  reinvestmentApproxDate: z.string().optional().refine(isDateInFuture, { message: "Date cannot be in the past." }),
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
      if (data.maturityAmount === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maturity Amount is required.", path: ["maturityAmount"] });
    }
    if (data.financialService === 'Death Claim') {
      if (!data.deathClaimProcessDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Death Claim Process Date is required.", path: ["deathClaimProcessDate"] });
    }
    if (data.financialService === 'Surrender') {
      if (!data.surrenderProcessDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Surrender Process Date is required.", path: ["surrenderProcessDate"] });
    }
    
    if (data.amountStatus === 'Credited') {
      if (!data.receivedDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Received Date is required.", path: ["receivedDate"] });
      if (data.receivedAmount === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Received Amount is required.", path: ["receivedAmount"] });
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

const generalInsuranceTaskDetailsSchema = z.object({
  serviceCategory: z.string().min(1, 'Service Category is required'),
  subCategory: z.string().optional(),
  policyNumber: z.string().optional(),
});
const fdTaskDetailsSchema = z.object({
  serviceCategory: z.string().min(1, 'FD Service Category is required'),
  folioNumber: z.string().optional(),
});
const bondsTaskDetailsSchema = z.object({
  serviceCategory: z.string().min(1, 'Bond Service Category is required'),
  isinNumber: z.string().optional(),
});
const ppfTaskDetailsSchema = z.object({
  serviceCategory: z.string().min(1, 'PPF Service Category is required'),
  policyNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});
const physicalToDematTaskDetailsSchema = z.object({
  serviceCategory: z.string().min(1, 'Service Category is required'),
  folioNumber: z.string().optional(),
});

const stocksTaskDetailsSchema = z.object({
    service: z.string().min(1, 'Stocks Service is required'),
    dpid: z.string().optional(),
});

export const taskSchema = z.discriminatedUnion('category', [
  baseTaskSchema.extend({ category: z.literal('Mutual Funds'), mutualFund: mutualFundDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('Life Insurance'), insurance: insuranceDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('General Insurance'), generalInsuranceTask: generalInsuranceTaskDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('Stocks'), stocksTask: stocksTaskDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('Physical to Demat'), physicalToDematTask: physicalToDematTaskDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('Bonds'), bondsTask: bondsTaskDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('PPF'), ppfTask: ppfTaskDetailsSchema }),
  baseTaskSchema.extend({ category: z.literal('FDs'), fdTask: fdTaskDetailsSchema }),
]);


export type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskFormData) => void;
  task?: Task | null;
}

const sortedMutualFundServices = [...MUTUAL_FUND_SERVICES]
  .slice()
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

const sortedNonFinancialInsuranceServices = [...INSURANCE_SERVICES]
  .filter(service => !FINANCIAL_SERVICES.includes(service as any))
  .slice()
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));


export function CreateTaskModal({ isOpen, onClose, onSave, task }: CreateTaskModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!task;

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

  const allRms = useMemo(() => getAllRMs().map(rm => ({ label: `${rm.name} (RM)`, value: rm.id })), []);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    shouldUnregister: false,
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = form;
  const errorsWithType = errors as any;
  const isTerminal = isEditMode && task ? ['Completed', 'Cancelled', 'Rejected'].includes(task.status) : false;
  const selectedCategory = watch('category');
  const clientIdValue = watch('clientId');
  const descriptionValue = watch('description') ?? '';
  const insuranceType = watch('insurance.insuranceType');
  const financialService = watch('insurance.financialService');
  const amountStatus = watch('insurance.amountStatus');
  const reinvestmentStatus = watch('insurance.reinvestmentStatus');

  const { familyHead, assignedAssociate, assignedRM, assignedAdmin } = useMemo(() => {
    if (!clientIdValue) return { familyHead: null, assignedAssociate: null, assignedRM: null, assignedAdmin: null };
    const selectedOption = clientOptions.find(opt => opt.value === clientIdValue);
    if (!selectedOption) return { familyHead: null, assignedAssociate: null, assignedRM: null, assignedAdmin: null };
    const headId = 'clientId' in selectedOption ? (selectedOption as any).clientId : selectedOption.value;
    const head = getAllClients().find(c => c.id === headId);
    if (!head) return { familyHead: null, assignedAssociate: null, assignedRM: null, assignedAdmin: null };
    const associate = getAllAssociates().find(a => a.id === head.associateId);
    const rm = associate ? getAllRMs().find(r => r.id === associate.rmId) : undefined;
    const admin = rm ? getAllAdmins().find(adm => adm.id === rm.adminId) : undefined;
    return { familyHead: head, assignedAssociate: associate, assignedRM: rm, assignedAdmin: admin };
  }, [clientIdValue, clientOptions]);

  const familyHeadName = familyHead ? `${familyHead.firstName} ${familyHead.lastName}` : '';
  const associateName = assignedAssociate?.name || 'N/A';
  const rmName = assignedRM?.name || 'No RM assigned';

  useEffect(() => {
    if (!isEditMode) {
        setValue('rmName', rmName, { shouldValidate: true });
        
        if (familyHeadName && selectedCategory === 'Mutual Funds')
        setValue('mutualFund.familyHead', familyHeadName, { shouldValidate: true });

        if (familyHeadName && selectedCategory === 'Life Insurance')
        setValue('insurance.familyHead', familyHeadName, { shouldValidate: true });

        if (associateName && selectedCategory === 'Life Insurance')
        setValue('insurance.associate', associateName, { shouldValidate: true });

        setValue('familyHeadId', familyHead?.id);
        setValue('associateId', assignedAssociate?.id);
        setValue('rmId', assignedRM?.id);
        setValue('adminId', assignedAdmin?.id);
    }
  }, [familyHeadName, associateName, rmName, selectedCategory, setValue, isEditMode, familyHead, assignedAssociate, assignedRM, assignedAdmin]);


  useEffect(() => {
    if (!task) {
        form.reset({
            clientId: undefined,
            category: undefined,
            rmName: undefined,
            serviceableRM: undefined,
            dueDate: '',
            description: '',
            status2: undefined,
        });
        return;
    }

    const getCategoryPayload = (task: Task) => {
      switch (task.category) {
        case 'Stocks':
          return { stocksTask: task.stocksTask };
        case 'Mutual Funds':
          return { mutualFund: task.mutualFund };
        case 'Life Insurance':
          return { insurance: task.insurance };
        case 'General Insurance':
            return { generalInsuranceTask: task.generalInsuranceTask };
        case 'FDs':
            return { fdTask: task.fdTask };
        case 'Bonds':
            return { bondsTask: task.bondsTask };
        case 'PPF':
            return { ppfTask: task.ppfTask };
        case 'Physical to Demat':
            return { physicalToDematTask: task.physicalToDematTask };
        default:
          return {};
      }
    };
    
    const formatDateForInput = (dateString?: string | null, type: 'datetime' | 'date' = 'date'): string => {
        if (!dateString) return '';
        let date: Date | null = null;
        try {
            date = parseISO(dateString);
        } catch {
            try {
                date = parse(dateString, 'dd-MM-yyyy HH:mm', new Date());
            } catch {
                return dateString;
            }
        }
        if (date && !isNaN(date.getTime())) {
            return type === 'datetime' ? format(date, "yyyy-MM-dd'T'HH:mm") : format(date, "yyyy-MM-dd");
        }
        return dateString;
    };


    form.reset({
      clientId: task.clientId,
      category: task.category as any,
      rmName: task.rmName ?? '',
      serviceableRM: task.serviceableRM ?? undefined,
      dueDate: formatDateForInput(task.dueDate, 'datetime'),
      description: task.description ?? '',
      status2: task.status2 ?? undefined,
      ...getCategoryPayload(task),
    });

    // Use setTimeout to ensure Select components update after reset
    setTimeout(() => {
      if (task.category) {
        form.setValue('category', task.category as any, { shouldValidate: false, shouldDirty: false });
      }
      if (task.serviceableRM) {
        form.setValue('serviceableRM', task.serviceableRM, { shouldValidate: false, shouldDirty: false });
      }
    }, 50);

  }, [task, form]);
  
  const processSave = (data: TaskFormData) => {
    setIsSaving(true);
    
    setTimeout(() => {
      const selectedClientOption = clientOptions.find(opt => opt.value === data.clientId);
      const clientName = selectedClientOption ? selectedClientOption.label : 'N/A';

      onSave({ ...data, clientName });
      setIsSaving(false);
    }, 400);
  };
  
  const getTodayForDateTime = () => {
    const now = new Date();
    // Adjust for timezone offset
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
    return localISOTime;
  };
  const getToday = () => new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
            className="absolute top-4 right-4 z-10 close-icon"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-lg font-semibold leading-none tracking-tight">{isEditMode ? 'Edit Task' : 'Create Task Manually'}</h2>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? 'Update the details for this task.' : 'Fill in the details to create a new task.'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(processSave)} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label htmlFor="clientId">Client</Label>
                  <Controller
                  name="clientId"
                  control={control}
                  render={({ field }) => (
                      <Combobox
                      options={clientOptions}
                      value={field.value}
                      onChange={(value) => setValue('clientId', value, { shouldValidate: true })}
                      placeholder="Select Client"
                      searchPlaceholder="Search clients..."
                      emptyText="No matching clients."
                      disabled={isEditMode || isTerminal}
                      />
                  )}
                  />
                  {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
              </div>

              <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                  <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                      <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditMode || isTerminal}
                      >
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
                  render={({ field }) => {
                    const selectedRm = allRms.find(rm => rm.label === field.value);
                    return (
                      <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isTerminal}>
                      <SelectTrigger id="serviceableRM">
                          <SelectValue placeholder={selectedRm ? selectedRm.label : "Select Serviceable RM"} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {allRms.map(rm => (
                          <SelectItem key={rm.value} value={rm.label}>{rm.label}</SelectItem>
                          ))}
                      </SelectContent>
                      </Select>
                    );
                  }}
                  />
              </div>

              <div className="space-y-1">
                  <Label htmlFor="dueDate">Due Date & Time</Label>
                  <Input id="dueDate" type="datetime-local" min={getTodayForDateTime()} {...register('dueDate')} disabled={isTerminal} />
                  {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
              </div>

              </div>

              {/* --- STOCKS --- */}
              {selectedCategory === 'Stocks' && (
              <div className="space-y-4 pt-4">
                  <Separator />
                  <h3 className="text-md font-semibold">Stocks Task Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label>SERVICE</Label>
                          <Controller name="stocksTask.service" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}><SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                  <SelectContent>{STOCKS_TASK_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                          )} />
                          {errorsWithType.stocksTask?.service && <p className="text-sm text-destructive">{errorsWithType.stocksTask.service.message}</p>}
                      </div>
                      <div className="space-y-1">
                          <Label>DPID</Label>
                          <Controller
                          name="stocksTask.dpid"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select DPID" />
                              </SelectTrigger>
                              <SelectContent>
                                  {DPID_LIST.map(n => (
                                  <SelectItem key={n} value={n}>{n}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                      </div>
                  </div>
              </div>
              )}

              {/* --- GENERAL INSURANCE --- */}
              {selectedCategory === 'General Insurance' && (
              <div className="space-y-4 pt-4">
                  <Separator />
                  <h3 className="text-md font-semibold">General Insurance Task Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                          <Label>Service Category</Label>
                          <Controller name="generalInsuranceTask.serviceCategory" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}><SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                  <SelectContent>{GENERAL_INSURANCE_TASK_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                          )} />
                          {errorsWithType.generalInsuranceTask?.serviceCategory && <p className="text-sm text-destructive">{errorsWithType.generalInsuranceTask.serviceCategory.message}</p>}
                      </div>
                      <div className="space-y-1">
                          <Label>Sub Category</Label>
                          <Controller name="generalInsuranceTask.subCategory" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}><SelectTrigger><SelectValue placeholder="Select Sub Category..." /></SelectTrigger>
                                  <SelectContent>{GENERAL_INSURANCE_TASK_SUB_CATEGORIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                          )} />
                      </div>
                      <div className="space-y-1">
                          <Label>Policy Number</Label>
                          <Controller
                          name="generalInsuranceTask.policyNumber"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select Policy Number" />
                              </SelectTrigger>
                              <SelectContent>
                                  {POLICY_NUMBERS.map(n => (
                                  <SelectItem key={n} value={n}>{n}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                      </div>
                  </div>
              </div>
              )}

              {/* --- FDs --- */}
              {selectedCategory === 'FDs' && (
              <div className="space-y-4 pt-4">
                  <Separator />
                  <h3 className="text-md font-semibold">Fixed Deposit Task Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label>Service Category</Label>
                          <Controller name="fdTask.serviceCategory" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}><SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                  <SelectContent>{FD_TASK_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                          )} />
                          {errorsWithType.fdTask?.serviceCategory && <p className="text-sm text-destructive">{errorsWithType.fdTask.serviceCategory.message}</p>}
                      </div>
                      <div className="space-y-1">
                          <Label>Folio Number</Label>
                          <Controller
                          name="fdTask.folioNumber"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select Folio Number" />
                              </SelectTrigger>
                              <SelectContent>
                                  {FOLIO_NUMBERS.map(n => (
                                  <SelectItem key={n} value={n}>{n}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                      </div>
                  </div>
              </div>
              )}

              {/* --- BONDS --- */}
              {selectedCategory === 'Bonds' && (
              <div className="space-y-4 pt-4">
                  <Separator />
                  <h3 className="text-md font-semibold">Bonds Task Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label>Service Category</Label>
                          <Controller name="bondsTask.serviceCategory" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}><SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                  <SelectContent>{BONDS_TASK_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                          )} />
                          {errorsWithType.bondsTask?.serviceCategory && <p className="text-sm text-destructive">{errorsWithType.bondsTask.serviceCategory.message}</p>}
                      </div>
                      <div className="space-y-1">
                          <Label>ISIN Number</Label>
                          <Controller
                          name="bondsTask.isinNumber"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select ISIN" />
                              </SelectTrigger>
                              <SelectContent>
                                  {ISIN_NUMBERS.map(n => (
                                  <SelectItem key={n} value={n}>{n}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                      </div>
                  </div>
              </div>
              )}
              
              {/* --- PPF --- */}
              {selectedCategory === 'PPF' && (
              <div className="space-y-4 pt-4">
                  <Separator />
                  <h3 className="text-md font-semibold">PPF Task Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                      <Label>Service Category</Label>
                      <Controller
                      name="ppfTask.serviceCategory"
                      control={control}
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Service..." />
                          </SelectTrigger>
                          <SelectContent>
                              {PPF_TASK_SERVICES.map((s) => (
                              <SelectItem key={s} value={s}>
                                  {s}
                              </SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      )}
                      />
                      {errorsWithType.ppfTask?.serviceCategory && <p className="text-sm text-destructive">{errorsWithType.ppfTask.serviceCategory.message}</p>}
                  </div>
                  <div className="space-y-1">
                      <Label>Policy Number</Label>
                      <Controller
                      name="ppfTask.policyNumber"
                      control={control}
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Policy Number" />
                          </SelectTrigger>
                          <SelectContent>
                              {POLICY_NUMBERS.map(n => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      )}
                      />
                  </div>
                  <div className="space-y-1">
                      <Label>Bank Account Number</Label>
                      <Controller
                      name="ppfTask.bankAccountNumber"
                      control={control}
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Bank Account Number" />
                          </SelectTrigger>
                          <SelectContent>
                              {BANK_ACCOUNT_NUMBERS.map(n => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      )}
                      />
                  </div>
                  </div>
              </div>
              )}
              
              {/* --- Physical to Demat --- */}
              {selectedCategory === 'Physical to Demat' && (
              <div className="space-y-4 pt-4">
                  <Separator />
                  <h3 className="text-md font-semibold">Physical to Demat Task Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                          <Label>Service Category</Label>
                          <Controller name="physicalToDematTask.serviceCategory" control={control} render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}><SelectTrigger><SelectValue placeholder="Select Service..." /></SelectTrigger>
                                  <SelectContent>{PHYSICAL_TO_DEMAT_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                          )} />
                          {errorsWithType.physicalToDematTask?.serviceCategory && <p className="text-sm text-destructive">{errorsWithType.physicalToDematTask.serviceCategory.message}</p>}
                      </div>
                      <div className="space-y-1">
                          <Label>Folio Number</Label>
                          <Controller
                          name="physicalToDematTask.folioNumber"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select Folio Number" />
                              </SelectTrigger>
                              <SelectContent>
                                  {FOLIO_NUMBERS.map(n => (
                                  <SelectItem key={n} value={n}>{n}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="status2">Status 2</Label>
                          <Controller
                          name="status2"
                          control={control}
                          render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger id="status2">
                                  <SelectValue placeholder="Select Status 2" />
                              </SelectTrigger>
                              <SelectContent>
                                  {TASK_STATUS_2_OPTIONS.map(status => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                          {errors.status2 && <p className="text-sm text-destructive">{errors.status2.message}</p>}
                      </div>
                  </div>
              </div>
              )}


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
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                          <SelectContent>
                              {sortedMutualFundServices.map(service => (
                              <SelectItem key={service} value={service}>{service}</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      )}
                      />
                      {errorsWithType.mutualFund?.service && <p className="text-sm text-destructive">{errorsWithType.mutualFund.service.message}</p>}
                  </div>

                  <div className="space-y-1">
                      <Label>Folio No.</Label>
                      <Controller
                      name="mutualFund.folioNo"
                      control={control}
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Folio Number" />
                          </SelectTrigger>
                          <SelectContent>
                              {FOLIO_NUMBERS.map(n => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      )}
                      />
                      {errorsWithType.mutualFund?.folioNo && <p className="text-sm text-destructive">{errorsWithType.mutualFund.folioNo.message}</p>}
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
                      {errorsWithType.mutualFund?.nameOfAMC && <p className="text-sm text-destructive">{errorsWithType.mutualFund.nameOfAMC.message}</p>}
                  </div>

                  <div className="space-y-1">
                      <Label>Amount</Label>
                      <Input type="number" min="0" {...register('mutualFund.amount', { valueAsNumber: true })} />
                      {errorsWithType.mutualFund?.amount && <p className="text-sm text-destructive">{errorsWithType.mutualFund.amount.message}</p>}
                  </div>

                  <div className="space-y-1">
                      <Label>Document Status</Label>
                      <Controller
                      name="mutualFund.documentStatus"
                      control={control}
                      defaultValue="Pending"
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
                      <Controller
                      name="insurance.policyNo"
                      control={control}
                      render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value ?? ''}>
                          <SelectTrigger>
                              <SelectValue placeholder="Select Policy Number" />
                          </SelectTrigger>
                          <SelectContent>
                              {POLICY_NUMBERS.map(n => (
                              <SelectItem key={n} value={n}>{n}</SelectItem>
                              ))}
                          </SelectContent>
                          </Select>
                      )}
                      />
                      {errorsWithType.insurance?.policyNo && <p className="text-sm text-destructive">{errorsWithType.insurance.policyNo.message}</p>}
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
                      {errorsWithType.insurance?.company && <p className="text-sm text-destructive">{errorsWithType.insurance.company.message}</p>}
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
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                              <SelectContent>
                                  {sortedNonFinancialInsuranceServices.map(service => (
                                  <SelectItem key={service} value={service}>{service}</SelectItem>
                                  ))}
                              </SelectContent>
                              </Select>
                          )}
                          />
                          {errorsWithType.insurance?.typeOfService && <p className="text-sm text-destructive">{errorsWithType.insurance.typeOfService.message}</p>}
                      </div>
                      <div className="space-y-1">
                          <Label>Date</Label>
                          <Input type="date" max={getToday()} {...register('insurance.nonFinancialDate')} />
                          {errorsWithType.insurance?.nonFinancialDate && <p className="text-sm text-destructive">{errorsWithType.insurance.nonFinancialDate.message}</p>}
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
                              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger><SelectValue placeholder="Select Financial Service" /></SelectTrigger>
                              <SelectContent>
                                  {FINANCIAL_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                              </Select>
                          )}
                          />
                          {errorsWithType.insurance?.financialService && <p className="text-sm text-destructive">{errorsWithType.insurance.financialService.message}</p>}
                      </div>
                      
                      {/* Financial Service: Maturity */}
                      {financialService === 'Maturity' && (
                          <>
                          <div className="space-y-1">
                              <Label>Maturity Due Date</Label>
                              <Input type="date" min={getToday()} {...register('insurance.maturityDueDate')} />
                              {errorsWithType.insurance?.maturityDueDate && <p className="text-sm text-destructive">{errorsWithType.insurance.maturityDueDate.message}</p>}
                          </div>
                          <div className="space-y-1">
                              <Label>Maturity Amount</Label>
                              <Input type="number" min="0" {...register('insurance.maturityAmount', { valueAsNumber: true })} />
                              {errorsWithType.insurance?.maturityAmount && <p className="text-sm text-destructive">{errorsWithType.insurance.maturityAmount.message}</p>}
                          </div>
                          </>
                      )}

                      {/* Financial Service: Death Claim */}
                      {financialService === 'Death Claim' && (
                          <div className="space-y-1">
                              <Label>Death Claim Process Date</Label>
                              <Input type="date" max={getToday()} {...register('insurance.deathClaimProcessDate')} />
                              {errorsWithType.insurance?.deathClaimProcessDate && <p className="text-sm text-destructive">{errorsWithType.insurance.deathClaimProcessDate.message}</p>}
                          </div>
                      )}

                      {/* Financial Service: Surrender */}
                      {financialService === 'Surrender' && (
                          <div className="space-y-1">
                              <Label>Surrender Process Date</Label>
                              <Input type="date" max={getToday()} {...register('insurance.surrenderProcessDate')} />
                              {errorsWithType.insurance?.surrenderProcessDate && <p className="text-sm text-destructive">{errorsWithType.insurance.surrenderProcessDate.message}</p>}
                          </div>
                      )}

                      {/* Common Amount Status for Financial */}
                      <div className="md:col-span-2">
                              <Label>Amount Status</Label>
                              <Controller
                              name="insurance.amountStatus"
                              control={control}
                              render={({ field }) => (
                                  <RadioGroup onValueChange={field.onChange} value={field.value ?? 'Pending'} className="flex space-x-4 mt-2">
                                      <div className="flex items-center space-x-2"><RadioGroupItem value="Pending" id="pending" /><Label htmlFor="pending">Pending</Label></div>
                                      <div className="flex items-center space-x-2"><RadioGroupItem value="Credited" id="credited" /><Label htmlFor="credited">Received</Label></div>
                                  </RadioGroup>
                              )}
                              />
                      </div>

                      {/* If Amount Received */}
                      {amountStatus === 'Credited' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                              <div className="space-y-1">
                              <Label>Received Date</Label>
                              <Input type="date" max={getToday()} {...register('insurance.receivedDate')} />
                              {errorsWithType.insurance?.receivedDate && <p className="text-sm text-destructive">{errorsWithType.insurance.receivedDate.message}</p>}
                              </div>
                              <div className="space-y-1">
                              <Label>Received Amount</Label>
                              <Input type="number" min="0" {...register('insurance.receivedAmount', { valueAsNumber: true })} />
                              {errorsWithType.insurance?.receivedAmount && <p className="text-sm text-destructive">{errorsWithType.insurance.receivedAmount.message}</p>}
                              </div>
                              <div className="space-y-1 md:col-span-2">
                              <Label>Re-Investment Status</Label>
                              <Controller
                                  name="insurance.reinvestmentStatus"
                                  control={control}
                                  render={({ field }) => (
                                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                      <SelectContent>
                                      <SelectItem value="Pending">Pending</SelectItem>
                                      <SelectItem value="No">No</SelectItem>
                                      <SelectItem value="Yes">Yes</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  )}
                              />
                              {errorsWithType.insurance?.reinvestmentStatus && <p className="text-sm text-destructive">{errorsWithType.insurance.reinvestmentStatus.message}</p>}
                              </div>
                              
                              {reinvestmentStatus === 'Pending' && (
                              <div className="space-y-1">
                                  <Label>Approx Date</Label>
                                  <Input type="date" min={getToday()} {...register('insurance.reinvestmentApproxDate')} />
                                  {errorsWithType.insurance?.reinvestmentApproxDate && <p className="text-sm text-destructive">{errorsWithType.insurance.reinvestmentApproxDate.message}</p>}
                              </div>
                              )}
                              {reinvestmentStatus === 'No' && (
                              <div className="space-y-1">
                                  <Label>Reason</Label>
                                  <Controller
                                      name="insurance.reinvestmentReason"
                                      control={control}
                                      render={({ field }) => (
                                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                          <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                                          <SelectContent>
                                          {REINVESTMENT_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                          </SelectContent>
                                      </Select>
                                      )}
                                  />
                                  {errorsWithType.insurance?.reinvestmentReason && <p className="text-sm text-destructive">{errorsWithType.insurance.reinvestmentReason.message}</p>}
                              </div>
                              )}
                              </div>
                      )}
                      </>
                  )}
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
          </div>

          <div className="p-6 border-t flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
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
    </div>
  );
}

    