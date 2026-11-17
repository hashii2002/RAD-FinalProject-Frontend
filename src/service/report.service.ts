import api from "./api";

export type ReportType =
  | "pet-sales"
  | "training"
  | "payments"
  | "system-summary";

const reportEndpoints: Record<ReportType, string> = {
  "pet-sales": "/reports/pet-sales",
  training: "/reports/training",
  payments: "/reports/payments",
  "system-summary": "/reports/system-summary",
};

export interface ReportApiResponse<T = Record<string, any>> {
  success: boolean;
  message: string;
  data: T;
}

export const getReportData = async <T = Record<string, any>>(
  reportType: ReportType
): Promise<T> => {
  const response = await api.get<ReportApiResponse<T>>(
    reportEndpoints[reportType]
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || "Unable to retrieve report data."
    );
  }

  return response.data.data;
};