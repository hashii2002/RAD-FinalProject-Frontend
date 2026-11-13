import api from "./api";

import type {
  TrainingBooking,
  TrainingBookingResponse,
  TrainingBookingActionResponse,
  TrainingBookingUsersResponse,
} from "../types/training-booking.types";

export const getAllTrainingBookings = async (): Promise<TrainingBooking[]> => {
  const response = await api.get<TrainingBookingResponse>(
    "/training-bookings"
  );

  return response.data.data;
};

export const approveTrainingBooking = async (
  bookingId: string
): Promise<TrainingBooking> => {
  const response = await api.patch<TrainingBookingActionResponse>(
    `/training-bookings/${bookingId}/approve`
  );

  return response.data.data;
};

export const rejectTrainingBooking = async (
  bookingId: string
): Promise<TrainingBooking> => {
  const response = await api.patch<TrainingBookingActionResponse>(
    `/training-bookings/${bookingId}/reject`
  );

  return response.data.data;
};

export const assignTrainingTrainer = async (
  bookingId: string,
  trainerId: string
): Promise<TrainingBooking> => {
  const response = await api.patch<TrainingBookingActionResponse>(
    `/training-bookings/${bookingId}/assign-trainer`,
    { trainerId }
  );

  return response.data.data;
};

export const getAllBookingUsers = async () => {
  const response = await api.get<TrainingBookingUsersResponse>("/users");

  return response.data.data;
};

