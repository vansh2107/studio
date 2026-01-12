
'use client';

import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client, FamilyMember } from '@/lib/types';
import { NomineeFields } from './nominee-fields';
import { JointHolderFields } from './joint-holder-fields';

export function StocksFields({ control, register, errors, familyMembers, watch, getValues, setValue }: { control: any; register: any; errors: any; familyMembers: (Client | FamilyMember)[], watch: any; getValues: any; setValue: any; }) {

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Holder Details</h3>
        
        <JointHolderFields control={control} register={register} errors={errors?.jointHolders} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
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

      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>DPID</Label>
            <Controller
              name="stocks.dpId"
              control={control}
              render={({ field }) => <Input {...field} value={field.value || ''} placeholder="Enter DPID" />}
            />
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
          <Controller
            name="stocks.mobileNumber"
            control={control}
            render={({ field }) => (
                <Input
                type="tel"
                maxLength={10}
                onKeyDown={handleMobileKeyDown}
                {...field}
                value={field.value || ''}
              />
            )}
          />
           {errors?.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>}
        </div>
        <div>
          <Label>Email Address</Label>
          <Input type="email" {...register('stocks.emailAddress')} />
           {errors?.emailAddress && <p className="text-sm text-destructive">{errors.emailAddress.message}</p>}
        </div>
      </div>

      <Separator />

      <NomineeFields control={control} errors={errors?.nominees} familyMembers={familyMembers} watch={watch} getValues={getValues} setValue={setValue} />
    </div>
  );
}
