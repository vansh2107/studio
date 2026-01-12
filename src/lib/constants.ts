

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
  'Physical to Demat',
  'Bonds',
  'PPF',
  'FDs',
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

export const TASK_STATUS_2_OPTIONS = [
    "Letter sent to company",
    "Pending work",
    "Objection Relodge",
    "Objection pending",
    "Sent for IEPF",
    "Credited"
] as const;
export type TaskStatus2 = typeof TASK_STATUS_2_OPTIONS[number];


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
  'Death Claim',
  'Change/Update Bank Details',
  'Change/Update Of Nominee',
  'Change/Update Policy Holder',
  'Status Modification From Minor To Major',
  'Duplicate Policy',
] as const;

export const INSURANCE_COMPANIES = [
  'Aditya Birla Sun Life Insurance Co. Ltd.',
  'Acko Life Insurance Ltd',
  'Ageas Federal Life Insurance Company Ltd.',
  'Aviva Life Insurance Co. India Ltd.',
  'Bajaj Life Insurance Co. Ltd.',
  'Bharti AXA Life Insurance Co. Ltd.',
  '(AEGON) Bandhan Life Insurance Company Limited',
  'Canara HSBC Life Insurance Co. Ltd.',
  'Edelweiss Tokio Life Insurance Company Limited',
  'Exide Life - Life Products',
  'Future Generali India Life Insurance Co. Ltd.',
  'Go Digit Life Insurance Limited',
  'HDFC Life Insurance Co. Ltd',
  'ICICI Prudential Life Insurance Co. Ltd',
  'India First Life Insurance Company Ltd.',
  'Kotak Mahindra Life Insurance Company Ltd.',
  'Life Insurance Corporation of India',
  'Max Life Insurance Company Limited',
  'PNB MetLife India Insurance Co. Ltd.',
  'Pramerica Life Insurance Limited',
  'Reliance Nippon Life Insurance Co. Ltd.',
  'SBI Life Insurance Co Ltd',
  'Sahara India Life Insurance Co. Ltd.',
  'Star Union Dai-ichi Life Insurance Company Ltd.',
  'Shriram Life Insurance Co. Ltd.',
  'TATA AIA Life Insurance Co. Ltd.',
] as const;

export const FINANCIAL_SERVICES = ['Maturity', 'Death Claim', 'Surrender'] as const;

export const REINVESTMENT_REASONS = [
  "Client's Own Business",
  "Daughter's Wedding",
  "Son's Wedding",
  "Real Estate Investment",
  "Other",
] as const;

export const RELATION_OPTIONS = ["Self", "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other", "Daughter-in-law", "Son-in-law", "Grandson", "Granddaughter"];


// --- Task Category Specific Services ---

export const GENERAL_INSURANCE_TASK_SERVICES = ['Renewal', 'Claim', 'Nominee change'] as const;
export const GENERAL_INSURANCE_TASK_SUB_CATEGORIES = ['Car', 'Two wheeler', 'Health insurance', 'Personal accident'] as const;

export const FD_TASK_SERVICES = ['Maturity', 'Transmission', 'Renew', 'Nominee change'] as const;

export const BONDS_TASK_SERVICES = ['Duplicate', 'Maturity', 'Interest'] as const;

export const PPF_TASK_SERVICES = ['Extension', 'Nominee update', 'Passbook print', 'Withdrawal'] as const;

export const PHYSICAL_TO_DEMAT_SERVICES = [
    'IEPF', 'Lost shares', 'Duplicate Share', 'Normal Convert to shares', 
    'Transmission', 'KYC update', 'Name deletion', 'Succession', 'FIR', 'Gazett'
] as const;
