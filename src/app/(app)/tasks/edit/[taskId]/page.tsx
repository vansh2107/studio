
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTasks, Task } from '@/hooks/use-tasks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
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
import { format, parse, parseISO } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTaskModal, taskSchema } from '@/components/tasks/create-task-modal';
import React, { useEffect, useState, useMemo } from 'react';

type TaskFormData = z.infer<typeof taskSchema>;


export default function EditTaskPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const { tasks, updateTask } = useTasks();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const task = useMemo(() => tasks.find(t => t.id === taskId), [tasks, taskId]);

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

  const { reset, setValue } = form;

  useEffect(() => {
    if (!task) return;

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


    reset({
      clientId: task.clientId,
      category: task.category as any,
      rmName: task.rmName ?? '',
      serviceableRM: task.serviceableRM ?? undefined,
      dueDate: formatDateForInput(task.dueDate, 'datetime'),
      description: task.description ?? '',
      status2: task.status2 ?? undefined,
      ...getCategoryPayload(task),
    });

  }, [task, reset]);
  

  const onSubmit = (data: TaskFormData) => {
    if (!task) return;
    setIsSaving(true);
    
    const selectedClientOption = clientOptions.find(opt => opt.value === data.clientId);
    const derivedClientName = selectedClientOption ? selectedClientOption.label : 'N/A';

    const enrichedFormData = {
      ...task, // Start with existing task data to preserve fields like ID, createDate etc.
      ...data, // Overwrite with new form data
      clientName: derivedClientName,
      dueDate: new Date(data.dueDate).toISOString(),
    };

    setTimeout(() => {
      updateTask(task.id, enrichedFormData);
      toast({
        title: 'Task Updated',
        description: `The task has been successfully saved.`,
      });
      setIsSaving(false);
      router.push('/tasks');
    }, 400);
  };

  if (!task) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Task not found</h1>
        <p>The task you are trying to edit does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/tasks')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/tasks')}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold font-headline">Edit Task</h1>
            <p className="text-muted-foreground">Editing task for {task.clientName}.</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
            <CreateTaskModal.Form
                isEditMode={true}
                task={task}
                form={form}
                clientOptions={clientOptions}
                allRms={allRms}
                onSubmit={onSubmit}
                isSaving={isSaving}
             />
        </CardContent>
      </Card>

    </div>
  );
}
