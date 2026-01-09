
'use client';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, FamilyMember } from '@/lib/types';

export function FDFields({ control, errors, familyMembers }: { control: any, errors: any, familyMembers: (Client | FamilyMember)[] }) {
    
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === '') {
      field.onChange('');
      return;
    }
    const numValue = Number(value);
    if (numValue < 0) {
      field.onChange('0');
    } else {
      field.onChange(value);
    }
  };

  return (
    <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Fixed Deposit Details</h3>
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Company/Bank Name</Label>
                <Controller name="fixedDeposits.companyName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Investor Name</Label>
                 <Controller
                    name="fixedDeposits.investorName"
                    control={control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select Member" />
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Mobile Number</Label>
                <Controller
                    name="fixedDeposits.mobileNumber"
                    control={control}
                    render={({ field }) => (
                        <Input type="tel" maxLength={10} onKeyDown={handleNumericKeyDown} {...field} value={field.value || ''} />
                    )}
                />
                 {errors?.mobileNumber && <p className="text-sm text-destructive mt-1">{errors.mobileNumber.message}</p>}
            </div>
            <div>
                <Label>Email Address</Label>
                <Controller
                    name="fixedDeposits.emailAddress"
                    control={control}
                    render={({ field }) => (
                        <Input type="email" {...field} value={field.value || ''} />
                    )}
                />
                 {errors?.emailAddress && <p className="text-sm text-destructive mt-1">{errors.emailAddress.message}</p>}
            </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>FD Name</Label>
                <Controller name="fixedDeposits.fdName" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>FD Number</Label>
                <Controller name="fixedDeposits.fdNumber" control={control} render={({ field }) => <Input {...field} value={field.value || ''} />} />
            </div>
        </div>

        {/* Row 3 - Corrected Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 items-start">
            <div className="space-y-2">
                <Label>Deposited Amount (₹)</Label>
                <Controller name="fixedDeposits.depositedAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} value={field.value || ''} />} />
            </div>
            {/* Period */}
            <div className="space-y-2">
                <Label>Period</Label>
                <div className="grid grid-cols-2 gap-4">
                <Controller
                    name="fixedDeposits.periodMonth"
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
                    name="fixedDeposits.periodDays"
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
                <Controller name="fixedDeposits.interestRate" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} id="fd_interestRate" value={field.value || ''} />} />
            </div>

            {/* Maturity Amount */}
            <div className="space-y-2">
                <Label htmlFor="fd_maturityAmount">Maturity Amount (₹)</Label>
                <Controller name="fixedDeposits.maturityAmount" control={control} render={({ field }) => <Input type="number" min="0" step="any" inputMode="numeric" onKeyDown={handleNumericKeyDown} {...field} onChange={(e) => handleNumericChange(e, field)} id="fd_maturityAmount" value={field.value || ''} />} />
            </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>Date of Purchase</Label>
                <Controller name="fixedDeposits.purchaseDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
            <div>
                <Label>Date of Maturity</Label>
                <Controller name="fixedDeposits.maturityDate" control={control} render={({ field }) => <Input type="date" {...field} value={field.value || ''} />} />
            </div>
        </div>
    </div>
  );
}
