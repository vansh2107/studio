
'use client';

import { useState, useEffect } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function StocksFields({ control, register, errors, watch, setValue }: { control: any; register: any; errors: any; watch: any, setValue: any }) {
  const [jointHolderCount, setJointHolderCount] = useState(0);

  const { fields: nomineeFields, append: appendNominee, remove: removeNominee } = useFieldArray({
    control,
    name: 'stocks.nominees',
  });

  const nominees = watch('stocks.nominees');
  const firstNomineeAllocation = watch('stocks.nominees.0.allocation');

  useEffect(() => {
    if (nominees?.length === 2) {
      const firstAllocation = parseFloat(firstNomineeAllocation) || 0;
      const secondAllocation = 100 - firstAllocation;
      if (secondAllocation >= 0) {
        setValue('stocks.nominees.1.allocation', secondAllocation, { shouldValidate: true });
      }
    }
  }, [firstNomineeAllocation, nominees?.length, setValue]);
  
  const handleAddNominee = () => {
    if(nominees.length === 1) {
        const firstAllocation = parseFloat(firstNomineeAllocation) || 100;
        const secondAllocation = 100 - firstAllocation;
        appendNominee({ name: '', relationship: '', allocation: secondAllocation < 0 ? 0 : secondAllocation, dateOfBirth: '' });
    } else {
        appendNominee({ name: '', relationship: '', allocation: 100, dateOfBirth: '' });
    }
  }


  return (
    <div className="space-y-6">
      {/* Holder Details */}
      <div>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Holder Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Name of the Holder</Label>
            <Input {...register('stocks.holderName')} />
            {errors.stocks?.holderName && <p className="text-sm text-destructive">{errors.stocks.holderName.message}</p>}
          </div>
          {jointHolderCount > 0 && (
            <div>
              <Label>Joint Holder 1</Label>
              <Input {...register('stocks.jointHolder1')} />
            </div>
          )}
          {jointHolderCount > 1 && (
            <div>
              <Label>Joint Holder 2</Label>
              <Input {...register('stocks.jointHolder2')} />
            </div>
          )}
        </div>
        {jointHolderCount < 2 && (
          <Button type="button" variant="link" size="sm" onClick={() => setJointHolderCount(prev => prev + 1)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Joint Holder
          </Button>
        )}
      </div>

      <Separator />

      {/* Demat, Bank, Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>DPID</Label>
          <Input {...register('stocks.dpId')} />
           {errors.stocks?.dpId && <p className="text-sm text-destructive">{errors.stocks.dpId.message}</p>}
        </div>
        <div>
          <Label>DP Name</Label>
          <Input {...register('stocks.dpName')} />
           {errors.stocks?.dpName && <p className="text-sm text-destructive">{errors.stocks.dpName.message}</p>}
        </div>
        <div>
          <Label>Bank Name</Label>
          <Input {...register('stocks.bankName')} />
           {errors.stocks?.bankName && <p className="text-sm text-destructive">{errors.stocks.bankName.message}</p>}
        </div>
        <div>
          <Label>Bank Account Number</Label>
          <Input {...register('stocks.bankAccountNumber')} />
           {errors.stocks?.bankAccountNumber && <p className="text-sm text-destructive">{errors.stocks.bankAccountNumber.message}</p>}
        </div>
        <div>
          <Label>Mobile Number</Label>
          <Input type="tel" {...register('stocks.mobileNumber')} />
           {errors.stocks?.mobileNumber && <p className="text-sm text-destructive">{errors.stocks.mobileNumber.message}</p>}
        </div>
        <div>
          <Label>Email Address</Label>
          <Input type="email" {...register('stocks.emailAddress')} />
           {errors.stocks?.emailAddress && <p className="text-sm text-destructive">{errors.stocks.emailAddress.message}</p>}
        </div>
      </div>

      <Separator />

      {/* Nominee Details */}
      <div>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Nominee Details</h3>
        {nomineeFields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end mb-2">
            <div>
              <Label>Nominee Name {index + 1}</Label>
              <Input {...register(`stocks.nominees.${index}.name`)} />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input {...register(`stocks.nominees.${index}.relationship`)} />
            </div>
            <div>
              <Label>
                {index === 1 ? "Allocation % (Auto)" : "Allocation %"}
              </Label>
              <Controller
                control={control}
                name={`stocks.nominees.${index}.allocation`}
                render={({ field }) => (
                  <Input 
                    type="number"
                    min="0" 
                    max="100"
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    disabled={index === 1}
                  />
                )}
              />
               {errors.stocks?.nominees?.[index]?.allocation && (
                <p className="text-xs text-destructive mt-1">{errors.stocks?.nominees?.[index]?.allocation?.message}</p>
              )}
               {index === 1 && <p className="text-xs text-muted-foreground mt-1">Auto-calculated.</p>}
            </div>
             <div>
              <Label>Date of Birth</Label>
              <Input type="date" {...register(`stocks.nominees.${index}.dateOfBirth`)} />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeNominee(index)}
              disabled={nomineeFields.length === 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {nomineeFields.length < 2 && (
          <Button type="button" variant="outline" size="sm" onClick={handleAddNominee}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Nominee
          </Button>
        )}
      </div>
    </div>
  );
}

    

    