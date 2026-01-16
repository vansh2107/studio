
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function PPFFields({ control, errors, familyMembers, register, watch, getValues, setValue }: { control: any; errors: any; familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any; }) {

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === '') {
      field.onChange('');
      return;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      field.onChange('0');
    } else {
      field.onChange(value);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">PPF Details</h3>
      
      <JointHolderFields control={control} register={register} errors={errors?.jointHolders} />

      <div className="space-y-4 pt-4">
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Family Member Name</Label>
            <Controller
              name="ppf.familyMemberName"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Member" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyMembers.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {errors?.familyMemberName && <p className="text-sm text-destructive mt-1">{errors.familyMemberName.message}</p>}
          </div>
          <div>
            <Label>Bank Name</Label>
            <Controller name="ppf.bankName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
             {errors?.bankName && <p className="text-sm text-destructive mt-1">{errors.bankName.message}</p>}
          </div>
          <div>
            <Label>Bank Account Number</Label>
            <Controller name="ppf.bankAccountNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            {errors?.bankAccountNumber && <p className="text-sm text-destructive mt-1">{errors.bankAccountNumber.message}</p>}
          </div>
        </div>
        
        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Contributed Amount</Label>
            <Controller name="ppf.contributedAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.contributedAmount && <p className="text-sm text-destructive mt-1">{errors.contributedAmount.message}</p>}
          </div>
           <div>
            <Label>Balance</Label>
            <Controller name="ppf.balance" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.balance && <p className="text-sm text-destructive mt-1">{errors.balance.message}</p>}
          </div>
          <div>
            <Label>Date of Opening</Label>
            <Controller name="ppf.openingDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
          </div>
          <div>
            <Label>Date of Mature</Label>
            <Controller name="ppf.matureDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
          </div>
        </div>
      </div>

      <NomineeFields control={control} errors={errors?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
    </div>
  );
}
