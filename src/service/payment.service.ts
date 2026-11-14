import api from "./api";

import type {
  Payment,
  PaymentListResponse,
  SinglePaymentResponse,
  CreatePaymentRequest,
  AddPaymentTransactionRequest,
  UpdatePaymentRequest,
} from "../types/payment.types";

const PAYMENT_URL = "/payments";

const paymentService = {

  getAllPayments: async (): Promise<Payment[]> => {
    const response = await api.get<PaymentListResponse>(PAYMENT_URL);
    return response.data.data;
  },

  // Get logged in customer's payments
  getMyPayments: async (): Promise<Payment[]> => {
    const response = await api.get<PaymentListResponse>(
      `${PAYMENT_URL}/my-payments`
    );
    return response.data.data;
  },

  // Get payment details
  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await api.get<SinglePaymentResponse>(
      `${PAYMENT_URL}/${paymentId}`
    );
    return response.data.data;
  },

  // Create payment record
  createPayment: async (
    payload: CreatePaymentRequest
  ): Promise<Payment> => {
    const response = await api.post<SinglePaymentResponse>(
      PAYMENT_URL,
      payload
    );
    return response.data.data;
  },

  // Update payment discount
  updatePayment: async (
    paymentId: string,
    payload: UpdatePaymentRequest
  ): Promise<Payment> => {
    const response = await api.put<SinglePaymentResponse>(
      `${PAYMENT_URL}/${paymentId}`,
      payload
    );
    return response.data.data;
  },

  // Record a payment transaction or installment
  addPaymentTransaction: async (
    paymentId: string,
    payload: AddPaymentTransactionRequest
  ): Promise<Payment> => {
    const response = await api.post<SinglePaymentResponse>(
      `${PAYMENT_URL}/${paymentId}/transactions`,
      payload
    );
    return response.data.data;
  },

  // Refund payment
  refundPayment: async (paymentId: string): Promise<Payment> => {
    const response = await api.delete<SinglePaymentResponse>(
      `${PAYMENT_URL}/${paymentId}`
    );
    return response.data.data;
  },
};

export default paymentService;
