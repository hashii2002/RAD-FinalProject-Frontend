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
  data: PetOrder;
}

export const createCustomerPetOrder = async (
  data: CreatePetOrderData
): Promise<PetOrder> => {
  const response = await api.post<PetOrderApiResponse>(
    "/pet-orders",
    data
  );

  return response.data.data;
};
