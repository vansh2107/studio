'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { getFamilyMembersForClient, getDocumentsForClient, clients } from '@/lib/mock-data';
import type { Document } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FamilyMember } from '@/lib/types';
import Link from 'next/link';

export default function DocVaultPage() {
  const { effectiveUser, hasPermission } = useCurrentUser();

  const [documents, setDocuments] = useState<Document[]>(
    useMemo(() => (effectiveUser?.role === 'CUSTOMER' ? getDocumentsForClient(effectiveUser.id) : []), [effectiveUser])
  );

  const familyMembers = useMemo(() => {
    if (effectiveUser?.role !== 'CUSTOMER') return [];
    const head = clients.find(c => c.id === effectiveUser.id);
    if (!head) return [];
    return [
        head as unknown as FamilyMember,
        ...getFamilyMembersForClient(effectiveUser.id)
    ];
  }, [effectiveUser]);
  
  const canView = hasPermission('DOC_VAULT', 'view');

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    );
  }
  
  const getDocCountForMember = (memberId: string) => {
    return documents.filter(doc => doc.memberId === memberId).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Document Vault</h1>
        <p className="text-muted-foreground">Securely store and manage your family's important documents.</p>
      </div>

      {familyMembers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {familyMembers.map((member) => (
            <Link href={`/documents/${member.id}?clientId=${member.clientId || effectiveUser?.id}`} key={member.id} className="block">
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer h-full flex flex-col text-center group">
                <CardHeader className="flex-grow flex items-center justify-center p-4">
                  <Folder className="h-12 w-12 text-primary/30 group-hover:text-primary/60 transition-colors" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="font-bold text-base group-hover:text-primary transition-colors truncate">{member.firstName} {member.lastName}</p>
                  <p className="text-xs text-muted-foreground">{member.relation || 'Head'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getDocCountForMember(member.id)} document{getDocCountForMember(member.id) !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <p>No family members found to display document folders.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
