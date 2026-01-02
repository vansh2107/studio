
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Client, FamilyMember } from '@/lib/types';
import { Loader2, X, UploadCloud, File as FileIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isValid, parseISO, format } from 'date-fns';

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  emailId: z.string().email('Invalid email address'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').refine(date => isValid(parseISO(date)), { message: "Invalid date" }),
  address: z.string().min(1, 'Address is required'),
  anniversaryDate: z.string().optional().refine(date => !date || (z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(date).success && isValid(parseISO(date))), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
  relation: z.string().min(1, 'Relation is required'),
  panNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

const RELATION_OPTIONS = ["Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other", "Daughter-in-law", "Son-in-law", "Grandson", "Granddaughter"];
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface FamilyMemberFormModalProps {
  onClose: () => void;
  client: Client;
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
}

export function FamilyMemberFormModal({
  onClose,
  client,
  member,
  onSave,
}: FamilyMemberFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [otherFile, setOtherFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState({ pan: '', aadhaar: '', other: '' });


  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      emailId: '',
      dateOfBirth: '',
      address: '',
      anniversaryDate: '',
      relation: '',
      panNumber: '',
      aadhaarNumber: '',
    },
  });

  useEffect(() => {
    if (member) {
       reset({
        ...member,
        dateOfBirth: member.dateOfBirth ? format(parseISO(member.dateOfBirth), 'yyyy-MM-dd') : '',
        anniversaryDate: member.anniversaryDate ? format(parseISO(member.anniversaryDate), 'yyyy-MM-dd') : '',
      });
      setPanFile(member.panFileName ? new File([], member.panFileName) : null);
      setAadhaarFile(member.aadhaarFileName ? new File([], member.aadhaarFileName) : null);
      setOtherFile(member.otherDocumentFileName ? new File([], member.otherDocumentFileName) : null);
    } else {
      reset({
        firstName: '', lastName: '', phoneNumber: '', emailId: '',
        dateOfBirth: '', address: '', anniversaryDate: '', relation: '',
        panNumber: '', aadhaarNumber: '',
      });
      setPanFile(null);
      setAadhaarFile(null);
      setOtherFile(null);
    }
    setStep(1);
    setIsSaving(false);
  }, [member, reset]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    errorKey: keyof typeof fileErrors
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (ACCEPTED_FILE_TYPES.includes(file.type)) {
        setter(file);
        setFileErrors(prev => ({ ...prev, [errorKey]: '' }));
      } else {
        setter(null);
        setFileErrors(prev => ({
          ...prev,
          [errorKey]: 'Invalid file type. Please use JPG, PNG, or PDF.',
        }));
        e.target.value = ''; // Clear the input
      }
    }
  };

  const processSave = (data: MemberFormData) => {
    setIsSaving(true);
    
    setTimeout(() => {
      const memberData: FamilyMember = {
        id: member?.id || `fm-${Date.now()}`,
        clientId: client.id,
        ...data,
        anniversaryDate: data.anniversaryDate || undefined,
        panFileName: panFile?.name,
        aadhaarFileName: aadhaarFile?.name,
        otherDocumentFileName: otherFile?.name,
        panPhotoUrl: panFile ? 'simulated_url' : member?.panPhotoUrl,
        aadhaarPhotoUrl: aadhaarFile ? 'simulated_url' : member?.aadhaarPhotoUrl,
        otherDocumentUrl: otherFile ? 'simulated_url' : member?.otherDocumentUrl,
      };

      onSave(memberData);
      setIsSaving(false);
      onClose();
    }, 1000);
  };
  
  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const renderFileUploader = (
    label: string,
    file: File | null,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    errorKey: keyof typeof fileErrors,
    id: string,
    numberValue?: string,
    numberRegister?: any,
    numberLabel?: string
  ) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-input">
          <UploadCloud className="w-8 h-8 text-muted-foreground" />
          <Input
            type="file"
            className="absolute w-full h-full opacity-0 cursor-pointer"
            onChange={e => handleFileChange(e, setter, errorKey)}
            accept={ACCEPTED_FILE_TYPES.join(',')}
            disabled={isSaving}
          />
        </div>
        {fileErrors[errorKey] && <p className="text-sm text-destructive">{fileErrors[errorKey]}</p>}
        {file && (
          <div className="flex items-center p-2 mt-2 text-sm rounded-md bg-muted text-muted-foreground">
            <FileIcon className="w-4 h-4 mr-2" />
            <span className="truncate">{file.name}</span>
            <Button variant="ghost" size="icon" className="w-6 h-6 ml-auto" onClick={() => setter(null)} disabled={isSaving}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      {numberRegister && numberLabel && (
        <div className="space-y-2">
            <Label htmlFor={id}>{numberLabel}</Label>
            <Input id={id} {...numberRegister} disabled={isSaving} defaultValue={numberValue} />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4 relative">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0">
            <X className="h-4 w-4" />
        </Button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {member ? 'Edit Family Member' : 'Add New Member'} - Step {step} / 2
          </h2>
           { step === 2 && (
             <p className="text-sm text-muted-foreground">Upload member identity documents.</p>
           )}
        </div>

        <form
          onSubmit={handleSubmit(processSave)}
          className="space-y-4"
        >
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register('firstName')} disabled={isSaving} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                 <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} disabled={isSaving} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" type="tel" {...register('phoneNumber')} disabled={isSaving} />
                  {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emailId">Email ID</Label>
                  <Input id="emailId" type="email" {...register('emailId')} disabled={isSaving} />
                  {errors.emailId && <p className="text-sm text-destructive">{errors.emailId.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="text" placeholder="YYYY-MM-DD" {...register('dateOfBirth')} disabled={isSaving} />
                   {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                </div>
                 <div className="flex flex-col gap-1.5">
                  <Label htmlFor="anniversaryDate">Anniversary Date (Optional)</Label>
                  <Input id="anniversaryDate" type="text" placeholder="YYYY-MM-DD" {...register('anniversaryDate')} disabled={isSaving} />
                  {errors.anniversaryDate && <p className="text-sm text-destructive">{errors.anniversaryDate.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="relation">Relation</Label>
                  <Controller
                    name="relation"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                        <SelectTrigger id="relation">
                          <SelectValue placeholder="Select a relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELATION_OPTIONS.map(option => (
                             <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.relation && <p className="text-sm text-destructive">{errors.relation.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" {...register('address')} disabled={isSaving} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
            </div>
          )}

          {step === 2 && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderFileUploader('PAN Card', panFile, setPanFile, 'pan', 'panNumber', member?.panNumber, register('panNumber'), 'PAN Number')}
              {renderFileUploader('Aadhaar Card', aadhaarFile, setAadhaarFile, 'aadhaar', 'aadhaarNumber', member?.aadhaarNumber, register('aadhaarNumber'), 'Aadhaar Number')}
              {renderFileUploader('Other Documents', otherFile, setOtherFile, 'other', 'otherDocs')}
            </div>
          )}
        
            <div className="flex justify-end space-x-2 pt-6">
              {step === 1 && (
                <Button type="button" onClick={handleSubmit(() => handleNext(), () => {})}>Next</Button>
              )}
              {step === 2 && (
                <>
                  <Button variant="outline" onClick={handleBack} disabled={isSaving}>Back</Button>
                  <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Member'
                      )}
                  </Button>
                </>
              )}
            </div>
        </form>
    </div>
  );
}
