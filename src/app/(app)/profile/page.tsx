
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function ProfilePage() {
    const { effectiveUser } = useCurrentUser();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p>{effectiveUser?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{effectiveUser?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Role</p>
                            <p>{effectiveUser?.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
