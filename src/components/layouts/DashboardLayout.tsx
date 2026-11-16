import { useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  PawPrint,
  ShoppingBag,
  GraduationCap,
  Users,
  CreditCard,
  FileText,
  CalendarDays,
  ClipboardList,
  UserCircle,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  PhoneCall,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import type { UserRole } from "../../types/auth.types";

interface DashboardLayoutProps {
  role: UserRole;
  children: React.ReactNode;
}

const menuItems = {
  ADMIN: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Pet Management", path: "/admin/pets", icon: PawPrint },
    { label: "Pet Orders", path: "/admin/orders", icon: ShoppingBag },
    { label: "Training Programs", path: "/admin/programs", icon: GraduationCap },
    { label: "Training Bookings", path: "/admin/bookings", icon: CalendarDays },
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Payments", path: "/admin/payments", icon: CreditCard },
    { label: "Reports", path: "/admin/reports", icon: FileText },
    { label: "My Profile", path: "/admin/profile", icon: UserCircle },
  ],
  TRAINER: [
    { label: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
    { label: "My Bookings", path: "/trainer/bookings", icon: CalendarDays },
    { label: "Training Sessions", path: "/trainer/sessions", icon: ClipboardList },
    { label: "My Profile", path: "/trainer/profile", icon: UserCircle },
  ],
  CUSTOMER: [
    { label: "Dashboard", path: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Browse Pets", path: "/customer/pets", icon: PawPrint },
    { label: "My Orders", path: "/customer/orders", icon: ShoppingBag },
    { label: "Training Programs", path: "/customer/programs", icon: GraduationCap },
    { label: "My Bookings", path: "/customer/bookings", icon: CalendarDays },
    { label: "My Payments", path: "/customer/payments", icon: CreditCard },
    { label: "My Profile", path: "/customer/profile", icon: UserCircle },
    { label: "Contact Us", path: "/customer/contact", icon: PhoneCall,},
  ],
};

const roleTitles: Record<UserRole, string> = {
  ADMIN: "Administrator",
  TRAINER: "Professional Trainer",
  CUSTOMER: "Pet Owner",
};

const DashboardLayout = ({
  role,
  children,
}: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const currentMenu = menuItems[role];

  const currentPage =
    currentMenu.find((item) => item.path === location.pathname)?.label ||
    "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
    
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#142B45] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500">
              <PawPrint size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">PawPath</h1>
              <p className="text-xs text-slate-400">Pet Care Management</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Information */}
        <div className="mx-4 mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <p className="mt-1 font-semibold">{roleTitles[role]}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          {currentMenu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 font-bold text-teal-300">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {roleTitles[role]}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-xs text-slate-500">
                PawPath / {roleTitles[role]}
              </p>
              <h2 className="text-lg font-bold text-slate-800">
                {currentPage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <Bell size={19} />
            </button>

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
