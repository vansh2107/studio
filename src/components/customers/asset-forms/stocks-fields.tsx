
'use client';

import { useState } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function StocksFields({ control, register, errors }: { control: any; register: any; errors: any }) {
  const [jointHolderCount, setJointHolderCount] = useState(0);

  const { fields: nomineeFields, append: appendNominee, remove: removeNominee } = useFieldArray({
    control,
    name: 'stocks.nominees',
  });

  const totalAllocation = control.getValues('stocks.nominees')?.reduce((acc: number, nominee: any) => acc + (Number(nominee.allocation) || 0), 0) || 0;

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
         {errors.stocks?.nominees && typeof errors.stocks.nominees.message === 'string' && (
            <p className="text-sm text-destructive mb-2">{errors.stocks.nominees.message}</p>
        )}
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
              <Label>Allocation %</Label>
              <Controller
                control={control}
                name={`stocks.nominees.${index}.allocation`}
                render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />}
              />
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
        <Button type="button" variant="outline" size="sm" onClick={() => appendNominee({ name: '', relationship: '', allocation: 0, dateOfBirth: '' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Nominee
        </Button>
         <div className="mt-2 text-sm font-medium">
            Total Allocation: <span className={totalAllocation !== 100 ? 'text-destructive' : 'text-green-600'}>{totalAllocation}%</span>
        </div>
      </div>
    </div>
  );
}
