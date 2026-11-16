import api from "./api";

export interface CompanyContact {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  website?: string;
  facebook?: string;
  instagram?: string;
}

interface CompanyContactResponse {
  success: boolean;
  message: string;
  data: CompanyContact;
}

export const getCompanyContact = async (): Promise<CompanyContact> => {
  const response = await api.get<CompanyContactResponse>(
    "/company-contact"
  );

  return response.data.data;
};
