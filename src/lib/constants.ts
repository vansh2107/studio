import { Role, Permission, AssetCategory } from './types';

export const ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'ASSOCIATE', 'CUSTOMER'];

export const PERMISSIONS: Permission[] = ['Create', 'Edit', 'Update', 'Delete', 'Export'];

export const HIERARCHY: Role[] = ['SUPER_ADMIN', 'ADMIN', 'ASSOCIATE', 'CUSTOMER'];

export const ASSET_CATEGORIES: AssetCategory[] = [
  'Stocks',
  'PPF',
  'Mutual Funds',
  'Life Insurance',
  'Term Insurance',
  'Fixed Deposits',
  'Bonds',
];

export const DOC_CATEGORIES: AssetCategory[] = [
  'Mutual Funds',
  'Life Insurance',
  'Term Insurance',
];
