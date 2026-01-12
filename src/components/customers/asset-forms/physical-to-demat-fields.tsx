
'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client, FamilyMember } from '@/lib/types';
import { useEffect } from 'react';
import { JointHolderFields } from './joint-holder-fields';


export function PhysicalToDematFields({ register, errors, control, familyMembers, watch, setValue }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[], watch: any, setValue: any }) {
  
  const quantity = watch('physicalToDemat.quantity');
  const marketPrice = watch('physicalToDemat.marketPrice');

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
      setValue('physicalToDemat.totalValue', q * mp, { shouldValidate: true });
    } else {
        setValue('physicalToDemat.totalValue', undefined, { shouldValidate: true });
    }
  }, [quantity, marketPrice, setValue]);


  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Physical to Demat Details</h3>
      
      <JointHolderFields control={control} register={register} errors={errors?.jointHolders} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div>
          <Label>Client Name</Label>
           <Controller
                name="physicalToDemat.clientName"
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
            {errors?.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
        </div>
        <div>
          <Label>Mobile Number</Label>
          <Controller
            name="physicalToDemat.mobileNumber"
            control={control}
            render={({ field }) => (
              <Input
                type="tel"
                maxLength={10}
                onKeyDown={handleNumericKeyDown}
                {...field}
                value={field.value || ''}
              />
            )}
          />
          {errors?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.mobileNumber.message}</p>}
        </div>
        <div>
          <Label>Email Address</Label>
          <Controller
            name="physicalToDemat.emailAddress"
            control={control}
            render={({ field }) => <Input type="email" {...field} value={field.value || ''} />}
          />
          {errors?.emailAddress && <p className="text-sm text-destructive mt-1">{errors.emailAddress.message}</p>}
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
          {errors?.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
        </div>
        <div>
          <Label>Market Price</Label>
          <Controller name="physicalToDemat.marketPrice" control={control} render={({ field }) => <Input type="number" min="0" step="any" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
          {errors?.marketPrice && <p className="text-sm text-destructive mt-1">{errors.marketPrice.message}</p>}
        </div>
        <div>
          <Label>Total Value</Label>
          <Input readOnly {...register('physicalToDemat.totalValue')} />
          {errors?.totalValue && <p className="text-sm text-destructive mt-1">{errors.totalValue.message}</p>}
        </div>
      </div>
      
    </div>
  );
}
