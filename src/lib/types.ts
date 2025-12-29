export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'ASSOCIATE' | 'CUSTOMER';
export type Permission = 'Create' | 'Edit' | 'Update' | 'Delete' | 'Export';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface RoleData {
  name: Role;
  permissions: Permission[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  customerId: string;
}

export type AssetCategory =
  | 'Stocks'
  | 'PPF'
  | 'Mutual Funds'
  | 'Life Insurance'
  | 'Term Insurance'
  | 'Fixed Deposits'
  | 'Bonds';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  ownerMemberId: string;
  customerId: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  category: AssetCategory;
  memberId: string;
  customerId: string;
}
