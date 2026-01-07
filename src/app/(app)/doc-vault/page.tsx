
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
import { Upload, FileText, Trash2, Folder, Download } from 'lucide-react';
import { TASK_CATEGORIES } from '@/lib/constants';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Modal from '@/components/ui/Modal';
import { UploadDocModal } from '@/components/doc-vault/upload-doc-modal';
import type { FamilyMember } from '@/lib/types';


export default function DocVaultPage() {
  const { effectiveUser, hasPermission } = useCurrentUser();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>(
    useMemo(() => (effectiveUser?.role === 'CUSTOMER' ? getDocumentsForClient(effectiveUser.id) : []), [effectiveUser])
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMemberForUpload, setSelectedMemberForUpload] = useState<FamilyMember | null>(null);

  const familyMembers = useMemo(() => 
    (effectiveUser?.role === 'CUSTOMER') ? getFamilyMembersForClient(effectiveUser.id) : [],
    [effectiveUser]
  );
  
  const canView = hasPermission('DOC_VAULT', 'view');
  const canCreate = hasPermission('DOC_VAULT', 'create');
  const canDelete = hasPermission('DOC_VAULT', 'delete');

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

  const getDocsForMemberAndCategory = (memberId: string, category: string) => {
    return documents.filter(doc => doc.memberId === memberId && doc.category === category);
  };
  
  const getDocCountForMember = (memberId: string) => {
    return documents.filter(doc => doc.memberId === memberId).length;
  }

  const handleOpenUploadModal = (member: FamilyMember) => {
      if (!canCreate) {
          toast({ title: 'Permission Denied', description: 'You do not have permission to upload documents.', variant: 'destructive'});
          return;
      }
      setSelectedMemberForUpload(member);
      setIsUploadModalOpen(true);
  }
  
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedMemberForUpload(null);
  }

  const handleSaveUploads = (uploadedFiles: { category: string; file: File }[], member: FamilyMember) => {
    const newDocs: Document[] = uploadedFiles.map(({ category, file }) => ({
      id: `doc-${Date.now()}-${Math.random()}`,
      clientId: member.clientId,
      memberId: member.id,
      category,
      name: file.name,
      url: URL.createObjectURL(file), // Mock URL
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    toast({ title: 'Success', description: `${uploadedFiles.length} document(s) have been uploaded.` });
    handleCloseUploadModal();
  };


  const handleDelete = (docId: string) => {
      if (!canDelete) {
          toast({ title: 'Permission Denied', description: 'You do not have permission to delete documents.', variant: 'destructive'});
          return;
      }
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast({ title: 'Success', description: 'Document has been deleted.' });
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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
                  {TASK_CATEGORIES.map(category => {
                    const memberDocs = getDocsForMemberAndCategory(member.id, category);
                    
                    return (
                      <Card key={category} className="bg-card/50">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                          <CardTitle className="text-base">{category}</CardTitle>
                          {canCreate && (
                              <Button variant="outline" size="sm" onClick={() => handleOpenUploadModal(member)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </Button>
                          )}
                        </CardHeader>
                        {memberDocs.length > 0 && (
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                                      <Download className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    {canDelete && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(doc.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                  <div className="pt-4">
                      {canCreate && (
                          <Button variant="outline" onClick={() => handleOpenUploadModal(member)}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload New Document for {member.firstName}
                          </Button>
                      )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Modal open={isUploadModalOpen} onClose={handleCloseUploadModal}>
        {selectedMemberForUpload && (
          <UploadDocModal 
            member={selectedMemberForUpload}
            onClose={handleCloseUploadModal}
            onSave={handleSaveUploads}
          />
        )}
      </Modal>
    </>
  );
}
