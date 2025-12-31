
import { SuperAdmin, Admin, RelationshipManager, Associate, Client, FamilyMember, Asset, Document, User } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { Permissions } from './constants';

const avatarUrls = PlaceHolderImages
  .filter(img => img.id.startsWith('avatar-'))
  .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))
  .map(img => img.imageUrl);

// --- HIERARCHICAL MOCK DATA ---

// 1. Super Admin (Top Level)
export const superAdmins: SuperAdmin[] = [
    { id: 'sa-1', name: 'Sonia Adminia', email: 'superadmin@demo.app', password: 'SuperAdmin@123', role: 'SUPER_ADMIN', avatarUrl: avatarUrls[0] },
];

// 2. Admins (Child of Super Admin)
export const admins: Admin[] = [
    { id: 'admin-1', name: 'Adam Min', email: 'admin1@demo.app', password: 'AdminDemo@123', role: 'ADMIN', avatarUrl: avatarUrls[1], superAdminId: 'sa-1' },
    { id: 'admin-2', name: 'Anna Ministrator', email: 'admin2@demo.app', password: 'AdminDemo@123', role: 'ADMIN', avatarUrl: avatarUrls[2], superAdminId: 'sa-1' },
];

// 3. Relationship Managers (Child of Admin)
export const relationshipManagers: RelationshipManager[] = [
    { id: 'rm-1', name: 'Rohan Mehta', email: 'rm1@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[3], adminId: 'admin-1' },
    { id: 'rm-2', name: 'Kunal Shah', email: 'rm2@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[4], adminId: 'admin-1' },
    { id: 'rm-3', name: 'Sneha Patil', email: 'rm3@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[5], adminId: 'admin-2' },
    { id: 'rm-4', name: 'Vikram Singh', email: 'rm4@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[6], adminId: 'admin-2' },
];

// 4. Associates (Child of Relationship Manager)
export const associates: Associate[] = [
    { id: 'assoc-1', name: 'Ash Socia', email: 'associate1@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[7], rmId: 'rm-1' },
    { id: 'assoc-2', name: 'Asher Socien', email: 'associate2@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[8], rmId: 'rm-1' },
    { id: 'assoc-3', name: 'Ashley C. Ociat', email: 'associate3@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[9], rmId: 'rm-2' },
    { id: 'assoc-4', name: 'Anjali Sharma', email: 'associate4@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[10], rmId: 'rm-3' },
    { id: 'assoc-5', name: 'Rajesh Gupta', email: 'associate5@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[11], rmId: 'rm-3' },
    { id: 'assoc-6', name: 'Pooja Reddy', email: 'associate6@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[12], rmId: 'rm-4' },
];

// 5. Clients (Child of Associate)
export const clients: Client[] = [
    {
        id: 'client-1',
        name: 'Rahul Mehta',
        firstName: 'Rahul',
        lastName: 'Mehta',
        email: 'customer1@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[13],
        associateId: 'assoc-1',
        phoneNumber: '9876543210',
        dateOfBirth: '1990-05-12',
        address: 'Mumbai, India',
        anniversaryDate: '2018-12-01',
    },
    {
        id: 'client-2',
        name: 'Priya Sharma',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'customer2@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[14],
        associateId: 'assoc-2',
        phoneNumber: '9990011122',
        dateOfBirth: '1994-08-20',
        address: 'Delhi, India',
    },
    {
        id: 'client-3',
        name: 'Mehul Patel',
        firstName: 'Mehul',
        lastName: 'Patel',
        email: 'customer3@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[0], // Reuse avatars
        associateId: 'assoc-3',
        phoneNumber: '9123456780',
        dateOfBirth: '1988-03-15',
        address: 'Ahmedabad, Gujarat',
    },
    {
        id: 'client-4',
        name: 'Harpreet Singh',
        firstName: 'Harpreet',
        lastName: 'Singh',
        email: 'customer4@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[1], // Reuse avatars
        associateId: 'assoc-5',
        phoneNumber: '9234567891',
        dateOfBirth: '1985-11-25',
        address: 'Chandigarh, Punjab',
    },
];

// --- Combined list of all users for authentication ---
export const users: User[] = [
    ...superAdmins,
    ...admins,
    ...relationshipManagers,
    ...associates,
    ...clients,
];

// --- Other Mock Data (Family, Assets, etc.) ---

export const familyMembers: FamilyMember[] = [
  { id: 'fm-1-1', clientId: 'client-1', firstName: 'Rahul', lastName: 'Mehta', relation: 'Self', phoneNumber: '9876543210', emailId: 'rahul@example.com', dateOfBirth: '1990-05-12', address: 'Mumbai, India' },
  { id: 'fm-1-2', clientId: 'client-1', firstName: 'Anita', lastName: 'Mehta', relation: 'Spouse', phoneNumber: '9876543211', emailId: 'anita.m@example.com', dateOfBirth: '1992-11-20', address: 'Mumbai, India' },
  { id: 'fm-1-3', clientId: 'client-1', firstName: 'Aarav', lastName: 'Mehta', relation: 'Son', phoneNumber: '', emailId: '', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-2-1', clientId: 'client-2', firstName: 'Priya', lastName: 'Sharma', relation: 'Self', phoneNumber: '9990011122', emailId: 'priya@example.com', dateOfBirth: '1994-08-20', address: 'Delhi, India' },
  { id: 'fm-3-1', clientId: 'client-3', firstName: 'Mehul', lastName: 'Patel', relation: 'Self', phoneNumber: '9123456780', emailId: 'mehul.p@example.com', dateOfBirth: '1988-03-15', address: 'Ahmedabad, Gujarat' },
  { id: 'fm-3-2', clientId: 'client-3', firstName: 'Sonal', lastName: 'Patel', relation: 'Spouse', phoneNumber: '9123456781', emailId: 'sonal.p@example.com', dateOfBirth: '1990-02-22', address: 'Ahmedabad, Gujarat' },
  { id: 'fm-4-1', clientId: 'client-4', firstName: 'Harpreet', lastName: 'Singh', relation: 'Self', phoneNumber: '9234567891', emailId: 'harpreet.s@example.com', dateOfBirth: '1985-11-25', address: 'Chandigarh, Punjab' },
];

export const assets: Asset[] = [
  { id: 'asset-1', clientId: 'client-1', ownerMemberId: 'fm-1-1', category: 'Stocks', name: 'Reliance Industries', value: 150000 },
  { id: 'asset-2', clientId: 'client-1', ownerMemberId: 'fm-1-2', category: 'Mutual Funds', name: 'Axis Bluechip Fund', value: 75000 },
  { id: 'asset-3', clientId: 'client-1', ownerMemberId: 'fm-1-1', category: 'Life Insurance', name: 'LIC Jeevan Anand', value: 500000 },
  { id: 'asset-4', clientId: 'client-2', ownerMemberId: 'fm-2-1', category: 'Fixed Deposits', name: 'HDFC Bank FD', value: 200000 },
  { id: 'asset-5', clientId: 'client-3', ownerMemberId: 'fm-3-2', category: 'Bonds', name: 'Govt. of India 2030', value: 120000 },
  { id: 'asset-6', clientId: 'client-3', ownerMemberId: 'fm-3-1', category: 'PPF', name: 'Public Provident Fund', value: 85000 },
  { id: 'asset-7', clientId: 'client-4', ownerMemberId: 'fm-4-1', category: 'Term Insurance', name: 'HDFC Click 2 Protect', value: 1000000 },
];

export const documents: Document[] = [
  { id: 'doc-1', clientId: 'client-1', memberId: 'fm-1-2', category: 'Mutual Funds', name: 'Axis_Bluechip_Statement.pdf', url: '#' },
  { id: 'doc-2', clientId: 'client-1', memberId: 'fm-1-1', category: 'Life Insurance', name: 'LIC_Policy_Bond.pdf', url: '#' },
  { id: 'doc-3', clientId: 'client-4', memberId: 'fm-4-1', category: 'Term Insurance', name: 'HDFC_Term_Policy.pdf', url: '#' },
];

// --- Permissions ---

export const permissions: Record<string, Permissions> = {
  SUPER_ADMIN: {
    SUPER_ADMIN: { view: true, create: true, update: true, delete: true, export: true },
    ADMIN: { view: true, create: true, update: true, delete: true, export: true },
    ASSOCIATE: { view: true, create: true, update: true, delete: true, export: true },
    CUSTOMER: { view: true, create: true, update: true, delete: true, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: true, export: true },
    DOC_VAULT: { view: true, create: true, update: true, delete: true, export: true },
  },
  ADMIN: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: true, create: false, update: true, delete: false, export: true },
    ASSOCIATE: { view: true, create: true, update: true, delete: true, export: false },
    CUSTOMER: { view: true, create: true, update: true, delete: true, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: false, export: true },
    DOC_VAULT: { view: true, create: true, update: false, delete: false, export: true },
  },
   // Add RM permissions if needed, for now they are like admins without create rights for other admins
  RM: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ASSOCIATE: { view: true, create: true, update: true, delete: false, export: true },
    CUSTOMER: { view: true, create: true, update: true, delete: true, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: false, export: true },
    DOC_VAULT: { view: true, create: true, update: false, delete: false, export: true },
  },
  ASSOCIATE: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ASSOCIATE: { view: true, create: false, update: true, delete: false, export: false },
    CUSTOMER: { view: true, create: true, update: true, delete: false, export: true },
    FAMILY_MANAGER: { view: true, create: false, update: true, delete: false, export: false },
    DOC_VAULT: { view: true, create: true, update: false, delete: false, export: false },
  },
  CUSTOMER: {
    SUPER_ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ADMIN: { view: false, create: false, update: false, delete: false, export: false },
    ASSOCIATE: { view: false, create: false, update: false, delete: false, export: false },
    CUSTOMER: { view: true, create: false, update: false, delete: false, export: true },
    FAMILY_MANAGER: { view: true, create: true, update: true, delete: true, export: false },
    DOC_VAULT: { view: true, create: true, update: true, delete: true, export: true },
  },
};

// --- DATA ACCESSOR FUNCTIONS (NEW HIERARCHY) ---

// Get children
export const getAdminsForSuperAdmin = (saId: string) => admins.filter(a => a.superAdminId === saId);
export const getRMsForAdmin = (adminId: string) => relationshipManagers.filter(rm => rm.adminId === adminId);
export const getAssociatesForRM = (rmId: string) => associates.filter(a => a.rmId === rmId);
export const getClientsForAssociate = (assocId: string) => clients.filter(c => c.associateId === assocId);

// Get all of a type
export const getAllAdmins = () => admins;
export const getAllRMs = () => relationshipManagers;
export const getAllAssociates = () => associates;
export const getAllClients = () => clients;


// Get data for a specific customer/client
export const getFamilyMembersForClient = (clientId: string): FamilyMember[] => {
  return familyMembers.filter(fm => fm.clientId === clientId);
};

export const getAssetsForClient = (clientId: string): Asset[] => {
  return assets.filter(a => a.clientId === clientId);
}

export const getDocumentsForClient = (clientId: string): Document[] => {
  return documents.filter(d => d.clientId === clientId);
}


// These are legacy and need to be adapted or removed.
// For now, they can be adapted to the new Client model.
export const families = clients;
export const getFamilyMembersForCustomer = getFamilyMembersForClient;
export const getAssetsForCustomer = getAssetsForClient;
export const getDocumentsForCustomer = getDocumentsForClient;
export const getAdmins = getAllAdmins;
export const getAssociates = getAllAssociates;
export const getCustomers = getAllClients;


// --- MIGRATED MAPPINGS FOR DASHBOARD VIEWS ---

// Mappings from old userMappings structure to new hierarchical functions
// This provides a compatibility layer for existing components while they are being updated.

export const userMappings: Record<string, string[]> = {
    'sa-1': admins.map(a => a.id),
    'admin-1': getRMsForAdmin('admin-1').flatMap(rm => getAssociatesForRM(rm.id)).map(a => a.id),
    'admin-2': getRMsForAdmin('admin-2').flatMap(rm => getAssociatesForRM(rm.id)).map(a => a.id),
    'assoc-1': getClientsForAssociate('assoc-1').map(c => c.id),
    'assoc-2': getClientsForAssociate('assoc-2').map(c => c.id),
    'assoc-3': getClientsForAssociate('assoc-3').map(c => c.id),
    'assoc-4': getClientsForAssociate('assoc-4').map(c => c.id),
    'assoc-5': getClientsForAssociate('assoc-5').map(c => c.id),
    'assoc-6': getClientsForAssociate('assoc-6').map(c => c.id),
};

export const getMappedAssociatesForAdmin = (adminId: string): (Associate)[] => {
    const rmIds = getRMsForAdmin(adminId).map(rm => rm.id);
    return associates.filter(a => rmIds.includes(a.rmId));
};

export const getMappedCustomersForAssociate = (associateId: string): Client[] => {
  return getClientsForAssociate(associateId);
};
