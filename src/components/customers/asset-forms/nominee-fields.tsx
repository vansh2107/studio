
'use client';

import { useFieldArray, Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import React, { useEffect } from 'react';

export function NomineeFields({ control, errors, familyMembers, getValues, setValue, maxNominees = 3, fieldPath = 'nominees', trigger }: { control: any; errors: any; familyMembers: (Client | FamilyMember)[], getValues: any, setValue: any, maxNominees?: number, fieldPath?: string, trigger?: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPath as any,
  });
  
  const watchedNominees = useWatch({ control, name: fieldPath });
  
  // Effect to manage allocation and trigger validation
  useEffect(() => {
    const nominees = getValues(fieldPath) || [];
    if (nominees.length === 1) {
      // If there is only one nominee, and allocation is not 100, set it.
      if (nominees[0].allocation !== 100) {
        setValue(`${fieldPath}.0.allocation`, 100, { shouldValidate: true });
      }
    }
    
    // Always trigger validation on the parent field array when its content changes.
    // This is crucial for the superRefine check to re-run.
    if (trigger) {
        trigger(fieldPath);
    }
  }, [watchedNominees, getValues, setValue, trigger, fieldPath]);

    // Effect to auto-fill DOB
  useEffect(() => {
    if (watchedNominees && watchedNominees.length > 0) {
      watchedNominees.forEach((nominee: { name?: string }, index: number) => {
        if (nominee.name) {
          const member = familyMembers.find(m => m.name === nominee.name);
          const dob = member?.dateOfBirth || '';
          const currentDob = getValues(`${fieldPath}.${index}.dateOfBirth`);
          if (dob !== currentDob) {
            setValue(`${fieldPath}.${index}.dateOfBirth`, dob, { shouldValidate: true });
          }
        } else {
           // if name is cleared, clear DOB
           const currentDob = getValues(`${fieldPath}.${index}.dateOfBirth`);
           if (currentDob) {
             setValue(`${fieldPath}.${index}.dateOfBirth`, '', { shouldValidate: true });
           }
        }
      });
    }
  }, [watchedNominees, familyMembers, fieldPath, setValue, getValues]);


  const handleAddNominee = () => {
    if (fields.length < maxNominees) {
      if (fields.length === 1) {
        // If we are about to add the second nominee, clear the first one's allocation
        // to encourage manual distribution.
        setValue(`${fieldPath}.0.allocation`, '', { shouldValidate: true });
      }
      append({ name: '', allocation: '', dateOfBirth: '' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent typing decimals and other non-numeric characters
    if (['.', '-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };
  
  const totalAllocation = React.useMemo(() => {
    if (!watchedNominees) return 0;
    return watchedNominees.reduce((acc: number, nominee: any) => acc + (parseInt(String(nominee.allocation), 10) || 0), 0);
  }, [watchedNominees]);

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
                name={`${fieldPath}.${index}.name`}
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
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
              <Label>Date of Birth</Label>
              <Controller
                name={`${fieldPath}.${index}.dateOfBirth`}
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    readOnly
                    max={getToday()}
                    {...field}
                    value={field.value || ''}
                    className="bg-muted/50"
                  />
                )}
              />
               {errors?.[index]?.dateOfBirth && <p className="text-sm text-destructive mt-1">{errors[index].dateOfBirth.message}</p>}
            </div>

            <div>
              <Label>Allocation %</Label>
              <Controller
                name={`${fieldPath}.${index}.allocation`}
                control={control}
                render={({ field }) => (
                   <Input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    inputMode="numeric"
                    {...field}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow integers
                      field.onChange(value.replace(/[^0-9]/g, ''));
                    }}
                    readOnly={fields.length === 1}
                  />
                )}
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
        
         {fields.length > 1 && (
          <div className={`mt-2 text-sm font-medium text-right pr-12 ${totalAllocation !== 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
            Total: {totalAllocation}% / 100%
          </div>
        )}

        {errors && typeof errors !== 'string' && errors.message && (
            <p className="text-sm text-destructive mt-1 text-center">{errors.message}</p>
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
