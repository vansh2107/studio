export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'ASSOCIATE', 'CUSTOMER'] as const;
export type Role = typeof ROLES[number];

export const PERMISSION_MODULES = [
  'Admin Modules', 
  'Associates', 
  'Customers', 
  'Whole Family'
] as const;
export type PermissionModule = typeof PERMISSION_MODULES[number];

export const PERMISSIONS = ['view', 'edit', 'delete', 'download'] as const;
export type Permission = typeof PERMISSIONS[number];

export type Permissions = {
  [M in PermissionModule]: {
    [P in Permission]?: boolean;
  }
} & {
  EditCustomers?: boolean;
  DeleteCascade?: boolean;
  DownloadPDF?: boolean;
};

export const HIERARCHY: Role[] = ['SUPER_ADMIN', 'ADMIN', 'ASSOCIATE', 'CUSTOMER'];

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

    