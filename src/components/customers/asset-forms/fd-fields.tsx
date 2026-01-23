
'use client';
import { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export function FDFields({ control, errors, familyMembers, register, watch, getValues, setValue, trigger }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any, trigger: any }) {
  const [isMobileReadOnly, setIsMobileReadOnly] = useState(true);
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(true);

  const mobileInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const holderName = watch('fixedDeposits.holderName');

  useEffect(() => {
    if (holderName) {
      const member = familyMembers.find(m => m.name === holderName);
      if (member) {
        setValue('fixedDeposits.mobileNumber', member.phoneNumber || '', { shouldValidate: true });
        setValue('fixedDeposits.emailAddress', (member as any).email || (member as any).emailId || '', { shouldValidate: true });
      }
    }
    setIsMobileReadOnly(true);
    setIsEmailReadOnly(true);
  }, [holderName, familyMembers, setValue]);

  useEffect(() => {
    if (!isMobileReadOnly && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [isMobileReadOnly]);
  
  useEffect(() => {
    if (!isEmailReadOnly && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isEmailReadOnly]);
    
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

  const getToday = () => new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Fixed Deposit Details</h3>
        
        <JointHolderFields
            control={control}
            errors={errors}
            familyMembers={familyMembers}
            watch={watch}
            holderNamePath="fixedDeposits.holderName"
            jointHoldersPath="fixedDeposits.jointHolders"
        />

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
                <Label>Company/Bank Name</Label>
                <Controller name="fixedDeposits.companyName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                 {errors?.fixedDeposits?.companyName && <p className="text-sm text-destructive mt-1">{errors.fixedDeposits.companyName.message}</p>}
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
            <div className="space-y-1">
                <Label>Mobile Number</Label>
                <div className="relative">
                    <Controller
                        name="fixedDeposits.mobileNumber"
                        control={control}
                        render={({ field }) => (
                            <Input
                              type="tel"
                              maxLength={10}
                              {...field}
                              ref={mobileInputRef}
                              readOnly={isMobileReadOnly}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value);
                              }}
                              value={field.value || ''}
                              className="pr-10"
                            />
                        )}
                    />
                    {isMobileReadOnly && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={() => setIsMobileReadOnly(false)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                 </div>
                 {errors?.fixedDeposits?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.fixedDeposits.mobileNumber.message}</p>}
            </div>
            <div className="space-y-1">
                <Label>Email Address</Label>
                <div className="relative">
                    <Controller
                        name="fixedDeposits.emailAddress"
                        control={control}
                        render={({ field }) => (
                            <Input 
                                type="email" 
                                {...field}
                                ref={emailInputRef}
                                readOnly={isEmailReadOnly}
                                value={field.value || ''} 
                                className="pr-10"
                            />
                        )}
                    />
                    {isEmailReadOnly && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={() => setIsEmailReadOnly(false)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                 </div>
                 {errors?.fixedDeposits?.emailAddress && <p className="text-sm text-destructive mt-1">{errors.fixedDeposits.emailAddress.message}</p>}
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
                <Controller name="fixedDeposits.purchaseDate" control={control} render={({ field }) => <Input type="date" max={getToday()} {...field} value={field.value || ''} />} />
                {errors?.fixedDeposits?.purchaseDate && <p className="text-sm text-destructive mt-1">{errors.fixedDeposits.purchaseDate.message}</p>}
            </div>
            <div>
                <Label>Date of Maturity</Label>
                <Controller name="fixedDeposits.maturityDate" control={control} render={({ field }) => <Input type="date" min={getToday()} {...field} value={field.value || ''} />} />
                {errors?.fixedDeposits?.maturityDate && <p className="text-sm text-destructive mt-1">{errors.fixedDeposits.maturityDate.message}</p>}
            </div>
        </div>
        <NomineeFields control={control} errors={errors?.fixedDeposits?.nominees} familyMembers={familyMembers} getValues={getValues} setValue={setValue} fieldPath="fixedDeposits.nominees" trigger={trigger} />
    </div>
  );
}
