import { useCallback, useEffect, useState } from "react";
import {
  PawPrint,
  ShoppingBag,
  GraduationCap,
  CreditCard,
  CalendarDays,
  Clock3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  Activity,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import {
  getCustomerDashboard,
} from "../../service/dashboard";

import type {
  CustomerDashboardData,
} from "../../service/dashboard";

const CHART_COLORS = [
  "#14B8A6",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
    case "PAID":
      return "bg-green-50 text-green-700";

    case "PENDING":
    case "PARTIALLY_PAID":
      return "bg-amber-50 text-amber-700";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    case "REJECTED":
    case "CANCELLED":
    case "REFUNDED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const formatStatus = (status: string) =>
  status.replaceAll("_", " ");


const DashboardLoading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-44 rounded-2xl bg-slate-200" />

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 rounded-2xl bg-slate-200"
        />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div className="h-80 rounded-2xl bg-slate-200" />
      <div className="h-80 rounded-2xl bg-slate-200" />
    </div>
  </div>
);


const CustomerDashboard = () => {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<CustomerDashboardData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getCustomerDashboard();

      setDashboardData(data);
    } catch (error: unknown) {
      console.error("Customer dashboard error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load dashboard information.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="mx-auto max-w-7xl space-y-6">
          <DashboardLoading />
        </div>
      </DashboardLayout>
    );
  }

  if (errorMessage || !dashboardData) {
    return (
      <DashboardLayout role="CUSTOMER">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              Unable to Load Dashboard
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {errorMessage ||
                "Something went wrong while retrieving your dashboard data."}
            </p>

            <button
              onClick={fetchDashboard}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245078]"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { customer, summary, orders, trainingBookings, trainingSessions } =
    dashboardData;

  const stats = [
    {
      title: "My Pet Orders",
      value: summary.orders.total,
      description: `${summary.orders.pending} pending orders`,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Training Bookings",
      value: summary.training.total,
      description: `${summary.training.inProgress} in progress`,
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Training Sessions",
      value: summary.training.totalSessions,
      description: "Sessions completed / recorded",
      icon: CalendarDays,
      color: "bg-teal-50 text-teal-600",
    },
    {
      title: "Payment Records",
      value: summary.payments.totalRecords,
      description: `${summary.payments.unpaid} unpaid records`,
      icon: CreditCard,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const orderChartData = [
    { name: "Pending", value: summary.orders.pending },
    { name: "Approved", value: summary.orders.approved },
    { name: "Rejected", value: summary.orders.rejected },
    { name: "Cancelled", value: summary.orders.cancelled },
  ].filter((item) => item.value > 0);

  const trainingChartData = [
    { name: "Pending", value: summary.training.pending },
    { name: "Approved", value: summary.training.approved },
    { name: "In Progress", value: summary.training.inProgress },
    { name: "Completed", value: summary.training.completed },
    { name: "Rejected", value: summary.training.rejected },
    { name: "Cancelled", value: summary.training.cancelled },
  ].filter((item) => item.value > 0);

  const paymentChartData = [
    { name: "Paid", value: summary.payments.paid },
    { name: "Partially Paid", value: summary.payments.partiallyPaid },
    { name: "Unpaid", value: summary.payments.unpaid },
    { name: "Refunded", value: summary.payments.refunded },
  ].filter((item) => item.value > 0);

  const upcomingBookings = [...trainingBookings]
    .filter((booking) =>
      ["APPROVED", "IN_PROGRESS"].includes(booking.status)
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
    )
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const recentSessions = [...trainingSessions]
    .sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() -
        new Date(a.sessionDate).getTime()
    )
    .slice(0, 4);

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* WELCOME SECTION */}

        <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#142B45] to-[#20536A] p-7 text-white shadow-lg sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 text-sm font-semibold tracking-wider text-teal-300">
              PAWPATH CUSTOMER PORTAL
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Welcome back, {customer.name || user?.name || "Customer"}!
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
              Manage your pet orders, training bookings and payments
              from one convenient place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-lg bg-white/10 px-3 py-2">
                Customer ID: {customer.userId}
              </span>

              <span className="rounded-lg bg-white/10 px-3 py-2">
                {customer.email}
              </span>
            </div>
          </div>

          <PawPrint
            className="absolute -right-8 -top-8 h-60 w-60 rotate-12 text-white/5"
            strokeWidth={1}
          />
        </section>

        {/* STATISTICS */}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                My Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your personal PawPath activity summary
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-slate-300"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-1 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* PAYMENT SUMMARY */}

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#18365C] to-[#245D72] p-7 text-white shadow-md">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-3">
                  <Wallet size={23} />
                </div>

                <p className="text-sm font-medium text-slate-200">
                  Total Payments Made
                </p>
              </div>

              <h2 className="mt-7 text-3xl font-bold sm:text-4xl">
                {formatCurrency(summary.payments.totalPaid)}
              </h2>

              <p className="mt-3 text-sm text-slate-300">
                Excludes refunded payment records
              </p>
            </div>

            <TrendingUp className="absolute -bottom-8 -right-5 h-40 w-40 text-white/5" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <CreditCard size={23} />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Outstanding Balance
              </p>
            </div>

            <h2 className="mt-7 text-3xl font-bold text-slate-800 sm:text-4xl">
              {formatCurrency(summary.payments.totalOutstandingBalance)}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{summary.payments.unpaid} Unpaid</span>
              <span>•</span>
              <span>{summary.payments.partiallyPaid} Partially Paid</span>
            </div>
          </div>
        </section>

        {/* ANALYTICS CHARTS */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              My Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Visual summary of your orders, training and payments
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* ORDER CHART */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-800">
                Pet Order Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Distribution of your pet orders by status
              </p>

              {orderChartData.length > 0 ? (
                <div className="mt-5 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {orderChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 flex-col items-center justify-center text-slate-400">
                  <ShoppingBag size={40} />
                  <p className="mt-3 text-sm">
                    No pet orders available yet
                  </p>
                </div>
              )}
            </div>

            {/* TRAINING CHART */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-800">
                Training Booking Overview
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your training booking status distribution
              </p>

              {trainingChartData.length > 0 ? (
                <div className="mt-5 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trainingChartData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        name="Bookings"
                        fill="#269DA3"
                        radius={[6, 6, 0, 0]}
                        barSize={38}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 flex-col items-center justify-center text-slate-400">
                  <GraduationCap size={40} />
                  <p className="mt-3 text-sm">
                    No training bookings available yet
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* PAYMENT ANALYTICS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-800">
            Payment Status Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your payment records by current status
          </p>

          {paymentChartData.length > 0 ? (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paymentChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Payment Records"
                    radius={[6, 6, 0, 0]}
                    barSize={48}
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <CreditCard size={40} />
              <p className="mt-3 text-sm">
                No payment records available yet
              </p>
            </div>
          )}
        </section>

        {/* UPCOMING TRAINING BOOKINGS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                My Training Bookings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your approved and ongoing training appointments
              </p>
            </div>

            <CalendarDays className="text-teal-600" size={22} />
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.bookingId}
                  className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-200"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {booking.petName}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.species} • {booking.breed}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Booking ID: {booking.bookingId}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          {formatDate(booking.appointmentDate)}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock3 size={14} />
                          {booking.appointmentTime}
                        </span>
                      </div>
                    </div>

                    <div className="sm:min-w-40">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                        {formatStatus(booking.status)}
                      </span>

                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Training Progress</span>
                          <span>{booking.progressPercentage}%</span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-teal-500 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, booking.progressPercentage)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <CalendarDays size={38} className="mx-auto" />

              <p className="mt-3 text-sm">
                You don't have any approved training appointments yet.
              </p>
            </div>
          )}
        </section>

        {/* RECENT PET ORDERS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recent Pet Orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your latest pet order requests
              </p>
            </div>

            <ShoppingBag className="text-teal-600" size={22} />
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <th className="px-3 py-3">Order ID</th>
                    <th className="px-3 py-3">Pet ID</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-3 py-4 font-semibold text-slate-700">
                        {order.orderId}
                      </td>

                      <td className="px-3 py-4 text-slate-500">
                        {order.petId}
                      </td>

                      <td className="px-3 py-4 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <ShoppingBag size={38} className="mx-auto" />

              <p className="mt-3 text-sm">
                You haven't placed any pet orders yet.
              </p>
            </div>
          )}
        </section>

        {/* RECENT TRAINING SESSIONS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recent Training Sessions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your pet's training activities
              </p>
            </div>

            <Activity className="text-teal-600" size={22} />
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Session {session.sessionId}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Booking: {session.bookingId}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(session.sessionDate)} • {session.durationMinutes} minutes
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {session.activities}
                    </p>
                  </div>

                  <div className="sm:min-w-36">
                    <span className="text-sm font-semibold text-teal-700">
                      {session.progressPercentage}% Progress
                    </span>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, session.progressPercentage)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <CheckCircle2 size={38} className="mx-auto" />

              <p className="mt-3 text-sm">
                No training sessions have been recorded yet.
              </p>
            </div>
          )}
        </section>

        {/* FOOTER INFORMATION */}

        <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-teal-100 p-3 text-teal-700">
              <PawPrint size={22} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Your PawPath Activity
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your dashboard displays information related to your own
                pet orders, training bookings, training sessions and
                payment records.
              </p>
            </div>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;

