
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
import { NomineeFields } from './nominee-fields';

export function StocksFields({ control, register, errors, familyMembers, watch, getValues, setValue }: { control: any; register: any; errors: any; familyMembers: FamilyMember[], watch: any; getValues: any; setValue: any; }) {

  const { fields: jointHolderFields, append: appendJointHolder, remove: removeJointHolder } = useFieldArray({
    control,
    name: "stocks.jointHolders"
  });
  
  return (
    <div className="space-y-6">
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
            {errors?.holderName && <p className="text-sm text-destructive">{errors.holderName.message}</p>}
          </div>
        </div>

        <div className="space-y-2 pt-4">
            <Label>Joint Holders</Label>
            <div className="flex flex-wrap gap-2 items-center">
                {jointHolderFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 flex-grow">
                    <Input 
                        {...register(`stocks.jointHolders.${index}.name`)} 
                        placeholder={`Joint Holder ${index + 1}`}
                        className="w-auto flex-grow"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeJointHolder(index)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                </div>
                ))}
                {jointHolderFields.length < 3 && (
                <Button type="button" variant="link" size="sm" onClick={() => appendJointHolder({ name: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
                )}
            </div>
            {errors?.jointHolders && <p className="text-sm text-destructive">{errors.jointHolders.message}</p>}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>DPID</Label>
          <Input {...register('stocks.dpId')} />
           {errors?.dpId && <p className="text-sm text-destructive">{errors.dpId.message}</p>}
        </div>
        <div>
          <Label>DP Name</Label>
          <Input {...register('stocks.dpName')} />
           {errors?.dpName && <p className="text-sm text-destructive">{errors.dpName.message}</p>}
        </div>
        <div>
          <Label>Bank Name</Label>
          <Input {...register('stocks.bankName')} />
           {errors?.bankName && <p className="text-sm text-destructive">{errors.bankName.message}</p>}
        </div>
        <div>
          <Label>Bank Account Number</Label>
          <Input {...register('stocks.bankAccountNumber')} />
           {errors?.bankAccountNumber && <p className="text-sm text-destructive">{errors.bankAccountNumber.message}</p>}
        </div>
        <div>
          <Label>Mobile Number</Label>
          <Input type="tel" {...register('stocks.mobileNumber')} />
           {errors?.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>}
        </div>
        <div>
          <Label>Email Address</Label>
          <Input type="email" {...register('stocks.emailAddress')} />
           {errors?.emailAddress && <p className="text-sm text-destructive">{errors.emailAddress.message}</p>}
        </div>
      </div>

      <Separator />

      <NomineeFields
        control={control}
        errors={errors?.nominees}
        familyMembers={familyMembers}
        watch={watch}
        getValues={getValues}
        setValue={setValue}
        fieldArrayName="stocks.nominees"
      />
    </div>
  );
}
