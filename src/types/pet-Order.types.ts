export type PetOrderStatus =
  | "PENDING"
  | "CONTACTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface OrderPetDetails {
  _id: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  price: number;
  imageUrl?: string;
  status: "AVAILABLE" | "SOLD" | "RESERVED";
}

export interface PetOrder {
  _id?: string;
  orderId: string;
  petId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
  status: PetOrderStatus;
  createdAt?: string;
  updatedAt?: string;
  pet?: OrderPetDetails | null;
}

export interface PetOrderResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: PetOrder | PetOrder[];
}
