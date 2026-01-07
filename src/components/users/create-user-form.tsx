
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  superAdmins,
  admins,
  relationshipManagers,
  associates,
  users,
  addSuperAdmin,
  addAdmin,
  addRM,
  addAssociate,
} from '@/lib/mock-data';
import type { Role } from '@/lib/types';
import { ROLES } from '@/lib/constants';

// Define roles that can be created via this form
const CREATABLE_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE'];

const baseSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').refine(
    (email) => !users.some(u => u.email === email),
    { message: 'This email is already in use.' }
  ),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(CREATABLE_ROLES as [string, ...string[]]),
});

const formSchema = baseSchema.extend({
  assignedSuperAdmin: z.string().optional(),
  assignedAdmin: z.string().optional(),
  assignedRM: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'ADMIN' && !data.assignedSuperAdmin) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assignedSuperAdmin'], message: 'Super Admin assignment is required.' });
  }
  if (data.role === 'RM' && !data.assignedAdmin) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assignedAdmin'], message: 'Admin assignment is required.' });
  }
  if (data.role === 'ASSOCIATE' && !data.assignedRM) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assignedRM'], message: 'RM assignment is required.' });
  }
});

type UserFormData = z.infer<typeof formSchema>;

export function CreateUserForm({ onUserCreated }: { onUserCreated: () => void }) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const selectedRole = watch('role');

  const superAdminOptions = useMemo(() => superAdmins.map(sa => ({ value: sa.id, label: sa.name })), []);
  const adminOptions = useMemo(() => admins.map(a => ({ value: a.id, label: a.name })), []);
  const rmOptions = useMemo(() => relationshipManagers.map(rm => ({ value: rm.id, label: rm.name })), []);

  const onSubmit = (data: UserFormData) => {
    setIsSaving(true);
    
    // Simulate async operation
    setTimeout(() => {
        try {
            switch(data.role) {
                case 'SUPER_ADMIN':
                    addSuperAdmin(data);
                    break;
                case 'ADMIN':
                    if (!data.assignedSuperAdmin) throw new Error("Super Admin not assigned.");
                    addAdmin(data, data.assignedSuperAdmin);
                    break;
                case 'RM':
                    if (!data.assignedAdmin) throw new Error("Admin not assigned.");
                    addRM(data, data.assignedAdmin);
                    break;
                case 'ASSOCIATE':
                    if (!data.assignedRM) throw new Error("RM not assigned.");
                    addAssociate(data, data.assignedRM);
                    break;
            }
            toast({ title: "User Created", description: `${data.firstName} ${data.lastName} has been added.` });
            onUserCreated();
        } catch (error) {
            const err = error as Error;
            toast({ title: "Error", description: err.message, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }

    }, 500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
      
        <div className="space-y-1">
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {CREATABLE_ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
        </div>

        {selectedRole === 'ADMIN' && (
          <div className="space-y-1">
            <Label htmlFor="assignedSuperAdmin">Assign Super Admin</Label>
            <Controller
              name="assignedSuperAdmin"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Super Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {superAdminOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assignedSuperAdmin && <p className="text-sm text-destructive">{errors.assignedSuperAdmin.message}</p>}
          </div>
        )}

        {selectedRole === 'RM' && (
          <div className="space-y-1">
            <Label htmlFor="assignedAdmin">Assign Admin</Label>
            <Controller
              name="assignedAdmin"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assignedAdmin && <p className="text-sm text-destructive">{errors.assignedAdmin.message}</p>}
          </div>
        )}

        {selectedRole === 'ASSOCIATE' && (
          <div className="space-y-1">
            <Label htmlFor="assignedRM">Assign RM</Label>
            <Controller
              name="assignedRM"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select RM" />
                  </SelectTrigger>
                  <SelectContent>
                    {rmOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.assignedRM && <p className="text-sm text-destructive">{errors.assignedRM.message}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </div>
    </form>
  );
}

    