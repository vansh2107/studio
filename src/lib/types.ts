

import { type Role, type Permission, type AssetCategory, type Permissions, type TaskStatus, type TaskStatus2, type TaskRMStatus } from './constants';
export type { Role, Permission, AssetCategory, Permissions, TaskStatus, TaskStatus2, TaskRMStatus };

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


export interface StocksTaskDetails {
    service?: string;
    dpid?: string;
}

export interface TimelineEvent {
  id: string;
  eventType: 'TASK_CREATED' | 'STATUS_CHANGED' | 'ASSIGNED_RM' | 'SERVICEABLE_RM_ASSIGNED' | 'TASK_RM_ASSIGNED' | 'TASK_COMPLETED' | 'TASK_REOPENED' | 'FIELD_UPDATED';
  title: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string; // User name
  timestamp: string; // ISO string
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
  status2?: TaskStatus2;
  description?: string;
  createDate: string;
  startDate?: string | null;
  completeDate?: string | null;
  taskRM?: string;
  taskRMStatus?: TaskRMStatus;
  timelineEvents?: TimelineEvent[];
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

  // New category-specific fields
  generalInsuranceTask?: {
      serviceCategory?: string;
      subCategory?: string;
      policyNumber?: string;
  };
  fdTask?: {
      serviceCategory?: string;
      folioNumber?: string;
  };
  bondsTask?: {
      serviceCategory?: string;
      isinNumber?: string;
  };
  ppfTask?: {
      serviceCategory?: string;
      policyNumber?: string;
      bankAccountNumber?: string;
  };
  physicalToDematTask?: {
      serviceCategory?: string;
      folioNumber?: string;
  };
  stocksTask?: StocksTaskDetails;
}


// --- Asset Management Types ---

export interface GeneralInsuranceDetails {
  holderName?: string;
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
  jointHolders?: { name: string }[];
  nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
}

export interface PhysicalToDematDetails {
    holderName: string;
    mobileNumber: string;
    emailAddress?: string;
    folioNumber?: string;
    nameOnShare?: string;
    jointHolders?: { name: string }[];
    companyName?: string;
    rtaName?: string;
    quantity?: number;
    marketPrice?: number;
    totalValue?: number;
}

export interface BondDetails {
    holderName?: string;
    mobileNumber: string;
    emailAddress?: string;
    isin?: string;
    issuer?: string;
    bondPrice?: number;
    bondUnit?: number;
    bondAmount?: number;
    purchaseDate?: string;
    maturityDate?: string;
    jointHolders?: { name: string }[];
    nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
}

export interface FDDetails {
    holderName?: string;
    companyName?: string;
    mobileNumber: string;
    emailAddress?: string;
    fdName?: string;
    fdNumber?: string;
    depositedAmount?: number;
    periodMonth?: number;
    periodDays?: number;
    interestRate?: number;
    maturityAmount?: number;
    purchaseDate?: string;
    maturityDate?: string;
    jointHolders?: { name: string }[];
    nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
}

export interface PPFDetails {
    holderName?: string;
    contributedAmount?: number;
    balance?: number;
    bankName?: string;
    bankAccountNumber?: string;
    openingDate?: string;
    matureDate?: string;
    jointHolders?: { name: string }[];
    nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
}

export interface StocksDetails {
    holderName: string;
    jointHolders?: { name: string }[];
    dpId: string;
    dpName: string;
    bankName: string;
    bankAccountNumber: string;
    mobileNumber: string;
    emailAddress?: string;
    nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
}

export interface MutualFundsDetails {
  holderName?: string;
  folioNumber: string;
  amc: string;
  schemeName: string;
  investedAmount?: number;
  jointHolders?: { name: string }[];
  nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
}

export interface LifeInsuranceDetails {
  holderName?: string;
  company: string;
  policyNumber: string;
  planName?: string;
  sumAssured?: number;
  premiumAmount?: number;
  policyStartDate?: string;
  policyEndDate?: string;
  jointHolders?: { name: string }[];
  nominees?: { name: string; allocation?: number; dateOfBirth?: string; }[];
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
  stocks?: StocksDetails;
  mutualFunds?: MutualFundsDetails;
  lifeInsurance?: LifeInsuranceDetails;
}

export interface Document {
  id: string;
  clientId: string;
  memberId: string;
  category: string;
  name: string;
  url: string;
}

export interface DashboardAsset {
  id: string;
  ownerMemberId: string;
  category: AssetCategory;
  value: number;
  familyHeadId: string;
  
  // Optional detailed fields for popups
  dpName?: string;
  dpId?: string;
  bankName?: string;
  accountOpeningDate?: string;
  folioNumber?: string;
  premiumAmount?: number;
  sumAssured?: number;
  policyName?: string;
  policyType?: string;
  issuerName?: string;
}
