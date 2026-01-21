
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client, FamilyMember } from '@/lib/types';
import { AMC_NAMES } from '@/lib/constants';
import { Combobox } from '@/components/ui/combobox';
import { JointHolderFields } from './joint-holder-fields';
import { NomineeFields } from './nominee-fields';

export function MutualFundsFields({ control, errors, familyMembers, register, watch, getValues, setValue }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[], register: any, watch: any, getValues: any, setValue: any }) {

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === '') {
      field.onChange('');
      return;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      field.onChange('0');
    } else {
      field.onChange(value);
    }
  };
  
  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Mutual Funds Details</h3>

        <JointHolderFields
            control={control}
            errors={errors}
            familyMembers={familyMembers}
            watch={watch}
            holderNamePath="mutualFunds.holderName"
            jointHoldersPath="mutualFunds.jointHolders"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div>
                <Label>Folio Number</Label>
                <Controller name="mutualFunds.folioNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                 {errors?.mutualFunds?.folioNumber && <p className="text-sm text-destructive">{errors.mutualFunds.folioNumber.message}</p>}
            </div>
             <div>
                <Label>AMC</Label>
                 <Controller
                  name="mutualFunds.amc"
                  control={control}
                  render={({ field }) => (
                     <Combobox
                      options={AMC_NAMES.map(c => ({ label: c, value: c }))}
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Select AMC"
                      searchPlaceholder='Search AMC...'
                    />
                  )}
                />
                {errors?.mutualFunds?.amc && <p className="text-sm text-destructive">{errors.mutualFunds.amc.message}</p>}
            </div>
             <div>
                <Label>Scheme Name</Label>
                <Controller name="mutualFunds.schemeName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
                {errors?.mutualFunds?.schemeName && <p className="text-sm text-destructive">{errors.mutualFunds.schemeName.message}</p>}
            </div>
            <div>
                <Label>Invested Amount</Label>
                <Controller name="mutualFunds.investedAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
        </div>
        <NomineeFields control={control} errors={errors?.mutualFunds?.nominees} familyMembers={familyMembers} getValues={getValues} setValue={setValue} fieldPath="mutualFunds.nominees" />
    </div>
  );
}
