
'use client';
import { useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

export function JointHolderFields({ control, register, errors, fieldPath = 'jointHolders' }: { control: any, register: any, errors: any, fieldPath?: string }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldPath as any,
  });

  return (
    <div className="space-y-2 pt-4">
      <Label>Joint Holders (Optional)</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {fields.map((item, index) => (
          <div key={item.id} className="relative">
            <Input
              {...register(`${fieldPath}.${index}.name`)}
              placeholder={`Joint Holder ${index + 1}`}
              className="pr-8"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {fields.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '' })}
            className="self-end"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        )}
      </div>
      {errors && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
    </div>
  );
}
