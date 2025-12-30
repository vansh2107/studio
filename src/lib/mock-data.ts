import { User, RoleData, FamilyMember, Asset, Document, Family } from './types';
import { PERMISSIONS, DOC_CATEGORIES, ROLES } from './constants';
import { PlaceHolderImages } from './placeholder-images';

const avatarUrls = PlaceHolderImages
  .filter(img => img.id.startsWith('avatar-'))
  .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))
  .map(img => img.imageUrl);

export const users: User[] = [
    { id: 'user-sa-1', name: 'Sonia Adminia', email: 'superadmin@demo.app', password: 'SuperAdmin@123', role: 'SUPER_ADMIN', avatarUrl: avatarUrls[0] },
    
    { id: 'user-a-1', name: 'Adam Min', email: 'admin1@demo.app', password: 'AdminDemo@123', role: 'ADMIN', avatarUrl: avatarUrls[1] },
    { id: 'user-a-2', name: 'Anna Ministrator', email: 'admin2@demo.app', password: 'AdminDemo@123', role: 'ADMIN', avatarUrl: avatarUrls[2] },
    
    { id: 'user-as-1', name: 'Ash Socia', email: 'associate1@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[3] },
    { id: 'user-as-2', name: 'Asher Socien', email: 'associate2@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[4] },
    { id: 'user-as-3', name: 'Ashley C. Ociat', email: 'associate3@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[5] },
    
    { id: 'user-c-1', name: 'The Mehta Family', email: 'customer1@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[6] },
    { id: 'user-c-2', name: 'The Sharma Household', email: 'customer2@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[7] },
    { id: 'user-c-3', name: 'The Patel Clan', email: 'customer3@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[8] },
    { id: 'user-c-4', name: 'The Singh Estate', email: 'customer4@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[9] },
    { id: 'user-c-5', name: 'The Kumar Group', email: 'customer5@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[10] },
    { id: 'user-c-6', name: 'The Reddy Enterprise', email: 'customer6@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[11] },
    { id: 'user-c-7', name: 'The Das LLC', email: 'customer7@demo.app', password: 'Customer@123', role: 'CUSTOMER', avatarUrl: avatarUrls[12] },
];

export const families: Family[] = [
    {
      id: 'F001',
      familyHeadName: 'Rahul Mehta',
      familyName: 'Mehta',
      phoneNumber: '9876543210',
      emailId: 'rahul@example.com',
      dateOfBirth: '1990-05-12',
      address: 'Mumbai, India',
      anniversaryDate: '2018-12-01',
      panFileName: 'PAN.pdf',
      aadhaarFileName: 'Aadhaar.pdf',
      otherDocumentFileName: ''
    },
    {
      id: 'F002',
      familyHeadName: 'Priya Sharma',
      familyName: 'Sharma',
      phoneNumber: '9990011122',
      emailId: 'priya@example.com',
      dateOfBirth: '1994-08-20',
      address: 'Delhi, India',
      anniversaryDate: undefined,
      panFileName: '',
      aadhaarFileName: 'Aadhaar.png',
      otherDocumentFileName: ''
    },
     { id: 'F003', familyName: 'Patel', familyHeadName: 'Mehul Patel', phoneNumber: '9123456780', emailId: 'mehul.p@example.com', dateOfBirth: '1988-03-15', address: 'Ahmedabad, Gujarat' },
     { id: 'F004', familyName: 'Singh', familyHeadName: 'Harpreet Singh', phoneNumber: '9234567891', emailId: 'harpreet.s@example.com', dateOfBirth: '1985-11-25', address: 'Chandigarh, Punjab' },
     { id: 'F005', familyName: 'Kumar', familyHeadName: 'Suresh Kumar', phoneNumber: '9345678902', emailId: 'suresh.k@example.com', dateOfBirth: '1982-07-30', address: 'Bengaluru, Karnataka' },
];


export const userMappings: Record<string, string[]> = {
  'user-sa-1': ['user-a-1', 'user-a-2'], // Super Admin sees all Admins
  'user-a-1': ['user-as-1', 'user-as-2'], // Admin 1 sees Associates 1 & 2
  'user-a-2': ['user-as-3'],             // Admin 2 sees Associate 3
  'user-as-1': ['user-c-1'],              // Associate 1 sees Customer 1
  'user-as-2': ['user-c-2', 'user-c-3'],  // Associate 2 sees Customers 2 & 3
  'user-as-3': ['user-c-4'],              // Associate 3 sees Customer 4
};

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

export const permissions = {
    SUPER_ADMIN: {
        role: "SUPER_ADMIN",
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true,
        canAccessCustomers: true
    },
    ADMIN: {
        role: "ADMIN",
        canView: true,
        canEdit: true,
        canDelete: false,
        canManageUsers: false,
        canAccessCustomers: true
    },
    ASSOCIATE: {
        role: "ASSOCIATE",
        canView: true,
        canEdit: false,
        canDelete: false,
        canAccessCustomers: true
    },
    CUSTOMER: {
        role: "CUSTOMER",
        canView: true, // only their own data
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
        canAccessCustomers: false
    }
}


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

export const getRoles = (): RoleData[] => ROLES.map(r => ({ id: r, name: r }));
