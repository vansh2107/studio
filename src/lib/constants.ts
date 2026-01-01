
export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'RM', 'ASSOCIATE', 'CUSTOMER'] as const;
export type Role = typeof ROLES[number];

export const PERMISSION_MODULES = [
  'SUPER_ADMIN',
  'ADMIN',
  'ASSOCIATE',
  'CUSTOMER',
  'FAMILY_MANAGER',
  'DOC_VAULT',
] as const;
export type PermissionModule = typeof PERMISSION_MODULES[number];

export const PERMISSIONS = ['view', 'create', 'update', 'delete', 'export'] as const;
export type Permission = typeof PERMISSIONS[number];

export type ModulePermissions = {
  [P in Permission]?: boolean;
};

export type Permissions = {
  [M in PermissionModule]: ModulePermissions;
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
