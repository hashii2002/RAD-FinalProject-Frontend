import api from "./api";
import type {
  Pet,
  PetFormData,
  PetResponse,
  PetStatus,
} from "../types/pet.types";

export const getAllPets = async (): Promise<Pet[]> => {
  const response = await api.get<PetResponse>("/pets");
  return response.data.data as Pet[];
};

export const searchPets = async (filters: {
  name?: string;
  species?: string;
  breed?: string;
  status?: PetStatus | "";
  minPrice?: number | "";
  maxPrice?: number | "";
}): Promise<Pet[]> => {
  const params: Record<string, string | number> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      params[key] = value;
    }
  });

  const response = await api.get<PetResponse>("/pets/search", {
    params,
  });

  return response.data.data as Pet[];
};

const createPetFormData = (data: PetFormData): FormData => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("species", data.species);
  formData.append("breed", data.breed);
  formData.append("ageMonths", String(data.ageMonths));
  formData.append("price", String(data.price));
  formData.append("description", data.description);
  formData.append("status", data.status);

  if (data.image) {
    formData.append("image", data.image);
  }

  return formData;
};

export const createPet = async (data: PetFormData): Promise<Pet> => {
  const formData = createPetFormData(data);

  const response = await api.post<PetResponse>("/pets", formData);

  return response.data.data as Pet;
};

export const updatePet = async (
  petId: string,
  data: PetFormData
): Promise<Pet> => {
  const formData = createPetFormData(data);

  const response = await api.put<PetResponse>(
    `/pets/${petId}`,
    formData
  );

  return response.data.data as Pet;
};

export const deletePet = async (petId: string): Promise<void> => {
  await api.delete(`/pets/${petId}`);
};
