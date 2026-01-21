
'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';
import type { Client, FamilyMember } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { JointHolderFields } from './joint-holder-fields';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';


export function PhysicalToDematFields({ register, errors, control, familyMembers, watch, setValue }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[], watch: any, setValue: any }) {
  const [isMobileReadOnly, setIsMobileReadOnly] = useState(true);
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(true);

  const mobileInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const holderName = watch('physicalToDemat.holderName');
  const quantity = watch('physicalToDemat.quantity');
  const marketPrice = watch('physicalToDemat.marketPrice');

  useEffect(() => {
    if (holderName) {
      const member = familyMembers.find(m => m.name === holderName);
      if (member) {
        setValue('physicalToDemat.mobileNumber', member.phoneNumber || '', { shouldValidate: true });
        setValue('physicalToDemat.emailAddress', (member as any).email || (member as any).emailId || '', { shouldValidate: true });
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


  useEffect(() => {
    const q = parseFloat(quantity);
    const mp = parseFloat(marketPrice);
    if (!isNaN(q) && !isNaN(mp)) {
      setValue('physicalToDemat.totalValue', q * mp);
    } else {
        setValue('physicalToDemat.totalValue', undefined);
    }
  }, [quantity, marketPrice, setValue]);


  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Physical to Demat Details</h3>
      
      <JointHolderFields
        control={control}
        errors={errors}
        familyMembers={familyMembers}
        watch={watch}
        holderNamePath="physicalToDemat.holderName"
        jointHoldersPath="physicalToDemat.jointHolders"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="space-y-1">
          <Label>Mobile Number</Label>
          <div className="relative">
            <Controller
              name="physicalToDemat.mobileNumber"
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
          {errors?.physicalToDemat?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.mobileNumber.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Email Address</Label>
           <div className="relative">
            <Controller
              name="physicalToDemat.emailAddress"
              control={control}
              render={({ field }) => 
                <Input 
                  type="email" 
                  {...field} 
                  ref={emailInputRef}
                  readOnly={isEmailReadOnly}
                  value={field.value || ''} 
                  className="pr-10"
                />
              }
            />
             {isEmailReadOnly && (
              <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={() => setIsEmailReadOnly(false)}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          {errors?.physicalToDemat?.emailAddress && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.emailAddress.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Name on Share</Label>
          <Input {...register('physicalToDemat.nameOnShare')} />
        </div>
        <div>
          <Label>Folio Number</Label>
          <Controller
              name="physicalToDemat.folioNumber"
              control={control}
              render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Enter Folio Number" />}
          />
        </div>
         <div>
          <Label>Company Name</Label>
          <Input {...register('physicalToDemat.companyName')} />
        </div>
        <div>
          <Label>RTA Name</Label>
          <Input {...register('physicalToDemat.rtaName')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Quantity</Label>
          <Controller name="physicalToDemat.quantity" control={control} render={({ field }) => <Input type="number" min="0" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
          {errors?.physicalToDemat?.quantity && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.quantity.message}</p>}
        </div>
        <div>
          <Label>Market Price</Label>
          <Controller name="physicalToDemat.marketPrice" control={control} render={({ field }) => <Input type="number" min="0" step="any" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
          {errors?.physicalToDemat?.marketPrice && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.marketPrice.message}</p>}
        </div>
        <div>
          <Label>Total Value</Label>
          <Input readOnly {...register('physicalToDemat.totalValue')} />
          {errors?.physicalToDemat?.totalValue && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.totalValue.message}</p>}
        </div>
      </div>
      
    </div>
  );
}
