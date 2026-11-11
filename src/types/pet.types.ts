export type PetStatus = "AVAILABLE" | "SOLD" | "RESERVED";

export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  price: number;
  description: string;
  imageUrl: string;
  status: PetStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  price: number;
  description: string;
  status: PetStatus;
  image?: File | null;
}

export interface PetResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: Pet | Pet[];
}
