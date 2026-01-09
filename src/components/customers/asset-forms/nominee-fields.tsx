
'use client';

import { useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/lib/types';
import { useEffect, useState } from 'react';

export function NomineeFields({ control, register, errors, familyMembers, watch, getValues, setValue, maxNominees = 3 }: { control: any; register: any; errors: any; familyMembers: FamilyMember[], watch: any, getValues: any, setValue: any, maxNominees?: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'nominees',
  });
  
  const [totalAllocation, setTotalAllocation] = useState(0);
  const watchedNominees = watch('nominees');
  
  useEffect(() => {
    const currentAllocation = watchedNominees?.reduce((acc: number, nominee: any) => acc + (parseFloat(nominee.allocation) || 0), 0) || 0;
    setTotalAllocation(currentAllocation);
  }, [watchedNominees]);

  const handleAddNominee = () => {
    if (fields.length < maxNominees) {
      append({ name: '', allocation: '', dateOfBirth: '' });
    }
  };
  
  const handleAllocationChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) value = 0;
    if (value > 100) value = 100;
    
    const tempNominees = [...(getValues('nominees') || [])];
    tempNominees[index] = { ...tempNominees[index], allocation: value };
    const tempTotal = tempNominees.reduce((acc, n) => acc + (n.allocation || 0), 0);

    if (tempTotal <= 100) {
        setValue(`nominees.${index}.allocation`, value, { shouldValidate: true });
    } else {
        const clampedValue = value - (tempTotal - 100);
        setValue(`nominees.${index}.allocation`, clampedValue < 0 ? 0 : clampedValue, { shouldValidate: true });
    }
  };
  
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  return (
    <div>
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Nominee Details</h3>
      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
            <div>
              <Label>Nominee Name {index + 1}</Label>
              <Controller
                name={`nominees.${index}.name`}
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
              <Label>Allocation %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                {...register(`nominees.${index}.allocation`)}
                onChange={(e) => handleAllocationChange(e, index)}
              />
            </div>
             <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                max={getToday()}
                {...register(`nominees.${index}.dateOfBirth`)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        
        {errors && (
            <p className="text-sm text-destructive mt-1">{errors.message}</p>
        )}
      </div>
      {fields.length < maxNominees && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={handleAddNominee}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Nominee
        </Button>
      )}
    </div>
  );
}
