
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
    'Sell'
] as const;

export const POLICY_NUMBERS = [
  "9834127765",
  "7712098843",
  "5501984321",
  "6648201190",
  "9083415572",
  "4319026684",
  "7823459901"
];

export const FOLIO_NUMBERS = [
  "48392017",
  "77120488",
  "99843102",
  "56288941",
  "34012766",
  "81560493",
  "22947851"
];
