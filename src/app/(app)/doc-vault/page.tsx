
'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { getFamilyMembersForClient, getDocumentsForClient, Document } from '@/lib/mock-data';
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

  const familyMembers = useMemo(() => 
    (effectiveUser?.role === 'CUSTOMER') ? getFamilyMembersForClient(effectiveUser.id) : [],
    [effectiveUser]
  );
  
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {familyMembers.map((member) => (
            <Link href={`/documents/${member.id}?clientId=${member.clientId}`} key={member.id} className="block">
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer h-full flex flex-col text-center group">
                <CardHeader className="flex-grow flex items-center justify-center p-6">
                  <Folder className="h-20 w-20 text-primary/30 group-hover:text-primary/60 transition-colors" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <p className="font-bold text-lg group-hover:text-primary transition-colors">{member.firstName} {member.lastName}</p>
                  <p className="text-sm text-muted-foreground">{member.relation}</p>
                  <p className="text-sm text-muted-foreground mt-2">
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
