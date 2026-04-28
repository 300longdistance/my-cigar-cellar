export type PairingCategory =
  | 'Coffee'
  | 'Bourbon'
  | 'Rum'
  | 'Whiskey'
  | 'Scotch'
  | 'Beer'
  | 'Wine'
  | 'Cocktail'
  | 'Food'
  | 'Other';

export type PairingType = {
  id: number;
  name: string;
  category: PairingCategory;
};

export type PairingLog = {
  id: number;
  pairingTypeId: number;
  cigarId: number;
  rating: number;
  notes?: string;
  pairedAt: string;
};