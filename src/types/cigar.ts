export type CigarStrength =
  | "Mild"
  | "Mild-Medium"
  | "Medium"
  | "Medium-Full"
  | "Full";

export type Cigar = {
  id: string;
  brand: string;
  line: string;
  vitola: string;
  wrapper: string;
  binder?: string;
  filler?: string;
  country: string;
  strength: CigarStrength;
  quantity: number;
  purchasePrice?: number;
  purchaseDate?: string;
  humidor?: string;
  favorite?: boolean;
  notes?: string;
  rating?: number;
  preferredStore?: string;
};