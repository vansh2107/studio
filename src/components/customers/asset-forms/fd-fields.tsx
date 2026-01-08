
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export function FDFields({ register, errors, control, familyMembers }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[] }) {
  
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
          <h2 className="text-2xl font-bold">Fixed Deposit</h2>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Fixed Deposit</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Row 1 */}
        <div className="space-y-2">
          <Label htmlFor="fd_companyName">Company Name</Label>
          <Input id="fd_companyName" {...register('fd_companyName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fd_familyHead">Family Head</Label>
          <Controller
            name="fd_familyHead"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="fd_familyHead">
                  <SelectValue placeholder="Select Family Head" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.filter(m => 'role' in m && m.role === 'CUSTOMER').map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Row 2 */}
        <div className="space-y-2">
          <Label htmlFor="fd_investorName">Investor Name</Label>
          <Controller
            name="fd_investorName"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="fd_investorName">
                  <SelectValue placeholder="Select Investor" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fd_fdName">FD Name</Label>
          <Input id="fd_fdName" {...register('fd_fdName')} />
        </div>

        {/* Row 3 */}
        <div className="space-y-2">
          <Label htmlFor="fd_fdNumber">FD number</Label>
          <Input id="fd_fdNumber" {...register('fd_fdNumber')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fd_depositedAmount">Deposited Amount (₹)</Label>
          <Input id="fd_depositedAmount" type="number" {...register('fd_depositedAmount')} />
        </div>

        {/* Row 4 */}
        <div className="space-y-2">
            <Label>Period</Label>
            <div className="flex gap-4">
                <div className="flex-1">
                    <Label htmlFor="fd_periodMonth" className="text-xs text-muted-foreground">Month</Label>
                    <Controller
                        name="fd_periodMonth"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="fd_periodMonth">
                                <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
                <div className="flex-1">
                    <Label htmlFor="fd_periodDays" className="text-xs text-muted-foreground">Days</Label>
                    <Controller
                        name="fd_periodDays"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="fd_periodDays">
                                <SelectValue placeholder="Select Days" />
                            </SelectTrigger>
                            <SelectContent>
                                {days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="fd_interestRate">Interest Rate (%)</Label>
                <Input id="fd_interestRate" type="number" {...register('fd_interestRate')} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="fd_maturityAmount">Maturity Amount (₹)</Label>
                <Input id="fd_maturityAmount" type="number" {...register('fd_maturityAmount')} />
            </div>
        </div>

        {/* Row 5 */}
        <div className="space-y-2">
          <Label htmlFor="fd_purchaseDate">Purchase Date</Label>
          <Input id="fd_purchaseDate" type="date" {...register('fd_purchaseDate')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fd_maturityDate">Maturity Date</Label>
          <Input id="fd_maturityDate" type="date" {...register('fd_maturityDate')} />
        </div>
        
        {/* Remarks */}
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="fd_remarks">Remarks</Label>
            <Textarea id="fd_remarks" {...register('fd_remarks')} rows={4} />
        </div>

        {/* File Upload */}
        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="fd_fileUpload">File Upload</Label>
            <div className="flex items-center gap-4">
                <Input id="fd_fileUpload" type="file" className="max-w-xs"/>
                {/* Placeholder for selected file name */}
                <span className="text-sm text-muted-foreground">image.png</span>
            </div>
        </div>

        {/* Buttons */}
        <div className="md:col-span-2 flex justify-center items-center gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => { /* Cancel does nothing */ }}>Cancel</Button>
            <Button type="button" onClick={() => { /* Submit does nothing */ }}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
