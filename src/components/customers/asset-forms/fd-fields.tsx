'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';

export function FDFields({ register, errors, control, familyMembers }: { register: any, errors: any, control: any, familyMembers: (Client | FamilyMember)[] }) {
    
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Fixed Deposit Details</h3>
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Company/Bank Name</Label>
                <Input {...register('fd_companyName')} />
            </div>
            <div>
                <Label>Investor Name</Label>
                 <Controller
                    name="fd_investorName"
                    control={control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select Member" />
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
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>FD Name</Label>
                <Input {...register('fd_fdName')} />
            </div>
            <div>
                <Label>FD Number</Label>
                <Input {...register('fd_fdNumber')} />
            </div>
        </div>

        {/* Row 3 - Corrected Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 items-start">
            {/* Period */}
            <div className="space-y-2">
                <Label>Period</Label>
                <div className="grid grid-cols-2 gap-4">
                <Controller
                    name="fd_periodMonth"
                    control={control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="fd_periodMonth">
                        <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                        {months.map(m => (
                            <SelectItem key={m} value={String(m)}>
                            {m}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
                <Controller
                    name="fd_periodDays"
                    control={control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="fd_periodDays">
                        <SelectValue placeholder="Days" />
                        </SelectTrigger>
                        <SelectContent>
                        {days.map(d => (
                            <SelectItem key={d} value={String(d)}>
                            {d}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
                </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
                <Label htmlFor="fd_interestRate">Interest Rate (%)</Label>
                <Input
                id="fd_interestRate"
                type="number"
                {...register('fd_interestRate')}
                />
            </div>

            {/* Maturity Amount */}
            <div className="space-y-2">
                <Label htmlFor="fd_maturityAmount">Maturity Amount (₹)</Label>
                <Input
                id="fd_maturityAmount"
                type="number"
                {...register('fd_maturityAmount')}
                />
            </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Date of Purchase</Label>
                <Input type="date" {...register('fd_purchaseDate')} />
            </div>
            <div>
                <Label>Date of Maturity</Label>
                <Input type="date" {...register('fd_maturityDate')} />
            </div>
        </div>
    </div>
  );
}
