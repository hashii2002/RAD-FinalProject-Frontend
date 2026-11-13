import api from "./api";
import type {
  TrainingProgram,
  TrainingProgramFormData,
  TrainingProgramResponse,
} from "../types/training-program.types";

export const getAllTrainingPrograms = async (): Promise<TrainingProgram[]> => {
  const response = await api.get<TrainingProgramResponse>(
    "/training-programs"
  );

  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const getTrainingProgramById = async (
  id: string
): Promise<TrainingProgram> => {
  const response = await api.get<TrainingProgramResponse>(
    `/training-programs/${id}`
  );

  return response.data.data as TrainingProgram;
};

export const createTrainingProgram = async (
  data: TrainingProgramFormData
): Promise<TrainingProgram> => {
  const response = await api.post<TrainingProgramResponse>(
    "/training-programs",
    data
  );

  return response.data.data as TrainingProgram;
};

export const updateTrainingProgram = async (
  id: string,
  data: Partial<TrainingProgramFormData>
): Promise<TrainingProgram> => {
  const response = await api.put<TrainingProgramResponse>(
    `/training-programs/${id}`,
    data
  );

  return response.data.data as TrainingProgram;
};

export const deleteTrainingProgram = async (
  id: string
): Promise<void> => {
  await api.delete(`/training-programs/${id}`);
};
