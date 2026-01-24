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
    getClientsForAssociate,
    getAllRMs,
    familyMembers as allFamilyMembersData,
} from '@/lib/mock-data';
import type { User, AssetCategory, DashboardAsset, FamilyMember, Task, Client } from '@/lib/types';
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
  HelpCircle
} from 'lucide-react';
import { AssetBreakdownModal } from './asset-breakdown-modal';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { MultiSelectCheckbox } from '../ui/multi-select-checkbox';
import { TaskOverviewSection } from './task-overview-section';
import { Separator } from '../ui/separator';

interface CustomerDashboardProps {
  user: User;
  allTasks: Task[];
}

const categoryIcons: Record<AssetCategory, React.ElementType> = {
  'Stocks': TrendingUp,
  'PPF': PiggyBank,
  'Mutual Funds': Landmark,
  'Life Insurance': HeartHandshake,
  'General Insurance': ShieldCheck,
  'Fixed Deposits': Banknote,
  'Bonds': FileText,
};

export default function CustomerDashboard({ user, allTasks }: CustomerDashboardProps) {
  const { impersonate } = useCurrentUser();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedId, setSelectedId] = useState('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const allClientsForSearch = useMemo(() => {
    const clients = getAllClients().map(c => ({ label: c.name, value: c.id }));
    return [{ label: 'All Clients', value: 'all' }, ...clients];
  }, []);

  const allAvailableFamilyMembers = useMemo(() => {
    if (!user) return [];
    
    let allMembers: (FamilyMember | Client)[] = [];
    let clientIds: string[] = [];

    switch(user.role) {
      case 'CUSTOMER':
        const head = clients.find(c => c.id === user.id);
        if (head) {
          allMembers.push(head as unknown as FamilyMember);
          allMembers.push(...getFamilyMembersForClient(user.id));
        }
        break;
      case 'ASSOCIATE':
        clientIds = getClientsForAssociate(user.id).map(c => c.id);
        break;
      case 'RM': {
        const associates = getAssociatesForRM(user.id);
        clientIds = associates.flatMap(assoc => getClientsForAssociate(assoc.id)).map(c => c.id);
        break;
      }
      case 'ADMIN': {
        const rms = getRMsForAdmin(user.id);
        const associates = rms.flatMap(rm => getAssociatesForRM(rm.id));
        clientIds = associates.flatMap(assoc => getClientsForAssociate(assoc.id)).map(c => c.id);
        break;
      }
      case 'SUPER_ADMIN':
        clientIds = getAllClients().map(c => c.id);
        break;
    }

    if (clientIds.length > 0) {
      const allScopedClients = getAllClients().filter(c => clientIds.includes(c.id));
      allMembers.push(...allScopedClients.map(c => ({ ...c, relation: 'Head' } as unknown as FamilyMember)));
      
      const allScopedFamilyMembers = clientIds.flatMap(id => getFamilyMembersForClient(id));
      allMembers.push(...allScopedFamilyMembers);
    }
    
    // Add a consistent 'name' property if it doesn't exist
    return allMembers.map(m => ({ ...m, name: m.name || `${m.firstName} ${m.lastName}` }));
  }, [user]);

  const dropdownOptions = useMemo(() => {
    if (!user) return [];
    
    let options: {id: string, name: string}[] = [];

    switch(user.role) {
        case 'CUSTOMER': // This case is now handled by familyDropdownOptions
            return [];
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
            return [];
    }
    
    const sortedOptions = options.sort((a,b) => a.name.localeCompare(b.name));
    return [{ id: 'all', name: 'All Clients'}, ...sortedOptions];
  }, [user]);

  const familyDropdownOptions = useMemo(() => {
    if (user.role !== 'CUSTOMER') return [];
    const head = clients.find(c => c.id === user.id);
    if (!head) return [];
    const members = getFamilyMembersForClient(user.id);
    const sortedMembers = members.sort((a,b) => a.name.localeCompare(b.name));
    return [
        { value: 'all', label: 'All Members'},
        { value: head.id, label: `${head.firstName} ${head.lastName} (Head)` },
        ...sortedMembers.map(m => ({ value: m.id, label: `${m.name} (${m.relation})` }))
    ];
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
      
      let scopedAssets = allDashboardAssets.filter(a => scopedClientIds.includes(a.familyHeadId));

      if (user.role === 'CUSTOMER') {
        if (selectedMemberIds.length === 0) {
            return [];
        }
        if (selectedMemberIds.includes('all')) {
          return scopedAssets;
        }
        return scopedAssets.filter(asset => selectedMemberIds.includes(asset.ownerMemberId));
      }
      
      if (selectedId === 'all') {
          return scopedAssets;
      }
      
      // for others, selectedId is a clientId (familyHeadId)
      return scopedAssets.filter(a => a.familyHeadId === selectedId);
  }, [user, selectedId, selectedMemberIds]);

  const allRms = useMemo(() => getAllRMs(), []);
  const scopedTasks = useMemo(() => {
      if (!user) return [];
      if (user.role === 'SUPER_ADMIN') {
          return allTasks;
      }

      return allTasks.filter(task => {
          const serviceableRm = allRms.find(rm => rm.name === task.serviceableRM);

          return (
              task.adminId === user.id ||
              task.rmId === user.id ||
              task.associateId === user.id ||
              (serviceableRm && serviceableRm.id === user.id) ||
              task.clientId === user.id ||
              task.familyHeadId === user.id
          );
      });
  }, [allTasks, user, allRms]);

  const {
    totalNetWorth,
    lifeInsurancePremium,
    generalInsurancePremium,
    cashFlow,
    totalSumAssured,
  } = useMemo(() => {
    const netWorth = assets
      .filter(asset => asset.category !== 'General Insurance')
      .reduce((sum, asset) => sum + (asset.premiumAmount || asset.value), 0);

    const liPremium = assets
      .filter(asset => asset.category === 'Life Insurance')
      .reduce((sum, asset) => sum + (asset.premiumAmount || 0), 0);

    const giPremium = assets
      .filter(asset => asset.category === 'General Insurance')
      .reduce((sum, asset) => sum + asset.value, 0);

    const cashFlowCategories: AssetCategory[] = ['PPF', 'Fixed Deposits', 'Bonds', 'Life Insurance'];
    const cf = assets
      .filter(asset => cashFlowCategories.includes(asset.category))
      .reduce((sum, asset) => {
        if (asset.category === 'Life Insurance') {
          return sum + (asset.premiumAmount || 0);
        }
        return sum + asset.value;
      }, 0);

    const sumAssured = assets
      .filter(asset => asset.category === 'Life Insurance')
      .reduce((sum, asset) => sum + (asset.sumAssured || 0), 0);

    return {
      totalNetWorth: netWorth,
      lifeInsurancePremium: liPremium,
      generalInsurancePremium: giPremium,
      cashFlow: cf,
      totalSumAssured: sumAssured,
    };
  }, [assets]);
  
  const assetsByCategory = useMemo(() => {
    return ASSET_CATEGORIES.map(category => {
      const categoryAssets = assets.filter(asset => asset.category === category);
      const totalValue = categoryAssets.reduce((sum, asset) => sum + (asset.premiumAmount || asset.value), 0);
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
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };
  
  const isCardClickable = true;
  const showFilterDropdown = user.role !== 'SUPER_ADMIN' && user.role !== 'CUSTOMER' && dropdownOptions.length > 0;

  const MetricItem = ({ label, value, isPrimary = false }: { label: string, value: string, isPrimary?: boolean }) => (
    <div className="flex flex-col items-center justify-center text-center flex-1 py-2">
        <p className={cn(
            "text-sm text-muted-foreground mb-1",
            isPrimary && "text-base"
        )}>{label}</p>
        <p className={cn(
            "font-bold",
            isPrimary ? "text-4xl text-primary" : "text-2xl"
        )}>{value}</p>
    </div>
  );


  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline">{user.role === 'CUSTOMER' ? 'Family Dashboard' : 'Dashboard'}</h1>
            <p className="text-muted-foreground">{user.role === 'SUPER_ADMIN' ? "A summary of all clients' wealth" : user.role === 'CUSTOMER' ? "A summary of your family's wealth" : "A summary of your clients' wealth"}</p>
        </div>

        {user.role === 'SUPER_ADMIN' ? (
          <div className="flex items-center gap-2 w-full max-w-sm ml-auto">
            <Label htmlFor="client-search" className="whitespace-nowrap">Switch to Client View</Label>
            <Combobox
              options={allClientsForSearch}
              onChange={(clientId) => {
                if (clientId && clientId !== 'all') {
                  impersonate(clientId);
                }
              }}
              placeholder="Search & select a client"
              searchPlaceholder='Search client...'
              emptyText='No client found.'
            />
          </div>
        ) : user.role === 'CUSTOMER' ? (
             <div className="flex items-center gap-2 justify-end">
              <Label htmlFor="member-filter">View Assets For</Label>
               <MultiSelectCheckbox
                    options={familyDropdownOptions}
                    selected={selectedMemberIds}
                    onChange={setSelectedMemberIds}
                    className="w-[280px]"
                />
            </div>
        ) : showFilterDropdown && (
          <div className="flex items-center gap-2 justify-end">
              <Label htmlFor="member-filter">View Assets For</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger id="member-filter" className="w-[280px]">
                      <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                      {dropdownOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                              {option.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
        )}

      <Card className="futuristic-hover">
        <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-stretch md:justify-around divide-y md:divide-y-0 md:divide-x divide-border">
                <MetricItem label="Total Net Worth" value={formatter.format(totalNetWorth)} isPrimary />
                <MetricItem label="LI Premium" value={formatter.format(lifeInsurancePremium)} />
                <MetricItem label="GI Premium" value={formatter.format(generalInsurancePremium)} />
                <MetricItem label="Cash Flow" value={formatter.format(cashFlow)} />
                <MetricItem label="Total Sum Assured" value={formatter.format(totalSumAssured)} />
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
                  "flex flex-col h-full futuristic-hover", 
                  canClick && "transition-colors"
              )}>
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category}</CardTitle>
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
         <Card className="flex flex-col h-full futuristic-hover">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle className="text-lg">Others</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="mt-auto">
                <p className="text-sm text-muted-foreground">This section will be available in future updates.</p>
            </CardContent>
        </Card>
      </div>

      <TaskOverviewSection tasks={scopedTasks} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="futuristic-hover">
              <CardHeader>
                  <CardTitle className="text-xl">Compliance</CardTitle>
                  <Separator />
              </CardHeader>
              <CardContent>
                  <ul className="space-y-3">
                      {['Address Update', 'Email Update', 'Mobile Number Update', 'Nominee Update', 'PAN Card Update', 'Name Change'].map(item => (
                          <li key={item} className="flex justify-between items-center text-sm font-medium p-2 -m-2 rounded-md hover:bg-muted cursor-pointer transition-colors" role="button" tabIndex={0}>
                              <span>{item}</span>
                              <Badge variant="secondary">{Math.floor(Math.random() * 15) + 1}</Badge>
                          </li>
                      ))}
                      <li className="flex justify-between items-center text-sm font-medium p-2 -m-2 rounded-md hover:bg-muted cursor-pointer transition-colors" role="button" tabIndex={0}>
                          <span>Document Not Available</span>
                          <Badge variant="secondary">{Math.floor(Math.random() * 5)}</Badge>
                      </li>
                  </ul>
              </CardContent>
          </Card>

          <Card className="futuristic-hover">
              <CardHeader>
                  <CardTitle className="text-xl">Alerts</CardTitle>
                   <Separator />
              </CardHeader>
              <CardContent>
                  <ul className="space-y-3">
                        {['FD Maturity', 'Insurance Renewal', 'Insurance Maturity', 'Bond Maturity', 'Upcoming Birthday', 'Minor to Major'].map(item => (
                          <li key={item} className="flex justify-between items-center text-sm font-medium p-2 -m-2 rounded-md hover:bg-muted cursor-pointer transition-colors" role="button" tabIndex={0}>
                              <span>{item}</span>
                                <Badge variant="destructive">{Math.floor(Math.random() * 8)}</Badge>
                          </li>
                      ))}
                  </ul>
              </CardContent>
          </Card>
      </div>
    </div>
      
      {selectedCategory && (
            <AssetBreakdownModal 
              category={selectedCategory} 
              assets={assets}
              familyMembers={allAvailableFamilyMembers}
              documents={mockDocuments}
              onClose={handleCloseModal}
              isOpen={!!selectedCategory}
            />
          )}
    </>
  );
}
