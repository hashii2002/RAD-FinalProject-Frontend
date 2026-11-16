export interface TrainingSession {
  sessionId: string;
  bookingId: string;
  trainerId: string;
  sessionDate: string;
  durationMinutes: number;
  activities: string;
  petCondition: string;
  progressPercentage: number;
  trainerNotes?: string;
  nextSessionPlan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainingSessionPayload {
  bookingId: string;
  sessionDate: string;
  durationMinutes: number;
  activities: string;
  petCondition: string;
  progressPercentage: number;
  trainerNotes?: string;
  nextSessionPlan?: string;
}

export interface TrainingBookingProgress {
  bookingId: string;
  status: string;
  progressPercentage: number;
  currentCondition: string;
}

export interface CreateTrainingSessionResult {
  session: TrainingSession;
  bookingProgress: TrainingBookingProgress;
}

export interface TrainingSessionApiResponse<T> {
  success: boolean;
  message: string;
  count?: number;
  data: T;
}