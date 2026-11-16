import api from "./api";

import type {
  TrainingSession,
  CreateTrainingSessionPayload,
  CreateTrainingSessionResult,
  TrainingSessionApiResponse,
} from "../types/training-session.types";

export const getMyTrainingSessions = async (): Promise<TrainingSession[]> => {
  const response = await api.get<
    TrainingSessionApiResponse<TrainingSession[]>
  >("/training-sessions/my-history");

  return response.data.data;
};

// Create a new training session
export const createTrainingSession = async (
  sessionData: CreateTrainingSessionPayload
): Promise<CreateTrainingSessionResult> => {
  const response = await api.post<
    TrainingSessionApiResponse<CreateTrainingSessionResult>
  >("/training-sessions", sessionData);

  return response.data.data;
};