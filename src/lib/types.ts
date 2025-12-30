import { type Role, type Permission, type AssetCategory, type Permissions } from './constants';
export type { Role, Permission, AssetCategory, Permissions };

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface RoleData {
  id: string;
  name: Role;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  customerId: string;
}

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
