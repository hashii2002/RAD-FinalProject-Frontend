import api from "./api";
// ======================== Admin Dashboard =============================
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

// ===============================  Customer Dashboard ============================

export interface CustomerDashboardData {
  customer: {
    userId: string;
    name: string;
    email: string;
  };

  summary: {
    orders: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      cancelled: number;
    };

    training: {
      total: number;
      pending: number;
      approved: number;
      inProgress: number;
      completed: number;
      rejected: number;
      cancelled: number;
      totalSessions: number;
    };

    payments: {
      totalRecords: number;
      unpaid: number;
      partiallyPaid: number;
      paid: number;
      refunded: number;
      totalPaid: number;
      totalOutstandingBalance: number;
    };
  };

  orders: Array<{
    orderId: string;
    petId: string;
    customerId: string;
    customerName: string;
    status: string;
    createdAt?: string;
  }>;

  trainingBookings: Array<{
    bookingId: string;
    trainingProgramId: string;
    petName: string;
    species: string;
    breed: string;
    appointmentDate: string;
    appointmentTime: string;
    progressPercentage: number;
    status: string;
    trainerId?: string;
  }>;

  trainingSessions: Array<{
    sessionId: string;
    bookingId: string;
    sessionDate: string;
    durationMinutes: number;
    activities: string;
    petCondition: string;
    progressPercentage: number;
    trainerNotes?: string;
  }>;

  payments: Array<{
    paymentId: string;
    paymentType: string;
    referenceId: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    status: string;
  }>;
}

interface CustomerDashboardResponse {
  success: boolean;
  message: string;
  data: CustomerDashboardData;
}

export const getCustomerDashboard =
  async (): Promise<CustomerDashboardData> => {
    const response = await api.get<CustomerDashboardResponse>(
      "/customer-dashboard"
    );

    return response.data.data;
  };

// ======================== Trainer Dashboard ============================

export interface TrainerDashboardData {
  trainer: {
    userId: string;
    name: string;
    email: string;
  };

  summary: {
    bookings: {
      total: number;
      pending: number;
      approved: number;
      inProgress: number;
      completed: number;
      rejected: number;
      cancelled: number;
    };

    sessions: {
      total: number;
      totalTrainingMinutes: number;
      averageProgress: number;
    };

    todayAppointments: number;
  };

  todayAppointments: Array<{
    bookingId: string;
    customerId: string;
    trainingProgramId: string;
    petName: string;
    species: string;
    breed: string;
    appointmentDate: string;
    appointmentTime: string;
    progressPercentage: number;
    status: string;
  }>;

  assignedBookings: Array<{
    bookingId: string;
    customerId: string;
    trainingProgramId: string;
    petName: string;
    species: string;
    breed: string;
    appointmentDate: string;
    appointmentTime: string;
    progressPercentage: number;
    status: string;
  }>;

  trainingSessions: Array<{
    sessionId: string;
    bookingId: string;
    sessionDate: string;
    durationMinutes: number;
    activities: string;
    petCondition: string;
    progressPercentage: number;
    trainerNotes?: string;
    nextSessionPlan?: string;
  }>;
}

interface TrainerDashboardResponse {
  success: boolean;
  message: string;
  data: TrainerDashboardData;
}

export const getTrainerDashboard =
  async (): Promise<TrainerDashboardData> => {
    const response = await api.get<TrainerDashboardResponse>(
      "/trainer-dashboard"
    );

    return response.data.data;
  };
