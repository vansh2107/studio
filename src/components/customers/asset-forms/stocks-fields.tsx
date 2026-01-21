
'use client';

import { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Client, FamilyMember } from '@/lib/types';
import { NomineeFields } from './nominee-fields';
import { JointHolderFields } from './joint-holder-fields';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export function StocksFields({ control, register, errors, familyMembers, watch, getValues, setValue }: { control: any; register: any; errors: any; familyMembers: (Client | FamilyMember)[], watch: any; getValues: any; setValue: any; }) {
  const [isMobileReadOnly, setIsMobileReadOnly] = useState(true);
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(true);

  const mobileInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const holderName = watch('stocks.holderName');

  useEffect(() => {
    if (holderName) {
      const member = familyMembers.find(m => m.name === holderName);
      if (member) {
        setValue('stocks.mobileNumber', member.phoneNumber || '', { shouldValidate: true });
        setValue('stocks.emailAddress', (member as any).email || (member as any).emailId || '', { shouldValidate: true });
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Holder Details</h3>
        
        <JointHolderFields
            control={control}
            errors={errors}
            familyMembers={familyMembers}
            watch={watch}
            holderNamePath="stocks.holderName"
            jointHoldersPath="stocks.jointHolders"
        />
      </div>

      <Separator />

      <h3 className="font-semibold text-lg border-b pb-2 mb-4">DP Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>DPID</Label>
            <Controller
              name="stocks.dpId"
              control={control}
              render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Enter DPID" />}
            />
           {errors?.stocks?.dpId && <p className="text-sm text-destructive">{errors.stocks.dpId.message}</p>}
        </div>
        <div>
          <Label>DP Name</Label>
          <Input {...register('stocks.dpName')} />
           {errors?.stocks?.dpName && <p className="text-sm text-destructive">{errors.stocks.dpName.message}</p>}
        </div>
        <div>
          <Label>Bank Name</Label>
          <Input {...register('stocks.bankName')} />
           {errors?.stocks?.bankName && <p className="text-sm text-destructive">{errors.stocks.bankName.message}</p>}
        </div>
        <div>
          <Label>Bank Account Number</Label>
          <Input {...register('stocks.bankAccountNumber')} />
           {errors?.stocks?.bankAccountNumber && <p className="text-sm text-destructive">{errors.stocks.bankAccountNumber.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Mobile Number</Label>
          <div className="relative">
            <Controller
              name="stocks.mobileNumber"
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
           {errors?.stocks?.mobileNumber && <p className="text-sm text-destructive">{errors.stocks.mobileNumber.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Email Address</Label>
          <div className="relative">
             <Controller
              name="stocks.emailAddress"
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
           {errors?.stocks?.emailAddress && <p className="text-sm text-destructive">{errors.stocks.emailAddress.message}</p>}
        </div>

      </div>

      <Separator />

      <NomineeFields control={control} errors={errors?.stocks?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} fieldPath="stocks.nominees" />
    </div>
  );
}
