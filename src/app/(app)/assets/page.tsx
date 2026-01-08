
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddAssetModal } from '@/components/customers/add-asset-modal';
import { PlusCircle } from 'lucide-react';
import { getAllClients } from '@/lib/mock-data';
import type { Client } from '@/lib/types';


export default function AssetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const familyHeads = getAllClients();

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline">Asset Management</h1>
           <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page is under construction. Asset listing will appear here.</p>
          </CardContent>
        </Card>
      </div>

       {isModalOpen && (
          <AddAssetModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              familyHeads={familyHeads}
          />
      )}
    </>
  );
}
