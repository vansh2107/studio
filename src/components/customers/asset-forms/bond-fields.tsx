
'use client';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import { BOND_TRANSACTION_TYPES } from '@/lib/asset-form-types';


export function BondFields({ register, errors, control, familyMembers, setValue, watch }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[], setValue: any, watch: any }) {
  
  const bondPrice = watch('b_bondPrice');
  const bondUnit = watch('b_bondUnit');

  useEffect(() => {
    const price = parseFloat(bondPrice) || 0;
    const unit = parseInt(bondUnit, 10) || 0;
    setValue('b_bondAmount', price * unit);
  }, [bondPrice, bondUnit, setValue]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Bond Details</h3>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
              <Label>Family Member</Label>
              <Controller
                  name="b_familyMember"
                  control={control}
                  render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                      <SelectValue placeholder="Select Member" />
                      </SelectTrigger>
                      <SelectContent>
                      {familyMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
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
            <Input {...register('b_issuer')} />
          </div>
          <div>
            <Label>ISIN Number</Label>
            <Input {...register('b_isin')} />
          </div>
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Bond Price</Label>
            <Input type="number" min="0" {...register('b_bondPrice', { valueAsNumber: true })} />
            {errors.b_bondPrice && <p className="text-sm text-destructive mt-1">{errors.b_bondPrice.message}</p>}
          </div>
          <div>
            <Label>Bond Unit</Label>
            <Input type="number" min="0" step="1" {...register('b_bondUnit', { valueAsNumber: true })} />
            {errors.b_bondUnit && <p className="text-sm text-destructive mt-1">{errors.b_bondUnit.message}</p>}
          </div>
          <div>
            <Label>Bond Amount</Label>
            <Input readOnly {...register('b_bondAmount', { valueAsNumber: true })} />
            {errors.b_bondAmount && <p className="text-sm text-destructive mt-1">{errors.b_bondAmount.message}</p>}
          </div>
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Purchase Date</Label>
            <Input type="date" {...register('b_purchaseDate')} />
          </div>
          <div>
            <Label>Maturity Date</Label>
            <Input type="date" {...register('b_maturityDate')} />
          </div>
          <div>
              <Label>Transaction Type</Label>
              <Controller
                  name="b_transactionType"
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
        {/* Row 4 */}
        <div className="grid grid-cols-1">
          <div>
            <Label>Nominee Name</Label>
            <Controller
              name="b_nomineeName"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Nominee" />
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
        </div>
      </div>
    </div>
  );
}
