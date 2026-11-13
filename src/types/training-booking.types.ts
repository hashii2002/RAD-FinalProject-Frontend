export type TrainingBookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface TrainingBooking {
  bookingId: string;
  customerId: string;
  trainingProgramId: string;
  trainerId?: string;

  petName: string;
  species: string;
  breed: string;
  ageMonths: number;
  initialCondition: string;

  appointmentDate: string;
  appointmentTime: string;

  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;

  currentCondition?: string;
  progressPercentage: number;
  status: TrainingBookingStatus;

  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingBookingResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: TrainingBooking[];
}

export interface TrainingBookingActionResponse {
  success: boolean;
  message?: string;
  data: TrainingBooking;
}

export interface TrainingBookingUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "TRAINER" | "CUSTOMER";
  isActive: boolean;
}

export interface TrainingBookingUsersResponse {
  success: boolean;
  count?: number;
  data: TrainingBookingUser[];
}

export interface TrainingProgramOption {
  _id?: string;
  programId?: string;
  name: string;
}