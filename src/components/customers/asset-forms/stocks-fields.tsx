
'use client';

import { useEffect } from 'react';
import { useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/lib/types';
import { RELATION_OPTIONS } from '@/lib/constants';

export function StocksFields({ control, register, errors, familyMembers }: { control: any; register: any; errors: any; familyMembers: FamilyMember[] }) {

  const { fields: jointHolderFields, append: appendJointHolder, remove: removeJointHolder } = useFieldArray({
    control,
    name: "stocks.jointHolders"
  });

  const { fields: nomineeFields, append: appendNominee, remove: removeNominee } = useFieldArray({
    control,
    name: 'stocks.nominees',
  });

  const nominees = control.watch('stocks.nominees');

  useEffect(() => {
    if (nominees?.length === 2) {
      const firstAllocation = parseFloat(nominees[0].allocation) || 0;
      const secondAllocation = 100 - firstAllocation;
      if (secondAllocation >= 0) {
        control.setValue('stocks.nominees.1.allocation', secondAllocation, { shouldValidate: true });
      }
    }
  }, [nominees, control]);
  
  const handleAddNominee = () => {
    if(nomineeFields.length < 3) {
        appendNominee({ name: '', relationship: '', allocation: 0, dateOfBirth: '' });
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
            <Controller
              name="stocks.holderName"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Holder" />
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
            {errors.stocks?.holderName && <p className="text-sm text-destructive">{errors.stocks.holderName.message}</p>}
          </div>
        </div>

        {jointHolderFields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2 mt-2">
            <div className="flex-1">
              <Label>Joint Holder {index + 1}</Label>
               <Input {...register(`stocks.jointHolders.${index}.name`)} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeJointHolder(index)}>
                <Trash2 className="h-4 w-4 text-destructive"/>
            </Button>
          </div>
        ))}
         {jointHolderFields.length < 2 && (
            <Button type="button" variant="link" size="sm" onClick={() => appendJointHolder({ name: "" })}>
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
              <Controller
                name={`stocks.nominees.${index}.name`}
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
            <div>
              <Label>Relationship</Label>
              <Controller
                name={`stocks.nominees.${index}.relationship`}
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATION_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>Allocation %</Label>
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
                  />
                )}
              />
               {errors.stocks?.nominees?.[index]?.allocation && (
                <p className="text-xs text-destructive mt-1">{errors.stocks?.nominees?.[index]?.allocation?.message}</p>
              )}
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
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {nomineeFields.length < 3 && (
          <Button type="button" variant="outline" size="sm" onClick={handleAddNominee}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Nominee
          </Button>
        )}
      </div>
    </div>
  );
}
