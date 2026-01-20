
'use client';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';


export function BondFields({ control, errors, familyMembers, watch, register, getValues, setValue }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], watch: any, register: any, getValues: any, setValue: any }) {

  const bondPrice = watch('bonds.bondPrice');
  const bondUnit = watch('bonds.bondUnit');

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Holder Name</Label>
          <Controller
              name="bonds.holderName"
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
            {errors?.bonds?.holderName && <p className="text-sm text-destructive mt-1">{errors.bonds.holderName.message}</p>}
        </div>
      </div>
      
      <JointHolderFields 
        control={control} 
        errors={errors?.bonds?.jointHolders} 
        fieldPath="bonds.jointHolders"
        familyMembers={familyMembers}
        watch={watch}
        holderNamePath="bonds.holderName"
      />

      <div className="space-y-4 pt-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mobile Number</Label>
            <Controller
              name="bonds.mobileNumber"
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
            {errors?.bonds?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.bonds.mobileNumber.message}</p>}
          </div>
          <div>
            <Label>Email Address</Label>
            <Controller
              name="bonds.emailAddress"
              control={control}
              render={({ field }) => <Input type="email" {...field} value={field.value || ''} />}
            />
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
        
        <NomineeFields control={control} errors={errors?.bonds?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} fieldPath="bonds.nominees" />
      </div>
    </div>
  );
}
