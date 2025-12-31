
'use client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getFamilyMembersForClient, getDocumentsForClient, Document } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, Folder } from 'lucide-react';
import { DOC_CATEGORIES } from '@/lib/constants';
import { useMemo } from 'react';

export default function DocVaultPage() {
  const { effectiveUser } = useCurrentUser();

  const familyMembers = useMemo(() => 
    (effectiveUser?.role === 'CUSTOMER') ? getFamilyMembersForClient(effectiveUser.id) : [],
    [effectiveUser]
  );
  
  const documents = useMemo(() =>
    (effectiveUser?.role === 'CUSTOMER') ? getDocumentsForClient(effectiveUser.id) : [],
    [effectiveUser]
  );

  if (effectiveUser?.role !== 'CUSTOMER') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is only available for customer accounts.</p>
        </CardContent>
      </Card>
    );
  }

  const getDocsForMemberAndCategory = (memberId: string, category: string) => {
    return documents.filter(doc => doc.memberId === memberId && doc.category === category);
  };
  
  const getDocCountForMember = (memberId: string) => {
    return documents.filter(doc => doc.memberId === memberId).length;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Document Vault</h1>
        <p className="text-muted-foreground">Securely store and manage your family's important documents.</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {familyMembers.map((member) => (
          <AccordionItem value={member.id} key={member.id}>
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              <div className="flex items-center gap-3">
                <Folder className="h-6 w-6 text-primary"/>
                {member.firstName} {member.lastName} ({member.relation})
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({getDocCountForMember(member.id)} documents)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-8 space-y-4 pt-2">
                {DOC_CATEGORIES.map(category => {
                  const memberDocs = getDocsForMemberAndCategory(member.id, category);
                  if (memberDocs.length === 0) return null;

                  return (
                    <Card key={category} className="bg-card/50">
                      <CardHeader>
                        <CardTitle className="text-base">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {memberDocs.map(doc => (
                            <li key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-background">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  {doc.name}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload to {category}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
                 <div className="pt-4">
                     <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Document for {member.firstName}
                    </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
