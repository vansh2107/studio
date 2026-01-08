
'use client';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PhysicalToDematFields({ register, errors, control, setValue, watch }: { register: any, errors: any, control: any, setValue: any, watch: any }) {
  
  const quantity = watch('p2d_quantity');
  const marketPrice = watch('p2d_marketPrice');

  useEffect(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(marketPrice) || 0;
    setValue('p2d_totalValue', q * p);
  }, [quantity, marketPrice, setValue]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Physical to Demat Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label>Folio Number</Label>
          <Input {...register('p2d_folioNumber')} />
        </div>
        <div>
          <Label>Name on Share</Label>
          <Input {...register('p2d_nameOnShare')} />
        </div>
        <div>
          <Label>Joint Holder 1 (Optional)</Label>
          <Input {...register('p2d_jointHolder1')} />
        </div>
        <div>
          <Label>Joint Holder 2 (Optional)</Label>
          <Input {...register('p2d_jointHolder2')} />
        </div>
        <div>
          <Label>Joint Holder 3 (Optional)</Label>
          <Input {...register('p2d_jointHolder3')} />
        </div>
        <div>
          <Label>Company Name</Label>
          <Input {...register('p2d_companyName')} />
        </div>
        <div>
          <Label>RTA Name</Label>
          <Input {...register('p2d_rtaName')} />
        </div>
        <div>
          <Label>Quantity</Label>
          <Input type="number" {...register('p2d_quantity', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Market Price</Label>
          <Input type="number" {...register('p2d_marketPrice', { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Total Value</Label>
          <Input readOnly {...register('p2d_totalValue', { valueAsNumber: true })} />
        </div>
      </div>
    </div>
  );
}
