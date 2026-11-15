import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  ImageOff,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  X,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getMyCustomerPetOrders } from "../../service/customer-pet-order.service";
import type { PetOrder, PetOrderStatus,} from "../../types/pet-Order.types";

type StatusFilter = "ALL" | PetOrderStatus;

const statusStyles: Record<
  PetOrderStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  CONTACTED: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-700",
    icon: Package,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600",
    icon: XCircle,
  },
};

const formatDate = (date?: string) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatAge = (months: number) => {
  if (months < 12) {
    return `${months} months`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return remainingMonths > 0
    ? `${years} years ${remainingMonths} months`
    : `${years} years`;
};

const MyOrders = () => {
  const [orders, setOrders] = useState<PetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<PetOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyCustomerPetOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      setError("Unable to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const orderCounts = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      approved: orders.filter((order) => order.status === "APPROVED").length,
      rejected: orders.filter(
        (order) =>
          order.status === "REJECTED" || order.status === "CANCELLED"
      ).length,
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.orderId.toLowerCase().includes(search) ||
        order.petId.toLowerCase().includes(search) ||
        order.pet?.name.toLowerCase().includes(search) ||
        order.pet?.breed.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Customer Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and track your pet order requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchOrders()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          <SummaryCard
            title="Total Orders"
            value={orderCounts.total}
            icon={<ShoppingBag size={21} />}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <SummaryCard
            title="Pending"
            value={orderCounts.pending}
            icon={<Clock size={21} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Approved"
            value={orderCounts.approved}
            icon={<CheckCircle2 size={21} />}
            iconClass="bg-green-50 text-green-600"
          />

          <SummaryCard
            title="Rejected / Cancelled"
            value={orderCounts.rejected}
            icon={<XCircle size={21} />}
            iconClass="bg-red-50 text-red-600"
          />
        </div>

        {/* Search and Filter */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Order ID, Pet ID or Pet name..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONTACTED">Contacted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>

            <button
              type="button"
              onClick={() => void fetchOrders()}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Order History */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">
              Order History
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredOrders.length} order(s) found
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2
                size={32}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading your orders...
              </p>
            </div>
          ) : !error && filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <ShoppingBag size={30} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                {orders.length === 0
                  ? "No orders yet"
                  : "No matching orders"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {orders.length === 0
                  ? "When you submit a pet order request, it will appear here."
                  : "Try changing your search term or status filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">

                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Pet</th>
                      <th className="px-5 py-4 font-semibold">Order ID</th>
                      <th className="px-5 py-4 font-semibold">Pet Price</th>
                      <th className="px-5 py-4 font-semibold">Order Date</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-center font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.orderId}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Pet Image and Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <PetImage
                              src={order.pet?.imageUrl}
                              name={order.pet?.name || "Pet"}
                              className="h-14 w-14 rounded-xl"
                            />

                            <div>
                              <p className="font-semibold text-gray-900">
                                {order.pet?.name || "Pet details unavailable"}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {order.pet?.breed || order.petId}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {order.orderId}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-700">
                          {order.pet
                            ? formatCurrency(order.pet.price)
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays
                              size={15}
                              className="text-gray-400"
                            />
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <OrderStatus status={order.status} />
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          >
                            <Eye size={15} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <PetImage
                        src={order.pet?.imageUrl}
                        name={order.pet?.name || "Pet"}
                        className="h-20 w-20 rounded-xl"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900">
                          {order.pet?.name || "Pet details unavailable"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {order.pet?.breed || order.petId}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-emerald-700">
                          {order.pet
                            ? formatCurrency(order.pet.price)
                            : "Price unavailable"}
                        </p>
                      </div>

                      <OrderStatus status={order.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {order.orderId}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Pet ID</p>
                        <p className="mt-1 font-medium text-gray-700">
                          {order.petId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} />
                      {formatDate(order.createdAt)}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <Eye size={16} />
                      View Order Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status Information */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Understanding your order status
          </h3>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            Pending means your request is waiting for review. Contacted means
            the PawPath team has contacted you. Approved means your request
            has been approved. Rejected or Cancelled means the request was
            not completed.
          </p>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order Details
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedOrder.orderId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Pet Image */}
              <div className="bg-gray-50 p-5">
                <PetImage
                  src={selectedOrder.pet?.imageUrl}
                  name={selectedOrder.pet?.name || "Pet"}
                  className="h-56 w-full rounded-xl"
                />

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedOrder.pet?.name || "Pet details unavailable"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedOrder.pet?.species || "Species unavailable"}
                    {selectedOrder.pet?.breed
                      ? ` • ${selectedOrder.pet.breed}`
                      : ""}
                  </p>

                  {selectedOrder.pet && (
                    <>
                      <p className="mt-2 text-sm text-gray-600">
                        Age: {formatAge(selectedOrder.pet.ageMonths)}
                      </p>

                      <p className="mt-2 text-lg font-bold text-emerald-700">
                        {formatCurrency(selectedOrder.pet.price)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Order Status
                  </span>

                  <OrderStatus status={selectedOrder.status} />
                </div>

                <DetailRow
                  label="Order ID"
                  value={selectedOrder.orderId}
                />

                <DetailRow
                  label="Pet ID"
                  value={selectedOrder.petId}
                />

                <DetailRow
                  label="Customer Phone"
                  value={selectedOrder.customerPhone}
                />

                <DetailRow
                  label="Order Date"
                  value={formatDate(selectedOrder.createdAt)}
                />

                {selectedOrder.message && (
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500">
                      Your Message
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                      {selectedOrder.message}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Summary Card
interface SummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconClass: string;
}

const SummaryCard = ({
  title,
  value,
  icon,
  iconClass,
}: SummaryCardProps) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
    </div>

    <p className="mt-3 text-3xl font-bold text-gray-900">
      {value}
    </p>
  </div>
);

interface PetImageProps {
  src?: string;
  name: string;
  className?: string;
}

const PetImage = ({ src, name, className = "" }: PetImageProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gray-100 ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
          <ImageOff size={25} />
          <span className="text-[10px]">No Image</span>
        </div>
      )}
    </div>
  );
};

const OrderStatus = ({ status }: { status: PetOrderStatus }) => {
  const config = statusStyles[status];
  const StatusIcon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <StatusIcon size={13} />
      {config.label}
    </span>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="break-all text-right text-sm font-semibold text-gray-800">
      {value}
    </span>
  </div>
);

export default MyOrders;