import api from "./api";

export interface AdminDashboardData {
  pets: {
    total: number;
    available: number;
    sold: number;
    reserved: number;
  };

  petOrders: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };

  trainingPrograms: {
    total: number;
    active: number;
  };

  trainingBookings: {
    total: number;
    pending: number;
    approved: number;
    inProgress: number;
    completed: number;
  };

  payments: {
    total: number;
    unpaid: number;
    partiallyPaid: number;
    paid: number;
    refunded: number;
    petSalesCollected: number;
    trainingFeesCollected: number;
    totalCollectedRevenue: number;
    totalOutstandingBalance: number;
    note: string;
  };
}

interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
}

export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await api.get<AdminDashboardResponse>(
    "/analytics/dashboard"
  );

  return response.data.data;
};
