
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
  TASK_STATUSES,
  RM_NAMES,
  MUTUAL_FUND_SERVICES,
  AMC_NAMES,
  INSURANCE_SERVICES,
  INSURANCE_COMPANIES
} from '@/lib/constants';
import { getAllClients, getAllAssociates, familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { format, parse, parseISO } from 'date-fns';
import { Separator } from '../ui/separator';

const baseTaskSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  category: z.string().min(1, 'Category is required'),
  rmName: z.string().min(1, 'RM name is required'),
  dueDate: z.string().min(1, 'Due date and time are required'),
  description: z.string().max(300, 'Description cannot exceed 300 characters.').optional(),
});

const mutualFundSchema = z.object({
    familyHead: z.string(),
    service: z.string().min(1, "Service is required"),
    folioNo: z.string().min(1, "Folio No. is required"),
    nameOfAMC: z.string().min(1, "Name of AMC is required"),
    amount: z.preprocess(
      (a) => parseFloat(z.string().parse(a)),
      z.number().positive("Amount must be positive")
    ),
    documentStatus: z.enum(["Received", "Pending"]),
    signatureStatus: z.enum(["Done", "Pending"]),
});

const insuranceSchema = z.object({
  familyHead: z.string(),
  typeOfService: z.string().min(1, "Type of Service is required"),
  associate: z.string().min(1, "Associate is required"),
  policyNo: z.string().min(1, "Policy No. is required"),
  company: z.string().min(1, "Company is required"),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive("Amount must be positive")
  ),
  maturityStatus: z.string().min(1, "Maturity status is required"),
  amountStatus: z.enum(["Credited", "Pending"]),
  reinvestmentStatus: z.string().min(1, "Re-investment status is required"),
});

const taskSchema = baseTaskSchema.extend({
  mutualFund: mutualFundSchema.optional(),
  insurance: insuranceSchema.optional(),
}).superRefine((data, ctx) => {
    if (data.category === 'Mutual Funds' && !data.mutualFund) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mutual Fund details are required for this category.",
            path: ["mutualFund"],
        });
    }
    if (data.category === 'Life Insurance' && !data.insurance) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Insurance details are required for this category.",
            path: ["insurance"],
        });
    }
});


type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task | null;
}

