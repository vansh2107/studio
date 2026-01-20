
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
import { format, parse, isValid } from 'date-fns';
import { RELATION_OPTIONS } from '@/lib/constants';

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const aadhaarRegex = /^[0-9]{12}$/;

const isDateInPast = (val: string) => {
    if (!val) return true; // Allow optional fields
    const inputDate = parse(val, 'yyyy-MM-dd', new Date());
    if (!isValid(inputDate)) return true; // Let other validators handle invalid format
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
};

const memberSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().length(10, 'Phone number must be exactly 10 digits'),
  emailId: z.string().email('Invalid email address'),
  dateOfBirth: z.string()
    .refine(val => val && isValid(parse(val, 'yyyy-MM-dd', new Date())), { message: "Invalid date" })
    .refine(isDateInPast, { message: "Date of Birth cannot be in the future." }),
  address: z.string().min(1, 'Address is required'),
  anniversaryDate: z.string().optional()
    .refine(val => !val || (val && isValid(parse(val, 'yyyy-MM-dd', new Date()))), { message: "Invalid date format." })
    .refine(isDateInPast, { message: "Anniversary Date cannot be in the future." }),
  relation: z.string().min(1, 'Relation is required'),
  panNumber: z.string()
    .optional()
    .refine(val => !val || panRegex.test(val), {
        message: 'Please enter a valid PAN number (e.g., ABCDE1234F)',
    }),
  aadhaarNumber: z.string()
    .optional()
    .refine(val => !val || aadhaarRegex.test(val), {
        message: 'Please enter a valid 12-digit Aadhaar number',
    }),
});

type MemberFormData = z.infer<typeof memberSchema>;

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface FamilyMemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  member: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
}


// Aadhaar Input Component for auto-formatting
const AadhaarInput = ({ value, onChange, ...props }: { value: string, onChange: (value: string) => void } & React.ComponentProps<typeof Input>) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters
    const digitsOnly = e.target.value.replace(/\D/g, '');
    // Take only the first 12 digits
    const trimmedValue = digitsOnly.slice(0, 12);
    // Pass the raw digits to the form handler
    onChange(trimmedValue);
  };

  // Format the value for display
  const formattedValue = (value || "")
    .replace(/\D/g, '')
    .slice(0, 12)
    .replace(/(\d{4})/g, '$1 ')
    .trim();

  return <Input {...props} value={formattedValue} onChange={handleInputChange} />;
};

const PanInput = (props: React.ComponentProps<typeof Input>) => {
  const handlePanInput = (e: React.FormEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value.toUpperCase();
    let sanitized = '';
    for (let i = 0; i < value.length && i < 10; i++) {
      const char = value[i];
      if (i < 5) {
        // First 5 must be letters
        if (/[A-Z]/.test(char)) {
          sanitized += char;
        }
      } else if (i < 9) {
        // Next 4 must be digits
        if (/[0-9]/.test(char)) {
          sanitized += char;
        }
      } else {
        // Last one must be a letter
        if (/[A-Z]/.test(char)) {
          sanitized += char;
        }
      }
    }
    e.currentTarget.value = sanitized;
    // Let react-hook-form's onChange handle the state update
    props.onChange?.(e as React.ChangeEvent<HTMLInputElement>);
  };

  return <Input {...props} onInput={handlePanInput} maxLength={10} />;
};


export function FamilyMemberFormModal({
  isOpen,
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
    setValue,
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
        dateOfBirth: member.dateOfBirth ? format(new Date(member.dateOfBirth), 'yyyy-MM-dd') : '',
        anniversaryDate: member.anniversaryDate ? format(new Date(member.anniversaryDate), 'yyyy-MM-dd') : '',
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
        name: `${data.firstName} ${data.lastName}`,
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

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const renderFileUploader = (
    label: string,
    file: File | null,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    errorKey: keyof typeof fileErrors,
    id: string,
    numberValue?: string,
    numberRegister?: any,
    numberLabel?: string,
    error?: string,
    isAadhaar?: boolean
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
            <Button variant="ghost" size="icon" className="w-6 h-6 ml-auto close-icon" onClick={() => setter(null)} disabled={isSaving}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      {numberRegister && numberLabel && (
        <div className="space-y-2">
            <Label htmlFor={id}>{numberLabel}</Label>
             {isAadhaar ? (
                <Controller
                  name={numberRegister.name}
                  control={control}
                  render={({ field }) => (
                    <AadhaarInput
                      id={id}
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={isSaving}
                    />
                  )}
                />
            ) : (
                <PanInput
                  id={id}
                  {...numberRegister}
                  disabled={isSaving}
                  defaultValue={numberValue}
                />
            )}
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh] overflow-hidden w-full max-w-4xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b relative">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 close-icon">
                <X className="h-4 w-4" />
            </Button>
            <div className="flex flex-col space-y-1.5">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {member ? 'Edit Family Member' : 'Add New Member'} - Step {step} / 2
              </h2>
              { step === 2 && (
                <p className="text-sm text-muted-foreground">Upload member identity documents.</p>
              )}
            </div>
        </div>

        <form
          onSubmit={handleSubmit(processSave)}
          className="flex flex-col h-full flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    <Input
                      id="phoneNumber"
                      type="tel"
                      {...register('phoneNumber')}
                      maxLength={10}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                      }}
                      disabled={isSaving}
                    />
                    {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="emailId">Email ID</Label>
                    <Input id="emailId" type="email" {...register('emailId')} disabled={isSaving} />
                    {errors.emailId && <p className="text-sm text-destructive">{errors.emailId.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" max={getToday()} {...register('dateOfBirth')} disabled={isSaving} />
                    {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="anniversaryDate">Anniversary Date (Optional)</Label>
                    <Input id="anniversaryDate" type="date" max={getToday()} {...register('anniversaryDate')} disabled={isSaving} />
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
                {renderFileUploader(
                    'PAN Card',
                    panFile,
                    setPanFile,
                    'pan',
                    'panNumber',
                    member?.panNumber,
                    register('panNumber'),
                    'PAN Number',
                    errors.panNumber?.message
                )}
                {renderFileUploader(
                    'Aadhaar Card',
                    aadhaarFile,
                    setAadhaarFile,
                    'aadhaar',
                    'aadhaarNumber',
                    member?.aadhaarNumber,
                    register('aadhaarNumber'),
                    'Aadhaar Number',
                    errors.aadhaarNumber?.message,
                    true // isAadhaar
                )}
                {renderFileUploader('Other Documents', otherFile, setOtherFile, 'other', 'otherDocs')}
              </div>
            )}
          </div>
            <div className="p-6 border-t flex justify-end space-x-2">
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
    </div>
  );
}

    