
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';

export function FDFields({ register, errors, control, familyMembers }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[] }) {
  
  const handlePeriodInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      e.target.value = value;
    } else {
      e.target.value = value.slice(0, 8);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Fixed Deposit Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label>Family Member Name</Label>
          <Controller
            name="fd_familyMemberName"
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
          <Label>Issuer (Company)</Label>
          <Input {...register('fd_issuer')} />
        </div>
        <div>
          <Label>Date of Purchase</Label>
          <Input type="date" {...register('fd_purchaseDate')} />
        </div>
        <div>
          <Label>Date of Maturity</Label>
          <Input type="date" {...register('fd_maturityDate')} />
        </div>
        <div>
          <Label>Interest (%)</Label>
          <Input type="number" {...register('fd_interest', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Period (DDMMYYYY)</Label>
          <Input {...register('fd_period')} onInput={handlePeriodInput} maxLength={8} placeholder="DDMMYYYY" />
        </div>
      </div>
    </div>
  );
}
