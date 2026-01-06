
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAssetsForClient, getFamilyMembersForClient } from '@/lib/mock-data';
import type { User, AssetCategory } from '@/lib/types';
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
  User as UserIcon,
  ClipboardList,
  FolderOpen
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { AssetBreakdownModal } from './asset-breakdown-modal';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/use-tasks';
import CustomerTaskDashboard from './customer-task-dashboard';
import { StatCard } from '../ui/stat-card';

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

  const assets = useMemo(() => user.role === 'CUSTOMER' ? getAssetsForClient(user.id) : [], [user]);
  const familyMembers = useMemo(() => user.role === 'CUSTOMER' ? getFamilyMembersForClient(user.id): [], [user]);

  const { tasks } = useTasks();
  const customerTasks = useMemo(() => {
    if (user.role !== 'CUSTOMER') return [];
    return tasks.filter(task => task.clientId === user.id);
  }, [tasks, user]);

  const totalPoliciesValue = useMemo(() => {
    return assets
      .filter(asset => asset.category === 'Life Insurance' || asset.category === 'Term Insurance')
      .reduce((sum, asset) => sum + asset.value, 0);
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
    setSelectedCategory(category);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
  };

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Family Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="My Tasks" value={customerTasks.length} href="/tasks" icon={ClipboardList} />
        <StatCard label="Doc Vault" value="View" href="/doc-vault" icon={FolderOpen} />
        <StatCard label="My Profile" value="View" href="/profile" icon={UserIcon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Policy Value</CardTitle>
          <CardDescription>Sum of all Life and Term Insurance policies across the family.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">
            {formatter.format(totalPoliciesValue)}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {assetsByCategory.map(({ category, totalValue, count }) => {
          const Icon = categoryIcons[category];
          const isClickable = count > 0;
          return (
            <button
              key={category}
              disabled={!isClickable}
              onClick={() => isClickable && handleCardClick(category)}
              className={cn(
                "text-left",
                isClickable ? "cursor-pointer" : "cursor-default"
              )}
            >
              <Card className={cn(
                  "flex flex-col h-full", 
                  isClickable && "hover:bg-muted transition-colors"
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
      
      <CustomerTaskDashboard tasks={customerTasks} />

      <Modal open={!!selectedCategory} onClose={handleCloseModal}>
        {selectedCategory && (
          <AssetBreakdownModal 
            category={selectedCategory} 
            assets={assets}
            familyMembers={familyMembers}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
}
