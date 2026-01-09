
'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/lib/types';


export function PhysicalToDematFields({ register, errors, control, familyMembers, watch, setValue }: { register: any, errors: any, control: any, familyMembers: FamilyMember[], watch: any, setValue: any }) {
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "physicalToDemat.jointHolders",
  });

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Physical to Demat Details</h3>
      
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
            render={({ field }) => <Input type="tel" maxLength={10} onKeyDown={handleNumericKeyDown} {...field} value={field.value || ''} />}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Name on Share</Label>
          <Input {...register('physicalToDemat.nameOnShare')} />
        </div>
        <div>
          <Label>Folio Number</Label>
          <Input {...register('physicalToDemat.folioNumber')} />
        </div>
      </div>
      
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Quantity</Label>
          <Controller name="physicalToDemat.quantity" control={control} render={({ field }) => <Input type="number" min="0" onKeyDown={handleNumericKeyDown} {...field} value={field.value || ''} />} />
          {errors?.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>}
        </div>
        <div>
          <Label>Market Price</Label>
          <Controller name="physicalToDemat.marketPrice" control={control} render={({ field }) => <Input type="number" min="0" step="any" onKeyDown={handleNumericKeyDown} {...field} value={field.value || ''} />} />
          {errors?.marketPrice && <p className="text-sm text-destructive mt-1">{errors.marketPrice.message}</p>}
        </div>
        <div>
          <Label>Total Value</Label>
          <Input readOnly {...register('physicalToDemat.totalValue')} />
          {errors?.totalValue && <p className="text-sm text-destructive mt-1">{errors.totalValue.message}</p>}
        </div>
      </div>
      
       <div className="space-y-2 pt-4">
        <Label>Joint Holders</Label>
        <div className="grid grid-cols-3 gap-3 items-center">
            {fields.map((item, index) => (
                <div key={item.id} className="relative">
                    <Input 
                        {...register(`physicalToDemat.jointHolders.${index}.name`)} 
                        placeholder={`Joint Holder ${index + 1}`}
                        className="pr-8"
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-destructive"
                    >
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            ))}
            {fields.length < 3 && (
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            )}
        </div>
        {errors?.jointHolders && <p className="text-sm text-destructive mt-1">{errors.jointHolders.message}</p>}
      </div>

    </div>
  );
}
