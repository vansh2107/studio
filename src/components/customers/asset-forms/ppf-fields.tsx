
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';

export function PPFFields({ register, errors, control, familyMembers }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">PPF Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label>Family Member Name</Label>
           <Controller
            name="ppf.familyMemberName"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Bank Name</Label>
          <Input {...register('ppf.bankName')} />
        </div>
        <div>
          <Label>Contributed Amount</Label>
          <Input type="number" min="0" {...register('ppf.contributedAmount', { valueAsNumber: true })} />
          {errors.ppf?.contributedAmount && <p className="text-sm text-destructive mt-1">{errors.ppf.contributedAmount.message}</p>}
        </div>
        <div>
          <Label>Balance</Label>
          <Input type="number" min="0" {...register('ppf.balance', { valueAsNumber: true })} />
          {errors.ppf?.balance && <p className="text-sm text-destructive mt-1">{errors.ppf.balance.message}</p>}
        </div>
        <div>
          <Label>Date of Opening</Label>
          <Input type="date" {...register('ppf.openingDate')} />
        </div>
        <div>
          <Label>Date of Mature</Label>
          <Input type="date" {...register('ppf.matureDate')} />
        </div>
      </div>
    </div>
  );
}

    