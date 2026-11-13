import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getAllPetOrders,
  updatePetOrderStatus,
} from "../../service/pet-Order.service";

import type {
  PetOrder,
  PetOrderStatus,
} from "../../types/pet-Order.types";

const statusStyles: Record<PetOrderStatus, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 border border-amber-200",

  CONTACTED:
    "bg-blue-50 text-blue-700 border border-blue-200",

  APPROVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",

  REJECTED:
    "bg-rose-50 text-rose-700 border border-rose-200",

  CANCELLED:
    "bg-slate-100 text-slate-600 border border-slate-200",
};

const statusLabels: Record<PetOrderStatus, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const formatDate = (date?: string): string => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return (
      apiError.response?.data?.message ||
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const PetOrders = () => {

  const [orders, setOrders] = useState<PetOrder[]>([]);

  const [loading, setLoading] = useState(true);

  const [pageError, setPageError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] =
    useState<PetOrder | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await getAllPetOrders();

      setOrders(data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.orderId.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        order.customerPhone.toLowerCase().includes(search) ||
        order.petId.toLowerCase().includes(search) ||
        order.customerId.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Summary Calculations

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const approvedOrders = orders.filter(
    (order) => order.status === "APPROVED"
  ).length;

  const rejectedOrders = orders.filter(
    (order) => order.status === "REJECTED"
  ).length;

  const handleStatusUpdate = async (
    order: PetOrder,
    newStatus: PetOrderStatus
  ) => {
    if (
      order.status === newStatus ||updatingOrderId === order.orderId) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change order ${order.orderId} from ${order.status} to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingOrderId(order.orderId);
      setPageError("");

      const updatedOrder = await updatePetOrderStatus(
        order.orderId,
        newStatus
      );

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.orderId === order.orderId
            ? updatedOrder
            : item
        )
      );

      setSelectedOrder((previousOrder) =>
        previousOrder?.orderId === order.orderId
          ? updatedOrder
          : previousOrder
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(event.target.value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const renderStatusDropdown = (order: PetOrder) => {
    const isUpdating =
      updatingOrderId === order.orderId;

    return (
      <div className="relative">
        <select
          value=""
          disabled={isUpdating}
          onChange={(event) => {
            const value = event.target.value;

            if (value) {
              handleStatusUpdate(
                order,
                value as PetOrderStatus
              );
            }
          }}
          title="Update order status"
          className="max-w-36 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-7 text-xs font-semibold text-[#18365C] outline-none transition hover:border-[#269DA3] focus:border-[#269DA3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            Update Status
          </option>

          {(
            Object.keys(statusLabels) as PetOrderStatus[]
          )
            .filter((status) => status !== order.status)
            .map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
        </select>

        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    );
  };

  const summaryCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "All pet order requests",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      description: "Awaiting admin action",
    },
    {
      title: "Approved Orders",
      value: approvedOrders,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description: "Successfully approved",
    },
    {
      title: "Rejected Orders",
      value: rejectedOrders,
      icon: XCircle,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      description: "Rejected requests",
    },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#269DA3]">
              PAWPATH MANAGEMENT SYSTEM
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#18365C] sm:text-3xl">
              Pet Orders Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage customer pet order requests and update their statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading || updatingOrderId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#18365C] shadow-sm transition hover:border-[#269DA3] hover:text-[#269DA3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />

            Refresh Orders
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#18365C]">
                      {card.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    <Icon
                      size={21}
                      className={card.iconColor}
                    />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* API Error */}
        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-rose-600"
            />

            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">
                Unable to complete the request
              </p>

              <p className="mt-1 text-sm text-rose-600">
                {pageError}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              className="text-rose-500 hover:text-rose-700"
              aria-label="Close error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Orders Management Panel */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Panel Header */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#18365C]">
                Customer Order Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all pet orders submitted by customers.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Package
                size={17}
                className="text-[#269DA3]"
              />

              <span>
                {filteredOrders.length} of {totalOrders} orders
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-5 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Order ID, Customer, Pet ID..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
              />
            </div>

            <div className="relative md:w-52">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONTACTED">Contacted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#269DA3] hover:text-[#269DA3]"
            >
              Reset
            </button>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">

            {loading ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3">
                <Loader2
                  size={34}
                  className="animate-spin text-[#269DA3]"
                />

                <p className="text-sm font-medium text-slate-500">
                  Loading pet orders...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <ShoppingBag
                    size={29}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="mt-4 text-base font-bold text-[#18365C]">
                  No Orders Found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  {orders.length === 0
                    ? "There are currently no pet order requests."
                    : "No orders match your search or selected status."}
                </p>

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-sm font-semibold text-[#269DA3] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full min-w-262.5 border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Order Details
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pet ID
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Order Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const isUpdating =
                      updatingOrderId === order.orderId;

                    return (
                      <tr
                        key={order.orderId}
                        className="transition hover:bg-slate-50/80"
                      >
                        {/* Order Details */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-[#18365C]">
                            {order.orderId}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Customer ID: {order.customerId}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-700">
                            {order.customerName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {order.customerEmail}
                          </p>
                        </td>

                        {/* Pet ID */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-[#269DA3]/10 px-2.5 py-1.5 text-xs font-bold text-[#21898E]">
                            {order.petId}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[order.status]}`}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrder(order)
                              }
                              title="View order details"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#269DA3] hover:bg-[#269DA3]/5 hover:text-[#269DA3]"
                            >
                              <Eye size={17} />
                            </button>

                            {renderStatusDropdown(order)}

                            {isUpdating && (
                              <Loader2
                                size={17}
                                className="animate-spin text-[#269DA3]"
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {!loading && filteredOrders.length > 0 && (
            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-[#18365C]">
                  {filteredOrders.length}
                </span>{" "}
                order(s)
              </p>

              <p className="text-xs text-slate-400">
                PawPath Pet Order Management
              </p>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142B45]/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#269DA3]">
                    ORDER INFORMATION
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#18365C]">
                    {selectedOrder.orderId}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <X size={19} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6 p-6">

                {/* Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Current Order Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[selectedOrder.status]}`}
                    >
                      {statusLabels[selectedOrder.status]}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                      Submitted Date
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#18365C]">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#18365C]">
                    <User
                      size={17}
                      className="text-[#269DA3]"
                    />
                    Customer Information
                  </h3>

                  <div className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Customer Name
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {selectedOrder.customerName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Customer ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {selectedOrder.customerId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Email Address
                      </p>

                      <p className="mt-1 flex items-center gap-2 break-all text-sm font-medium text-slate-700">
                        <Mail
                          size={14}
                          className="shrink-0 text-[#269DA3]"
                        />
                        {selectedOrder.customerEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Phone Number
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Phone
                          size={14}
                          className="text-[#269DA3]"
                        />
                        {selectedOrder.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pet Information */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#18365C]">
                    <Package
                      size={17}
                      className="text-[#269DA3]"
                    />
                    Pet Information
                  </h3>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">
                      Requested Pet ID
                    </p>

                    <p className="mt-1 text-base font-bold text-[#18365C]">
                      {selectedOrder.petId}
                    </p>
                  </div>
                </div>

                {/* Customer Message */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#18365C]">
                    <MessageSquare
                      size={17}
                      className="text-[#269DA3]"
                    />
                    Customer Message
                  </h3>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {selectedOrder.message?.trim()
                        ? selectedOrder.message
                        : "No additional message provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="text-xs font-semibold text-slate-500">
                    Change Order Status:
                  </span>

                  {renderStatusDropdown(selectedOrder)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PetOrders;
