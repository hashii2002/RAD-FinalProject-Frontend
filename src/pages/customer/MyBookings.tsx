import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  PawPrint,
  Search,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Eye,
  X,
  TrendingUp,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getMyTrainingBookings } from "../../service/customer-training-booking.service";
import { getActiveTrainingPrograms } from "../../service/training-program.service";

import type { TrainingBooking } from "../../types/training-booking.types";
import type { TrainingProgram } from "../../types/training-program.types";

type FilterStatus = "ALL" | TrainingBooking["status"];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  IN_PROGRESS: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const formatDate = (date?: string) => {
  if (!date) return "Not scheduled";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time?: string) => {
  if (!time) return "Not scheduled";

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

function MyBookings() {
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [selectedBooking, setSelectedBooking] =
    useState<TrainingBooking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingData, programData] = await Promise.all([
        getMyTrainingBookings(),
        getActiveTrainingPrograms(),
      ]);

      setBookings(bookingData);
      setPrograms(programData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getProgramName = (programId: string) => {
    return (
      programs.find((program) => program._id === programId)?.name ||
      programId ||
      "Training Program"
    );
  };

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      inProgress: bookings.filter((b) => b.status === "IN_PROGRESS").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingId.toLowerCase().includes(search) ||
        booking.petName.toLowerCase().includes(search) ||
        booking.species.toLowerCase().includes(search) ||
        getProgramName(booking.trainingProgramId).toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter, programs]);

  const stats = [
    {
      title: "Total Bookings",
      value: summary.total,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: summary.pending,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: summary.inProgress,
      icon: TrendingUp,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Approved",
      value: summary.approved,
      icon: CheckCircle2,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">

          {/* Page Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-600">
                <GraduationCap size={17} />
                Training Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Bookings
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage your training bookings and track your pet's progress.
              </p>
            </div>

            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and Filter */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Booking History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View and track all your training requests.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search booking, pet or program..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as FilterStatus)
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking List */}
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
                Unable to load bookings
              </h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                onClick={fetchBookings}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <PawPrint size={30} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {bookings.length === 0
                  ? "No bookings yet"
                  : "No matching bookings"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {bookings.length === 0
                  ? "You haven't made any training bookings yet. Explore our training programs to get started."
                  : "Try changing your search term or selected status filter."}
              </p>

              {bookings.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredBookings.map((booking) => {
                const progress = Math.min(
                  100,
                  Math.max(0, booking.progressPercentage || 0)
                );

                return (
                  <div
                    key={booking.bookingId}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <PawPrint size={23} />
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              {booking.bookingId}
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {booking.petName}
                            </h3>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[booking.status] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {statusLabels[booking.status] || booking.status}
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Training Program
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {getProgramName(booking.trainingProgramId)}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <CalendarDays size={15} />
                            <span className="text-xs">Appointment</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {formatDate(booking.appointmentDate)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock3 size={15} />
                            <span className="text-xs">Time</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            {formatTime(booking.appointmentTime)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">
                            Training Progress
                          </span>
                          <span className="text-sm font-bold text-violet-700">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-violet-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="text-xs text-slate-400">
                          {booking.trainerId
                            ? "Trainer assigned"
                            : "Awaiting trainer assignment"}
                        </div>

                        <button
                          onClick={() => setSelectedBooking(booking)}
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

          {!loading && !error && filteredBookings.length > 0 && (
            <p className="text-center text-sm text-slate-400">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-violet-600">
                  Booking Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedBooking.bookingId}
                </h2>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Pet Name</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {selectedBooking.petName}
                  </h3>
                </div>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    statusStyles[selectedBooking.status]
                  }`}
                >
                  {statusLabels[selectedBooking.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Training Program", getProgramName(selectedBooking.trainingProgramId)],
                  ["Species", selectedBooking.species],
                  ["Breed", selectedBooking.breed],
                  ["Age", `${selectedBooking.ageMonths} months`],
                  ["Appointment Date", formatDate(selectedBooking.appointmentDate)],
                  ["Appointment Time", formatTime(selectedBooking.appointmentTime)],
                  ["Trainer ID", selectedBooking.trainerId || "Not assigned"],
                  ["Booking Created", formatDate(selectedBooking.createdAt)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <p className="text-xs font-medium text-slate-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-800">
                  Initial Pet Condition
                </h4>
                <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
                  {selectedBooking.initialCondition || "No condition details provided."}
                </p>
              </div>

              {selectedBooking.currentCondition && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">
                    Current Pet Condition
                  </h4>
                  <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
                    {selectedBooking.currentCondition}
                  </p>
                </div>
              )}

              <div className="rounded-xl bg-violet-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-800">
                    <TrendingUp size={18} />
                    <span className="text-sm font-semibold">
                      Training Progress
                    </span>
                  </div>
                  <span className="text-lg font-bold text-violet-800">
                    {Math.min(
                      100,
                      Math.max(0, selectedBooking.progressPercentage || 0)
                    )}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, selectedBooking.progressPercentage || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
                {selectedBooking.status === "COMPLETED" ? (
                  <CheckCircle2 className="mt-0.5 text-emerald-600" size={20} />
                ) : selectedBooking.status === "REJECTED" ? (
                  <XCircle className="mt-0.5 text-red-600" size={20} />
                ) : selectedBooking.status === "PENDING" ? (
                  <Clock3 className="mt-0.5 text-amber-600" size={20} />
                ) : (
                  <UserRound className="mt-0.5 text-violet-600" size={20} />
                )}

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedBooking.status === "PENDING"
                      ? "Booking awaiting approval"
                      : selectedBooking.status === "REJECTED"
                      ? "Booking was rejected"
                      : selectedBooking.status === "COMPLETED"
                      ? "Training completed"
                      : selectedBooking.status === "IN_PROGRESS"
                      ? "Training is in progress"
                      : "Booking status updated"}
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {selectedBooking.status === "PENDING"
                      ? "Your booking request is waiting for administrator approval."
                      : selectedBooking.status === "REJECTED"
                      ? "Please contact the PawPath team if you need more information."
                      : selectedBooking.status === "COMPLETED"
                      ? "Your pet has completed this training program."
                      : "You can monitor your pet's training progress here."}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedBooking(null)}
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

export default MyBookings;
