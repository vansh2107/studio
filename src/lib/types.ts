
import { type Role, type Permission, type AssetCategory, type Permissions } from './constants';
export type { Role, Permission, AssetCategory, Permissions };

// Base user type
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
}

// Role-specific types with hierarchical links
export interface SuperAdmin extends BaseUser {
  role: 'SUPER_ADMIN';
}

export interface Admin extends BaseUser {
  role: 'ADMIN';
  superAdminId: string;
}

export interface RelationshipManager extends BaseUser {
  role: 'RM';
  adminId: string;
}

export interface Associate extends BaseUser {
  role: 'ASSOCIATE';
  rmId: string;
}

export interface Client extends BaseUser {
  role: 'CUSTOMER';
  associateId: string;
  // Merging Family concept into Client for simplicity
  firstName: string;
  lastName: string;
  phoneNumber: string;
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

// A union type for any user in the system
export type User = SuperAdmin | Admin | RelationshipManager | Associate | Client;

export interface RoleData {
  id: string;
  name: Role;
}

export interface FamilyMember {
  id: string;
  clientId: string; // Link to the main Client record
  firstName: string;
  lastName: string;
  relation: string;
  phoneNumber: string;
  emailId: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  anniversaryDate?: string; // YYYY-MM-DD
}


export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  ownerMemberId: string; // ID of FamilyMember who owns it
  clientId: string; // ID of the client family head
}

export interface Document {
  id: string;
  name: string;
  url: string;
  category: string; // Keep as string, not AssetCategory for flexibility
  memberId: string;
  clientId: string;
}

// This type is now effectively merged into the Client type.
// Kept for legacy compatibility if needed, but should be phased out.
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
