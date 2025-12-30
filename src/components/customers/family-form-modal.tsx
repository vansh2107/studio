'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Calendar as CalendarIcon,
  X,
  UploadCloud,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Family } from '@/lib/types';

const familySchema = z.object({
  familyHeadName: z.string().min(1, 'Family head name is required'),
  familyName: z.string().min(1, 'Family name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  emailId: z.string().email('Invalid email address'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  address: z.string().min(1, 'Address is required'),
  anniversaryDate: z.date().optional(),
});

type FamilyFormData = z.infer<typeof familySchema>;

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

interface FamilyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  family?: Family | null;
  onSave: (family: Family) => void;
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
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      familyHeadName: '',
      familyName: '',
      phoneNumber: '',
      emailId: '',
      address: '',
    },
  });

  const familyHeadName = watch('familyHeadName');

  useEffect(() => {
    if (family) {
      reset({
        ...family,
        dateOfBirth: family.dateOfBirth ? new Date(family.dateOfBirth) : undefined,
        anniversaryDate: family.anniversaryDate
          ? new Date(family.anniversaryDate)
          : undefined,
      });
      setPanFile(family.panFileName ? new File([], family.panFileName) : null);
      setAadhaarFile(family.aadhaarFileName ? new File([], family.aadhaarFileName) : null);
      setOtherFile(family.otherDocumentFileName ? new File([], family.otherDocumentFileName) : null);
    } else {
      reset({
        familyHeadName: '',
        familyName: '',
        phoneNumber: '',
        emailId: '',
        address: '',
        dateOfBirth: undefined,
        anniversaryDate: undefined,
      });
      setPanFile(null);
      setAadhaarFile(null);
      setOtherFile(null);
    }
    setStep(1);
    setIsSaving(false);
  }, [family, isOpen, reset]);

  useEffect(() => {
    if (familyHeadName) {
      const parts = familyHeadName.trim().split(' ');
      if (parts.length > 1) {
        setValue('familyName', parts[parts.length - 1]);
      } else {
        setValue('familyName', familyHeadName);
      }
    }
  }, [familyHeadName, setValue]);

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

  const processSave = (data: FamilyFormData) => {
    setIsSaving(true);
    
    // Simulate saving delay
    setTimeout(() => {
      const familyData: Family = {
        id: family?.id || `fam-${Date.now()}`,
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString(),
        anniversaryDate: data.anniversaryDate?.toISOString(),
        panFileName: panFile?.name,
        aadhaarFileName: aadhaarFile?.name,
        otherDocumentFileName: otherFile?.name,
        // In prototype, URLs are just placeholders
        panPhotoUrl: panFile ? URL.createObjectURL(panFile) : family?.panPhotoUrl,
        aadhaarPhotoUrl: aadhaarFile ? URL.createObjectURL(aadhaarFile) : family?.aadhaarPhotoUrl,
        otherDocumentUrl: otherFile ? URL.createObjectURL(otherFile) : family?.otherDocumentUrl,
      };

      onSave(familyData);

      toast({
        title: family ? 'Family Updated' : 'Family Created',
        description: `The family "${data.familyName}" has been successfully saved.`,
      });
      
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
            className="w-6 h-6 ml-auto"
            onClick={() => setter(null)}
            disabled={isSaving}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {family ? 'Edit Family' : 'Create New Family'} - Step {step} / 2
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(processSave)}
          className="grid gap-4 py-4"
        >
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familyHeadName">Family Head (Full Name)</Label>
                <Input
                  id="familyHeadName"
                  {...register('familyHeadName')}
                  disabled={isSaving}
                />
                {errors.familyHeadName && (
                  <p className="text-sm text-destructive">
                    {errors.familyHeadName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  {...register('familyName')}
                  disabled={isSaving}
                />
                {errors.familyName && (
                  <p className="text-sm text-destructive">
                    {errors.familyName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="emailId">Email ID</Label>
                <Input
                  id="emailId"
                  type="email"
                  {...register('emailId')}
                  disabled={isSaving}
                />
                {errors.emailId && (
                  <p className="text-sm text-destructive">
                    {errors.emailId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isSaving}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                 {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>
               <div className="space-y-2">
                <Label>Anniversary Date (Optional)</Label>
                <Controller
                  name="anniversaryDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isSaving}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
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
        </form>

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSubmit(() => handleNext(), () => {})}>Next</Button>
            </>
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
                  'Save Family'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
