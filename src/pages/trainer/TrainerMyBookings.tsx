import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock3,
  PawPrint,
  Eye,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpRight,
  Filter,
  ChevronDown,
  UserRound,
  GraduationCap,
  Activity,
  CalendarCheck,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getTrainerDashboard,
  type TrainerDashboardData,
} from "../../service/dashboard";

type TrainerBooking = TrainerDashboardData["assignedBookings"][number];

const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

const formatDate = (date: string) => {
  if (!date) return "Not scheduled";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 60) return "bg-blue-500";
  if (progress >= 30) return "bg-violet-500";
  return "bg-amber-500";
};

const MyBookings = () => {
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] =
    useState<TrainerBooking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTrainerDashboard();
      setBookings(response.assignedBookings || []);
    } catch (err: any) {
      console.error("Failed to load bookings:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong while loading your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        booking.bookingId.toLowerCase().includes(search) ||
        booking.petName.toLowerCase().includes(search) ||
        booking.species.toLowerCase().includes(search) ||
        booking.breed.toLowerCase().includes(search) ||
        booking.customerId.toLowerCase().includes(search) ||
        booking.trainingProgramId.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const summary = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    active: bookings.filter((b) => b.status === "IN_PROGRESS").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  return (
    <DashboardLayout role="TRAINER">
      <div className="min-h-screen space-y-7 bg-[#f8fafc] pb-8">
        {/* Page Header */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#18365C] via-[#1D4964] to-[#269DA3] px-6 py-8 shadow-lg sm:px-8">
          <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-100">
                <Sparkles size={14} />
                Trainer Workspace
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                My Bookings
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50/80">
                Manage your assigned training bookings, monitor pet
                progress, and stay on top of your upcoming appointments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-teal-100/80">Total assigned</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {summary.total}
                </p>
              </div>

              <button
                onClick={fetchBookings}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#18365C] shadow-sm transition hover:bg-teal-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Bookings"
            value={summary.total}
            subtitle="All assigned bookings"
            icon={<ClipboardList size={21} />}
            iconBg="bg-blue-50 text-blue-600"
            accent="border-l-blue-500"
          />

          <SummaryCard
            title="Pending Bookings"
            value={summary.pending}
            subtitle="Waiting for action"
            icon={<Clock3 size={21} />}
            iconBg="bg-amber-50 text-amber-600"
            accent="border-l-amber-500"
          />

          <SummaryCard
            title="In Progress"
            value={summary.active}
            subtitle="Currently training"
            icon={<Activity size={21} />}
            iconBg="bg-violet-50 text-violet-600"
            accent="border-l-violet-500"
          />

          <SummaryCard
            title="Completed"
            value={summary.completed}
            subtitle="Successfully completed"
            icon={<CheckCircle2 size={21} />}
            iconBg="bg-emerald-50 text-emerald-600"
            accent="border-l-emerald-500"
          />

        </div>

        {/* Booking Management */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

          {/* Section Heading */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <CalendarCheck size={19} />
                </div>

                <h2 className="text-lg font-bold text-slate-800">
                  Booking Management
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                View and track all your assigned training bookings.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:self-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live data
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by booking ID, pet or customer..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Filter size={16} />
                <span>Filter:</span>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  onClick={clearFilters}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results Information */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-6">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredBookings.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {bookings.length}
              </span>{" "}
              bookings
            </p>

            <span className="text-xs font-medium text-slate-400">
              Latest assigned records
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>

              <button
                onClick={fetchBookings}
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="rounded-2xl bg-blue-50 p-4">
                <RefreshCw
                  size={27}
                  className="animate-spin text-blue-600"
                />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading bookings...
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Please wait while we fetch your records.
              </p>
            </div>
          ) : !error && filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
              <div className="rounded-2xl bg-slate-100 p-5">
                <CalendarDays size={32} className="text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                {bookings.length === 0
                  ? "No bookings assigned yet"
                  : "No matching bookings"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {bookings.length === 0
                  ? "Your assigned training bookings will appear here once they are available."
                  : "Try changing your search keywords or selecting another booking status."}
              </p>

              {bookings.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-237.5 text-left">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Booking / Pet</th>
                      <th className="px-6 py-4">Training Program</th>
                      <th className="px-6 py-4">Appointment</th>
                      <th className="px-6 py-4">Progress</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.bookingId}
                        className="group transition hover:bg-blue-50/30"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
                              <PawPrint size={21} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {booking.petName}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {booking.bookingId}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {booking.species} · {booking.breed}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <GraduationCap
                              size={17}
                              className="text-slate-400"
                            />
                            <span className="text-sm font-medium text-slate-700">
                              {booking.trainingProgramId}
                            </span>
                          </div>
                          <p className="mt-1 pl-6 text-xs text-slate-400">
                            Customer: {booking.customerId}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CalendarDays
                              size={16}
                              className="text-slate-400"
                            />
                            {formatDate(booking.appointmentDate)}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 size={14} />
                            {booking.appointmentTime}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="w-32">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs text-slate-500">
                                Progress
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {booking.progressPercentage}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(
                                  booking.progressPercentage
                                )}`}
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, booking.progressPercentage)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={booking.status} />
                        </td>

                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={15} />
                            View
                            <ArrowUpRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid grid-cols-1 gap-4 px-5 pb-5 lg:hidden">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                          <PawPrint size={22} />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-800">
                            {booking.petName}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {booking.bookingId}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
                      <div>
                        <p className="text-xs text-slate-400">Appointment</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(booking.appointmentDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.appointmentTime}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Training</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {booking.trainingProgramId}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.species} · {booking.breed}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500">
                          Training Progress
                        </span>
                        <span className="font-bold text-slate-700">
                          {booking.progressPercentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            booking.progressPercentage
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, booking.progressPercentage)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Eye size={16} />
                      View Booking Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

/* ========================= Summary Card ========================= */

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  accent: string;
}

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  accent,
}: SummaryCardProps) => (
  <div
    className={`rounded-2xl border border-slate-200/80 border-l-4 ${accent} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </h3>
        <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className={`rounded-xl p-3 ${iconBg}`}>{icon}</div>
    </div>
  </div>
);

/* ========================= Status Badge ========================= */

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || {
    label: status,
    color: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

/* ========================= Booking Details Modal ========================= */

interface BookingDetailsModalProps {
  booking: TrainerBooking;
  onClose: () => void;
}

const BookingDetailsModal = ({
  booking,
  onClose,
}: BookingDetailsModalProps) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative overflow-hidden bg-linear-to-br from-slate-900 to-blue-950 px-6 py-6 sm:px-8">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

          <div className="relative flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                <ClipboardList size={13} />
                Booking Information
              </span>

              <h2 className="mt-3 text-xl font-bold text-white">
                Booking Details
              </h2>

              <p className="mt-1 text-sm text-blue-100/70">
                Reference: {booking.bookingId}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[65vh] space-y-6 overflow-y-auto p-6 sm:p-8">

          {/* Pet Profile */}
          <div className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
              <PawPrint size={28} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-800">
                {booking.petName}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {booking.species} · {booking.breed}
              </p>
            </div>

            <StatusBadge status={booking.status} />
          </div>

          {/* Booking Information */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <ClipboardList size={17} className="text-blue-600" />
              Booking Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem
                icon={<UserRound size={16} />}
                label="Customer ID"
                value={booking.customerId}
              />

              <DetailItem
                icon={<GraduationCap size={16} />}
                label="Training Program ID"
                value={booking.trainingProgramId}
              />

              <DetailItem
                icon={<CalendarDays size={16} />}
                label="Appointment Date"
                value={formatDate(booking.appointmentDate)}
              />

              <DetailItem
                icon={<Clock3 size={16} />}
                label="Appointment Time"
                value={booking.appointmentTime}
              />

              <DetailItem
                icon={<PawPrint size={16} />}
                label="Pet Species"
                value={booking.species}
              />

              <DetailItem
                icon={<Activity size={16} />}
                label="Pet Breed"
                value={booking.breed}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Training Progress
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Current training completion
                </p>
              </div>

              <span className="text-2xl font-bold text-blue-600">
                {booking.progressPercentage}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor(
                  booking.progressPercentage
                )}`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, booking.progressPercentage)
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Current Booking Status
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Latest assigned booking status
              </p>
            </div>

            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-slate-100 px-6 py-4 sm:px-8">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================= Detail Item ========================= */

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem = ({ icon, label, value }: DetailItemProps) => (
  <div className="flex items-start gap-3">
    <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 wrap-break-word text-sm font-semibold text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  </div>
);

export default MyBookings;
