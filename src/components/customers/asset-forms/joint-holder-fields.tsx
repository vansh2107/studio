
'use client';
import { useFieldArray, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client, FamilyMember } from '@/lib/types';

export function JointHolderFields({ 
    control, 
    errors, 
    fieldPath = 'jointHolders',
    familyMembers,
    watch,
    holderNamePath
}: { 
    control: any, 
    errors: any, 
    fieldPath?: string,
    familyMembers: (Client | FamilyMember)[],
    watch: any,
    holderNamePath: string
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPath as any,
  });

  const primaryHolderName = watch(holderNamePath);
  const allSelectedJointHolders = watch(fieldPath) || [];

  return (
    <div className="space-y-2 pt-4">
      <Label>Joint Holders (Optional)</Label>
      <div className="space-y-3">
        {fields.map((item, index) => {
          const currentFieldValue = allSelectedJointHolders[index]?.name;
          
          const availableOptions = familyMembers.filter(member => 
            member.name !== primaryHolderName &&
            (!allSelectedJointHolders.some((jh: {name: string}) => jh.name === member.name) || member.name === currentFieldValue)
          );

          return (
            <div key={item.id}>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <Controller
                    control={control}
                    name={`${fieldPath}.${index}.name`}
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
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {errors?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors[index].name.message}</p>}
            </div>
          )
        })}
      </div>
      
      {fields.length < 3 && (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => append({ name: '' })}
        >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Joint Holder
        </Button>
      )}

      {errors && typeof errors !== 'string' && errors.message && (
        <p className="text-sm text-destructive mt-1">{errors.message}</p>
      )}
    </div>
  );
}
