export type PaymentType = "PET_ORDER" | "TRAINING_BOOKING";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "OTHER";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "REFUNDED";

export interface PaymentTransaction {
  transactionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  receivedBy: string;
  notes?: string;
}

export interface Payment {
  _id?: string;
  paymentId: string;
  paymentType: PaymentType;
  referenceId: string;
  customerId: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
  transactions: PaymentTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentListResponse {
  success: boolean;
  count: number;
  data: Payment[];
}

export interface SinglePaymentResponse {
  success: boolean;
  message?: string;
  data: Payment;
}

export interface CreatePaymentRequest {
  paymentType: PaymentType;
  referenceId: string;
  discount?: number;
}

export interface AddPaymentTransactionRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentRequest {
  discount: number;
}
