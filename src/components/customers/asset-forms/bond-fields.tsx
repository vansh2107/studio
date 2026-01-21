
'use client';
import { useEffect, useState, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';


export function BondFields({ control, errors, familyMembers, watch, register, getValues, setValue, trigger }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], watch: any, register: any, getValues: any, setValue: any, trigger: any }) {
  const [isMobileReadOnly, setIsMobileReadOnly] = useState(true);
  const [isEmailReadOnly, setIsEmailReadOnly] = useState(true);

  const mobileInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const holderName = watch('bonds.holderName');
  const bondPrice = watch('bonds.bondPrice');
  const bondUnit = watch('bonds.bondUnit');

  useEffect(() => {
    if (holderName) {
      const member = familyMembers.find(m => m.name === holderName);
      if (member) {
        setValue('bonds.mobileNumber', member.phoneNumber || '', { shouldValidate: true });
        setValue('bonds.emailAddress', (member as any).email || (member as any).emailId || '', { shouldValidate: true });
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


  useEffect(() => {
    const price = parseFloat(bondPrice);
    const unit = parseInt(bondUnit, 10);
    if (!isNaN(price) && !isNaN(unit)) {
      setValue('bonds.bondAmount', price * unit, { shouldValidate: true });
    } else {
      setValue('bonds.bondAmount', undefined, { shouldValidate: true });
    }
  }, [bondPrice, bondUnit, setValue]);

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
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Bond Details</h3>
      
      <JointHolderFields
        control={control}
        errors={errors}
        familyMembers={familyMembers}
        watch={watch}
        holderNamePath="bonds.holderName"
        jointHoldersPath="bonds.jointHolders"
      />

      <div className="space-y-4 pt-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Mobile Number</Label>
            <div className="relative">
              <Controller
                name="bonds.mobileNumber"
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
            {errors?.bonds?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.bonds.mobileNumber.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email Address</Label>
            <div className="relative">
              <Controller
                name="bonds.emailAddress"
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
            {errors?.bonds?.emailAddress && <p className="text-sm text-destructive mt-1">{errors.bonds.emailAddress.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Issuer</Label>
            <Controller name="bonds.issuer" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
             {errors?.bonds?.issuer && <p className="text-sm text-destructive mt-1">{errors.bonds.issuer.message}</p>}
          </div>
          <div>
            <Label>ISIN Number</Label>
            <Controller
              name="bonds.isin"
              control={control}
              render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Enter ISIN" />}
            />
          </div>
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Bond Price</Label>
            <Controller name="bonds.bondPrice" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.bonds?.bondPrice && <p className="text-sm text-destructive mt-1">{errors.bonds.bondPrice.message}</p>}
          </div>
          <div>
            <Label>Bond Unit</Label>
            <Controller name="bonds.bondUnit" control={control} render={({ field }) => <Input type="number" min="0" step="1" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.bonds?.bondUnit && <p className="text-sm text-destructive mt-1">{errors.bonds.bondUnit.message}</p>}
          </div>
          <div>
            <Label>Bond Amount</Label>
            <Controller name="bonds.bondAmount" control={control} render={({ field }) => <Input readOnly {...field} value={field.value || ''} />} />
            {errors?.bonds?.bondAmount && <p className="text-sm text-destructive mt-1">{errors.bonds.bondAmount.message}</p>}
          </div>
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Purchase Date</Label>
            <Controller name="bonds.purchaseDate" control={control} render={({ field }) => <Input type="date" max={getToday()} {...field} value={field.value || ''} />} />
            {errors?.bonds?.purchaseDate && <p className="text-sm text-destructive mt-1">{errors.bonds.purchaseDate.message}</p>}
          </div>
          <div>
            <Label>Maturity Date</Label>
            <Controller name="bonds.maturityDate" control={control} render={({ field }) => <Input type="date" min={getToday()} {...field} value={field.value || ''} />} />
            {errors?.bonds?.maturityDate && <p className="text-sm text-destructive mt-1">{errors.bonds.maturityDate.message}</p>}
          </div>
        </div>
        
        <NomineeFields control={control} errors={errors?.bonds?.nominees} familyMembers={familyMembers} getValues={getValues} setValue={setValue} fieldPath="bonds.nominees" trigger={trigger} />
      </div>
    </div>
  );
}
