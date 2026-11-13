export type TrainingProgramStatus = "ACTIVE" | "INACTIVE";

export interface TrainingProgram {
  _id: string;
  name: string;
  animalType: string;
  description: string;
  durationWeeks: number;
  price: number;
  status: TrainingProgramStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingProgramFormData {
  name: string;
  animalType: string;
  description: string;
  durationWeeks: number;
  price: number;
  status: TrainingProgramStatus;
}

export interface TrainingProgramResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: TrainingProgram | TrainingProgram[];
}
