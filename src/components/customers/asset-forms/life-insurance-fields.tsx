
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function LifeInsuranceFields({ control, errors, familyMembers, register, watch, getValues, setValue, trigger }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any, trigger: any }) {

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
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Life Insurance Details</h3>

        <JointHolderFields
            control={control}
            errors={errors}
            familyMembers={familyMembers}
            watch={watch}
            holderNamePath="lifeInsurance.holderName"
            jointHoldersPath="lifeInsurance.jointHolders"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div>
                <Label>Company</Label>
                 <Controller
                  name="lifeInsurance.company"
                  control={control}
                  render={({ field }) => (
                     <Combobox
                      options={INSURANCE_COMPANIES.map(c => ({ label: c, value: c }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Select Insurance Company"
                      searchPlaceholder='Search company...'
                    />
                  )}
                />
                {errors?.lifeInsurance?.company && <p className="text-sm text-destructive">{errors.lifeInsurance.company.message}</p>}
            </div>
            <div>
                <Label>Policy Number</Label>
                <Controller name="lifeInsurance.policyNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Enter Policy Number"/>} />
                 {errors?.lifeInsurance?.policyNumber && <p className="text-sm text-destructive">{errors.lifeInsurance.policyNumber.message}</p>}
            </div>
             <div>
                <Label>Plan Name</Label>
                <Controller name="lifeInsurance.planName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
             <div>
                <Label>Sum Assured</Label>
                <Controller name="lifeInsurance.sumAssured" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Premium Amount</Label>
                <Controller name="lifeInsurance.premiumAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Policy Start Date</Label>
                <Controller name="lifeInsurance.policyStartDate" control={control} render={({ field }) => <Input type="date" max={getToday()} {...field} value={field.value || ''} />} />
                {errors?.lifeInsurance?.policyStartDate && <p className="text-sm text-destructive mt-1">{errors.lifeInsurance.policyStartDate.message}</p>}
            </div>
            <div>
                <Label>Policy End Date</Label>
                <Controller name="lifeInsurance.policyEndDate" control={control} render={({ field }) => <Input type="date" min={getToday()} {...field} value={field.value || ''} />} />
                {errors?.lifeInsurance?.policyEndDate && <p className="text-sm text-destructive mt-1">{errors.lifeInsurance.policyEndDate.message}</p>}
            </div>
        </div>
        <NomineeFields control={control} errors={errors?.lifeInsurance?.nominees} familyMembers={familyMembers} getValues={getValues} setValue={setValue} fieldPath="lifeInsurance.nominees" trigger={trigger} holderNamePath="lifeInsurance.holderName" jointHoldersPath="lifeInsurance.jointHolders" />
    </div>
  );
}
