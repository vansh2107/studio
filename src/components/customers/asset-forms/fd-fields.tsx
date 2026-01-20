
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function FDFields({ control, errors, familyMembers, register, watch, getValues, setValue }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any }) {
    
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: any, max?: number) => {
    let value = e.target.value;
    if (value === '') {
      field.onChange('');
      return;
    }
    let numValue = Number(value);
    if (numValue < 0) {
      numValue = 0;
    }
    if (max !== undefined && numValue > max) {
        numValue = max;
    }
    field.onChange(String(numValue));
  };


  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Fixed Deposit Details</h3>
        
        <JointHolderFields control={control} register={register} errors={errors?.fixedDeposits?.jointHolders} fieldPath="fixedDeposits.jointHolders" />

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
                <Label>Company/Bank Name</Label>
                <Controller name="fixedDeposits.companyName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                 {errors?.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
                <Label>Investor Name</Label>
                <Controller name="fixedDeposits.investorName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                 {errors?.investorName && <p className="text-sm text-destructive mt-1">{errors.investorName.message}</p>}
            </div>
            <div>
                <Label>FD Name</Label>
                <Controller name="fixedDeposits.fdName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
        </div>
        
        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <Label>FD Number</Label>
                <Controller name="fixedDeposits.fdNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Mobile Number</Label>
                <Controller
                    name="fixedDeposits.mobileNumber"
                    control={control}
                    render={({ field }) => (
                        <Input
                          type="tel"
                          maxLength={10}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                          value={field.value || ''}
                        />
                    )}
                />
                 {errors?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.mobileNumber.message}</p>}
            </div>
            <div>
                <Label>Email Address</Label>
                <Controller
                    name="fixedDeposits.emailAddress"
                    control={control}
                    render={({ field }) => (
                        <Input type="email" {...field} value={field.value || ''} />
                    )}
                />
                 {errors?.emailAddress && <p className="text-sm text-destructive mt-1">{errors.emailAddress.message}</p>}
            </div>
        </div>

        {/* ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
                <Label>Period (Month)</Label>
                <Controller
                    name="fixedDeposits.periodMonth"
                    control={control}
                    render={({ field }) => <Input type="number" min="0" max="999" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field, 999)} value={field.value || ''} />}
                />
            </div>
            <div>
                <Label>Period (Days)</Label>
                 <Controller
                    name="fixedDeposits.periodDays"
                    control={control}
                    render={({ field }) => <Input type="number" min="0" max="365" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field, 365)} value={field.value || ''} />}
                />
            </div>
            <div>
                <Label>Interest Rate (%)</Label>
                <Controller name="fixedDeposits.interestRate" control={control} render={({ field }) => <Input type="number" min="0" max="100" step="any" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field, 100)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Maturity Amount (₹)</Label>
                <Controller name="fixedDeposits.maturityAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
        </div>

        {/* ROW 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <Label>Deposited Amount (₹)</Label>
                <Controller name="fixedDeposits.depositedAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Date of Purchase</Label>
                <Controller name="fixedDeposits.purchaseDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Date of Maturity</Label>
                <Controller name="fixedDeposits.maturityDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
        </div>
        <NomineeFields control={control} errors={errors?.fixedDeposits?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} fieldPath="fixedDeposits.nominees" />
    </div>
  );
}
