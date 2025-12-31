import { type Role, type Permission, type AssetCategory, type Permissions } from './constants';
export type { Role, Permission, AssetCategory, Permissions };

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatarUrl: string;
  emailId?: string;
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
  category: string; // Keep as string, not AssetCategory for flexibility
  memberId: string;
  customerId: string;
}

export interface Family {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailId: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  anniversaryDate?: string; // YYYY-MM-DD
  panPhotoUrl?: string;
  aadhaarPhotoUrl?: string;
  otherDocumentUrl?: string;
  panFileName?: string;
  aadhaarFileName?: string;
  otherDocumentFileName?: string;
}
