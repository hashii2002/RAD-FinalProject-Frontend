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

export const downloadReport = async (
  reportType: ReportType
): Promise<Blob> => {
  const response = await api.get(reportEndpoints[reportType], {
    responseType: "blob",
  });

  return response.data;
};