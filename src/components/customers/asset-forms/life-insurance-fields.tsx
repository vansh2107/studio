
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function LifeInsuranceFields({ control, errors, familyMembers, register, watch, getValues, setValue }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any }) {

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Holder Name</Label>
                <Controller
                    name="lifeInsurance.holderName"
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
                {errors?.holderName && <p className="text-sm text-destructive">{errors.holderName.message}</p>}
            </div>
        </div>
        
        <JointHolderFields control={control} register={register} errors={errors?.lifeInsurance?.jointHolders} fieldPath="lifeInsurance.jointHolders" />
        
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
                {errors?.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
            </div>
            <div>
                <Label>Policy Number</Label>
                <Controller name="lifeInsurance.policyNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Enter Policy Number"/>} />
                 {errors?.policyNumber && <p className="text-sm text-destructive">{errors.policyNumber.message}</p>}
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
                {errors?.policyStartDate && <p className="text-sm text-destructive mt-1">{errors.policyStartDate.message}</p>}
            </div>
            <div>
                <Label>Policy End Date</Label>
                <Controller name="lifeInsurance.policyEndDate" control={control} render={({ field }) => <Input type="date" min={getToday()} {...field} value={field.value || ''} />} />
                {errors?.policyEndDate && <p className="text-sm text-destructive mt-1">{errors.policyEndDate.message}</p>}
            </div>
        </div>
        <NomineeFields control={control} errors={errors?.lifeInsurance?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} fieldPath="lifeInsurance.nominees" />
    </div>
  );
}
