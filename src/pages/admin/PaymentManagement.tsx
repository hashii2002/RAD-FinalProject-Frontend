import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  CreditCard,
  Wallet,
  CircleDollarSign,
  Receipt,
  Eye,
  Pencil,
  RotateCcw,
  X,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import paymentService from "../../service/payment.service";

import type {
  Payment,
  PaymentType,
  PaymentStatus,
  PaymentMethod,
} from "../../types/payment.types";

type ModalType =
  | "CREATE"
  | "TRANSACTION"
  | "DETAILS"
  | "DISCOUNT"
  | "REFUND"
  | null;

const currency = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PARTIALLY_PAID":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "UNPAID":
      return "bg-red-50 text-red-700 border-red-200";
    case "REFUNDED":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const getStatusIcon = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return <CheckCircle2 size={14} />;
    case "PARTIALLY_PAID":
      return <Clock3 size={14} />;
    case "UNPAID":
      return <AlertCircle size={14} />;
    case "REFUNDED":
      return <RotateCcw size={14} />;
  }
};

const PaymentManagement = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Create payment form
  const [paymentType, setPaymentType] =
    useState<PaymentType>("PET_ORDER");
  const [referenceId, setReferenceId] = useState("");
  const [discount, setDiscount] = useState("0");

  // Transaction form
  const [transactionAmount, setTransactionAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [referenceNumber, setReferenceNumber] = useState("");
  const [transactionNotes, setTransactionNotes] = useState("");

  // Discount update form
  const [updatedDiscount, setUpdatedDiscount] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await paymentService.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load payment records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Summary calculations
  const summary = useMemo(() => {
    const activePayments = payments.filter(
      (payment) => payment.status !== "REFUNDED"
    );

    return {
      totalRecords: payments.length,

      totalAmount: activePayments.reduce(
        (sum, payment) => sum + payment.finalAmount,
        0
      ),

      totalCollected: activePayments.reduce(
        (sum, payment) => sum + payment.paidAmount,
        0
      ),

      totalOutstanding: activePayments.reduce(
        (sum, payment) => sum + payment.balance,
        0
      ),

      refundedCount: payments.filter(
        (payment) => payment.status === "REFUNDED"
      ).length,
    };
  }, [payments]);

  // Search and filters
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        payment.paymentId.toLowerCase().includes(search) ||
        payment.referenceId.toLowerCase().includes(search) ||
        payment.customerId.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || payment.paymentType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, searchTerm, statusFilter, typeFilter]);

  // Live transaction calculations
  const transactionPreview = useMemo(() => {
    if (!selectedPayment) {
      return {
        paidAmount: 0,
        balance: 0,
        status: "UNPAID" as PaymentStatus,
        valid: false,
      };
    }

    const enteredAmount =
      transactionAmount.trim() === ""
        ? 0
        : Number(transactionAmount);

    const validAmount =
      Number.isFinite(enteredAmount) &&
      enteredAmount > 0 &&
      enteredAmount <= selectedPayment.balance;

    const paidAmount = Number(
      (selectedPayment.paidAmount + enteredAmount).toFixed(2)
    );

    const balance = Number(
      (selectedPayment.finalAmount - paidAmount).toFixed(2)
    );

    let status: PaymentStatus = "UNPAID";

    if (paidAmount === 0) {
      status = "UNPAID";
    } else if (balance === 0) {
      status = "PAID";
    } else {
      status = "PARTIALLY_PAID";
    }

    return {
      paidAmount,
      balance,
      status,
      valid: validAmount,
    };
  }, [selectedPayment, transactionAmount]);

  // Live discount calculations
  const discountPreview = useMemo(() => {
    if (!selectedPayment) {
      return {
        finalAmount: 0,
        balance: 0,
        valid: false,
      };
    }

    const discountValue =
      updatedDiscount.trim() === ""
        ? 0
        : Number(updatedDiscount);

    const valid =
      Number.isFinite(discountValue) &&
      discountValue >= 0 &&
      discountValue <= selectedPayment.totalAmount &&
      selectedPayment.totalAmount - discountValue >=
        selectedPayment.paidAmount;

    const finalAmount = Number(
      (selectedPayment.totalAmount - discountValue).toFixed(2)
    );

    const balance = Number(
      (finalAmount - selectedPayment.paidAmount).toFixed(2)
    );

    return {
      finalAmount,
      balance,
      valid,
    };
  }, [selectedPayment, updatedDiscount]);

  const resetCreateForm = () => {
    setPaymentType("PET_ORDER");
    setReferenceId("");
    setDiscount("0");
  };

  const resetTransactionForm = () => {
    setTransactionAmount("");
    setPaymentMethod("CASH");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setReferenceNumber("");
    setTransactionNotes("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedPayment(null);
    setError("");
    resetTransactionForm();
  };

  const openCreateModal = () => {
    resetCreateForm();
    setError("");
    setSuccessMessage("");
    setActiveModal("CREATE");
  };

  // Create a new payment record
  const handleCreatePayment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!referenceId.trim()) {
      setError("Please enter a valid Order ID or Booking ID.");
      return;
    }

    const discountValue = Number(discount);

    if (
      !Number.isFinite(discountValue) ||
      discountValue < 0
    ) {
      setError("Please enter a valid discount amount.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const createdPayment = await paymentService.createPayment({
        paymentType,
        referenceId: referenceId.trim(),
        discount: discountValue,
      });

      await loadPayments();

      resetCreateForm();

      setSelectedPayment(createdPayment);
      resetTransactionForm();
      setActiveModal("TRANSACTION");

      setSuccessMessage(
        `${createdPayment.paymentId} created successfully. Record the first payment below.`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to create payment record."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Record first payment or installment
  const handleAddTransaction = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedPayment) return;

    const amount = Number(transactionAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > selectedPayment.balance
    ) {
      setError(
        `Enter an amount greater than zero and not exceeding ${currency(
          selectedPayment.balance
        )}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updatedPayment =
        await paymentService.addPaymentTransaction(
          selectedPayment.paymentId,
          {
            amount,
            paymentMethod,
            paymentDate,
            referenceNumber: referenceNumber.trim() || undefined,
            notes: transactionNotes.trim() || undefined,
          }
        );

      setSelectedPayment(updatedPayment);
      setPayments((current) =>
        current.map((payment) =>
          payment.paymentId === updatedPayment.paymentId
            ? updatedPayment
            : payment
        )
      );

      resetTransactionForm();

      setSuccessMessage(
        `Payment transaction recorded successfully for ${updatedPayment.paymentId}.`
      );

      // Close only when the payment is fully paid.
      if (updatedPayment.status === "PAID") {
        setActiveModal("DETAILS");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to record payment transaction."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Update discount
  const handleUpdateDiscount = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedPayment) return;

    const discountValue = Number(updatedDiscount);

    if (!discountPreview.valid) {
      setError(
        "Discount is invalid. It cannot exceed the total amount or reduce the final amount below the amount already paid."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updatedPayment = await paymentService.updatePayment(
        selectedPayment.paymentId,
        { discount: discountValue }
      );

      setPayments((current) =>
        current.map((payment) =>
          payment.paymentId === updatedPayment.paymentId
            ? updatedPayment
            : payment
        )
      );

      setSelectedPayment(updatedPayment);
      setActiveModal(null);
      setSuccessMessage("Payment discount updated successfully.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to update payment discount."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Refund payment
  const handleRefund = async () => {
    if (!selectedPayment) return;

    try {
      setSubmitting(true);
      setError("");

      const refundedPayment = await paymentService.refundPayment(
        selectedPayment.paymentId
      );

      setPayments((current) =>
        current.map((payment) =>
          payment.paymentId === refundedPayment.paymentId
            ? refundedPayment
            : payment
        )
      );

      setSelectedPayment(refundedPayment);
      setActiveModal(null);
      setSuccessMessage(
        `${refundedPayment.paymentId} was marked as refunded.`
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to refund payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openTransactionModal = (payment: Payment) => {
    setSelectedPayment(payment);
    resetTransactionForm();
    setError("");
    setActiveModal("TRANSACTION");
  };

  const openDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setError("");
    setActiveModal("DETAILS");
  };

  const openDiscountModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setUpdatedDiscount(String(payment.discount));
    setError("");
    setActiveModal("DISCOUNT");
  };

  const openRefundModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setError("");
    setActiveModal("REFUND");
  };

  const closeSuccessMessage = () => setSuccessMessage("");

  return (
    <DashboardLayout role="ADMIN">
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Admin</span>
              <span>/</span>
              <span className="text-indigo-600">Payments</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Payment Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage pet sales payments, training payments and customer
              transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadPayments}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create Payment
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>

            <button
              type="button"
              onClick={closeSuccessMessage}
              aria-label="Close message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && !activeModal && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Payment Records"
            value={String(summary.totalRecords)}
            subtitle="All payment records"
            icon={<Receipt size={21} />}
            iconStyle="bg-indigo-50 text-indigo-600"
          />

          <SummaryCard
            title="Total Amount"
            value={currency(summary.totalAmount)}
            subtitle="Excluding refunded payments"
            icon={<CircleDollarSign size={21} />}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Amount Collected"
            value={currency(summary.totalCollected)}
            subtitle="Successfully recorded payments"
            icon={<Wallet size={21} />}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Outstanding Balance"
            value={currency(summary.totalOutstanding)}
            subtitle={`${summary.refundedCount} refunded records`}
            icon={<CreditCard size={21} />}
            iconStyle="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Payments Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Payment Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage all payment records in PawPath.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search payment ID, order ID or customer ID..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400 sm:w-48"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 sm:w-48"
                >
                  <option value="ALL">All Payment Types</option>
                  <option value="PET_ORDER">Pet Sales</option>
                  <option value="TRAINING_BOOKING">Training</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="text-sm text-slate-500">
                Loading payment records...
              </p>
            </div>
          ) : error && payments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <AlertCircle size={30} className="mb-3 text-red-500" />
              <p className="font-semibold text-slate-800">
                Unable to load payments
              </p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={loadPayments}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Receipt size={28} />
              </div>
              <h3 className="font-semibold text-slate-800">
                No payment records found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters, or create a new payment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-262.5 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Payment ID</th>
                    <th className="px-5 py-4 font-semibold">Reference</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Type</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Total
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Paid
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Balance
                    </th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-indigo-700">
                          {payment.paymentId}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(payment.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {payment.referenceId}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {payment.customerId}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {payment.paymentType === "PET_ORDER"
                            ? "Pet Sale"
                            : "Training"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                        {currency(payment.finalAmount)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-emerald-700">
                        {currency(payment.paidAmount)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                        {currency(payment.balance)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                            payment.status
                          )}`}
                        >
                          {getStatusIcon(payment.status)}
                          {payment.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            title="View details"
                            onClick={() => openDetailsModal(payment)}
                          >
                            <Eye size={16} />
                          </ActionButton>

                          {payment.status !== "PAID" &&
                            payment.status !== "REFUNDED" && (
                              <ActionButton
                                title="Record payment"
                                onClick={() =>
                                  openTransactionModal(payment)
                                }
                              >
                                <Plus size={16} />
                              </ActionButton>
                            )}

                          {payment.status !== "REFUNDED" && (
                            <>
                              <ActionButton
                                title="Update discount"
                                onClick={() => openDiscountModal(payment)}
                              >
                                <Pencil size={16} />
                              </ActionButton>

                              <ActionButton
                                title="Refund payment"
                                danger
                                onClick={() => openRefundModal(payment)}
                              >
                                <RotateCcw size={16} />
                              </ActionButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredPayments.length} of {payments.length} records
            </span>
            <span>Payment records are sorted by latest creation date.</span>
          </div>
        </div>

        {/* CREATE PAYMENT MODAL */}
        {activeModal === "CREATE" && (
          <Modal
            title="Create Payment Record"
            subtitle="Create a payment for an approved pet order or training booking."
            onClose={closeModal}
          >
            <form onSubmit={handleCreatePayment} className="space-y-5">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex gap-3">
                  <div className="rounded-lg bg-white p-2 text-indigo-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Payment creation
                    </p>
                    <p className="mt-1 text-xs leading-5 text-indigo-700">
                      The system gets the actual amount from the approved
                      order or training booking. The payment is initially
                      created as UNPAID.
                    </p>
                  </div>
                </div>
              </div>

              <FormField label="Payment Type" required>
                <select
                  value={paymentType}
                  onChange={(event) =>
                    setPaymentType(event.target.value as PaymentType)
                  }
                  className="form-input"
                >
                  <option value="PET_ORDER">Pet Sales Order</option>
                  <option value="TRAINING_BOOKING">
                    Training Booking
                  </option>
                </select>
              </FormField>

              <FormField
                label={
                  paymentType === "PET_ORDER"
                    ? "Pet Order ID"
                    : "Training Booking ID"
                }
                required
              >
                <input
                  value={referenceId}
                  onChange={(event) =>
                    setReferenceId(event.target.value.toUpperCase())
                  }
                  placeholder={
                    paymentType === "PET_ORDER"
                      ? "Example: ORD-0001"
                      : "Example: TRB-0001"
                  }
                  className="form-input"
                  required
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  {paymentType === "PET_ORDER"
                    ? "Only APPROVED pet orders can have payment records."
                    : "Only APPROVED or IN_PROGRESS training bookings can have payment records."}
                </p>
              </FormField>

              <FormField label="Discount (LKR)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  className="form-input"
                  placeholder="0.00"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Discount cannot exceed the actual order or training
                  program amount.
                </p>
              </FormField>

              {error && <ErrorMessage message={error} />}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Payment"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ADD TRANSACTION MODAL */}
        {activeModal === "TRANSACTION" && selectedPayment && (
          <Modal
            title={
              selectedPayment.paidAmount === 0
                ? "Record First Payment"
                : "Record Installment Payment"
            }
            subtitle={`Payment ID: ${selectedPayment.paymentId}`}
            onClose={closeModal}
            wide
          >
            <form onSubmit={handleAddTransaction} className="space-y-5">
              {/* Payment Calculation Summary */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <CalculationCard
                  label="Total Amount"
                  value={currency(selectedPayment.totalAmount)}
                  style="slate"
                />

                <CalculationCard
                  label="Discount"
                  value={currency(selectedPayment.discount)}
                  style="amber"
                />

                <CalculationCard
                  label="Final Amount"
                  value={currency(selectedPayment.finalAmount)}
                  style="indigo"
                />

                <CalculationCard
                  label="Previously Paid"
                  value={currency(selectedPayment.paidAmount)}
                  style="emerald"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">
                    Transaction Information
                  </h3>

                  <FormField label="Amount to Pay (LKR)" required>
                    <input
                      type="number"
                      min="0.01"
                      max={selectedPayment.balance}
                      step="0.01"
                      value={transactionAmount}
                      onChange={(event) =>
                        setTransactionAmount(event.target.value)
                      }
                      placeholder="Enter paid amount"
                      className="form-input"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Maximum payable amount:{" "}
                      <strong>{currency(selectedPayment.balance)}</strong>
                    </p>
                  </FormField>

                  <FormField label="Payment Method" required>
                    <select
                      value={paymentMethod}
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value as PaymentMethod
                        )
                      }
                      className="form-input"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Payment Date" required>
                    <input
                      type="date"
                      value={paymentDate}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(event) =>
                        setPaymentDate(event.target.value)
                      }
                      className="form-input"
                      required
                    />
                  </FormField>

                  <FormField label="Reference Number">
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(event) =>
                        setReferenceNumber(event.target.value)
                      }
                      placeholder="Bank slip / transaction reference"
                      className="form-input"
                    />
                  </FormField>

                  <FormField label="Notes">
                    <textarea
                      value={transactionNotes}
                      onChange={(event) =>
                        setTransactionNotes(event.target.value)
                      }
                      placeholder="Optional transaction notes..."
                      rows={3}
                      maxLength={1000}
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>

                {/* Live Auto Calculation */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-white p-2 text-indigo-600 shadow-sm">
                      <CircleDollarSign size={19} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Payment Calculation
                      </h3>
                      <p className="text-xs text-slate-500">
                        Automatically updated as you enter the payment.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl bg-white p-4">
                    <CalculationRow
                      label="Total Amount"
                      value={currency(selectedPayment.totalAmount)}
                    />

                    <CalculationRow
                      label="Discount"
                      value={`- ${currency(selectedPayment.discount)}`}
                    />

                    <div className="border-t border-dashed border-slate-200 pt-3">
                      <CalculationRow
                        label="Final Amount"
                        value={currency(selectedPayment.finalAmount)}
                        strong
                      />
                    </div>

                    <CalculationRow
                      label="Previously Paid"
                      value={currency(selectedPayment.paidAmount)}
                    />

                    <CalculationRow
                      label="New Payment"
                      value={currency(
                        Number(transactionAmount) || 0
                      )}
                      highlight
                    />

                    <div className="border-t border-dashed border-slate-200 pt-3">
                      <CalculationRow
                        label="Total Paid Amount"
                        value={currency(
                          transactionPreview.paidAmount
                        )}
                        strong
                        green
                      />

                      <div className="mt-3 rounded-xl bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-700">
                          Remaining Balance
                        </p>
                        <p className="mt-1 text-xl font-bold text-amber-800">
                          {currency(transactionPreview.balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
                    <span className="text-sm font-semibold text-slate-600">
                      New Payment Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                        transactionPreview.status
                      )}`}
                    >
                      {getStatusIcon(transactionPreview.status)}
                      {transactionPreview.status.replace("_", " ")}
                    </span>
                  </div>

                  {transactionAmount !== "" &&
                    !transactionPreview.valid && (
                      <p className="mt-3 flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle size={15} />
                        Enter an amount within the outstanding balance.
                      </p>
                    )}
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={submitting || !transactionPreview.valid}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  {submitting ? "Saving..." : "Save Payment"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* PAYMENT DETAILS MODAL */}
        {activeModal === "DETAILS" && selectedPayment && (
          <Modal
            title="Payment Details"
            subtitle={`Payment ID: ${selectedPayment.paymentId}`}
            onClose={closeModal}
            wide
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <CalculationCard
                  label="Total Amount"
                  value={currency(selectedPayment.totalAmount)}
                  style="slate"
                />
                <CalculationCard
                  label="Discount"
                  value={currency(selectedPayment.discount)}
                  style="amber"
                />
                <CalculationCard
                  label="Paid Amount"
                  value={currency(selectedPayment.paidAmount)}
                  style="emerald"
                />
                <CalculationCard
                  label="Balance"
                  value={currency(selectedPayment.balance)}
                  style="indigo"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                <DetailItem
                  label="Payment Type"
                  value={
                    selectedPayment.paymentType === "PET_ORDER"
                      ? "Pet Sales"
                      : "Training Booking"
                  }
                />
                <DetailItem
                  label="Reference ID"
                  value={selectedPayment.referenceId}
                />
                <DetailItem
                  label="Customer ID"
                  value={selectedPayment.customerId}
                />
                <DetailItem
                  label="Final Amount"
                  value={currency(selectedPayment.finalAmount)}
                />
                <DetailItem
                  label="Created Date"
                  value={formatDate(selectedPayment.createdAt)}
                />
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Payment Status
                  </p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                      selectedPayment.status
                    )}`}
                  >
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Transaction History
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedPayment.transactions.length} transaction(s)
                      recorded
                    </p>
                  </div>
                </div>

                {selectedPayment.transactions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center">
                    <Wallet
                      size={25}
                      className="mx-auto mb-2 text-slate-400"
                    />
                    <p className="text-sm font-medium text-slate-600">
                      No transactions recorded yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      This payment is waiting for the first payment.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-162.5 text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Transaction ID</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3">Reference</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPayment.transactions.map(
                          (transaction) => (
                            <tr key={transaction.transactionId}>
                              <td className="px-4 py-3 font-semibold text-indigo-700">
                                {transaction.transactionId}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {formatDate(transaction.paymentDate)}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {transaction.paymentMethod.replace(
                                  "_",
                                  " "
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {transaction.referenceNumber || "-"}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                                {currency(transaction.amount)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                {selectedPayment.status !== "PAID" &&
                  selectedPayment.status !== "REFUNDED" && (
                    <button
                      type="button"
                      onClick={() =>
                        openTransactionModal(selectedPayment)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      <Plus size={16} />
                      Record Payment
                    </button>
                  )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* UPDATE DISCOUNT MODAL */}
        {activeModal === "DISCOUNT" && selectedPayment && (
          <Modal
            title="Update Payment Discount"
            subtitle={`Payment ID: ${selectedPayment.paymentId}`}
            onClose={closeModal}
          >
            <form onSubmit={handleUpdateDiscount} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <CalculationRow
                  label="Total Amount"
                  value={currency(selectedPayment.totalAmount)}
                />
                <CalculationRow
                  label="Previously Paid"
                  value={currency(selectedPayment.paidAmount)}
                />
              </div>

              <FormField label="New Discount (LKR)" required>
                <input
                  type="number"
                  min="0"
                  max={selectedPayment.totalAmount}
                  step="0.01"
                  value={updatedDiscount}
                  onChange={(event) =>
                    setUpdatedDiscount(event.target.value)
                  }
                  className="form-input"
                  required
                />
              </FormField>

              <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <CalculationRow
                  label="Final Amount"
                  value={currency(discountPreview.finalAmount)}
                  strong
                />
                <CalculationRow
                  label="Paid Amount"
                  value={currency(selectedPayment.paidAmount)}
                />
                <div className="border-t border-indigo-100 pt-3">
                  <p className="text-xs font-medium text-indigo-700">
                    New Outstanding Balance
                  </p>
                  <p className="mt-1 text-xl font-bold text-indigo-900">
                    {currency(discountPreview.balance)}
                  </p>
                </div>
              </div>

              {!discountPreview.valid && (
                <ErrorMessage message="Discount is invalid. The final amount cannot be less than the amount already paid." />
              )}

              {error && <ErrorMessage message={error} />}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !discountPreview.valid}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Update Discount"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* REFUND CONFIRMATION MODAL */}
        {activeModal === "REFUND" && selectedPayment && (
          <Modal
            title="Confirm Payment Refund"
            subtitle={`Payment ID: ${selectedPayment.paymentId}`}
            onClose={closeModal}
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <div className="rounded-lg bg-white p-2 text-red-600">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">
                      Are you sure you want to refund this payment?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700">
                      This action will mark the payment as REFUNDED.
                      The payment record will remain in the database.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <CalculationRow
                  label="Payment ID"
                  value={selectedPayment.paymentId}
                />
                <CalculationRow
                  label="Paid Amount"
                  value={currency(selectedPayment.paidAmount)}
                />
                <CalculationRow
                  label="Payment Status"
                  value={selectedPayment.status.replace("_", " ")}
                />
              </div>

              {error && <ErrorMessage message={error} />}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={submitting}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm Refund"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

/* Reusable Components */

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  iconStyle,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconStyle: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 wrap-break-word text-xl font-bold text-slate-900">
          {value}
        </h3>
      </div>
      <div className={`rounded-xl p-3 ${iconStyle}`}>{icon}</div>
    </div>
    <p className="mt-3 text-xs text-slate-400">{subtitle}</p>
  </div>
);

const ActionButton = ({
  children,
  title,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-lg border p-2 transition ${
      danger
        ? "border-red-100 text-red-500 hover:bg-red-50"
        : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
    }`}
  >
    {children}
  </button>
);

const Modal = ({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div
      className={`my-auto w-full ${
        wide ? "max-w-4xl" : "max-w-xl"
      } overflow-hidden rounded-2xl bg-white shadow-2xl`}
    >
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <X size={19} />
        </button>
      </div>

      <div className="max-h-[calc(100vh-130px)] overflow-y-auto p-5 sm:p-6">
        {children}
      </div>
    </div>
  </div>
);

const FormField = ({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const CalculationCard = ({
  label,
  value,
  style,
}: {
  label: string;
  value: string;
  style: "slate" | "amber" | "indigo" | "emerald";
}) => {
  const styles = {
    slate: "bg-slate-50 text-slate-800",
    amber: "bg-amber-50 text-amber-800",
    indigo: "bg-indigo-50 text-indigo-800",
    emerald: "bg-emerald-50 text-emerald-800",
  };

  return (
    <div className={`rounded-xl p-3 ${styles[style]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="mt-1 wrap-break-word text-base font-bold">{value}</p>
    </div>
  );
};

const CalculationRow = ({
  label,
  value,
  strong = false,
  green = false,
  highlight = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  green?: boolean;
  highlight?: boolean;
}) => (
  <div
    className={`flex items-center justify-between gap-3 ${
      highlight ? "text-indigo-700" : "text-slate-600"
    }`}
  >
    <span className={`text-sm ${strong ? "font-bold" : "font-medium"}`}>
      {label}
    </span>
    <span
      className={`text-sm ${
        strong ? "font-bold" : "font-semibold"
      } ${green ? "text-emerald-700" : ""}`}
    >
      {value}
    </span>
  </div>
);

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-800">
      {value}
    </p>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
    <AlertCircle size={17} className="mt-0.5 shrink-0" />
    <span>{message}</span>
  </div>
);

export default PaymentManagement;

