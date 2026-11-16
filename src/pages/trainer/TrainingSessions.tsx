import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Clock3,
  ClipboardList,
  Plus,
  Search,
  X,
  PawPrint,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getTrainerDashboard,
  type TrainerDashboardData,
} from "../../service/dashboard";

import {
  getMyTrainingSessions,
  createTrainingSession,
} from "../../service/training-session.service";

import type {
  TrainingSession,
  CreateTrainingSessionPayload,
} from "../../types/training-session.types";

type Booking = TrainerDashboardData["assignedBookings"][number];

const getLocalDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const formatDate = (date: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "APPROVED":
      return "bg-violet-50 text-violet-700 border-violet-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const TrainingSessions = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedBookingId, setSelectedBookingId] = useState("");

  const [formData, setFormData] = useState<CreateTrainingSessionPayload>({
    bookingId: "",
    sessionDate: getLocalDateTime(),
    durationMinutes: 60,
    activities: "",
    petCondition: "",
    progressPercentage: 0,
    trainerNotes: "",
    nextSessionPlan: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [dashboardData, sessionData] = await Promise.all([
        getTrainerDashboard(),
        getMyTrainingSessions(),
      ]);

      setBookings(dashboardData.assignedBookings || []);
      setSessions(sessionData || []);
    } catch (error) {
      console.error("Training sessions loading error:", error);
      setErrorMessage(
        "Unable to load training sessions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Only approved and in-progress bookings can receive sessions.
  const eligibleBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "APPROVED" ||
          booking.status === "IN_PROGRESS"
      ),
    [bookings]
  );

  const selectedBooking = eligibleBookings.find(
    (booking) => booking.bookingId === selectedBookingId
  );

  const filteredSessions = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return sessions;

    return sessions.filter((session) => {
      const booking = bookings.find(
        (item) => item.bookingId === session.bookingId
      );

      return (
        session.sessionId.toLowerCase().includes(search) ||
        session.bookingId.toLowerCase().includes(search) ||
        session.activities.toLowerCase().includes(search) ||
        session.petCondition.toLowerCase().includes(search) ||
        (booking?.petName || "").toLowerCase().includes(search)
      );
    });
  }, [sessions, bookings, searchTerm]);

  const totalMinutes = sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0
  );

  const averageProgress =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (total, session) => total + session.progressPercentage,
            0
          ) / sessions.length
        )
      : 0;

  const completedSessions = sessions.filter(
    (session) => session.progressPercentage === 100
  ).length;

  const openModal = () => {
    setFormData({
      bookingId: "",
      sessionDate: getLocalDateTime(),
      durationMinutes: 60,
      activities: "",
      petCondition: "",
      progressPercentage: 0,
      trainerNotes: "",
      nextSessionPlan: "",
    });

    setSelectedBookingId("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setErrorMessage("");
  };

  const handleBookingChange = (bookingId: string) => {
    setSelectedBookingId(bookingId);

    setFormData((previous) => ({
      ...previous,
      bookingId,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.bookingId) {
      setErrorMessage("Please select a booking.");
      return;
    }

    if (!formData.sessionDate) {
      setErrorMessage("Please select the session date and time.");
      return;
    }

    if (!formData.activities.trim()) {
      setErrorMessage("Please enter the training activities.");
      return;
    }

    if (!formData.petCondition.trim()) {
      setErrorMessage("Please enter the pet's current condition.");
      return;
    }

    if (
      !Number.isInteger(Number(formData.durationMinutes)) ||
      Number(formData.durationMinutes) < 1 ||
      Number(formData.durationMinutes) > 1440
    ) {
      setErrorMessage("Duration must be between 1 and 1440 minutes.");
      return;
    }

    if (
      Number(formData.progressPercentage) < 0 ||
      Number(formData.progressPercentage) > 100
    ) {
      setErrorMessage("Progress must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);

      await createTrainingSession({
        ...formData,
        durationMinutes: Number(formData.durationMinutes),
        progressPercentage: Number(formData.progressPercentage),
      });

      setShowModal(false);
      setSuccessMessage("Training session added successfully.");

      await loadData();
    } catch (error: any) {
      console.error("Training session creation error:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to create training session. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="TRAINER">
      <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
            {/* Page Header */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#18365C] to-[#245B72] p-6 text-white shadow-md sm:p-8">
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-teal-300">
                    <Activity size={17} />
                    PAWPATH TRAINING MANAGEMENT
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Training Sessions
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                    Manage your training activities, record pet progress and
                    review your previous training sessions.
                </p>
                </div>

                <button
                onClick={openModal}
                disabled={eligibleBookings.length === 0}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#269DA3] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#21878C] disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                <Plus size={18} />
                Add Training Session
                </button>
            </div>

            <Activity className="absolute -bottom-8 -right-5 h-40 w-40 text-white/10" />
            </div>

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={19} />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !showModal && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={19} />
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage("")}
                className="ml-auto"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <ClipboardList size={21} />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  All records
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : sessions.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Total Sessions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <Clock3 size={21} />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Combined time
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : totalMinutes}
                <span className="ml-1 text-sm font-medium text-slate-400">
                  min
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Training Duration
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  100% progress
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : completedSessions}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Completed Sessions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <TrendingUp size={21} />
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Average
                </span>
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {loading ? "—" : `${averageProgress}%`}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Recorded Progress
              </p>
            </div>
          </div>

          {/* Booking Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Eligible Training Bookings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Bookings that can receive a new training session.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {eligibleBookings.length} Available
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" size={26} />
              </div>
            ) : eligibleBookings.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <PawPrint className="mx-auto text-slate-300" size={30} />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No eligible bookings available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Approved or in-progress bookings will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {eligibleBookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                          <PawPrint size={20} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {booking.petName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {booking.species} · {booking.breed}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex justify-between gap-2 text-xs">
                        <span className="text-slate-500">Booking ID</span>
                        <span className="font-medium text-slate-700">
                          {booking.bookingId}
                        </span>
                      </div>

                      <div className="flex justify-between gap-2 text-xs">
                        <span className="text-slate-500">Appointment</span>
                        <span className="font-medium text-slate-700">
                          {formatDate(booking.appointmentDate)}
                        </span>
                      </div>

                      <div>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-semibold text-blue-700">
                            {booking.progressPercentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${booking.progressPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session History */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Session History
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review your previously recorded training sessions.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search sessions..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-blue-600" size={28} />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <ClipboardList size={26} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  {searchTerm ? "No matching sessions" : "No sessions recorded yet"}
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  {searchTerm
                    ? "Try searching with another session ID, booking ID or pet name."
                    : "Your training session records will appear here after you add your first session."}
                </p>

                {!searchTerm && eligibleBookings.length > 0 && (
                  <button
                    onClick={openModal}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add First Session
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Session Details</th>
                      <th className="px-6 py-4">Pet / Booking</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Activities</th>
                      <th className="px-6 py-4">Progress</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.map((session) => {
                      const booking = bookings.find(
                        (item) => item.bookingId === session.bookingId
                      );

                      return (
                        <tr
                          key={session.sessionId}
                          className="transition hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {session.sessionId}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {session.bookingId}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-800">
                              {booking?.petName || "Pet"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {booking?.species || "Training booking"}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Clock3 size={15} className="text-slate-400" />
                              {session.durationMinutes} min
                            </div>
                          </td>

                          <td className="max-w-55 px-6 py-4">
                            <p className="truncate text-sm text-slate-700">
                              {session.activities}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {session.petCondition}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="w-28">
                              <div className="mb-1.5 flex justify-between text-xs">
                                <span className="font-semibold text-slate-700">
                                  {session.progressPercentage}%
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{
                                    width: `${session.progressPercentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />
                              {formatDate(session.sessionDate)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredSessions.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredSessions.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {sessions.length}
                  </span>{" "}
                  sessions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Training Session Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <Activity size={16} />
                  Training Management
                </div>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Add Training Session
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Record the activities and progress of a training session.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto px-5 py-5 sm:px-6"
            >
              {errorMessage && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  {errorMessage}
                </div>
              )}

              <div className="space-y-5">

                {/* Booking Selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Training Booking
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <select
                      required
                      value={selectedBookingId}
                      onChange={(event) =>
                        handleBookingChange(event.target.value)
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Choose a booking</option>

                      {eligibleBookings.map((booking) => (
                        <option
                          key={booking.bookingId}
                          value={booking.bookingId}
                        >
                          {booking.bookingId} — {booking.petName} (
                          {booking.status.replace("_", " ")})
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>

                  {selectedBooking && (
                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                          <PawPrint size={21} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {selectedBooking.petName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {selectedBooking.species} ·{" "}
                            {selectedBooking.breed}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-blue-100 pt-3">
                        <div>
                          <p className="text-[11px] text-slate-500">
                            Current Progress
                          </p>
                          <p className="mt-1 text-sm font-bold text-blue-700">
                            {selectedBooking.progressPercentage}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-500">
                            Booking Status
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {selectedBooking.status.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date and Duration */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Session Date & Time
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.sessionDate}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          sessionDate: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Duration (Minutes)
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1440}
                      step={1}
                      value={formData.durationMinutes}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          durationMinutes: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Training Activities
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    value={formData.activities}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        activities: event.target.value,
                      })
                    }
                    placeholder="Describe the activities performed during this session..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {formData.activities.length}/2000
                  </p>
                </div>

                {/* Pet Condition */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Pet's Current Condition
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    maxLength={1000}
                    value={formData.petCondition}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        petCondition: event.target.value,
                      })
                    }
                    placeholder="Describe the pet's behaviour, response and condition..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Progress */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                      Training Progress
                    </label>
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      {formData.progressPercentage}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={formData.progressPercentage}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        progressPercentage: Number(event.target.value),
                      })
                    }
                    className="w-full cursor-pointer accent-blue-600"
                  />

                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>0% — Started</span>
                    <span>100% — Completed</span>
                  </div>
                </div>

                {/* Trainer Notes */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Trainer Notes
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={formData.trainerNotes}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        trainerNotes: event.target.value,
                      })
                    }
                    placeholder="Add any additional observations..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Next Session Plan */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Next Session Plan
                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={formData.nextSessionPlan}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        nextSessionPlan: event.target.value,
                      })
                    }
                    placeholder="Describe what should be covered in the next session..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || eligibleBookings.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving Session...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Save Training Session
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TrainingSessions;
