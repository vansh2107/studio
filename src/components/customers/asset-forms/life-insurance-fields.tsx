
'use client';
import { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const premiumModeMultipliers = {
  'Yearly': 1,
  'Half-Yearly': 2,
  'Quarterly': 4,
  'Monthly': 12,
};

export function LifeInsuranceFields({ control, errors, familyMembers, register, watch, getValues, setValue, trigger }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any, trigger: any }) {

  const watchedFields = useWatch({
    control,
    name: [
      'lifeInsurance.grossAmount',
      'lifeInsurance.gst',
      'lifeInsurance.premiumsPaid',
      'lifeInsurance.netAmount',
      'lifeInsurance.premiumMode',
      'lifeInsurance.premiumPayingTerm',
    ]
  });

  // Calculate Net Amount
  useEffect(() => {
    const gross = parseFloat(watchedFields[0]);
    const gst = parseFloat(watchedFields[1]);
    const netAmount = (isNaN(gross) ? 0 : gross) + (isNaN(gst) ? 0 : gst);
    setValue('lifeInsurance.netAmount', netAmount > 0 ? netAmount : '', { shouldValidate: true });
  }, [watchedFields[0], watchedFields[1], setValue]);

  // Calculate Total Paid
  useEffect(() => {
    const premiumsPaid = parseInt(watchedFields[2], 10);
    const netAmount = parseFloat(watchedFields[3]);
    const totalPaid = (isNaN(premiumsPaid) ? 0 : premiumsPaid) * (isNaN(netAmount) ? 0 : netAmount);
    setValue('lifeInsurance.totalPaid', totalPaid > 0 ? totalPaid : '', { shouldValidate: true });
  }, [watchedFields[2], watchedFields[3], setValue]);
  
  // Calculate Premium Pending
  useEffect(() => {
    const premiumMode = watchedFields[4] as keyof typeof premiumModeMultipliers;
    const premiumPayingTerm = parseInt(watchedFields[5], 10);
    const premiumsPaid = parseInt(watchedFields[2], 10);
    const netAmount = parseFloat(watchedFields[3]);
    
    const multiplier = premiumModeMultipliers[premiumMode] || 0;
    
    if (!isNaN(premiumPayingTerm) && !isNaN(premiumsPaid) && !isNaN(netAmount) && multiplier > 0) {
      const totalPremiums = premiumPayingTerm * multiplier;
      const pendingPremiums = totalPremiums - premiumsPaid;
      const pendingAmount = (pendingPremiums > 0 ? pendingPremiums : 0) * netAmount;
      setValue('lifeInsurance.premiumPending', pendingAmount > 0 ? pendingAmount : '', { shouldValidate: true });
    } else {
      setValue('lifeInsurance.premiumPending', '', { shouldValidate: true });
    }
  }, [watchedFields[4], watchedFields[5], watchedFields[2], watchedFields[3], setValue]);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: any, isInt = false) => {
    const value = e.target.value;
    if (value === '') {
      field.onChange('');
      return;
    }
    
    if (isInt && value.includes('.')) {
        return;
    }

    const numValue = isInt ? parseInt(value, 10) : parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      field.onChange('');
    } else {
      field.onChange(String(numValue));
    }
  };
  
  const getToday = () => new Date().toISOString().split('T')[0];
  const holderOptions = familyMembers.map(m => ({ label: m.name, value: m.name }));

  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Life Insurance Details</h3>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Holder Name</Label>
            <Controller name="lifeInsurance.holderName" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger><SelectValue placeholder="Select Holder" /></SelectTrigger>
                  <SelectContent>{holderOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )} />
          </div>
          <div>
            <Label>Proposer</Label>
            <Controller name="lifeInsurance.proposer" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger><SelectValue placeholder="Select Proposer" /></SelectTrigger>
                  <SelectContent>{holderOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )} />
          </div>
          <div>
            <Label>Life Assured</Label>
            <Controller name="lifeInsurance.lifeAssured" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}><SelectTrigger><SelectValue placeholder="Select Life Assured" /></SelectTrigger>
                  <SelectContent>{holderOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
            )} />
          </div>
        </div>

        {/* Row 2 */}
        <JointHolderFields
            control={control}
            errors={errors}
            familyMembers={familyMembers}
            watch={watch}
            holderNamePath="lifeInsurance.holderName"
            jointHoldersPath="lifeInsurance.jointHolders"
            showPrimaryHolder={false}
        />
        
        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
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
                <Label>Plan Name</Label>
                <Controller name="lifeInsurance.planName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
             <div>
                <Label>Plan Type</Label>
                <Controller name="lifeInsurance.planType" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
        </div>
        
        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label>Policy Number</Label>
                <Controller name="lifeInsurance.policyNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                {errors?.lifeInsurance?.policyNumber && <p className="text-sm text-destructive">{errors.lifeInsurance.policyNumber.message}</p>}
            </div>
            <div>
                <Label>Date of Purchase</Label>
                <Controller name="lifeInsurance.policyStartDate" control={control} render={({ field }) => <Input type="date" max={getToday()} {...field} value={field.value || ''} />} />
                {errors?.lifeInsurance?.policyStartDate && <p className="text-sm text-destructive mt-1">{errors.lifeInsurance.policyStartDate.message}</p>}
            </div>
            <div>
                <Label>Premium Mode</Label>
                <Controller name="lifeInsurance.premiumMode" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                        <SelectContent>{Object.keys(premiumModeMultipliers).map(mode => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}</SelectContent>
                    </Select>
                )} />
            </div>
        </div>
        
        {/* Row 5 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <Label>Policy Term (Yrs)</Label>
                <Controller name="lifeInsurance.policyTerm" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field, true)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Premium Paying Term (Yrs)</Label>
                <Controller name="lifeInsurance.premiumPayingTerm" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field, true)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>No. of Premium Paid</Label>
                <Controller name="lifeInsurance.premiumsPaid" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field, true)} value={field.value || ''} />} />
            </div>
        </div>

        {/* Row 6 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label>Gross Amount</Label>
                <Controller name="lifeInsurance.grossAmount" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>GST</Label>
                <Controller name="lifeInsurance.gst" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Net Amount</Label>
                <Controller name="lifeInsurance.netAmount" control={control} render={({ field }) => <Input readOnly {...field} value={field.value || ''} />} />
            </div>
        </div>
        
        {/* Row 7 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label>Last Premium Paid Date</Label>
                <Controller name="lifeInsurance.lastPremiumPaidDate" control={control} render={({ field }) => <Input type="date" max={getToday()} {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Total Paid</Label>
                <Controller name="lifeInsurance.totalPaid" control={control} render={({ field }) => <Input readOnly {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Premium Pending</Label>
                <Controller name="lifeInsurance.premiumPending" control={control} render={({ field }) => <Input readOnly {...field} value={field.value || ''} />} />
            </div>
        </div>

        {/* Row 8 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label>Liability</Label>
                <Controller name="lifeInsurance.liability" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Bonus / Funds Value</Label>
                <Controller name="lifeInsurance.bonusValue" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Sum Assured</Label>
                <Controller name="lifeInsurance.sumAssured" control={control} render={({ field }) => <Input type="number" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
        </div>
        
        {/* Row 9 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label>Maturity Date</Label>
                <Controller name="lifeInsurance.policyEndDate" control={control} render={({ field }) => <Input type="date" min={getToday()} {...field} value={field.value || ''} />} />
                {errors?.lifeInsurance?.policyEndDate && <p className="text-sm text-destructive mt-1">{errors.lifeInsurance.policyEndDate.message}</p>}
            </div>
            <div>
                <Label>Status of Policy</Label>
                <Controller name="lifeInsurance.status" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
                 <Controller name="lifeInsurance.isActive" control={control} render={({ field }) => <Switch id="is-active" checked={field.value} onCheckedChange={field.onChange} />} />
                 <Label htmlFor="is-active">Active / Inactive</Label>
            </div>
        </div>
        
        {/* Row 10 */}
        <NomineeFields control={control} errors={errors?.lifeInsurance?.nominees} familyMembers={familyMembers} getValues={getValues} setValue={setValue} fieldPath="lifeInsurance.nominees" trigger={trigger} holderNamePath="lifeInsurance.holderName" jointHoldersPath="lifeInsurance.jointHolders" />
    </div>
  );
}
