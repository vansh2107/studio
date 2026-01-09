
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GENERAL_INSURANCE_CATEGORIES, GENERAL_INSURANCE_POLICY_TYPES } from '@/lib/asset-form-types';
import { Client, FamilyMember } from '@/lib/types';
import { useWatch } from 'react-hook-form';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function GeneralInsuranceFields({ control, errors, familyMembers, register, watch, getValues, setValue }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any }) {

  const selectedCategory = useWatch({
    control,
    name: 'generalInsurance.category',
  });

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
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">General Insurance Details</h3>

        <JointHolderFields control={control} register={register} errors={errors?.jointHolders} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div>
              <Label>Family Member</Label>
              <Controller
                name="generalInsurance.familyMember"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
             <div>
              <Label>Category</Label>
              <Controller
                name="generalInsurance.category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENERAL_INSURANCE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
                <Label>Issuer</Label>
                 <Controller
                  name="generalInsurance.issuer"
                  control={control}
                  render={({ field }) => (
                     <Combobox
                      options={INSURANCE_COMPANIES.map(c => ({ label: c, value: c }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Insurance Company"
                      searchPlaceholder='Search company...'
                    />
                  )}
                />
                {errors?.generalInsurance?.issuer && <p className="text-sm text-destructive">{errors.generalInsurance.issuer.message}</p>}
            </div>
             <div>
                <Label>Plan Name</Label>
                <Controller name="generalInsurance.planName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Policy Number</Label>
                <Controller name="generalInsurance.policyNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
            <div>
              <Label>Policy Type</Label>
              <Controller
                name="generalInsurance.policyType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENERAL_INSURANCE_POLICY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
                <Label>Policy Start Date</Label>
                <Controller name="generalInsurance.policyStartDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Policy Issue Date</Label>
                <Controller name="generalInsurance.policyIssueDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Policy End Date</Label>
                <Controller name="generalInsurance.policyEndDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            {(selectedCategory === 'FOUR WHEELER' || selectedCategory === 'TWO WHEELER') && (
                 <div>
                    <Label>Vehicle Registration Number</Label>
                    <Controller name="generalInsurance.vehicleRegNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                </div>
            )}
             <div>
                <Label>Sum Assured</Label>
                <Controller name="generalInsurance.sumAssured" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Price Without GST</Label>
                <Controller name="generalInsurance.priceWithoutGST" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Price With GST</Label>
                <Controller name="generalInsurance.priceWithGST" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 lg:col-span-3">
              <div>
                <Label>Eligible Premium</Label>
                <Controller name="generalInsurance.eligiblePremium" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
              </div>
              <div>
                <Label>Reference Agent</Label>
                <Controller name="generalInsurance.referenceAgent" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
              </div>
            </div>
        </div>
        <NomineeFields control={control} errors={errors?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
    </div>
  );
}
