import { useCallback, useEffect, useState } from "react";
import {
  PawPrint,
  ShoppingBag,
  GraduationCap,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Link } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import type { UserRole } from "../../types/auth.types";
import useAuth from "../../hooks/useAuth";

import {
  getAdminDashboard,
  type AdminDashboardData,
} from "../../service/dashboard";

interface DashboardHomeProps {
  role: UserRole;
}

const COLORS = {
  navy: "#18365C",
  teal: "#269DA3",
  orange: "#F39A36",
  purple: "#8B5CF6",
  blue: "#3B82F6",
  red: "#EF4444",
  green: "#16A34A",
  gray: "#94A3B8",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

const DashboardHome = ({ role }: DashboardHomeProps) => {
  const { user } = useAuth();

  const [adminData, setAdminData] =
    useState<AdminDashboardData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    if (role !== "ADMIN") return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getAdminDashboard();

      setAdminData(data);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setErrorMessage(
        "Unable to load dashboard analytics. Please check your backend connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (role === "ADMIN" && isLoading && !adminData) {
    return (
      <DashboardLayout role={role}>
        <div className="flex min-h-[65vh] flex-col items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
          <h2 className="mt-5 text-lg font-semibold text-slate-800">
            Loading Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Fetching your PawPath analytics...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (role === "ADMIN" && errorMessage && !adminData) {
    return (
      <DashboardLayout role={role}>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500" size={45} />

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Dashboard Unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <button
              onClick={fetchDashboard}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#244c76]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (role !== "ADMIN") {
    return (
      <DashboardLayout role={role}>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">
            {role === "TRAINER"
              ? "Welcome back, Trainer!"
              : "Welcome to PawPath!"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Hello {user?.name || "User"}, your dashboard is ready.
            Your live dashboard analytics will be connected next.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!adminData) return null;

  // Chart data 
  const petChartData = [
    { name: "Available", value: adminData.pets.available },
    { name: "Sold", value: adminData.pets.sold },
    { name: "Reserved", value: adminData.pets.reserved },
  ];

  const orderChartData = [
    { name: "Pending", value: adminData.petOrders.pending },
    { name: "Approved", value: adminData.petOrders.approved },
    { name: "Rejected", value: adminData.petOrders.rejected },
  ];

  const trainingChartData = [
    { name: "Pending", value: adminData.trainingBookings.pending },
    { name: "Approved", value: adminData.trainingBookings.approved },
    { name: "In Progress", value: adminData.trainingBookings.inProgress },
    { name: "Completed", value: adminData.trainingBookings.completed },
  ];

  const revenueChartData = [
    {
      name: "Pet Sales",
      revenue: adminData.payments.petSalesCollected,
    },
    {
      name: "Training Fees",
      revenue: adminData.payments.trainingFeesCollected,
    },
  ];

  const stats = [
    {
      label: "Total Pets",
      value: adminData.pets.total,
      icon: PawPrint,
      color: "bg-blue-50 text-blue-600",
      subtitle: `${adminData.pets.available} Available`,
    },
    {
      label: "Pet Orders",
      value: adminData.petOrders.total,
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600",
      subtitle: `${adminData.petOrders.pending} Pending`,
    },
    {
      label: "Training Programs",
      value: adminData.trainingPrograms.total,
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600",
      subtitle: `${adminData.trainingPrograms.active} Active`,
    },
    {
      label: "Training Bookings",
      value: adminData.trainingBookings.total,
      icon: Users,
      color: "bg-teal-50 text-teal-600",
      subtitle: `${adminData.trainingBookings.inProgress} In Progress`,
    },
  ];

  const quickActions = [
    {
      label: "Manage Pets",
      description: "Add and update pets",
      icon: PawPrint,
      path: "/admin/pets",
    },
    {
      label: "Manage Orders",
      description: "Review customer orders",
      icon: ShoppingBag,
      path: "/admin/orders",
    },
    {
      label: "Manage Users",
      description: "Manage system users",
      icon: Users,
      path: "/admin/users",
    },
    {
      label: "View Reports",
      description: "Business reports",
      icon: TrendingUp,
      path: "/admin/reports",
    },
  ];

  return (
    <DashboardLayout role={role}>
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold tracking-wider text-teal-600">
              PAWPATH MANAGEMENT SYSTEM
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#18365C] sm:text-3xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {user?.name || "Administrator"}.
              Here's your business overview.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-400 hover:text-teal-700 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : ""}
            />
            Refresh Data
          </button>
        </section>

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={19} />
            {errorMessage} Showing previously loaded data.
          </div>
        )}

        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <Icon size={23} />
                  </div>

                  <span className="rounded-full bg-slate-50 p-2 text-slate-400">
                    <TrendingUp size={17} />
                  </span>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <h2 className="mt-1 text-3xl font-bold text-[#18365C]">
                  {stat.value.toLocaleString()}
                </h2>

                <p className="mt-2 text-xs font-medium text-slate-500">
                  {stat.subtitle}
                </p>
              </div>
            );
          })}
        </section>

        {/* Financial Summary */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#18365C] to-[#245B72] p-6 text-white shadow-md">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-3">
                  <Wallet size={23} />
                </div>

                <p className="text-sm font-medium text-blue-100">
                  Total Collected Revenue
                </p>
              </div>

              <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                {formatCurrency(
                  adminData.payments.totalCollectedRevenue
                )}
              </h2>

              <p className="mt-3 text-xs text-blue-100">
                Excludes refunded payment records
              </p>
            </div>

            <TrendingUp className="absolute -bottom-8 -right-5 h-40 w-40 text-white/10" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <CreditCard size={23} />
              </div>

              <p className="text-sm font-medium text-slate-500">
                Outstanding Balance
              </p>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-[#18365C] sm:text-4xl">
              {formatCurrency(
                adminData.payments.totalOutstandingBalance
              )}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{adminData.payments.unpaid} Unpaid</span>
              <span>•</span>
              <span>{adminData.payments.partiallyPaid} Partially Paid</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Pet Inventory Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-bold text-[#18365C]">
                Pet Inventory Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Distribution of pets by current status
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={petChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    <Cell fill={COLORS.teal} />
                    <Cell fill={COLORS.orange} />
                    <Cell fill={COLORS.purple} />
                  </Pie>

                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex justify-between border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">Total Pets</span>
              <span className="font-bold text-[#18365C]">
                {adminData.pets.total}
              </span>
            </div>
          </div>

          {/* Pet Orders Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-bold text-[#18365C]">
                Pet Order Analytics
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Order distribution by status
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={orderChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Orders"
                    fill={COLORS.teal}
                    radius={[7, 7, 0, 0]}
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Training Analytics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-bold text-[#18365C]">
                Training Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Training bookings by current status
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trainingChartData}
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

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Bookings"
                    radius={[7, 7, 0, 0]}
                  >
                    {trainingChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={[
                          COLORS.orange,
                          COLORS.blue,
                          COLORS.purple,
                          COLORS.green,
                        ][index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="font-bold text-[#18365C]">
                Revenue Breakdown
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Collected revenue by business category
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Collected Revenue"
                    fill={COLORS.navy}
                    radius={[7, 7, 0, 0]}
                    barSize={65}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              {revenueChartData.map((item, index) => (
                <div key={item.name}>
                  <p className="text-xs text-slate-500">
                    {item.name}
                  </p>
                  <p
                    className="mt-1 text-sm font-bold"
                    style={{
                      color: index === 0 ? COLORS.navy : COLORS.teal,
                    }}
                  >
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <CreditCard size={22} />
            </div>

            <div>
              <h2 className="font-bold text-[#18365C]">
                Payment Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Current payment record summary
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Total Payments",
                value: adminData.payments.total,
                color: "text-[#18365C]",
              },
              {
                label: "Paid",
                value: adminData.payments.paid,
                color: "text-green-600",
              },
              {
                label: "Partially Paid",
                value: adminData.payments.partiallyPaid,
                color: "text-orange-600",
              },
              {
                label: "Refunded",
                value: adminData.payments.refunded,
                color: "text-red-600",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-slate-50 p-4"
              >
                <p className="text-xs text-slate-500">
                  {item.label}
                </p>
                <p className={`mt-2 text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#18365C]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access your management features.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-800">
                      {action.label}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-slate-400 transition group-hover:text-teal-600"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* System Status */}
        <section className="flex items-start gap-4 rounded-2xl border border-teal-100 bg-teal-50/50 p-5">
          <div className="rounded-xl bg-white p-3 text-teal-600 shadow-sm">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-[#18365C]">
              PawPath Analytics Connected
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Dashboard statistics and charts are generated using
              live data retrieved from the PawPath backend.
              Refunded payments are excluded from collected revenue.
            </p>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
