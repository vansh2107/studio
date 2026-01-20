
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    dashboardAssets as allDashboardAssets, 
    getFamilyMembersForClient, 
    clients, 
    documents as mockDocuments,
    getAllClients,
    getRMsForAdmin,
    getAssociatesForRM,
    getClientsForAssociate
} from '@/lib/mock-data';
import type { User, AssetCategory, DashboardAsset, FamilyMember } from '@/lib/types';
import { ASSET_CATEGORIES } from '@/lib/constants';
import { useMemo, useState } from 'react';
import {
  Banknote,
  Landmark,
  PiggyBank,
  HeartHandshake,
  ShieldCheck,
  TrendingUp,
  FileText,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { AssetBreakdownModal } from './asset-breakdown-modal';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CustomerDashboardProps {
  user: User;
}

const categoryIcons: Record<AssetCategory, React.ElementType> = {
  'Stocks': TrendingUp,
  'PPF': PiggyBank,
  'Mutual Funds': Landmark,
  'Life Insurance': HeartHandshake,
  'Term Insurance': ShieldCheck,
  'Fixed Deposits': Banknote,
  'Bonds': FileText,
};

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedId, setSelectedId] = useState('all');

  const familyMembersForModal = useMemo(() => {
    if (user.role !== 'CUSTOMER') return [];
    const head = clients.find(c => c.id === user.id);
    if (!head) return [];
    return [
        head as unknown as FamilyMember,
        ...getFamilyMembersForClient(user.id)
    ];
  }, [user]);

  const dropdownOptions = useMemo(() => {
    if (!user) return [];
    
    let options: {id: string, name: string}[] = [];

    switch(user.role) {
        case 'CUSTOMER': {
            const head = clients.find(c => c.id === user.id);
            if (!head) return [];
            const members = getFamilyMembersForClient(user.id);
            return [
                { id: head.id, name: `${head.firstName} ${head.lastName} (Head)` },
                ...members.map(m => ({ id: m.id, name: `${m.name} (${m.relation})` }))
            ];
        }
        case 'ASSOCIATE':
            options = getClientsForAssociate(user.id).map(c => ({ id: c.id, name: c.name }));
            break;
        case 'RM': {
            const associates = getAssociatesForRM(user.id);
            options = associates.flatMap(assoc => getClientsForAssociate(assoc.id)).map(c => ({ id: c.id, name: c.name }));
            break;
        }
        case 'ADMIN': {
            const rms = getRMsForAdmin(user.id);
            const associates = rms.flatMap(rm => getAssociatesForRM(rm.id));
            options = associates.flatMap(assoc => getClientsForAssociate(assoc.id)).map(c => ({ id: c.id, name: c.name }));
            break;
        }
        case 'SUPER_ADMIN':
            options = getAllClients().map(c => ({ id: c.id, name: c.name }));
            break;
    }
    return options.sort((a,b) => a.name.localeCompare(b.name));
  }, [user]);

  const assets: DashboardAsset[] = useMemo(() => {
      if (!user) return [];
      
      let scopedClientIds: string[] = [];
      switch(user.role) {
        case 'CUSTOMER':
            scopedClientIds = [user.id];
            break;
        case 'ASSOCIATE':
            scopedClientIds = getClientsForAssociate(user.id).map(c => c.id);
            break;
        case 'RM': {
            const associates = getAssociatesForRM(user.id);
            scopedClientIds = associates.flatMap(assoc => getClientsForAssociate(assoc.id)).map(c => c.id);
            break;
        }
        case 'ADMIN': {
            const rms = getRMsForAdmin(user.id);
            const associates = rms.flatMap(rm => getAssociatesForRM(rm.id));
            scopedClientIds = associates.flatMap(assoc => getClientsForAssociate(assoc.id)).map(c => c.id);
            break;
        }
        case 'SUPER_ADMIN':
            scopedClientIds = getAllClients().map(c => c.id);
            break;
      }
      
      const scopedAssets = allDashboardAssets.filter(a => scopedClientIds.includes(a.familyHeadId));

      if (selectedId === 'all') {
          return scopedAssets;
      }
      
      if (user.role === 'CUSTOMER') {
        // for customer, selectedId is a memberId
        return scopedAssets.filter(a => a.ownerMemberId === selectedId);
      } else {
        // for others, selectedId is a clientId (familyHeadId)
        return scopedAssets.filter(a => a.familyHeadId === selectedId);
      }
  }, [user, selectedId]);

  const totalAssetValue = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.value, 0);
  }, [assets]);
  
  const assetsByCategory = useMemo(() => {
    return ASSET_CATEGORIES.map(category => {
      const categoryAssets = assets.filter(asset => asset.category === category);
      const totalValue = categoryAssets.reduce((sum, asset) => sum + asset.value, 0);
      const count = categoryAssets.length;
      return { category, totalValue, count };
    });
  }, [assets]);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const handleCardClick = (category: AssetCategory) => {
    if (user.role === 'CUSTOMER') {
      setSelectedCategory(category);
    }
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };
  
  const isCardClickable = user.role === 'CUSTOMER';

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Family Dashboard</h1>
        {dropdownOptions.length > 0 && (
          <div className="flex items-center gap-2">
              <Label htmlFor="member-filter">View Assets For</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger id="member-filter" className="w-[280px]">
                      <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {dropdownOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                              {option.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
        )}
    </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Asset Value</CardTitle>
          <CardDescription>The total value of all assets for the selected scope.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {formatter.format(totalAssetValue)}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assetsByCategory.map(({ category, totalValue, count }) => {
          const Icon = categoryIcons[category];
          const canClick = isCardClickable && count > 0;
          return (
            <button
              key={category}
              disabled={!canClick}
              onClick={() => canClick && handleCardClick(category)}
              className={cn(
                "text-left",
                canClick ? "cursor-pointer" : "cursor-default"
              )}
            >
              <Card className={cn(
                  "flex flex-col h-full", 
                  canClick && "hover:bg-muted transition-colors"
              )}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{category}</CardTitle>
                      <CardDescription>{count} asset{count !== 1 ? 's' : ''}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  {count > 0 ? (
                    <div className="text-2xl font-bold">{formatter.format(totalValue)}</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No assets in this category.</div>
                  )}
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
      
      <Modal open={!!selectedCategory} onClose={handleCloseModal}>
        {selectedCategory && (
          <AssetBreakdownModal 
            category={selectedCategory} 
            assets={assets}
            familyMembers={familyMembersForModal}
            documents={mockDocuments}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
}
