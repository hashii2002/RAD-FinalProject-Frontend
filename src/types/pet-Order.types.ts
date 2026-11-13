export type PetOrderStatus =
  | "PENDING"
  | "CONTACTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

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
}

export interface PetOrderResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: PetOrder | PetOrder[];
}
