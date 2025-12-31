
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/hooks/use-tasks';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TASK_CATEGORIES } from '@/lib/constants';
import { getAllClients, getAssetsForClient } from '@/lib/mock-data';

const taskSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  category: z.string().min(1, 'Category is required'),
  rmName: z.string().min(1, 'RM name is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.string().min(1, 'Status is required'),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'> & { id?: string }) => void;
  task?: Task | null;
}

export function CreateTaskModal({ onClose, onSave, task }: CreateTaskModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!task;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      clientName: '',
      category: '',
      rmName: '',
      dueDate: '',
      status: '',
      description: '',
    },
  });

  const selectedClientName = watch('clientName');

  const availableCategories = useMemo(() => {
    if (!selectedClientName) return new Set();
    const client = getAllClients().find(c => c.name === selectedClientName);
    if (!client) return new Set();
    const assets = getAssetsForClient(client.id);
    return new Set(assets.map(a => a.category));
  }, [selectedClientName]);
  

  useEffect(() => {
    if (task) {
      reset(task);
    } else {
      reset({
        clientName: '',
        category: '',
        rmName: '',
        dueDate: '',
        status: '',
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
    <TooltipProvider>
      <div className="relative p-1 max-h-[80vh] overflow-y-auto pr-4 -mr-4">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
          <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
          <h2 className="text-lg font-semibold">
              {isEditMode ? 'Edit Task' : 'Create Task Manually'}
          </h2>
          <p className="text-sm text-muted-foreground">
              {isEditMode ? 'Update the details for this task.' : 'Fill in the details to create a new task.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(processSave)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input id="clientName" {...register('clientName')} />
                  {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
              </div>

               <div className="space-y-1">
                  <Label htmlFor="category">Category</Label>
                   <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_CATEGORIES.map(cat => {
                            const isEnabled = availableCategories.has(cat as any) || isEditMode;
                            return (
                               <Tooltip key={cat}>
                                <TooltipTrigger asChild>
                                    <div className={!isEnabled ? 'cursor-not-allowed' : ''}>
                                        <SelectItem
                                            value={cat}
                                            disabled={!isEnabled}
                                            className={!isEnabled ? 'text-muted-foreground' : ''}
                                        >
                                            {cat}
                                        </SelectItem>
                                    </div>
                                </TooltipTrigger>
                                {!isEnabled && (
                                    <TooltipContent>
                                        <p>This category is not available for this client.</p>
                                    </TooltipContent>
                                )}
                               </Tooltip>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

               <div className="space-y-1">
                  <Label htmlFor="rmName">RM Name</Label>
                  <Input id="rmName" {...register('rmName')} />
                  {errors.rmName && <p className="text-sm text-destructive">{errors.rmName.message}</p>}
              </div>
              <div className="space-y-1">
                  <Label htmlFor="status">Status</Label>
                  <Input id="status" {...register('status')} />
                  {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
              </div>
          </div>

          <div className="space-y-1">
              <Label htmlFor="dueDate">Due Date & Time</Label>
              <Input id="dueDate" {...register('dueDate')} placeholder="e.g., Tomorrow 5pm" />
              {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditMode ? 'Save Changes' : 'Save Task'}
            </Button>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}
