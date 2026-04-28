export type PairingType = {
  id: number;
  name: string;
  category: string;
};

export type PairingLog = {
  id: number;

  cigarId?: number | null;

  cigarName?: string;
  cigarBrand?: string;
  pairing?: string;
  pairingType?: string;
  loggedAt?: string;

  pairingTypeId?: number;
  rating?: number;
  notes?: string;
  pairedAt?: string;
};