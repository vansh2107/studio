
'use client';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';


export function BondFields({ control, errors, familyMembers, setValue, watch }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], setValue: any, watch: any }) {
  
  const bondPrice = watch('bondPrice');
  const bondUnit = watch('bondUnit');

  useEffect(() => {
    const price = parseFloat(bondPrice) || 0;
    const unit = parseInt(bondUnit, 10) || 0;
    setValue('bondAmount', price * unit, { shouldValidate: true });
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

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Bond Details</h3>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
              <Label>Family Member</Label>
              <Controller
                  name="familyMember"
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
            <Label>Issuer</Label>
            <Controller name="issuer" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
          </div>
          <div>
            <Label>ISIN Number</Label>
            <Controller name="isin" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
          </div>
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Bond Price</Label>
            <Controller name="bondPrice" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.bondPrice && <p className="text-sm text-destructive mt-1">{errors.bondPrice.message}</p>}
          </div>
          <div>
            <Label>Bond Unit</Label>
            <Controller name="bondUnit" control={control} render={({ field }) => <Input type="number" min="0" step="1" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            {errors?.bondUnit && <p className="text-sm text-destructive mt-1">{errors.bondUnit.message}</p>}
          </div>
          <div>
            <Label>Bond Amount</Label>
            <Controller name="bondAmount" control={control} render={({ field }) => <Input readOnly {...field} value={field.value || ''} />} />
            {errors?.bondAmount && <p className="text-sm text-destructive mt-1">{errors.bondAmount.message}</p>}
          </div>
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Purchase Date</Label>
            <Controller name="purchaseDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
          </div>
          <div>
            <Label>Maturity Date</Label>
            <Controller name="maturityDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
          </div>
        </div>
      </div>
    </div>
  );
}
