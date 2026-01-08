

import { type Role, type Permission, type AssetCategory, type Permissions, type TaskStatus } from './constants';
export type { Role, Permission, AssetCategory, Permissions, TaskStatus };

// Base user type
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  phone?: string;
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

// A display type for the unified clients list
export type DisplayClient = (Omit<Client, 'role'> | Omit<FamilyMember, 'emailId'> & { email: string }) & {
  isFamilyHead: boolean;
  role: 'CUSTOMER';
  name: string;
  associateId: string;
  avatarUrl: string;
};


export interface RoleData {
  id: string;
  name: Role;
}

export interface FamilyMember {
  id: string;
  name: string;
  clientId: string; // Link to the main Client record
  firstName: string;
  lastName: string;
  relation: string;
  phoneNumber: string;
  emailId: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  anniversaryDate?: string; // YYYY-MM-DD
  panNumber?: string;
  aadhaarNumber?: string;
  panFileName?: string;
  aadhaarFileName?: string;
  otherDocumentFileName?: string;
  panPhotoUrl?: string;
  aadhaarPhotoUrl?: string;
  otherDocumentUrl?: string;
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

export interface InsuranceDetails {
  familyHead: string;
  associate: string;
  policyNo: string;
  company: string;
  insuranceType: 'Financial' | 'Non-Financial';
  
  // Non-Financial
  typeOfService?: string;
  nonFinancialDate?: string;

  // Financial
  financialService?: 'Maturity' | 'Death Claim' | 'Surrender';
  
  // Maturity
  maturityDueDate?: string;
  maturityAmount?: number;

  // Death Claim
  deathClaimProcessDate?: string;

  // Surrender
  surrenderProcessDate?: string;

  // Common Financial Fields
  amountStatus?: 'Credited' | 'Pending';
  receivedDate?: string;
  receivedAmount?: number;
  reinvestmentStatus?: 'Pending' | 'No' | 'Yes';
  reinvestmentApproxDate?: string;
  reinvestmentReason?: string;
}


export interface Task {
  id: string;
  clientId: string; // The ID of the assigned member
  familyHeadId?: string; // The ID of the family head
  associateId?: string;
  rmId?: string;
  adminId?: string;
  clientName: string; // The display name of the family member or head
  category: string;
  rmName?: string;
  serviceableRM?: string;
  dueDate: string; // Should be in a format parsable by new Date()
  status: TaskStatus;
  description?: string;
  createDate: string;
  startDate?: string | null;
  completeDate?: string | null;
  mutualFund?: {
    familyHead: string;
    service: string;
    folioNo: string;
    nameOfAMC: string;
    amount: number;
    documentStatus: "Received" | "Pending";
    signatureStatus: "Done" | "Pending";
    amcSubmissionStatus?: "Done" | "Pending";
  };
  insurance?: InsuranceDetails;
}


// --- Asset Management Types ---

export interface GeneralInsuranceDetails {
  familyMember?: string;
  category?: string;
  issuer?: string;
  planName?: string;
  policyNumber?: string;
  policyType?: string;
  policyStartDate?: string;
  policyIssueDate?: string;
  policyEndDate?: string;
  vehicleRegNumber?: string;
  sumAssured?: string;
  priceWithoutGST?: string;
  priceWithGST?: string;
  eligiblePremium?: string;
  referenceAgent?: string;
}

export interface PhysicalToDematDetails {
    folioNumber?: string;
    nameOnShare?: string;
    jointHolder1?: string;
    jointHolder2?: string;
    jointHolder3?: string;
    companyName?: string;
    rtaName?: string;
    quantity?: number;
    marketPrice?: number;
    totalValue?: number;
}

export interface BondDetails {
    isin?: string;
    issuer?: string;
    bondPrice?: number;
    bondUnit?: number;
    bondAmount?: number;
    purchaseDate?: string;
    maturityDate?: string;
    nomineeName?: string;
    nameOfFamilyMember?: string;
}

export interface FDDetails {
    companyName?: string;
    investorName?: string;
    fdName?: string;
    fdNumber?: string;
    depositedAmount?: string;
    periodMonth?: string;
    periodDays?: string;
    interestRate?: string;
    maturityAmount?: string;
    purchaseDate?: string;
    maturityDate?: string;
}

export interface PPFDetails {
    familyName?: string;
    contributedAmount?: number;
    balance?: number;
    bankName?: string;
    openingDate?: string;
    matureDate?: string;
}


export interface Asset {
  id: string;
  familyHeadId: string;
  familyHeadName: string;
  assetType: 'GENERAL INSURANCE' | 'PHYSICAL TO DEMAT' | 'BONDS' | 'FIXED DEPOSITS' | 'PPF' | 'LIFE INSURANCE' | 'MUTUAL FUNDS' | 'STOCKS';
  generalInsurance?: GeneralInsuranceDetails;
  physicalToDemat?: PhysicalToDematDetails;
  bonds?: BondDetails;
  fixedDeposits?: FDDetails;
  ppf?: PPFDetails;
  // Future asset types can be added here
}
