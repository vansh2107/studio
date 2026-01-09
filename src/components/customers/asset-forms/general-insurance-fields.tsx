
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GENERAL_INSURANCE_CATEGORIES, GENERAL_INSURANCE_POLICY_TYPES } from '@/lib/asset-form-types';
import { Client, FamilyMember } from '@/lib/types';
import { useWatch } from 'react-hook-form';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';

export function GeneralInsuranceFields({ control, errors, familyMembers }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[] }) {

  const selectedCategory = useWatch({
    control,
    name: 'gi_category',
  });
  
  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">General Insurance Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Family Member</Label>
              <Controller
                name="gi_familyMember"
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
              <Label>Category</Label>
              <Controller
                name="gi_category"
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
                  name="gi_issuer"
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
            </div>
             <div>
                <Label>Plan Name</Label>
                <Controller name="gi_planName" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
                <Label>Policy Number</Label>
                <Controller name="gi_policyNumber" control={control} render={({ field }) => <Input {...field} />} />
            </div>
            <div>
              <Label>Policy Type</Label>
              <Controller
                name="gi_policyType"
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
                <Controller name="gi_policyStartDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Policy Issue Date</Label>
                <Controller name="gi_policyIssueDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Policy End Date</Label>
                <Controller name="gi_policyEndDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            {(selectedCategory === 'FOUR WHEELER' || selectedCategory === 'TWO WHEELER') && (
                 <div>
                    <Label>Vehicle Registration Number</Label>
                    <Controller name="gi_vehicleRegNumber" control={control} render={({ field }) => <Input {...field} />} />
                </div>
            )}
             <div>
                <Label>Sum Assured</Label>
                <Controller name="gi_sumAssured" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />
            </div>
            <div>
                <Label>Price Without GST</Label>
                <Controller name="gi_priceWithoutGST" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />
            </div>
            <div>
                <Label>Price With GST</Label>
                <Controller name="gi_priceWithGST" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />
            </div>
             <div>
                <Label>Eligible Premium</Label>
                <Controller name="gi_eligiblePremium" control={control} render={({ field }) => <Input type="number" min="0" {...field} />} />
            </div>
            <div>
                <Label>Reference Agent</Label>
                <Controller name="gi_referenceAgent" control={control} render={({ field }) => <Input {...field} />} />
            </div>
        </div>
    </div>
  );
}

    
