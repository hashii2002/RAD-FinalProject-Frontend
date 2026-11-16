import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Wallet,
  Clock3,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  X,
  Receipt,
  CalendarDays,
  AlertCircle,
  Banknote,
  FileText,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import paymentService from "../../service/payment.service";

import type {
  Payment,
  PaymentStatus,
  PaymentMethod,
} from "../../types/payment.types";

type StatusFilter = "ALL" | PaymentStatus;

const statusStyles: Record<PaymentStatus, string> = {
  UNPAID: "border-red-200 bg-red-50 text-red-700",
  PARTIALLY_PAID: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REFUNDED: "border-slate-200 bg-slate-100 text-slate-600",
};

const statusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  REFUNDED: "Refunded",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPaymentTypeLabel = (type: Payment["paymentType"]) =>
  type === "PET_ORDER" ? "Pet Order" : "Training Booking";

const getPaymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case "CASH":
      return "Cash";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "OTHER":
      return "Other";
    default:
      return method;
  }
};

const getErrorMessage = (error: unknown) => {
  const apiError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Something went wrong. Please try again."
  );
};

function MyPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await paymentService.getMyPayments();
      setPayments(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const summary = useMemo(() => {
    const activePayments = payments.filter(
      (payment) => payment.status !== "REFUNDED"
    );

    return {
      total: activePayments.reduce(
        (sum, payment) => sum + Number(payment.finalAmount || 0),
        0
      ),
      paid: activePayments.reduce(
        (sum, payment) => sum + Number(payment.paidAmount || 0),
        0
      ),
      outstanding: activePayments.reduce(
        (sum, payment) => sum + Number(payment.balance || 0),
        0
      ),
      refunded: payments
        .filter((payment) => payment.status === "REFUNDED")
        .reduce(
          (sum, payment) => sum + Number(payment.paidAmount || 0),
          0
        ),
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return payments.filter((payment) => {
      const matchesSearch =
        payment.paymentId.toLowerCase().includes(search) ||
        payment.referenceId.toLowerCase().includes(search) ||
        getPaymentTypeLabel(payment.paymentType).toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || payment.paymentType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, searchTerm, statusFilter, typeFilter]);

  const stats = [
    {
      title: "Total Payment Value",
      value: formatCurrency(summary.total),
      icon: Receipt,
      color: "bg-blue-50 text-blue-600",
      description: "Total value of active payments",
    },
    {
      title: "Total Paid",
      value: formatCurrency(summary.paid),
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
      description: "Amount successfully paid",
    },
    {
      title: "Outstanding",
      value: formatCurrency(summary.outstanding),
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
      description: "Remaining payment balance",
    },
    {
      title: "Refunded",
      value: formatCurrency(summary.refunded),
      icon: RefreshCw,
      color: "bg-slate-100 text-slate-600",
      description: "Amount recorded as refunded",
    },
  ];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">

          {/* Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
                <CreditCard size={17} />
                Payment Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Payments
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                View your payment history, track outstanding balances and
                review your transactions.
              </p>
            </div>

            <button
              onClick={fetchPayments}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-2 wrap-break-word text-xl font-bold text-slate-900 sm:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {stat.description}
                      </p>
                    </div>

                    <div className={`shrink-0 rounded-xl p-3 ${stat.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment History and Filters */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Payment History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and filter your payment records.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search payment or reference ID..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="ALL">All Payment Statuses</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="ALL">All Payment Types</option>
                  <option value="PET_ORDER">Pet Orders</option>
                  <option value="TRAINING_BOOKING">Training Bookings</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment List */}
          {loading ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="h-5 w-1/3 rounded bg-slate-200" />
                  <div className="mt-4 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-6 h-3 w-full rounded bg-slate-100" />
                  <div className="mt-5 h-10 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <AlertCircle className="mx-auto text-red-500" size={34} />
              <h3 className="mt-3 font-semibold text-red-800">
                Unable to load payments
              </h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={fetchPayments}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Wallet size={30} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {payments.length === 0
                  ? "No payments yet"
                  : "No matching payments"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {payments.length === 0
                  ? "Your payment records will appear here when a payment is created for your pet order or training booking."
                  : "Try changing your search term or selected filters."}
              </p>

              {payments.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setTypeFilter("ALL");
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredPayments.map((payment) => {
                const finalAmount = Number(payment.finalAmount || 0);
                const paidAmount = Number(payment.paidAmount || 0);
                const balance = Number(payment.balance || 0);

                const progress =
                  finalAmount > 0
                    ? Math.min(100, Math.max(0, (paidAmount / finalAmount) * 100))
                    : 0;

                return (
                  <div
                    key={payment.paymentId}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            {payment.paymentType === "PET_ORDER" ? (
                              <Wallet size={23} />
                            ) : (
                              <CreditCard size={23} />
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              {payment.paymentId}
                            </p>
                            <h3 className="mt-1 font-bold text-slate-900">
                              {getPaymentTypeLabel(payment.paymentType)}
                            </h3>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[payment.status]
                          }`}
                        >
                          {statusLabels[payment.status]}
                        </span>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Reference ID
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {payment.referenceId}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">
                            Final Amount
                          </p>
                          <p className="mt-1 text-base font-bold text-slate-900">
                            {formatCurrency(finalAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Paid Amount</p>
                          <p className="mt-1 text-base font-bold text-emerald-600">
                            {formatCurrency(paidAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Outstanding</p>
                          <p className="mt-1 text-base font-bold text-amber-600">
                            {formatCurrency(balance)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Transactions</p>
                          <p className="mt-1 text-base font-bold text-slate-800">
                            {payment.transactions?.length || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">
                            Payment Progress
                          </span>
                          <span className="text-sm font-bold text-violet-700">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              payment.status === "REFUNDED"
                                ? "bg-slate-400"
                                : "bg-violet-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="text-xs text-slate-400">
                          Created {formatDate(payment.createdAt)}
                        </div>

                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredPayments.length > 0 && (
            <p className="text-center text-sm text-slate-400">
              Showing {filteredPayments.length} of {payments.length} payments
            </p>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
                  Payment Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPayment.paymentId}
                </h2>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close payment details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Status */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Payment Category</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {getPaymentTypeLabel(selectedPayment.paymentType)}
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    statusStyles[selectedPayment.status]
                  }`}
                >
                  {statusLabels[selectedPayment.status]}
                </span>
              </div>

              {/* Amount Breakdown */}
              <div className="rounded-2xl border border-slate-100 p-5">
                <h4 className="mb-4 text-sm font-semibold text-slate-800">
                  Payment Summary
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3 text-slate-500">
                    <span>Total Amount</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(selectedPayment.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-slate-500">
                    <span>Discount</span>
                    <span className="font-medium text-slate-800">
                      - {formatCurrency(selectedPayment.discount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 font-semibold text-slate-800">
                    <span>Final Amount</span>
                    <span>{formatCurrency(selectedPayment.finalAmount)}</span>
                  </div>

                  <div className="flex justify-between gap-3 text-slate-500">
                    <span>Paid Amount</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(selectedPayment.paidAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-slate-500">
                    <span>Outstanding Balance</span>
                    <span className="font-semibold text-amber-600">
                      {formatCurrency(selectedPayment.balance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reference Details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText size={15} />
                    <span className="text-xs">Reference ID</span>
                  </div>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                    {selectedPayment.referenceId}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarDays size={15} />
                    <span className="text-xs">Created Date</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      Transaction History
                    </h4>
                    <p className="mt-1 text-xs text-slate-400">
                      Individual payments and installments
                    </p>
                  </div>

                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {selectedPayment.transactions?.length || 0} Transactions
                  </span>
                </div>

                {!selectedPayment.transactions ||
                selectedPayment.transactions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <Banknote
                      className="mx-auto text-slate-300"
                      size={28}
                    />
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      No transactions recorded
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Transaction details will appear here when payments are
                      recorded.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPayment.transactions.map((transaction) => (
                      <div
                        key={transaction.transactionId}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <CheckCircle2 size={19} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {transaction.transactionId}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {getPaymentMethodLabel(
                                  transaction.paymentMethod
                                )}
                              </p>
                            </div>
                          </div>

                          <p className="text-base font-bold text-emerald-600">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-400">
                              Payment Date
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {formatDate(transaction.paymentDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Received By
                            </p>
                            <p className="mt-1 break-all text-sm font-medium text-slate-700">
                              {transaction.receivedBy || "Not available"}
                            </p>
                          </div>

                          {transaction.referenceNumber && (
                            <div>
                              <p className="text-xs text-slate-400">
                                Reference Number
                              </p>
                              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                                {transaction.referenceNumber}
                              </p>
                            </div>
                          )}

                          {transaction.notes && (
                            <div className="sm:col-span-2">
                              <p className="text-xs text-slate-400">Notes</p>
                              <p className="mt-1 text-sm text-slate-700">
                                {transaction.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Progress */}
              <div className="rounded-xl bg-violet-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-800">
                    <TrendingUp size={18} />
                    <span className="text-sm font-semibold">
                      Payment Progress
                    </span>
                  </div>

                  <span className="text-lg font-bold text-violet-800">
                    {selectedPayment.finalAmount > 0
                      ? Math.round(
                          Math.min(
                            100,
                            Math.max(
                              0,
                              (selectedPayment.paidAmount /
                                selectedPayment.finalAmount) *
                                100
                            )
                          )
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all"
                    style={{
                      width: `${
                        selectedPayment.finalAmount > 0
                          ? Math.min(
                              100,
                              Math.max(
                                0,
                                (selectedPayment.paidAmount /
                                  selectedPayment.finalAmount) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedPayment(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyPayments;
