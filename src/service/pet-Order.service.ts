import api from "./api";

import type {
  PetOrder,
  PetOrderResponse,
  PetOrderStatus,
} from "../types/pet-Order.types";

export const getAllPetOrders = async (): Promise<PetOrder[]> => {
  const response = await api.get<PetOrderResponse>("/pet-orders");

  return response.data.data as PetOrder[];
};

export const updatePetOrderStatus = async (
  orderId: string,
  status: PetOrderStatus
): Promise<PetOrder> => {
  const response = await api.patch<PetOrderResponse>(
    `/pet-orders/${orderId}/status`,
    { status }
  );

  return response.data.data as PetOrder;
};

