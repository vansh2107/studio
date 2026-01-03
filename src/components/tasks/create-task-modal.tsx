
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
import { TASK_CATEGORIES, TASK_STATUSES, RM_NAMES } from '@/lib/constants';
import { getAllClients, familyMembers as mockFamilyMembers } from '@/lib/mock-data';
import { Combobox } from '@/components/ui/combobox';
import { format } from 'date-fns';

const taskSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  category: z.string().min(1, 'Category is required'),
  rmName: z.string().min(1, 'RM name is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().max(300, 'Description cannot exceed 300 characters.').optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createDate' | 'status' | 'startDate' | 'completeDate'> & { id?: string }) => void;
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
      ...c,
      label: `${c.firstName} ${c.lastName} — Head`,
      value: `${c.firstName} ${c.lastName}`
    }));

    const members = mockFamilyMembers.map(fm => ({
      ...fm,
      label: `${fm.firstName} ${fm.lastName} — ${fm.relation}`,
      value: `${fm.firstName} ${fm.lastName}`
    }));
    
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

  useEffect(() => {
    if (task) {
       const defaultData: TaskFormData = {
         clientName: task.clientName || '',
         category: task.category || '',
         rmName: task.rmName || '',
         dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
         description: task.description || '',
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
    // Simulate save
    setTimeout(() => {
      onSave({ ...data, id: task?.id });
      toast({
        title: isEditMode ? 'Task Updated' : 'Task Created',
        description: `The task for "${data.clientName}" has been successfully saved.`,
      });
      setIsSaving(false);
    }, 500);
  };

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
                            const selectedOption = clientOptions.find(opt => opt.value.toLowerCase() === value.toLowerCase());
                            setValue('clientName', selectedOption ? selectedOption.value : '');
                        }}
                        placeholder="Select Client"
                        searchPlaceholder="Search clients..."
                        emptyText="No clients found."
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
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" {...register('dueDate')} placeholder="YYYY-MM-DD" type="date" disabled={isTerminal} />
                  {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
              </div>
          </div>

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
