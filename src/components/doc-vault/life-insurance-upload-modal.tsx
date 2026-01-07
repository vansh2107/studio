
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { FamilyMember } from '@/lib/types';
import { INSURANCE_COMPANIES } from '@/lib/constants';
import { ScrollArea } from '../ui/scroll-area';

interface UploadItem {
  id: number;
  company: string;
  file: File | null;
}

interface LifeInsuranceUploadModalProps {
  member: FamilyMember;
  onClose: () => void;
  onSave: (files: { company: string; file: File }[], member: FamilyMember) => void;
}

const sortedInsuranceCompanies = [...INSURANCE_COMPANIES]
  .slice()
  .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

export function LifeInsuranceUploadModal({ member, onClose, onSave }: LifeInsuranceUploadModalProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([{ id: 1, company: '', file: null }]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRow = () => {
    setUploads([...uploads, { id: Date.now(), company: '', file: null }]);
  };

  const handleRemoveRow = (id: number) => {
    if (uploads.length > 1) {
      setUploads(uploads.filter(item => item.id !== id));
    }
  };

  const handleUpdate = (id: number, field: 'company' | 'file', value: string | File | null) => {
    setUploads(uploads.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0] || null;
    handleUpdate(id, 'file', file);
  };

  const canSave = uploads.every(item => item.company && item.file);

  const handleSave = () => {
    if (!canSave) return;
    setIsSaving(true);
    
    const filesToSave = uploads
      .map(({ company, file }) => ({ company, file }))
      .filter((item): item is { company: string; file: File } => item.file !== null);

    setTimeout(() => {
      onSave(filesToSave, member);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="relative p-1 max-h-[80vh] overflow-y-auto pr-4 -mr-4">
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 z-10 close-icon">
        <X className="h-4 w-4" />
      </Button>

      <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold">Upload Life Insurance Documents</h2>
        <p className="text-sm text-muted-foreground">Select an insurance company and upload the policy document for {member.firstName}.</p>
      </div>

      <div className="space-y-4">
        {uploads.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              {index === 0 && <Label>Insurance Company</Label>}
              <Select value={item.company} onValueChange={value => handleUpdate(item.id, 'company', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {sortedInsuranceCompanies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              {index === 0 && <Label>File</Label>}
              <Input type="file" onChange={e => handleFileChange(e, item.id)} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveRow(item.id)}
              disabled={uploads.length === 1}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={handleAddRow}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Another
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-6 mt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={!canSave || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Documents'
          )}
        </Button>
      </div>
    </div>
  );
}
