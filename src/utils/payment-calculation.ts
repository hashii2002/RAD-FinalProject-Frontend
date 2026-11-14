import type { PaymentStatus } from "../types/payment.types";

interface PaymentCalculation {
  finalAmount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
}

export const calculatePaymentPreview = (
  totalAmount: number,
  discount: number,
  paidAmount: number
): PaymentCalculation => {
  const finalAmount = Number(
    (totalAmount - discount).toFixed(2)
  );

  const balance = Number(
    (finalAmount - paidAmount).toFixed(2)
  );

  let status: PaymentStatus;

  if (paidAmount === 0) {
    status = "UNPAID";
  } else if (balance === 0) {
    status = "PAID";
  } else {
    status = "PARTIALLY_PAID";
  }

  return {
    finalAmount,
    paidAmount,
    balance,
    status,
  };
};
