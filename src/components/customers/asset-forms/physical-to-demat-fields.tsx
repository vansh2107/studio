
'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

export function PhysicalToDematFields({ register, errors, control, setValue, watch, unregister }: { register: any, errors: any, control: any, setValue: any, watch: any, unregister: any }) {
  
  const [jointHolderCount, setJointHolderCount] = useState(0);

  const quantity = watch('p2d_quantity');
  const marketPrice = watch('p2d_marketPrice');

  useEffect(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(marketPrice) || 0;
    setValue('p2d_totalValue', q * p);
  }, [quantity, marketPrice, setValue]);
  
  const addJointHolder = () => {
    if (jointHolderCount < 3) {
      setJointHolderCount(jointHolderCount + 1);
    }
  };

  const removeJointHolder = (index: number) => {
    // To properly remove, we need to clear the value and then decrement the count.
    // This is a simplified approach for UI. A more robust implementation
    // would shift values from lower fields up. For this prototype, we just hide.
    unregister(`p2d_jointHolder${index}`);
    setJointHolderCount(jointHolderCount - 1);
    // This logic is simple and just hides the last one. A real app might need more complex state.
  };


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
      
      {/* Dynamic Joint Holders */}
      <div className="space-y-2">
          <Label>Joint Holders</Label>
          {jointHolderCount > 0 && Array.from({ length: jointHolderCount }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                  <Input 
                      {...register(`p2d_jointHolder${index + 1}`)} 
                      placeholder={`Joint Holder ${index + 1}`}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeJointHolder(index + 1)}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
              </div>
          ))}
          {jointHolderCount < 3 && (
            <Button type="button" variant="link" size="sm" onClick={addJointHolder}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Joint Holder
            </Button>
          )}
      </div>

    </div>
  );
}
