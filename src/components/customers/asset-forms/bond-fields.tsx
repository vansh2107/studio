
'use client';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import { BOND_TRANSACTION_TYPES } from '@/lib/asset-form-types';


export function BondFields({ control, errors, familyMembers, setValue, watch }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], setValue: any, watch: any }) {
  
  const bondPrice = watch('bonds.bondPrice');
  const bondUnit = watch('bonds.bondUnit');

  useEffect(() => {
    const price = parseFloat(bondPrice) || 0;
    const unit = parseInt(bondUnit, 10) || 0;
    setValue('bonds.bondAmount', price * unit, { shouldValidate: true });
  }, [bondPrice, bondUnit, setValue]);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '') {
      setValue(name, '', { shouldValidate: true });
      return;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      setValue(name, '0', { shouldValidate: true });
    } else {
      setValue(name, value, { shouldValidate: true });
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
                  name="bonds.familyMember"
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
            <Controller name="bonds.issuer" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
          </div>
          <div>
            <Label>ISIN Number</Label>
            <Controller name="bonds.isin" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
          </div>
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Bond Price</Label>
            <Controller name="bonds.bondPrice" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e)} value={field.value || ''} />} />
            {errors?.bonds?.bondPrice && <p className="text-sm text-destructive mt-1">{errors.bonds.bondPrice.message}</p>}
          </div>
          <div>
            <Label>Bond Unit</Label>
            <Controller name="bonds.bondUnit" control={control} render={({ field }) => <Input type="number" min="0" step="1" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e)} value={field.value || ''} />} />
            {errors?.bonds?.bondUnit && <p className="text-sm text-destructive mt-1">{errors.bonds.bondUnit.message}</p>}
          </div>
          <div>
            <Label>Bond Amount</Label>
            <Controller name="bonds.bondAmount" control={control} render={({ field }) => <Input readOnly {...field} value={field.value || ''} />} />
            {errors?.bonds?.bondAmount && <p className="text-sm text-destructive mt-1">{errors.bonds.bondAmount.message}</p>}
          </div>
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Purchase Date</Label>
            <Controller name="bonds.purchaseDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
          </div>
          <div>
            <Label>Maturity Date</Label>
            <Controller name="bonds.maturityDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
          </div>
          <div>
              <Label>Transaction Type</Label>
              <Controller
                  name="bonds.transactionType"
                  control={control}
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                      {BOND_TRANSACTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                          {type}
                          </SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  )}
              />
          </div>
        </div>
      </div>
    </div>
  );
}
