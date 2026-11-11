import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  TrendingUp,
  PawPrint,
  AlertCircle,
  ClipboardList,
  BookOpen,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getTrainerDashboard, type TrainerDashboardData,} from "../../service/dashboard";

const formatDate = (date: string) => {
  if (!date) return "Not scheduled";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "bg-blue-100 text-blue-700";

    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-700";

    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700";

    case "PENDING":
      return "bg-orange-100 text-orange-700";

    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const formatStatus = (status: string) => {
  return status.replaceAll("_", " ");
};

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  iconStyle: string;
}

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconStyle,
}: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-3 text-3xl font-bold text-slate-800">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
};

// ===================== Main Trainer Dashboard =====================

const TrainerDashboard = () => {
  const [dashboardData, setDashboardData] =
    useState<TrainerDashboardData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getTrainerDashboard();

      setDashboardData(data);
    } catch (err: unknown) {
      console.error("Trainer dashboard error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to load dashboard information.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  // ===================== Loading State =====================

  if (isLoading) {
    return (
      <DashboardLayout role="TRAINER">
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-600" />

          <p className="mt-5 font-semibold text-slate-700">
            Loading Trainer Dashboard...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we load your training information.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ===================== Error State =====================

  if (error || !dashboardData) {
    return (
      <DashboardLayout role="TRAINER">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="text-red-500" size={28} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Unable to Load Dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "Dashboard information is currently unavailable."}
            </p>

            <button
              onClick={() => void fetchDashboardData()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ===================== Dashboard Data =====================

  const { trainer, summary } = dashboardData;

  const bookingChartData = [
    { name: "Pending", bookings: summary.bookings.pending },
    { name: "Approved", bookings: summary.bookings.approved },
    { name: "In Progress", bookings: summary.bookings.inProgress },
    { name: "Completed", bookings: summary.bookings.completed },
    { name: "Rejected", bookings: summary.bookings.rejected },
    { name: "Cancelled", bookings: summary.bookings.cancelled },
  ];

  return (
    <DashboardLayout role="TRAINER">
      <div className="space-y-8">

        {/* ===================== Welcome Section ===================== */}

        <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#142B45] to-[#20566A] p-6 text-white shadow-lg sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-teal-200">
                TRAINER WORKSPACE
              </p>

              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                Welcome back, {trainer.name}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
                Manage your assigned training programs, monitor pet
                progress, and keep track of your daily appointments.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-200">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  {trainer.userId}
                </span>

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  Professional Trainer
                </span>
              </div>
            </div>

            <div className="hidden h-28 w-28 items-center justify-center rounded-2xl bg-white/10 sm:flex">
              <PawPrint size={65} className="text-teal-200" />
            </div>
          </div>

          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full border-25 border-white/5" />
          <div className="absolute -bottom-20 right-40 h-44 w-44 rounded-full border-20 border-white/5" />
        </section>

        {/* ===================== Statistics Cards ===================== */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              Training Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A quick overview of your training activities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Assigned Bookings"
              value={summary.bookings.total}
              description="Total assigned training bookings"
              icon={ClipboardList}
              iconStyle="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Today's Appointments"
              value={summary.todayAppointments}
              description="Appointments scheduled for today"
              icon={CalendarDays}
              iconStyle="bg-teal-50 text-teal-600"
            />

            <StatCard
              title="Completed Sessions"
              value={summary.sessions.total}
              description="Total training sessions recorded"
              icon={CheckCircle2}
              iconStyle="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Average Progress"
              value={`${Math.round(summary.sessions.averageProgress)}%`}
              description="Average progress of your sessions"
              icon={TrendingUp}
              iconStyle="bg-orange-50 text-orange-600"
            />
          </div>
        </section>

        {/* ===================== Charts & Session Summary ===================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Booking Status Chart */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Booking Status Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your assigned bookings by current status.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bookingChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                  />

                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#269DA3"
                    radius={[7, 7, 0, 0]}
                    barSize={35}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Training Summary */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">
              Training Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your overall training performance.
            </p>

            <div className="mt-6 space-y-5">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                    <Users size={19} />
                  </div>

                  <span className="text-sm text-slate-600">
                    Total Bookings
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {summary.bookings.total}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-50 p-2.5 text-teal-600">
                    <Activity size={19} />
                  </div>

                  <span className="text-sm text-slate-600">
                    Training Sessions
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {summary.sessions.total}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-50 p-2.5 text-orange-600">
                    <Clock size={19} />
                  </div>

                  <span className="text-sm text-slate-600">
                    Training Hours
                  </span>
                </div>

                <span className="font-bold text-slate-800">
                  {(summary.sessions.totalTrainingMinutes / 60).toFixed(1)}h
                </span>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Average Progress
                  </span>

                  <span className="text-sm font-bold text-teal-700">
                    {Math.round(summary.sessions.averageProgress)}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, summary.sessions.averageProgress)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== Today's Appointments ===================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Today's Appointments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pets scheduled for training today.
              </p>
            </div>

            <span className="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
              {dashboardData.todayAppointments.length} Appointments
            </span>
          </div>

          {dashboardData.todayAppointments.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays
                size={35}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-700">
                No appointments scheduled for today.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Your upcoming appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-187.5 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Booking ID</th>
                    <th className="px-5 py-4">Pet</th>
                    <th className="px-5 py-4">Appointment Time</th>
                    <th className="px-5 py-4">Progress</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {dashboardData.todayAppointments.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-teal-700">
                        {booking.bookingId}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {booking.petName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {booking.species} · {booking.breed}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {booking.appointmentTime}
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {booking.progressPercentage}%
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                            booking.status
                          )}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===================== Assigned Bookings ===================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-800">
              My Assigned Bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Training bookings assigned to you.
            </p>
          </div>

          {dashboardData.assignedBookings.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen
                size={35}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-700">
                No assigned bookings found.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                New assigned bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Booking ID</th>
                    <th className="px-5 py-4">Pet Details</th>
                    <th className="px-5 py-4">Appointment Date</th>
                    <th className="px-5 py-4">Progress</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {dashboardData.assignedBookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-teal-700">
                        {booking.bookingId}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {booking.petName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {booking.species} · {booking.breed}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(booking.appointmentDate)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, booking.progressPercentage)
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-semibold text-slate-600">
                            {booking.progressPercentage}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                            booking.status
                          )}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ===================== Recent Training Sessions ===================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recent Training Sessions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest recorded training activities.
              </p>
            </div>

            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <Activity size={22} />
            </div>
          </div>

          {dashboardData.trainingSessions.length === 0 ? (
            <div className="py-8 text-center">
              <ClipboardList
                size={35}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No training sessions recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.trainingSessions
                .slice(0, 5)
                .map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-teal-200 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                        <PawPrint size={20} />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {session.sessionId}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Booking: {session.bookingId}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {session.activities || "No activity details"}
                        </p>

                        {session.trainerNotes && (
                          <p className="mt-1 text-xs text-slate-500">
                            Notes: {session.trainerNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 sm:justify-end">
                      <span>
                        {formatDate(session.sessionDate)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {session.durationMinutes} min
                      </span>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                        {session.progressPercentage}% Progress
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* ===================== Footer Note ===================== */}

        <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
          <CheckCircle2 size={19} className="shrink-0" />

          <p>
            Keep your training records updated to monitor each pet's
            development and provide better training services.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
