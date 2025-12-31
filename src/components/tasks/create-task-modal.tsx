
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Task } from '@/hooks/use-tasks';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  person: z.string().min(1, 'Person name is required'),
  task: z.string().min(1, 'Task is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
}

export function CreateTaskModal({ onClose, onSave }: CreateTaskModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [date, setDate] = useState<Date>()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      person: '',
      task: '',
      dueDate: '',
      description: '',
    },
  });
  
  useEffect(() => {
    if (date) {
        setValue('dueDate', format(date, "PPP"));
    }
  }, [date, setValue]);


  const processSave = (data: TaskFormData) => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      onSave(data);
      toast({
        title: 'Task Created',
        description: `The task "${data.task}" has been successfully created.`,
      });
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="relative p-1">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
        <X className="h-4 w-4" />
      </Button>
      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold">Create Task Manually</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details to create a new task.
        </p>
      </div>

      <form onSubmit={handleSubmit(processSave)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <Label htmlFor="person">Person</Label>
                <Input id="person" {...register('person')} />
                {errors.person && <p className="text-sm text-destructive">{errors.person.message}</p>}
            </div>
            <div className="space-y-1">
                <Label htmlFor="task">Task</Label>
                <Input id="task" {...register('task')} />
                {errors.task && <p className="text-sm text-destructive">{errors.task.message}</p>}
            </div>
        </div>

        <div className="space-y-1">
            <Label htmlFor="dueDate">Due Date & Time</Label>
             <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            <Input type="hidden" {...register('dueDate')} />
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
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}
