
'use client';
import { useFieldArray, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client, FamilyMember } from '@/lib/types';
import React from 'react';

// Helper to safely get a nested property from an object
const get = (obj: any, path: string, defaultValue = undefined) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};


export function JointHolderFields({ 
    control, 
    errors, 
    familyMembers,
    watch,
    holderNamePath,
    jointHoldersPath = 'jointHolders',
}: { 
    control: any, 
    errors: any, 
    familyMembers: (Client | FamilyMember)[],
    watch: any,
    holderNamePath: string,
    jointHoldersPath?: string,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: jointHoldersPath,
  });

  const primaryHolderName = watch(holderNamePath);
  const allSelectedJointHolders = watch(jointHoldersPath) || [];

  const holderNameError = get(errors, holderNamePath);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Primary Holder */}
        <div className="space-y-1">
            <Label>Holder Name</Label>
            <Controller
                name={holderNamePath}
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
            {holderNameError && <p className="text-sm text-destructive mt-1">{holderNameError.message}</p>}
        </div>

        {/* Joint Holders */}
        {fields.map((item, index) => {
            const currentFieldValue = allSelectedJointHolders[index]?.name;
            const availableOptions = familyMembers.filter(member => 
              member.name !== primaryHolderName &&
              (!allSelectedJointHolders.some((jh: {name: string}) => jh.name === member.name) || member.name === currentFieldValue)
            );

            const jointHolderErrors = get(errors, `${jointHoldersPath}.${index}.name`);

            return (
                <div key={item.id} className="space-y-1">
                    <Label>Joint Holder {index + 1}</Label>
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                        <Controller
                            control={control}
                            name={`${jointHoldersPath}.${index}.name`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select Joint Holder ${index + 1}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {availableOptions.map(option => (
                                        <SelectItem key={option.id} value={option.name}>
                                            {option.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                            )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-8 w-8 text-destructive self-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    {jointHolderErrors && <p className="text-sm text-destructive mt-1">{jointHolderErrors.message}</p>}
                </div>
            )
        })}
      </div>
      
      {fields.length < 3 && (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '' })}
        >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Joint Holder
        </Button>
      )}

      {get(errors, jointHoldersPath) && typeof get(errors, jointHoldersPath) !== 'string' && get(errors, jointHoldersPath).message && (
        <p className="text-sm text-destructive mt-1">{get(errors, jointHoldersPath).message}</p>
      )}
    </div>
  );
}
