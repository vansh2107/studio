
'use client';

import { useFieldArray, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FamilyMember } from '@/lib/types';
import { RELATION_OPTIONS } from '@/lib/constants';

export function NomineeFields({ control, register, errors, familyMembers, maxNominees = 3 }: { control: any; register: any; errors: any; familyMembers: FamilyMember[], maxNominees?: number }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'nominees',
  });

  const handleAddNominee = () => {
    if (fields.length < maxNominees) {
      append({ name: '', relationship: '', allocation: '' });
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-lg border-b pb-2 mb-4">Nominee Details</h3>
      <div className="space-y-4">
        {fields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
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
              <Label>Relationship</Label>
              <Controller
                name={`nominees.${index}.relationship`}
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
              <Input
                type="number"
                min="0"
                max="100"
                {...register(`nominees.${index}.allocation`)}
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
