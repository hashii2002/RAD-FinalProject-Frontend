import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  UserRound,
  Clock,
  PawPrint,
  GraduationCap,
  Users,
  ClipboardList,
  X,
  AlertCircle,
  Loader2,
  Filter,
  Plus,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import api from "../../service/api";

import {
  getAllTrainingBookings,
  approveTrainingBooking,
  rejectTrainingBooking,
  assignTrainingTrainer,
  getAllBookingUsers,
} from "../../service/training-booking.service";

import type {
  TrainingBooking,
  TrainingBookingStatus,
  TrainingBookingUser,
} from "../../types/training-booking.types";

interface TrainingProgramOption {
  _id: string;
  name: string;
  animalType: string;
  status: "ACTIVE" | "INACTIVE";
}

interface AdminBookingForm {
  customerId: string;
  trainingProgramId: string;
  petName: string;
  species: string;
  breed: string;
  ageMonths: number;
  initialCondition: string;
  appointmentDate: string;
  appointmentTime: string;
}

const statusStyles: Record<TrainingBookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  IN_PROGRESS: "bg-teal-50 text-teal-700 border-teal-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusLabels: Record<TrainingBookingStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return response?.data?.message || "Something went wrong.";
  }

  return "Unable to complete the request. Please try again.";
};

const initialBookingForm: AdminBookingForm = {
  customerId: "",
  trainingProgramId: "",
  petName: "",
  species: "",
  breed: "",
  ageMonths: 0,
  initialCondition: "",
  appointmentDate: "",
  appointmentTime: "",
};

