import api from "./api";
import type { TrainingBooking } from "../types/training-booking.types";

export interface CreateTrainingBookingData {
  trainingProgramId: string;
  petName: string;
  species: string;
  breed: string;
  ageMonths: number;
  initialCondition: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface CreateTrainingBookingResponse {
  success: boolean;
  message?: string;
  data: TrainingBooking;
}

export const createCustomerTrainingBooking = async (
  data: CreateTrainingBookingData
): Promise<TrainingBooking> => {
  const response = await api.post<CreateTrainingBookingResponse>(
    "/training-bookings",
    data
  );

  return response.data.data;
};