export function CreateTaskModal({ onClose, onSave, task }: CreateTaskModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!task;

  const terminalStatuses: TaskStatus[] = ['Completed', 'Cancelled', 'Rejected'];
  const isTerminal = isEditMode && task ? terminalStatuses.includes(task.status) : false;

  const clientOptions = useMemo(() => {
    const heads = getAllClients().map(c => ({
      label: `${c.firstName} ${c.lastName} (Head)`,
      value: c.id,
      relation: 'Head'
    }));

    const members = mockFamilyMembers.map(m => {
      const head = getAllClients().find(c => c.id === m.clientId);
      return {
        label: `${m.firstName} ${m.lastName} (${m.relation})`,
        value: m.id,
        clientId: m.clientId,
        relation: m.relation,
      };
    });

    return [...heads, ...members].sort((a,b) => a.label.localeCompare(b.label));
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
      dueDate: '',
      description: '',
    },
  });
  
  const descriptionValue = watch('description') || '';
  const selectedCategory = watch('category');
  const clientNameValue = watch('clientName');

  const { familyHead, assignedAssociate } = useMemo(() => {
    if (!clientNameValue) return { familyHead: null, assignedAssociate: 'N/A' };
    
    const selectedOption = clientOptions.find(opt => opt.value === clientNameValue);
    if (!selectedOption) return { familyHead: null, assignedAssociate: 'N/A' };
    
    const headId = 'clientId' in selectedOption ? selectedOption.clientId : selectedOption.value;
    const head = getAllClients().find(c => c.id === headId);

    if (!head) return { familyHead: null, assignedAssociate: 'N/A' };
    
    const associate = getAllAssociates().find(a => a.id === head.associateId);

    return {
      familyHead: head,
      assignedAssociate: associate ? associate.name : 'N/A',
    };
  }, [clientNameValue, clientOptions]);

  const familyHeadName = familyHead ? `${familyHead.firstName} ${familyHead.lastName}` : '';

  useEffect(() => {
    if (task) {
        let formattedDueDate = '';
        if (task.dueDate) {
            try {
                if (task.dueDate.includes(' ')) {
                     const parsedDate = parse(task.dueDate, 'dd-MM-yyyy HH:mm', new Date());
                     if (!isNaN(parsedDate.getTime())) {
                        formattedDueDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm");
                     }
                } else {
                    formattedDueDate = format(parseISO(task.dueDate), "yyyy-MM-dd'T'HH:mm");
                }
            } catch (e) {
                console.error("Error parsing due date:", e);
            }
        }
       const defaultData: TaskFormData = {
         clientName: task.clientName || '',
         category: task.category || '',
         rmName: task.rmName || '',
         dueDate: formattedDueDate,
         description: task.description || '',
         mutualFund: task.mutualFund ? {
           ...task.mutualFund,
           amount: task.mutualFund.amount || 0,
         } : undefined,
          insurance: task.insurance ? {
           ...task.insurance,
           amount: task.insurance.amount || 0,
         } : undefined,
       }
      reset(defaultData);
    } else {
      reset({
        clientName: '',
        category: '',
        rmName: '',
        dueDate: '',
        description: '',
      });
    }
  }, [task, reset]);

  const processSave = (data: TaskFormData) => {
    setIsSaving(true);
    setTimeout(() => {
        
      const selectedClient = clientOptions.find(c => c.value === data.clientName);

      const submissionData: Task = {
        ...(task || { id: '', createDate: new Date().toISOString(), status: 'Pending' }),
        ...data,
        clientName: selectedClient?.label || data.clientName, // Use the full label
        dueDate: new Date(data.dueDate).toISOString(), 
      };
      
      if (submissionData.category !== 'Mutual Funds') {
        delete submissionData.mutualFund;
      }
      if (submissionData.category !== 'Life Insurance') {
        delete submissionData.insurance;
      }
      
      onSave(submissionData);
      toast({
        title: isEditMode ? 'Task Updated' : 'Task Created',
        description: `The task for "${submissionData.clientName}" has been successfully saved.`,
      });
      setIsSaving(false);
    }, 500);
  };
    
  useEffect(() => {
      if(familyHeadName) {
        if(selectedCategory === 'Mutual Funds') {
            setValue('mutualFund.familyHead', familyHeadName, { shouldValidate: true });
        }
        if(selectedCategory === 'Life Insurance') {
            setValue('insurance.familyHead', familyHeadName, { shouldValidate: true });
        }
      }
      if(assignedAssociate) {
          if(selectedCategory === 'Life Insurance') {
              setValue('insurance.associate', assignedAssociate, { shouldValidate: true });
          }
      }
  }, [familyHeadName, assignedAssociate, selectedCategory, setValue]);

  const clientFilter = (value: string, search: string) => {
    const option = clientOptions.find(opt => opt.value.toLowerCase() === value.toLowerCase());
    if (!option) return 0;

    const searchTerm = search.toLowerCase();
    
    // Check against full label (which includes name and relation)
    if (option.label.toLowerCase().includes(searchTerm)) {
      return 1;
    }
    
    return 0;
  };
  
  const amcOptions = useMemo(() => AMC_NAMES.map(name => ({ label: name, value: name })), []);
  const insuranceCompanyOptions = useMemo(() => INSURANCE_COMPANIES.map(name => ({ label: name, value: name })), []);

  const nameFilter = (value: string, search: string) => {
      return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
  }

  return (
      <div className="relative p-1 max-h-[80vh] overflow-y-auto pr-4 -mr-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 z-[1002]">
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
                : 'Fill in the details to create a new task.'
              }
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
                        onChange={(value) => {
                           setValue('clientName', value, { shouldValidate: true });
                        }}
                        placeholder="Select Client"
                        searchPlaceholder="Search clients..."
                        emptyText="No matching clients."
                        filter={clientFilter}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isTerminal}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_CATEGORIES.map(cat => (
                             <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

               <div className="space-y-1">
                  <Label htmlFor="rmName">RM Name</Label>
                  <Controller
                    name="rmName"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isTerminal}>
                        <SelectTrigger id="rmName">
                          <SelectValue placeholder="Select RM" />
                        </SelectTrigger>
                        <SelectContent>
                          {RM_NAMES.map(rm => (
                             <SelectItem key={rm} value={rm}>
                                {rm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.rmName && <p className="text-sm text-destructive">{errors.rmName.message}</p>}
              </div>

               <div className="space-y-1">
                  <Label htmlFor="dueDate">Due Date & Time</Label>
                  <Input id="dueDate" {...register('dueDate')} type="datetime-local" disabled={isTerminal} />
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
                    <Label htmlFor="mf-service">Service</Label>
                    <Controller
                        name="mutualFund.service"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTerminal}>
                            <SelectTrigger><SelectValue placeholder="Select a service"/></SelectTrigger>
                            <SelectContent>
                                {MUTUAL_FUND_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.mutualFund?.service && <p className="text-sm text-destructive">{errors.mutualFund.service.message}</p>}
                  </div>
                   <div className="space-y-1">
                      <Label htmlFor="mf-folioNo">Folio No.</Label>
                      <Input id="mf-folioNo" {...register('mutualFund.folioNo')} disabled={isTerminal}/>
                       {errors.mutualFund?.folioNo && <p className="text-sm text-destructive">{errors.mutualFund.folioNo.message}</p>}
                  </div>
                   <div className="space-y-1">
                      <Label htmlFor="mf-nameOfAMC">Name of AMC</Label>
                      <Controller
                        name="mutualFund.nameOfAMC"
                        control={control}
                        render={({ field }) => (
                          <Combobox
                            options={amcOptions}
                            value={field.value}
                            onChange={(value) => setValue('mutualFund.nameOfAMC', value, { shouldValidate: true })}
                            placeholder="Select AMC"
                            searchPlaceholder="Search AMCs..."
                            emptyText="No matching AMC found."
                            filter={nameFilter}
                          />
                        )}
                      />
                       {errors.mutualFund?.nameOfAMC && <p className="text-sm text-destructive">{errors.mutualFund.nameOfAMC.message}</p>}
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="mf-amount">Amount</Label>
                      <Input id="mf-amount" type="number" {...register('mutualFund.amount')} disabled={isTerminal}/>
                       {errors.mutualFund?.amount && <p className="text-sm text-destructive">{errors.mutualFund.amount.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Document Status</Label>
                    <Controller
                        name="mutualFund.documentStatus"
                        control={control}
                        defaultValue="Pending"
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTerminal}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTerminal}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
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
                  <div className="space-y-1">
                    <Label>Family Head</Label>
                    <Input {...register('insurance.familyHead')} readOnly value={familyHeadName} />
                  </div>
                   <div className="space-y-1">
                    <Label>Associate</Label>
                    <Input {...register('insurance.associate')} readOnly value={assignedAssociate} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ins-typeOfService">Type of Service</Label>
                    <Controller
                        name="insurance.typeOfService"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTerminal}>
                            <SelectTrigger><SelectValue placeholder="Select a service"/></SelectTrigger>
                            <SelectContent>
                                {INSURANCE_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.insurance?.typeOfService && <p className="text-sm text-destructive">{errors.insurance.typeOfService.message}</p>}
                  </div>
                   <div className="space-y-1">
                      <Label htmlFor="ins-policyNo">Policy No.</Label>
                      <Input id="ins-policyNo" {...register('insurance.policyNo')} disabled={isTerminal}/>
                       {errors.insurance?.policyNo && <p className="text-sm text-destructive">{errors.insurance.policyNo.message}</p>}
                  </div>
                   <div className="space-y-1">
                      <Label htmlFor="ins-company">Company</Label>
                       <Controller
                        name="insurance.company"
                        control={control}
                        render={({ field }) => (
                          <Combobox
                            options={insuranceCompanyOptions}
                            value={field.value}
                            onChange={(value) => setValue('insurance.company', value, { shouldValidate: true })}
                            placeholder="Select Company"
                            searchPlaceholder="Search companies..."
                            emptyText="No matching company found."
                            filter={nameFilter}
                          />
                        )}
                      />
                       {errors.insurance?.company && <p className="text-sm text-destructive">{errors.insurance.company.message}</p>}
                  </div>
                  <div className="space-y-1">
                      <Label htmlFor="ins-amount">Amount</Label>
                      <Input id="ins-amount" type="number" {...register('insurance.amount')} disabled={isTerminal}/>
                       {errors.insurance?.amount && <p className="text-sm text-destructive">{errors.insurance.amount.message}</p>}
                  </div>
                   <div className="space-y-1">
                      <Label htmlFor="ins-maturityStatus">Maturity Status</Label>
                      <Input id="ins-maturityStatus" {...register('insurance.maturityStatus')} disabled={isTerminal}/>
                       {errors.insurance?.maturityStatus && <p className="text-sm text-destructive">{errors.insurance.maturityStatus.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Amount Status</Label>
                    <Controller
                        name="insurance.amountStatus"
                        control={control}
                        defaultValue="Pending"
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isTerminal}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Credited">Credited</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                  </div>
                   <div className="space-y-1">
                      <Label htmlFor="ins-reinvestmentStatus">Re-investment Status</Label>
                      <Input id="ins-reinvestmentStatus" {...register('insurance.reinvestmentStatus')} disabled={isTerminal}/>
                       {errors.insurance?.reinvestmentStatus && <p className="text-sm text-destructive">{errors.insurance.reinvestmentStatus.message}</p>}
                  </div>
                </div>
              </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              {...register('description')} 
              disabled={isTerminal} 
              maxLength={300}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
                {errors.description ? (
                    <p className="text-destructive">{errors.description.message}</p>
                ) : (
                    <p></p> 
                )}
                <p>{descriptionValue.length} / 300</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            {!isTerminal && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditMode ? 'Save Changes' : 'Save Task'}
              </Button>
            )}
          </div>
        </form>
      </div>
  );
}

    