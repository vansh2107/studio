
export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE', 'CUSTOMER'] as const;
export type Role = typeof ROLES[number];

export const PERMISSION_MODULES = [
  'SUPER_ADMIN',
  'ADMIN',
  'RM',
  'ASSOCIATE',
  'CUSTOMER',
  'DOC_VAULT',
  'TASK',
  'CHATBOT',
  'CUSTOMER_ACTIONS'
] as const;
export type PermissionModule = typeof PERMISSION_MODULES[number];

export const PERMISSIONS = ['view', 'edit', 'delete', 'create', 'export'] as const;
export type Permission = typeof PERMISSIONS[number];

export type ModulePermissions = {
  [P in Permission]?: boolean;
};

export type Permissions = {
  [M in PermissionModule]?: ModulePermissions;
};

export const HIERARCHY: Role[] = ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE', 'CUSTOMER'];

export const ASSET_CATEGORIES = [
  'Stocks',
  'PPF',
  'Mutual Funds',
  'Life Insurance',
  'Term Insurance',
  'Fixed Deposits',
  'Bonds',
] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];


export const DOC_CATEGORIES = [
  'Mutual Funds',
  'Life Insurance',
  'Term Insurance',
];

// New constant for the task categories in the specified order
export const TASK_CATEGORIES = [
  'Mutual Funds',
  'Life Insurance',
  'General Insurance',
  'Stocks',
  'Physical Shares',
  'Bonds',
  'PPF',
  'FDs',
  'NPS',
  'LAS'
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];

export const TASK_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Rejected',
  'Cancelled',
] as const;

export type TaskStatus = typeof TASK_STATUSES[number];

export const RM_NAMES = [
  'Kashish Nathwani',
  'Priyesh Shah',
  'Harsh Shah',
  'Dhrumi Shah',
] as const;

export const MUTUAL_FUND_SERVICES = [
  'Change/Update Email Address',
  'Change/Update Mobile Number',
  'Change/Update Name',
  'Change/Update PAN Card Details',
  'Consolidation of Folios',
  'Update Nominee Details',
  'Change of Bank Account Details',
  'Add or Delete Multiple Bank Mandate',
  'Update of Tax Status',
  'Status Modification from Minor To Major',
  'Change of FATCA',
] as const;

export const AMC_NAMES = [
  '360 ONE Mutual Fund',
  'Abakkus Mutual Fund',
  'Aditya Birla Sun Life Mutual Fund',
  'Angel One Mutual Fund',
  'Axis Mutual Fund',
  'Bajaj Finserv Mutual Fund',
  'Bandhan Mutual Fund',
  'Bank of India Mutual Fund',
  'Baroda BNP Paribas Mutual Fund',
  'Canara Robeco Mutual Fund',
  'Capitalmind Mutual Fund',
  'Choice Mutual Fund',
  'DSP Mutual Fund',
  'Edelweiss Mutual Fund',
  'Franklin Templeton Mutual Fund',
  'Groww Mutual Fund',
  'HDFC Mutual Fund',
  'Helios Mutual Fund',
  'HSBC Mutual Fund',
  'ICICI Prudential Mutual Fund',
  'IL&FS Mutual Fund (IDF)',
  'Invesco Mutual Fund',
  'ITI Mutual Fund',
  'Jio BlackRock Mutual Fund',
  'JM Financial Mutual Fund',
  'Kotak Mahindra Mutual Fund',
  'LIC Mutual Fund',
  'Mahindra Manulife Mutual Fund',
  'Mirae Asset Mutual Fund',
  'Motilal Oswal Mutual Fund',
  'Navi Mutual Fund',
  'Nippon India Mutual Fund',
  'NJ Mutual Fund',
  'Old Bridge Mutual Fund',
  'PGIM India Mutual Fund',
  'PPFAS Mutual Fund',
  'quant Mutual Fund',
  'Quantum Mutual Fund',
  'Samco Mutual Fund',
  'SBI Mutual Fund',
  'Shriram Mutual Fund',
  'Sundaram Mutual Fund',
  'Tata Mutual Fund',
  'Taurus Mutual Fund',
  'Trust Mutual Fund',
  'Unifi Mutual Fund',
  'Union Mutual Fund',
  'UTI Mutual Fund',
  'The Wealth Company Mutual Fund',
  'WhiteOak Capital Mutual Fund',
  'Zerodha Mutual Fund',
] as const;

export const INSURANCE_SERVICES = [
  'Maturity',
  'Surrender',
  'Assignment',
  'Mobile updation',
  'Mail updation',
  'Loan',
] as const;

export const INSURANCE_COMPANIES = [
  'ICICI Prudential Life Insurance',
  'HDFC Life',
  'Axis Max',
  'Aditya Birla Capital',
  'Bandhan Life',
  'Ageas Federal',
  'Aviva',
  'Bajaj Allianz',
  'Bharti AXA',
  'Canara HSBC Life',
  'Edelweiss Life',
  'Future Generali',
  'IndiaFirst Life',
  'Kotak Life',
  'LIC',
  'PNB MetLife',
  'Pramerica Life',
  'Reliance Life',
  'Sahara Life',
  'SBI Life',
  'Shriram Life',
  'Star Union Dai-ichi Life',
  'Tata AIA',
] as const;

    
