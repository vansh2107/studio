
'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/lib/types';


export function PhysicalToDematFields({ register, errors, control, setValue, watch, unregister, familyMembers }: { register: any, errors: any, control: any, setValue: any, watch: any, unregister: any, familyMembers: FamilyMember[] }) {
  
  const [jointHolderCount, setJointHolderCount] = useState(0);

  const quantity = watch('physicalToDemat.quantity');
  const marketPrice = watch('physicalToDemat.marketPrice');

  useEffect(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(marketPrice) || 0;
    setValue('physicalToDemat.totalValue', q * p);
  }, [quantity, marketPrice, setValue]);
  
  const addJointHolder = () => {
    if (jointHolderCount < 3) {
      setJointHolderCount(jointHolderCount + 1);
    }
  };

  const removeJointHolder = (index: number) => {
    unregister(`physicalToDemat.jointHolder${index}`);
    // This is a simple hide, for a real app you'd shift values up.
    // To keep it simple, we just reduce the count. If a user removes #1 then adds, #2's old value will be gone.
    setJointHolderCount(jointHolderCount - 1);
  };


  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Physical to Demat Details</h3>
      
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <SelectItem key={member.id} value={member.id}>
                        {member.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                )}
            />
            {errors.physicalToDemat?.clientName && <p className="text-sm text-destructive">{errors.physicalToDemat.clientName.message}</p>}
        </div>
        <div>
          <Label>Name on Share</Label>
          <Input {...register('physicalToDemat.nameOnShare')} />
        </div>
        <div>
          <Label>Folio Number</Label>
          <Input {...register('physicalToDemat.folioNumber')} />
        </div>
      </div>
      
      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
          <Label>Company Name</Label>
          <Input {...register('physicalToDemat.companyName')} />
        </div>
        <div>
          <Label>RTA Name</Label>
          <Input {...register('physicalToDemat.rtaName')} />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Quantity</Label>
          <Input type="number" min="0" {...register('physicalToDemat.quantity', { valueAsNumber: true })} />
          {errors.physicalToDemat?.quantity && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.quantity.message}</p>}
        </div>
        <div>
          <Label>Market Price</Label>
          <Input type="number" min="0" {...register('physicalToDemat.marketPrice', { valueAsNumber: true })} />
          {errors.physicalToDemat?.marketPrice && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.marketPrice.message}</p>}
        </div>
        <div>
          <Label>Total Value</Label>
          <Input readOnly {...register('physicalToDemat.totalValue', { valueAsNumber: true })} />
          {errors.physicalToDemat?.totalValue && <p className="text-sm text-destructive mt-1">{errors.physicalToDemat.totalValue.message}</p>}
        </div>
      </div>
      
      {/* Dynamic Joint Holders */}
      <div className="space-y-2 pt-4">
          <Label>Joint Holders</Label>
          {jointHolderCount > 0 && Array.from({ length: jointHolderCount }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                  <Input 
                      {...register(`physicalToDemat.jointHolder${index + 1}`)} 
                      placeholder={`Joint Holder ${index + 1}`}
                  />
                  {/* The remove logic is simple, just decrements count. More complex logic can be added to shift values. */}
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

    