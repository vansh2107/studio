
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Family, FamilyMember } from '@/lib/types';
import { Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const memberSchema = z.object({
  name: z.string().min(1, 'Member name is required'),
  relation: z.string().min(1, 'Relation is required'),
});

type MemberFormData = z.infer<typeof memberSchema>;

const RELATION_OPTIONS = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"];


interface FamilyMemberFormModalProps {
  onClose: () => void;
  family: Family;
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
}

export function FamilyMemberFormModal({
  onClose,
  family,
  member,
  onSave,
}: FamilyMemberFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      relation: '',
    },
  });

  useEffect(() => {
    if (member) {
      reset(member);
    } else {
      reset({ name: '', relation: '' });
    }
  }, [member, reset]);

  const processSave = (data: MemberFormData) => {
    setIsSaving(true);
    
    // Simulate saving delay
    setTimeout(() => {
      const memberData: FamilyMember = {
        id: member?.id || `fm-${Date.now()}`,
        customerId: family.id,
        ...data,
      };

      onSave(memberData);
      
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4 relative">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
            <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {member ? 'Edit Family Member' : 'Add New Member'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {member ? 'Update details for this member.' : `Add a new member to the ${family.firstName} ${family.lastName} family.`}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(processSave)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register('name')} disabled={isSaving} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="relation">Relation</Label>
                <Controller
                  name="relation"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                      <SelectTrigger id="relation">
                        <SelectValue placeholder="Select a relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATION_OPTIONS.map(option => (
                           <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.relation && <p className="text-sm text-destructive">{errors.relation.message}</p>}
              </div>
          </div>
        
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                    ) : (
                    'Save Member'
                    )}
                </Button>
            </div>
        </form>
    </div>
  );
}
