
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Family, FamilyMember } from '@/lib/types';
import { Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isValid, parseISO } from 'date-fns';

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  emailId: z.string().email('Invalid email address'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').refine(date => isValid(parseISO(date)), { message: "Invalid date" }),
  address: z.string().min(1, 'Address is required'),
  anniversaryDate: z.string().optional().refine(date => !date || (z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(date).success && isValid(parseISO(date))), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
  relation: z.string().min(1, 'Relation is required'),
});

type MemberFormData = z.infer<typeof memberSchema>;

const RELATION_OPTIONS = ["Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other"];


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
      firstName: '',
      lastName: '',
      phoneNumber: '',
      emailId: '',
      dateOfBirth: '',
      address: '',
      anniversaryDate: '',
      relation: '',
    },
  });

  useEffect(() => {
    if (member) {
       reset({
        ...member,
        anniversaryDate: member.anniversaryDate || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        emailId: '',
        dateOfBirth: '',
        address: '',
        anniversaryDate: '',
        relation: '',
      });
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
        anniversaryDate: data.anniversaryDate || undefined,
      };

      onSave(memberData);
      
      setIsSaving(false);
      onClose();
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
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} disabled={isSaving} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
               <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} disabled={isSaving} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" type="tel" {...register('phoneNumber')} disabled={isSaving} />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emailId">Email ID</Label>
                <Input id="emailId" type="email" {...register('emailId')} disabled={isSaving} />
                {errors.emailId && <p className="text-sm text-destructive">{errors.emailId.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="text" placeholder="YYYY-MM-DD" {...register('dateOfBirth')} disabled={isSaving} />
                 {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
              </div>
               <div className="flex flex-col gap-1.5">
                <Label htmlFor="anniversaryDate">Anniversary Date (Optional)</Label>
                <Input id="anniversaryDate" type="text" placeholder="YYYY-MM-DD" {...register('anniversaryDate')} disabled={isSaving} />
                {errors.anniversaryDate && <p className="text-sm text-destructive">{errors.anniversaryDate.message}</p>}
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
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" {...register('address')} disabled={isSaving} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
          </div>
        
            <div className="flex justify-end pt-6">
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