const TrainingBookings = () => {
  // Booking Data
  const [bookings, setBookings] = useState<TrainingBooking[]>([]);

  // User Data
  const [trainers, setTrainers] = useState<TrainingBookingUser[]>([]);
  const [customers, setCustomers] = useState<TrainingBookingUser[]>([]);

  // Training Programs
  const [programs, setPrograms] = useState<TrainingProgramOption[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Error States
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Booking Details Modal
  const [selectedBooking, setSelectedBooking] =
    useState<TrainingBooking | null>(null);

  // Trainer Assignment Modal
  const [assignBooking, setAssignBooking] =
    useState<TrainingBooking | null>(null);

  const [selectedTrainerId, setSelectedTrainerId] = useState("");

  const [updatingBookingId, setUpdatingBookingId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Add Booking Modal
  const [showAddModal, setShowAddModal] = useState(false);

  const [creatingBooking, setCreatingBooking] = useState(false);
  const [createError, setCreateError] = useState("");

  const [bookingForm, setBookingForm] =
    useState<AdminBookingForm>(initialBookingForm);

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setPageError("");

      const [bookingData, userData, programResponse] =
        await Promise.all([
          getAllTrainingBookings(),
          getAllBookingUsers(),
          api.get("/training-programs"),
        ]);

      const programData: TrainingProgramOption[] =
        programResponse.data.data;

      setBookings(bookingData);

      setTrainers(
        userData.filter(
          (user) => user.role === "TRAINER" && user.isActive
        )
      );

      setCustomers(
        userData.filter(
          (user) => user.role === "CUSTOMER" && user.isActive
        )
      );

      setPrograms(
        programData.filter(
          (program) => program.status === "ACTIVE"
        )
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Search 

  const filteredBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        booking.bookingId.toLowerCase().includes(search) ||
        booking.customerId.toLowerCase().includes(search) ||
        booking.petName.toLowerCase().includes(search) ||
        booking.species.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  // Summary Counts

  const summary = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      inProgress: bookings.filter((b) => b.status === "IN_PROGRESS").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
    }),
    [bookings]
  );

  // Get Trainer Name
  const getTrainerName = (trainerId?: string) => {
    if (!trainerId) return "Not assigned";

    const trainer = trainers.find(
      (item) => item.userId === trainerId
    );

    return trainer ? trainer.name : trainerId;
  };

  // Approve Booking

  const handleApprove = async (booking: TrainingBooking) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve booking ${booking.bookingId}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingBookingId(booking.bookingId);
      setActionError("");

      const updatedBooking = await approveTrainingBooking(
        booking.bookingId
      );

      setBookings((current) =>
        current.map((item) =>
          item.bookingId === booking.bookingId
            ? updatedBooking
            : item
        )
      );

      setSelectedBooking((current) =>
        current?.bookingId === booking.bookingId
          ? updatedBooking
          : current
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setUpdatingBookingId("");
    }
  };

  // Reject Booking

  const handleReject = async (booking: TrainingBooking) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject booking ${booking.bookingId}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingBookingId(booking.bookingId);
      setActionError("");

      const updatedBooking = await rejectTrainingBooking(
        booking.bookingId
      );

      setBookings((current) =>
        current.map((item) =>
          item.bookingId === booking.bookingId
            ? updatedBooking
            : item
        )
      );

      setSelectedBooking((current) =>
        current?.bookingId === booking.bookingId
          ? updatedBooking
          : current
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setUpdatingBookingId("");
    }
  };

  // Open Trainer Assignment Modal

  const openAssignModal = (booking: TrainingBooking) => {
    setAssignBooking(booking);
    setSelectedTrainerId(booking.trainerId || "");
    setActionError("");
  };

  // Assign Trainer
  const handleAssignTrainer = async () => {
    if (!assignBooking || !selectedTrainerId) {
      setActionError("Please select a trainer.");
      return;
    }

    try {
      setAssigning(true);
      setActionError("");

      const updatedBooking = await assignTrainingTrainer(
        assignBooking.bookingId,
        selectedTrainerId
      );

      setBookings((current) =>
        current.map((item) =>
          item.bookingId === assignBooking.bookingId
            ? updatedBooking
            : item
        )
      );

      setSelectedBooking((current) =>
        current?.bookingId === assignBooking.bookingId
          ? updatedBooking
          : current
      );

      setAssignBooking(null);
      setSelectedTrainerId("");
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setAssigning(false);
    }
  };


  const resetBookingForm = () => {
    setBookingForm(initialBookingForm);
    setCreateError("");
  };

  // Create Booking - Admin

  const handleCreateBooking = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setCreateError("");

    if (!bookingForm.customerId) {
      setCreateError("Please select a customer.");
      return;
    }

    if (!bookingForm.trainingProgramId) {
      setCreateError("Please select a training program.");
      return;
    }

    if (
      !bookingForm.petName.trim() ||
      !bookingForm.species.trim() ||
      !bookingForm.breed.trim() ||
      !bookingForm.initialCondition.trim()
    ) {
      setCreateError("Please complete all required pet details.");
      return;
    }

    if (
      !Number.isInteger(bookingForm.ageMonths) ||
      bookingForm.ageMonths < 0 ||
      bookingForm.ageMonths > 1200
    ) {
      setCreateError("Please enter a valid pet age.");
      return;
    }

    if (!bookingForm.appointmentDate || !bookingForm.appointmentTime) {
      setCreateError("Please select an appointment date and time.");
      return;
    }

    if (bookingForm.appointmentDate < getTodayDate()) {
      setCreateError("Appointment date cannot be in the past.");
      return;
    }

    try {
      setCreatingBooking(true);

      const response = await api.post(
        "/training-bookings/admin",
        {
          ...bookingForm,
          petName: bookingForm.petName.trim(),
          species: bookingForm.species.trim(),
          breed: bookingForm.breed.trim(),
          initialCondition: bookingForm.initialCondition.trim(),
        }
      );

      const newBooking: TrainingBooking = response.data.data;

      setBookings((current) => [newBooking, ...current]);

      setShowAddModal(false);
      resetBookingForm();

      setSearchTerm("");
      setStatusFilter("ALL");
    } catch (error) {
      setCreateError(getErrorMessage(error));
    } finally {
      setCreatingBooking(false);
    }
  };

  const renderStatus = (status: TrainingBookingStatus) => (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">

        {/* Page Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-[#18365C]">
                Training Bookings
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#18365C] sm:text-3xl">
              Training Bookings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer training requests and trainer assignments.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* Add Booking Button */}

            <button
              onClick={() => {
                resetBookingForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#18365C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102844]"
            >
              <Plus size={17} />
              Add Booking
            </button>

            {/* Refresh Button */}

            <button
              onClick={() => void loadData(false)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#18365C] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Error */}

        {pageError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="flex-1">{pageError}</div>

            <button
              onClick={() => void loadData()}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary Cards */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Bookings"
            value={summary.total}
            icon={<ClipboardList size={21} />}
            iconClass="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            title="Pending"
            value={summary.pending}
            icon={<Clock size={21} />}
            iconClass="bg-amber-50 text-amber-700"
          />

          <SummaryCard
            title="Approved"
            value={summary.approved}
            icon={<CheckCircle size={21} />}
            iconClass="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            title="In Progress"
            value={summary.inProgress}
            icon={<GraduationCap size={21} />}
            iconClass="bg-teal-50 text-teal-700"
          />

          <SummaryCard
            title="Completed"
            value={summary.completed}
            icon={<Users size={21} />}
            iconClass="bg-emerald-50 text-emerald-700"
          />
        </div>

        {/* Bookings Table */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}

          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-bold text-[#18365C]">
                  All Training Bookings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  View, approve, reject and assign trainers to bookings.
                </p>
              </div>

              {/* Search and Filter */}

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search booking, customer or pet..."
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10 sm:w-72"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-[#269DA3] sm:w-44"
                  >
                    <option value="ALL">All Statuses</option>

                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Error */}

          {actionError && (
            <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />

              <span>{actionError}</span>

              <button
                onClick={() => setActionError("")}
                className="ml-auto"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Table Loading */}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 size={21} className="animate-spin" />
              Loading training bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                <ClipboardList size={28} />
              </div>

              <h3 className="font-semibold text-[#18365C]">
                No bookings found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {bookings.length === 0
                  ? "There are no training bookings yet."
                  : "Try changing your search or status filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-262.5 text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4 font-semibold">Booking</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Pet Details</th>
                    <th className="px-5 py-4 font-semibold">Appointment</th>
                    <th className="px-5 py-4 font-semibold">Trainer</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#18365C]">
                          {booking.bookingId}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(booking.createdAt)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {booking.customerId}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Customer ID
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {booking.petName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {booking.species} · {booking.breed}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDate(booking.appointmentDate)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {booking.appointmentTime}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {getTrainerName(booking.trainerId)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {renderStatus(booking.status)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">

                          {/* View Details */}

                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setActionError("");
                            }}
                            title="View booking details"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Approve and Reject */}

                          {booking.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => void handleApprove(booking)}
                                disabled={
                                  updatingBookingId === booking.bookingId
                                }
                                title="Approve booking"
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {updatingBookingId === booking.bookingId ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </button>

                              <button
                                onClick={() => void handleReject(booking)}
                                disabled={
                                  updatingBookingId === booking.bookingId
                                }
                                title="Reject booking"
                                className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                          {/* Assign Trainer */}

                          {(booking.status === "APPROVED" ||
                            booking.status === "IN_PROGRESS") && (
                            <button
                              onClick={() => openAssignModal(booking)}
                              title="Assign trainer"
                              className="rounded-lg border border-teal-200 p-2 text-teal-700 transition hover:bg-teal-50"
                            >
                              <UserRound size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}

          {!loading && filteredBookings.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          ADD TRAINING BOOKING MODAL
      ================================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  Add Training Booking
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a training booking for a customer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetBookingForm();
                }}
                disabled={creatingBooking}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateBooking}
              className="space-y-6 p-6"
            >

              {/* Customer and Program */}

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[#18365C]">
                  <Users size={18} />
                  Customer & Training Program
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Customer */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Select Customer *
                    </label>

                    <select
                      required
                      value={bookingForm.customerId}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          customerId: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                    >
                      <option value="">Choose customer</option>

                      {customers.map((customer) => (
                        <option
                          key={customer.userId}
                          value={customer.userId}
                        >
                          {customer.name} ({customer.userId})
                        </option>
                      ))}
                    </select>

                    {customers.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        No active customers available.
                      </p>
                    )}
                  </div>

                  {/* Training Program */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Training Program *
                    </label>

                    <select
                      required
                      value={bookingForm.trainingProgramId}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          trainingProgramId: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                    >
                      <option value="">Choose program</option>

                      {programs.map((program) => (
                        <option
                          key={program._id}
                          value={program._id}
                        >
                          {program.name} ({program.animalType})
                        </option>
                      ))}
                    </select>

                    {programs.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">
                        No active training programs available.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pet Information */}

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[#18365C]">
                  <PawPrint size={18} />
                  Pet Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Pet Name */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Pet Name *
                    </label>

                    <input
                      required
                      type="text"
                      maxLength={50}
                      value={bookingForm.petName}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          petName: e.target.value,
                        }))
                      }
                      placeholder="Enter pet name"
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                    />
                  </div>

                  {/* Species */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Species *
                    </label>

                    <input
                      required
                      type="text"
                      maxLength={50}
                      value={bookingForm.species}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          species: e.target.value,
                        }))
                      }
                      placeholder="e.g. Dog, Cat"
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                    />
                  </div>

                  {/* Breed */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Breed *
                    </label>

                    <input
                      required
                      type="text"
                      maxLength={50}
                      value={bookingForm.breed}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                      placeholder="Enter breed"
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                    />
                  </div>

                  {/* Age */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Age (Months) *
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      max="1200"
                      step="1"
                      value={bookingForm.ageMonths}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          ageMonths:
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                    />
                  </div>
                </div>

                {/* Initial Condition */}

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Initial Condition *
                  </label>

                  <textarea
                    required
                    rows={3}
                    maxLength={1000}
                    value={bookingForm.initialCondition}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        initialCondition: e.target.value,
                      }))
                    }
                    placeholder="Describe the pet's current condition and training requirements..."
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                  />
                </div>
              </div>

              {/* Appointment Information */}

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[#18365C]">
                  <Clock size={18} />
                  Appointment Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Appointment Date */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Appointment Date *
                    </label>

                    <input
                      required
                      type="date"
                      min={getTodayDate()}
                      value={bookingForm.appointmentDate}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          appointmentDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                    />
                  </div>

                  {/* Appointment Time */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Appointment Time *
                    </label>

                    <input
                      required
                      type="time"
                      value={bookingForm.appointmentTime}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          appointmentTime: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#269DA3]"
                    />
                  </div>
                </div>
              </div>

              {/* Create Error */}

              {createError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Modal Buttons */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetBookingForm();
                  }}
                  disabled={creatingBooking}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creatingBooking ||
                    customers.length === 0 ||
                    programs.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#18365C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102844] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingBooking ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          BOOKING DETAILS MODAL
      ================================================= */}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  Booking Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedBooking.bookingId}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">

              {/* Status */}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">
                  Booking Status
                </span>

                {renderStatus(selectedBooking.status)}
              </div>

              {/* Pet Information */}

              <DetailSection
                title="Pet Information"
                icon={<PawPrint size={18} />}
              >
                <DetailItem
                  label="Pet Name"
                  value={selectedBooking.petName}
                />

                <DetailItem
                  label="Species"
                  value={selectedBooking.species}
                />

                <DetailItem
                  label="Breed"
                  value={selectedBooking.breed}
                />

                <DetailItem
                  label="Age"
                  value={`${selectedBooking.ageMonths} months`}
                />
              </DetailSection>

              {/* Booking Information */}

              <DetailSection
                title="Booking Information"
                icon={<ClipboardList size={18} />}
              >
                <DetailItem
                  label="Customer ID"
                  value={selectedBooking.customerId}
                />

                <DetailItem
                  label="Training Program ID"
                  value={selectedBooking.trainingProgramId}
                />

                <DetailItem
                  label="Appointment Date"
                  value={formatDate(selectedBooking.appointmentDate)}
                />

                <DetailItem
                  label="Appointment Time"
                  value={selectedBooking.appointmentTime}
                />

                <DetailItem
                  label="Initial Condition"
                  value={selectedBooking.initialCondition}
                />
              </DetailSection>

              {/* Training Progress */}

              <DetailSection
                title="Training Progress"
                icon={<GraduationCap size={18} />}
              >
                <DetailItem
                  label="Assigned Trainer"
                  value={getTrainerName(selectedBooking.trainerId)}
                />

                <DetailItem
                  label="Start Date"
                  value={formatDate(selectedBooking.startDate)}
                />

                <DetailItem
                  label="Expected End Date"
                  value={formatDate(selectedBooking.expectedEndDate)}
                />

                <DetailItem
                  label="Actual End Date"
                  value={formatDate(selectedBooking.actualEndDate)}
                />

                {/* Progress Bar */}

                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      Completion
                    </span>

                    <span className="font-bold text-[#18365C]">
                      {selectedBooking.progressPercentage || 0}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#269DA3] transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            selectedBooking.progressPercentage || 0
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Current Condition */}

                <div className="sm:col-span-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Condition
                  </p>

                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {selectedBooking.currentCondition ||
                      "No progress update yet."}
                  </p>
                </div>
              </DetailSection>

              {/* Approve and Reject */}

              {selectedBooking.status === "PENDING" && (
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                  <button
                    onClick={() => void handleApprove(selectedBooking)}
                    disabled={
                      updatingBookingId === selectedBooking.bookingId
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle size={17} />
                    Approve Booking
                  </button>

                  <button
                    onClick={() => void handleReject(selectedBooking)}
                    disabled={
                      updatingBookingId === selectedBooking.bookingId
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={17} />
                    Reject Booking
                  </button>
                </div>
              )}

              {/* Assign Trainer */}

              {(selectedBooking.status === "APPROVED" ||
                selectedBooking.status === "IN_PROGRESS") && (
                <button
                  onClick={() => openAssignModal(selectedBooking)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#18365C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102844]"
                >
                  <UserRound size={17} />
                  Assign Trainer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          ASSIGN TRAINER MODAL
      ================================================= */}

      {assignBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  Assign Trainer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Booking: {assignBooking.bookingId}
                </p>
              </div>

              <button
                onClick={() => setAssignBooking(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select Active Trainer
            </label>

            <select
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
            >
              <option value="">Choose a trainer</option>

              {trainers.map((trainer) => (
                <option key={trainer.userId} value={trainer.userId}>
                  {trainer.name} ({trainer.userId})
                </option>
              ))}
            </select>

            {trainers.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                No active trainers are currently available.
              </p>
            )}

            {actionError && (
              <p className="mt-3 text-sm text-red-600">
                {actionError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setAssignBooking(null)}
                disabled={assigning}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() => void handleAssignTrainer()}
                disabled={assigning || !selectedTrainerId}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#18365C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102844] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Trainer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

// --------------------------------------------------
// Summary Card Component
// --------------------------------------------------

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
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-2xl font-bold text-[#18365C]">
          {value}
        </p>
      </div>

      <div className={`rounded-xl p-3 ${iconClass}`}>
        {icon}
      </div>
    </div>
  </div>
);

// --------------------------------------------------
// Details Section Component
// --------------------------------------------------

interface DetailSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

const DetailSection = ({
  title,
  icon,
  children,
}: DetailSectionProps) => (
  <section>
    <div className="mb-3 flex items-center gap-2 text-[#18365C]">
      {icon}
      <h3 className="font-bold">{title}</h3>
    </div>

    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
      {children}
    </div>
  </section>
);

// --------------------------------------------------
// Details Item Component
// --------------------------------------------------

interface DetailItemProps {
  label: string;
  value: string;
}

const DetailItem = ({
  label,
  value,
}: DetailItemProps) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="wrap-break-word text-sm font-medium text-slate-700">
      {value || "Not available"}
    </p>
  </div>
);

export default TrainingBookings;
