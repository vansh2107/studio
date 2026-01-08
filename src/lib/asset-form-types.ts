
export const ASSET_TYPES = [
  'LIFE INSURANCE',
  'GENERAL INSURANCE',
  'MUTUAL FUNDS',
  'STOCKS',
  'PHYSICAL TO DEMAT',
  'BONDS',
  'PPF',
  'FIXED DEPOSITS',
] as const;

export type AssetType = typeof ASSET_TYPES[number];

export const GENERAL_INSURANCE_CATEGORIES = [
  'FOUR WHEELER',
  'TWO WHEELER',
  'MEDICLAIM',
] as const;

export const GENERAL_INSURANCE_POLICY_TYPES = [
    'NEW',
    'PORT'
] as const;

export const BOND_TRANSACTION_TYPES = [
    'Purchase',
    'Sell'
] as const;
