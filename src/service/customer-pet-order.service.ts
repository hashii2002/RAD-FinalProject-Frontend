import api from "./api";
import type { PetOrder } from "../types/pet-Order.types";

interface CreatePetOrderData {
  petId: string;
  customerPhone: string;
  message?: string;
}

interface PetOrderApiResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: PetOrder | PetOrder[];
}

// Create a new pet order
export const createCustomerPetOrder = async (
  data: CreatePetOrderData
): Promise<PetOrder> => {
  const response = await api.post<PetOrderApiResponse>(
    "/pet-orders",
    data
  );

  return response.data.data as PetOrder;
};

// View own order details for customer
export const getMyCustomerPetOrders = async (): Promise<PetOrder[]> => {
  const response = await api.get<PetOrderApiResponse>(
    "/pet-orders/my-orders"
  );

  return response.data.data as PetOrder[];
};
