
import { SuperAdmin, Admin, RelationshipManager, Associate, Client, FamilyMember, Asset, Document, User } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { Permissions } from './constants';

const avatarUrls = PlaceHolderImages
  .filter(img => img.id.startsWith('avatar-'))
  .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]))
  .map(img => img.imageUrl);

// --- HIERARCHICAL MOCK DATA ---

// 1. Super Admin
export const superAdmins: SuperAdmin[] = [
    { id: 'sa-1', name: 'Biren Shah', email: 'superadmin@demo.app', password: 'SuperAdmin@123', role: 'SUPER_ADMIN', avatarUrl: avatarUrls[0] },
];

// 2. Admins (Child of Super Admin)
export const admins: Admin[] = [
    { id: 'admin-1', name: 'Keval Shah', email: 'admin@demo.app', password: 'AdminDemo@123', role: 'ADMIN', avatarUrl: avatarUrls[1], superAdminId: 'sa-1' },
    { id: 'admin-2', name: 'Parth Doshi', email: 'parth.doshi@demo.app', password: 'AdminDemo@123', role: 'ADMIN', avatarUrl: avatarUrls[2], superAdminId: 'sa-1' },
];

// 3. Relationship Managers (Child of Admin)
export const relationshipManagers: RelationshipManager[] = [
    // RMs under Keval Shah
    { id: 'rm-1', name: 'Kashish Nathwani', email: 'rm@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[3], adminId: 'admin-1' },
    { id: 'rm-2', name: 'Priyesh Shah', email: 'priyesh.shah@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[4], adminId: 'admin-1' },
    // RMs under Parth Doshi
    { id: 'rm-3', name: 'Harsh Shah', email: 'harsh.shah@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[5], adminId: 'admin-2' },
    { id: 'rm-4', name: 'Dhrumi Shah', email: 'dhrumi.shah@demo.app', password: 'RMDemo@123', role: 'RM', avatarUrl: avatarUrls[6], adminId: 'admin-2' },
];

// 4. Associates (Child of Relationship Manager)
export const associates: Associate[] = [
    // Under Kashish Nathwani
    { id: 'assoc-1', name: 'Associate A1', email: 'associate@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[7], rmId: 'rm-1' },
    // Under Priyesh Shah
    { id: 'assoc-2', name: 'Associate A2', email: 'a2@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[8], rmId: 'rm-2' },
    { id: 'assoc-3', name: 'Associate A3', email: 'a3@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[9], rmId: 'rm-2' },
    // Under Harsh Shah
    { id: 'assoc-4', name: 'Associate A4', email: 'a4@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[10], rmId: 'rm-3' },
    { id: 'assoc-5', name: 'Associate A5', email: 'a5@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[11], rmId: 'rm-3' },
    // Under Dhrumi Shah
    { id: 'assoc-6', name: 'Associate A6', email: 'a6@demo.app', password: 'Associate@123', role: 'ASSOCIATE', avatarUrl: avatarUrls[12], rmId: 'rm-4' },
];

// 5. Clients (Child of Associate)
export const clients: Client[] = [
    // Client for A1
    {
        id: 'client-1',
        name: 'Bipin Hirpara',
        firstName: 'Bipin',
        lastName: 'Hirpara',
        email: 'customer@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[13],
        associateId: 'assoc-1',
        phoneNumber: '9876543210',
        dateOfBirth: '1990-05-12',
        address: 'Mumbai, India',
        anniversaryDate: '2018-12-01',
    },
     // Client 1 for A4
    {
        id: 'client-2',
        name: 'Jitendra Hirpara',
        firstName: 'Jitendra',
        lastName: 'Hirpara',
        email: 'jitendra.hirpara@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[14],
        associateId: 'assoc-4',
        phoneNumber: '9123456780',
        dateOfBirth: '1988-03-15',
        address: 'Ahmedabad, Gujarat',
    },
    // Client 2 for A4
    {
        id: 'client-4',
        name: 'Jivraj Hirpara',
        firstName: 'Jivraj',
        lastName: 'Hirpara',
        email: 'jivraj.hirpara@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[9],
        associateId: 'assoc-4',
        phoneNumber: '9825098250',
        dateOfBirth: '1985-08-20',
        address: 'Surat, Gujarat',
    },
    // Client for A6
    {
        id: 'client-3',
        name: 'Ramniklal Hirpara',
        firstName: 'Ramniklal',
        lastName: 'Hirpara',
        email: 'ramniklal.hirpara@demo.app',
        password: 'Customer@123',
        role: 'CUSTOMER',
        avatarUrl: avatarUrls[0], // Reuse avatars
        associateId: 'assoc-6',
        phoneNumber: '9998887771',
        dateOfBirth: '1985-11-25',
        address: 'Bangalore, Karnataka',
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
  // Bipin Hirpara's Family
  { id: 'fm-1-1', name: 'Sarlaben Hirpara', clientId: 'client-1', firstName: 'Sarlaben', lastName: 'Hirpara', relation: 'Spouse', phoneNumber: '9876543210', emailId: 'Salraben.hirpara@demo.app', dateOfBirth: '1990-05-12', address: 'Mumbai, India' },
  { id: 'fm-1-2', name: 'Hirenbhai Hirpara', clientId: 'client-1', firstName: 'Hirenbhai', lastName: 'Hirpara', relation: 'Son', phoneNumber: '9876543211', emailId: 'hirenbhai.h@example.com', dateOfBirth: '1992-11-20', address: 'Mumbai, India' },
  { id: 'fm-1-3', name: 'Priyanka Hirpara', clientId: 'client-1', firstName: 'Priyanka', lastName: 'Hirpara', relation: 'Daughter-in-law', phoneNumber: '', emailId: '', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-1-4', name: 'Nirav Hirpara', clientId: 'client-1', firstName: 'Nirav', lastName: 'Hirpara', relation: 'Son', phoneNumber: '9876543212', emailId: 'nirav.h@example.com', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-1-5', name: 'Jil Hirpara', clientId: 'client-1', firstName: 'Jil', lastName: 'Hirpara', relation: 'Daughter-in-law', phoneNumber: '9876543213', emailId: 'jil.h@example.com', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-1-6', name: 'Aarav Hirpara', clientId: 'client-1', firstName: 'Aarav', lastName: 'Hirpara', relation: 'Grandson', phoneNumber: '', emailId: 'aarav.h@example.com', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-1-7', name: 'Viraansh Hirpara', clientId: 'client-1', firstName: 'Viraansh', lastName: 'Hirpara', relation: 'Grandson', phoneNumber: '', emailId: 'viraansh.h@example.com', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },

  // Jitendra Hirpara's Family
  { id: 'fm-2-1', name: 'Nayanaben Hirpara', clientId: 'client-2', firstName: 'Nayanaben', lastName: 'Hirpara', relation: 'Spouse', phoneNumber: '9876543210', emailId: 'Salraben.hirpara@demo.app', dateOfBirth: '1990-05-12', address: 'Mumbai, India' },
  { id: 'fm-2-2', name: 'Harsh Hirpara', clientId: 'client-2', firstName: 'Harsh', lastName: 'Hirpara', relation: 'Son', phoneNumber: '9876543211', emailId: 'hirenbhai.h@example.com', dateOfBirth: '1992-11-20', address: 'Mumbai, India' },
  { id: 'fm-2-3', name: 'Shreya Hirpara', clientId: 'client-2', firstName: 'Shreya', lastName: 'Hirpara', relation: 'Daughter-in-law', phoneNumber: '', emailId: '', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-2-4', name: 'Krushi Hirpara', clientId: 'client-2', firstName: 'Krushi', lastName: 'Hirpara', relation: 'Son', phoneNumber: '', emailId: '', dateOfBirth:'2020-01-15' , address:'Mumbai, India' },
  { id:'fm-2-5', name: 'Nidhi Hirpara', clientId:'client-2' , firstName:'Nidhi' , lastName:'Hirpara' , relation:'Daughter-in-law' , phoneNumber:'9876543213' , emailId:'jil.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-2-6', name: 'Hayan Hirpara', clientId: 'client-2', firstName: 'Hayan', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'aarav.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-2-7', name: 'Viaan Hirpara', clientId: 'client-2', firstName: 'Viaan', lastName: 'Hirpara', relation: 'Grandson', phoneNumber: '', emailId: 'viraansh.h@example.com', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },

  // Jivraj Hirpara's Family
  { id: 'fm-3-1', name: 'Maniben Hirpara', clientId: 'client-4', firstName: 'Maniben', lastName: 'Hirpara', relation: 'Spouse', phoneNumber: '9876543210', emailId: 'Salraben.hirpara@demo.app', dateOfBirth: '1990-05-12', address: 'Mumbai, India' },
  { id: 'fm-3-2', name: 'Jayesh Hirpara', clientId: 'client-4', firstName: 'Jayesh', lastName: 'Hirpara', relation: 'Son', phoneNumber: '9876543211', emailId: 'hirenbhai.h@example.com', dateOfBirth: '1992-11-20', address: 'Mumbai, India' },
  { id: 'fm-3-3', name: 'Jignesh Hirpara', clientId: 'client-4', firstName: 'Jignesh', lastName: 'Hirpara', relation: 'Daughter-in-law', phoneNumber: '', emailId: '', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-3-4', name: 'Shiven Hirpara', clientId: 'client-4', firstName: 'Shiven', lastName: 'Hirpara', relation: 'Son', phoneNumber: '', emailId: '', dateOfBirth:'2020-01-15' , address:'Mumbai, India' },
  { id:'fm-3-5', name: 'Bijal Hirpara', clientId:'client-4' , firstName:'Bijal' , lastName:'Hirpara' , relation:'Daughter-in-law' , phoneNumber:'9876543213' , emailId:'jil.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-3-6', name: 'Dharaben Hirpara', clientId: 'client-4', firstName: 'Dharaben', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'aarav.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-3-7', name: 'Ashka Hirpara', clientId: 'client-4', firstName: 'Ashka', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'viraansh.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India' },
  { id: 'fm-3-8', name: 'Saanvi Hirpara', clientId: 'client-4', firstName: 'Saanvi', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'aarav.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-3-9', name: 'Taashvi Hirpara', clientId: 'client-4', firstName: 'Taashvi', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'viraansh.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},


  // Ramniklal Hirpara's Family
  { 
    id: 'fm-4-1', 
    name: 'Pushpaben Hirpara',
    clientId: 'client-3', 
    firstName: 'Pushpaben', 
    lastName: 'Hirpara', 
    relation: 'Spouse', 
    phoneNumber: '9876543210', 
    emailId: 'pushpaben.hirpara@demo.app', 
    dateOfBirth: '1990-05-12', 
    address: 'Bangalore, Karnataka',
    panPhotoUrl: 'https://picsum.photos/seed/pan1/400/300'
  },
  { id: 'fm-4-2', name: 'Ashish Hirpara', clientId: 'client-3', firstName: 'Ashish', lastName: 'Hirpara', relation: 'Son', phoneNumber: '9876543211', emailId: 'hirenbhai.h@example.com', dateOfBirth: '1992-11-20', address: 'Mumbai, India' },
  { id: 'fm-4-3', name: 'Sumita Hirpara', clientId: 'client-3', firstName: 'Sumita', lastName: 'Hirpara', relation: 'Daughter-in-law', phoneNumber: '', emailId: '', dateOfBirth: '2020-01-15', address: 'Mumbai, India' },
  { id: 'fm-4-4', name: 'Ravi Hirpara', clientId: 'client-3', firstName: 'Ravi', lastName: 'Hirpara', relation: 'Son', phoneNumber: '', emailId: '', dateOfBirth:'2020-01-15' , address:'Mumbai, India' },
  { id:'fm-4-5', name: 'Keyuri Hirpara', clientId:'client-3' , firstName:'Keyuri' , lastName:'Hirpara' , relation:'Daughter-in-law' , phoneNumber:'9876543213' , emailId:'jil.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-4-6', name: 'Dash Hirpara', clientId: 'client-3', firstName: 'Dash', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'aarav.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-4-7', name: 'Dev Hirpara', clientId: 'client-3', firstName: 'Dev', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'viraansh.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India' },
  { id: 'fm-4-8', name: 'Drashti Hirpara', clientId: 'client-3', firstName: 'Drashti', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'aarav.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India'},
  { id: 'fm-4-9', name: 'Aira Hirpara', clientId: 'client-3', firstName: 'Aira', lastName: 'Hirpara', relation: 'Grandson', phoneNumber:'', emailId:'viraansh.h@example.com' , dateOfBirth:'2020-01-15' , address:'Mumbai, India' },

];

export const assets: Asset[] = [
  { id: 'asset-1', clientId: 'client-1', ownerMemberId: 'fm-1-1', category: 'Stocks', name: 'Reliance Industries', value: 150000 },
  { id: 'asset-2', clientId: 'client-1', ownerMemberId: 'fm-1-2', category: 'Mutual Funds', name: 'Axis Bluechip Fund', value: 75000 },
  { id: 'asset-3', clientId: 'client-1', ownerMemberId: 'fm-1-1', category: 'Life Insurance', name: 'LIC Jeevan Anand', value: 500000 },
  { id: 'asset-4', clientId: 'client-2', ownerMemberId: 'fm-2-1', category: 'Fixed Deposits', name: 'HDFC Bank FD', value: 200000 },
  { id: 'asset-5', clientId: 'client-2', ownerMemberId: 'fm-2-2', category: 'Bonds', name: 'Govt. of India 2030', value: 120000 },
  { id: 'asset-8', clientId: 'client-4', ownerMemberId: 'fm-4-1', category: 'Stocks', name: 'Tata Motors', value: 250000 },
  { id: 'asset-9', clientId: 'client-4', ownerMemberId: 'fm-4-1', category: 'Mutual Funds', name: 'SBI Small Cap', value: 125000 },
  { id: 'asset-6', clientId: 'client-3', ownerMemberId: 'fm-3-1', category: 'PPF', name: 'Public Provident Fund', value: 85000 },
  { id: 'asset-7', clientId: 'client-3', ownerMemberId: 'fm-3-1', category: 'Term Insurance', name: 'HDFC Click 2 Protect', value: 1000000 },
];

export const documents: Document[] = [
  { id: 'doc-1', clientId: 'client-1', memberId: 'fm-1-2', category: 'Mutual Funds', name: 'Axis_Bluechip_Statement.pdf', url: '#' },
  { id: 'doc-2', clientId: 'client-1', memberId: 'fm-1-1', category: 'Life Insurance', name: 'LIC_Policy_Bond.pdf', url: '#' },
  { id: 'doc-4', clientId: 'client-4', memberId: 'fm-4-1', category: 'Stocks', name: 'Tata_Motors_Shares.pdf', url: '#' },
  { id: 'doc-3', clientId: 'client-3', memberId: 'fm-3-1', category: 'Term Insurance', name: 'HDFC_Term_Policy.pdf', url: '#' },
];

// --- Permissions ---

export const permissions: Record<string, Permissions> = {
  SUPER_ADMIN: {
    SUPER_ADMIN: { view: true, create: true, edit: true, delete: true, export: true },
    ADMIN: { view: true, create: true, edit: true, delete: true, export: true },
    RM: { view: true, create: true, edit: true, delete: true, export: true },
    ASSOCIATE: { view: true, create: true, edit: true, delete: true, export: true },
    CUSTOMER: { view: true, create: true, edit: true, delete: true, export: true },
    DOC_VAULT: { view: true, create: true, edit: true, delete: true, export: true },
    TASK: { view: true, create: true, edit: true, delete: true, export: true },
    CHATBOT: { view: true, create: true, edit: true, delete: true, export: true },
    CUSTOMER_ACTIONS: { view: true, create: true, edit: true, delete: true, export: true },
  },
  ADMIN: {
    SUPER_ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    ADMIN: { view: true, create: false, edit: true, delete: false, export: true },
    RM: { view: true, create: true, edit: true, delete: true, export: true },
    ASSOCIATE: { view: true, create: true, edit: true, delete: true, export: true },
    CUSTOMER: { view: true, create: true, edit: true, delete: true, export: true },
    DOC_VAULT: { view: true, create: true, edit: true, delete: false, export: true },
    TASK: { view: true, create: true, edit: true, delete: false, export: true },
    CHATBOT: { view: true, create: true, edit: true, delete: false, export: true },
    CUSTOMER_ACTIONS: { view: true, create: true, edit: true, delete: false, export: true },
  },
  RM: {
    SUPER_ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    RM: { view: true, create: false, edit: true, delete: false, export: true },
    ASSOCIATE: { view: true, create: true, edit: true, delete: false, export: true },
    CUSTOMER: { view: true, create: true, edit: true, delete: true, export: true },
    DOC_VAULT: { view: true, create: true, edit: true, delete: false, export: true },
    TASK: { view: true, create: true, edit: true, delete: false, export: true },
    CHATBOT: { view: true, create: true, edit: true, delete: false, export: true },
    CUSTOMER_ACTIONS: { view: true, create: true, edit: true, delete: true, export: true },
  },
  ASSOCIATE: {
    SUPER_ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    RM: { view: false, create: false, edit: false, delete: false, export: false },
    ASSOCIATE: { view: true, create: false, edit: true, delete: false, export: false },
    CUSTOMER: { view: true, create: true, edit: true, delete: false, export: true },
    DOC_VAULT: { view: true, create: true, edit: false, delete: false, export: false },
    TASK: { view: true, create: true, edit: false, delete: false, export: false },
    CHATBOT: { view: true, create: true, edit: false, delete: false, export: false },
    CUSTOMER_ACTIONS: { view: true, create: true, edit: true, delete: false, export: true },
  },
  CUSTOMER: {
    SUPER_ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    ADMIN: { view: false, create: false, edit: false, delete: false, export: false },
    RM: { view: false, create: false, edit: false, delete: false, export: false },
    ASSOCIATE: { view: false, create: false, edit: false, delete: false, export: false },
    CUSTOMER: { view: true, create: false, edit: false, delete: false, export: true },
    DOC_VAULT: { view: true, create: true, edit: true, delete: true, export: true },
    TASK: { view: false, create: false, edit: false, delete: false, export: false },
    CHATBOT: { view: false, create: false, edit: false, delete: false, export: false },
    CUSTOMER_ACTIONS: { view: true, create: true, edit: true, delete: true, export: false },
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
export const getClients = getAllClients;


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
