
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  X,
  UploadCloud,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/lib/types';
import { format, parse, isValid } from 'date-fns';

const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  dateOfBirth: z.string().refine(val => val && isValid(parse(val, 'yyyy-MM-dd', new Date())), { message: "Invalid date" }),
  address: z.string().min(1, 'Address is required'),
  anniversaryDate: z.string().optional().refine(val => !val || (val && isValid(parse(val, 'yyyy-MM-dd', new Date()))), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }),
});


type ClientFormData = z.infer<typeof clientSchema>;

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  family?: Client | null;
  onSave: (family: Client) => void;
}

export function FamilyFormModal({
  isOpen,
  onClose,
  family,
  onSave,
}: FamilyFormModalProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [otherFile, setOtherFile] = useState<File | null>(null);

  const [fileErrors, setFileErrors] = useState({
    pan: '',
    aadhaar: '',
    other: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      address: '',
      dateOfBirth: '',
      anniversaryDate: '',
    },
  });

  useEffect(() => {
    if (family) {
      reset({
        ...family,
        dateOfBirth: family.dateOfBirth ? format(new Date(family.dateOfBirth), 'yyyy-MM-dd') : '',
        anniversaryDate: family.anniversaryDate ? format(new Date(family.anniversaryDate), 'yyyy-MM-dd') : '',
      });
      setPanFile(family.panFileName ? new File([], family.panFileName) : null);
      setAadhaarFile(family.aadhaarFileName ? new File([], family.aadhaarFileName) : null);
      setOtherFile(family.otherDocumentFileName ? new File([], family.otherDocumentFileName) : null);
    } else {
      reset({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        address: '',
        dateOfBirth: '',
        anniversaryDate: '',
      });
      setPanFile(null);
      setAadhaarFile(null);
      setOtherFile(null);
    }
    setStep(1);
    setIsSaving(false);
  }, [family, reset]);

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

  const processSave = (data: ClientFormData) => {
    setIsSaving(true);
    
    // Simulate saving delay
    setTimeout(() => {
      const clientData: Client = {
        id: family?.id || `client-${Date.now()}`,
        name: `${data.firstName} ${data.lastName}`,
        role: 'CUSTOMER',
        associateId: family?.associateId || 'assoc-unassigned', // needs a default or passed in
        avatarUrl: family?.avatarUrl || '',
        ...data,
        anniversaryDate: data.anniversaryDate || undefined, // Store as undefined if empty
        panFileName: panFile?.name,
        aadhaarFileName: aadhaarFile?.name,
        otherDocumentFileName: otherFile?.name,
        panPhotoUrl: panFile ? 'simulated_url' : family?.panPhotoUrl,
        aadhaarPhotoUrl: aadhaarFile ? 'simulated_url' : family?.aadhaarPhotoUrl,
        otherDocumentUrl: otherFile ? 'simulated_url' : family?.otherDocumentUrl,
      };

      onSave(clientData);
      
      setIsSaving(false);
    }, 1000);
  };

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const renderFileUploader = (
    label: string,
    file: File | null,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    errorKey: keyof typeof fileErrors
  ) => (
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
      {fileErrors[errorKey] && (
        <p className="text-sm text-destructive">{fileErrors[errorKey]}</p>
      )}
      {file && (
        <div className="flex items-center p-2 mt-2 text-sm rounded-md bg-muted text-muted-foreground">
          <FileIcon className="w-4 h-4 mr-2" />
          <span className="truncate">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 ml-auto close-icon"
            onClick={() => setter(null)}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl shadow-lg border flex flex-col max-h-[90vh] overflow-hidden w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b relative">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 close-icon">
                <X className="h-4 w-4" />
            </Button>
            <div className="flex flex-col space-y-1.5">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {family ? 'Edit Family Head' : 'Create New Family Head'} - Step {step} / 2
              </h2>
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
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    disabled={isSaving}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    disabled={isSaving}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register('phoneNumber')}
                    disabled={isSaving}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="emailId">Email ID</Label>
                  <Input
                    id="emailId"
                    type="email"
                    {...register('email')}
                    disabled={isSaving}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      disabled={isSaving}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="anniversaryDate">Anniversary Date (Optional)</Label>
                  <Input
                      id="anniversaryDate"
                      type="date"
                      {...register('anniversaryDate')}
                      disabled={isSaving}
                  />
                  {errors.anniversaryDate && (
                    <p className="text-sm text-destructive">
                      {errors.anniversaryDate.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    disabled={isSaving}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderFileUploader('PAN Photo', panFile, setPanFile, 'pan')}
                {renderFileUploader(
                  'Aadhaar Photo',
                  aadhaarFile,
                  setAadhaarFile,
                  'aadhaar'
                )}
                {renderFileUploader(
                  'Other Document',
                  otherFile,
                  setOtherFile,
                  'other'
                )}
              </div>
            )}
          </div>
        
          <div className="p-6 border-t flex justify-end space-x-2">
            {step === 1 && (
              <Button type="button" onClick={handleSubmit(() => handleNext(), () => {})}>Next</Button>
            )}
            {step === 2 && (
              <>
                <Button variant="outline" onClick={handleBack} disabled={isSaving}>
                  Back
                </Button>
                <Button onClick={handleSubmit(processSave)} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Client'
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
