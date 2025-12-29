import { User, RoleData, FamilyMember, Asset, Document, AssetCategory } from './types';
import { PERMISSIONS, DOC_CATEGORIES } from './constants';
import { PlaceHolderImages } from './placeholder-images';

const avatarUrls = PlaceHolderImages
  .filter(img => img.id.startsWith('avatar-'))
  .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))
  .map(img => img.imageUrl);

export const users: User[] = [
  { id: 'user-sa-1', name: 'Sonia Adminia', email: 'sonia.a@ascend.inc', role: 'SUPER_ADMIN', avatarUrl: avatarUrls[0] },
  { id: 'user-a-1', name: 'Adam Min', email: 'adam.m@ascend.inc', role: 'ADMIN', avatarUrl: avatarUrls[1] },
  { id: 'user-a-2', name: 'Anna Ministrator', email: 'anna.m@ascend.inc', role: 'ADMIN', avatarUrl: avatarUrls[2] },
  { id: 'user-as-1', name: 'Ash Socia', email: 'ash.s@ascend.inc', role: 'ASSOCIATE', avatarUrl: avatarUrls[3] },
  { id: 'user-as-2', name: 'Asher Socien', email: 'asher.s@ascend.inc', role: 'ASSOCIATE', avatarUrl: avatarUrls[4] },
  { id: 'user-as-3', name: 'Ashley C. Ociat', email: 'ashley.c@ascend.inc', role: 'ASSOCIATE', avatarUrl: avatarUrls[5] },
  { id: 'user-c-1', name: 'The Sharma Family', email: 'contact@sharma.fam', role: 'CUSTOMER', avatarUrl: avatarUrls[6] },
  { id: 'user-c-2', name: 'The Gupta Household', email: 'contact@gupta.fam', role: 'CUSTOMER', avatarUrl: avatarUrls[7] },
  { id: 'user-c-3', name: 'The Patel Clan', email: 'contact@patel.fam', role: 'CUSTOMER', avatarUrl: avatarUrls[8] },
  { id: 'user-c-4', name: 'The Singh Estate', email: 'contact@singh.fam', role: 'CUSTOMER', avatarUrl: avatarUrls[9] },
];

export const userMappings: Record<string, string[]> = {
  'user-sa-1': ['user-a-1', 'user-a-2'], // Super Admin sees all Admins
  'user-a-1': ['user-as-1', 'user-as-2'], // Admin 1 sees Associates 1 & 2
  'user-a-2': ['user-as-3'],             // Admin 2 sees Associate 3
  'user-as-1': ['user-c-1'],              // Associate 1 sees Customer 1
  'user-as-2': ['user-c-2', 'user-c-3'],  // Associate 2 sees Customers 2 & 3
  'user-as-3': ['user-c-4'],              // Associate 3 sees Customer 4
};

export const roles: RoleData[] = [
  { name: 'SUPER_ADMIN', permissions: [...PERMISSIONS] },
  { name: 'ADMIN', permissions: ['Create', 'Edit', 'Update', 'Export'] },
  { name: 'ASSOCIATE', permissions: ['Create', 'Edit', 'Update'] },
  { name: 'CUSTOMER', permissions: [] },
];

export const familyMembers: FamilyMember[] = [
  { id: 'fm-1-1', customerId: 'user-c-1', name: 'Rohan Sharma', relation: 'Self' },
  { id: 'fm-1-2', customerId: 'user-c-1', name: 'Priya Sharma', relation: 'Spouse' },
  { id: 'fm-1-3', customerId: 'user-c-1', name: 'Aarav Sharma', relation: 'Son' },
  { id: 'fm-2-1', customerId: 'user-c-2', name: 'Anjali Gupta', relation: 'Self' },
  { id: 'fm-3-1', customerId: 'user-c-3', name: 'Mehul Patel', relation: 'Self' },
  { id: 'fm-3-2', customerId: 'user-c-3', name: 'Sonal Patel', relation: 'Spouse' },
  { id: 'fm-4-1', customerId: 'user-c-4', name: 'Harpreet Singh', relation: 'Self' },
];

export const assets: Asset[] = [
  { id: 'asset-1', customerId: 'user-c-1', ownerMemberId: 'fm-1-1', category: 'Stocks', name: 'Reliance Industries', value: 150000 },
  { id: 'asset-2', customerId: 'user-c-1', ownerMemberId: 'fm-1-2', category: 'Mutual Funds', name: 'Axis Bluechip Fund', value: 75000 },
  { id: 'asset-3', customerId: 'user-c-1', ownerMemberId: 'fm-1-1', category: 'Life Insurance', name: 'LIC Jeevan Anand', value: 500000 },
  { id: 'asset-4', customerId: 'user-c-2', ownerMemberId: 'fm-2-1', category: 'Fixed Deposits', name: 'HDFC Bank FD', value: 200000 },
  { id: 'asset-5', customerId: 'user-c-3', ownerMemberId: 'fm-3-2', category: 'Bonds', name: 'Govt. of India 2030', value: 120000 },
  { id: 'asset-6', customerId: 'user-c-3', ownerMemberId: 'fm-3-1', category: 'PPF', name: 'Public Provident Fund', value: 85000 },
  { id: 'asset-7', customerId: 'user-c-4', ownerMemberId: 'fm-4-1', category: 'Term Insurance', name: 'HDFC Click 2 Protect', value: 1000000 },
];

export const documents: Document[] = [
  { id: 'doc-1', customerId: 'user-c-1', memberId: 'fm-1-2', category: 'Mutual Funds', name: 'Axis_Bluechip_Statement.pdf', url: '#' },
  { id: 'doc-2', customerId: 'user-c-1', memberId: 'fm-1-1', category: 'Life Insurance', name: 'LIC_Policy_Bond.pdf', url: '#' },
  { id: 'doc-3', customerId: 'user-c-4', memberId: 'fm-4-1', category: 'Term Insurance', name: 'HDFC_Term_Policy.pdf', url: '#' },
];

// --- Data Accessor Functions (Simulating Backend Logic) ---

export const getUserById = (id: string) => users.find(u => u.id === id);

export const getAdmins = () => users.filter(u => u.role === 'ADMIN');
export const getAssociates = () => users.filter(u => u.role === 'ASSOCIATE');
export const getCustomers = () => users.filter(u => u.role === 'CUSTOMER');

export const getMappedAssociatesForAdmin = (adminId: string): User[] => {
  const associateIds = userMappings[adminId] || [];
  return users.filter(u => associateIds.includes(u.id));
};

export const getMappedCustomersForAssociate = (associateId: string): User[] => {
  const customerIds = userMappings[associateId] || [];
  return users.filter(u => customerIds.includes(u.id));
};

export const getFamilyMembersForCustomer = (customerId: string): FamilyMember[] => {
  return familyMembers.filter(fm => fm.customerId === customerId);
};

export const getAssetsForCustomer = (customerId: string): Asset[] => {
  return assets.filter(a => a.customerId === customerId);
}

export const getDocumentsForCustomer = (customerId: string): Document[] => {
  return documents.filter(d => d.customerId === customerId);
}

export const getRoles = (): RoleData[] => roles;
