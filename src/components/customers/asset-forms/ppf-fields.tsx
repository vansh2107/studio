
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function PPFFields({ control, errors, familyMembers, register, watch, getValues, setValue, trigger }: { control: any; errors: any; familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any; trigger: any; }) {

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
  
  const getToday = () => new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">PPF Details</h3>
      
      <JointHolderFields
        control={control}
        errors={errors}
        familyMembers={familyMembers}
        watch={watch}
        holderNamePath="ppf.holderName"
        jointHoldersPath="ppf.jointHolders"
      />

      <div className="space-y-4 pt-4">
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Bank Name</Label>
            <Controller name="ppf.bankName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
             {errors?.ppf?.bankName && <p className="text-sm text-destructive mt-1">{errors.ppf.bankName.message}</p>}
          </div>
          <div>
            <Label>PPF Account Number</Label>
            <Controller name="ppf.ppfNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            {errors?.ppf?.ppfNumber && <p className="text-sm text-destructive mt-1">{errors.ppf.ppfNumber.message}</p>}
          </div>
          <div>
            <Label>Bank Account Number (Optional)</Label>
            <Controller name="ppf.bankAccountNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            {errors?.ppf?.bankAccountNumber && <p className="text-sm text-destructive mt-1">{errors.ppf.bankAccountNumber.message}</p>}
          </div>
        </div>
        
        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Contributed Amount</Label>
            <Controller name="ppf.contributedAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.ppf?.contributedAmount && <p className="text-sm text-destructive mt-1">{errors.ppf.contributedAmount.message}</p>}
          </div>
           <div>
            <Label>Balance</Label>
            <Controller name="ppf.balance" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.ppf?.balance && <p className="text-sm text-destructive mt-1">{errors.ppf.balance.message}</p>}
          </div>
          <div>
            <Label>Date of Opening</Label>
            <Controller name="ppf.openingDate" control={control} render={({ field }) => <Input type="date" max={getToday()} {...field} value={field.value || ''} />} />
            {errors?.ppf?.openingDate && <p className="text-sm text-destructive mt-1">{errors.ppf.openingDate.message}</p>}
          </div>
          <div>
            <Label>Date of Mature</Label>
            <Controller name="ppf.matureDate" control={control} render={({ field }) => <Input type="date" min={getToday()} {...field} value={field.value || ''} />} />
            {errors?.ppf?.matureDate && <p className="text-sm text-destructive mt-1">{errors.ppf.matureDate.message}</p>}
          </div>
        </div>
      </div>

      <NomineeFields control={control} errors={errors?.ppf?.nominees} familyMembers={familyMembers} getValues={getValues} setValue={setValue} fieldPath="ppf.nominees" trigger={trigger} />
    </div>
  );
}
