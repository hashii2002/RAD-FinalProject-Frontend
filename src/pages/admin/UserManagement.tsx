import { useEffect, useMemo, useState } from "react";
import type { FormEvent,ReactNode,ElementType } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getAllUsers, createUser, updateUser,} from "../../service/user.service";
import type { User, UserRole,} from "../../types/user.types";
import {
  Users,
  UserRound,
  GraduationCap,
  ShieldCheck,
  Search,
  Plus,
  Pencil,
  Eye,
  Power,
  X,
  Mail,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  PawPrint,
  LockKeyhole,
} from "lucide-react";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

type RoleFilter = "ALL" | UserRole;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const initialFormData: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "CUSTOMER",
};

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRoleLabel = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "TRAINER":
      return "Trainer";
    case "CUSTOMER":
      return "Customer";
    default:
      return role;
  }
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles: Record<UserRole, string> = {
    ADMIN: "bg-purple-50 text-purple-700 ring-purple-200",
    TRAINER: "bg-blue-50 text-blue-700 ring-blue-200",
    CUSTOMER: "bg-teal-50 text-teal-700 ring-teal-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[role]}`}
    >
      {getRoleLabel(role)}
    </span>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
      isActive
        ? "bg-emerald-50 text-emerald-700"
        : "bg-red-50 text-red-700"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        isActive ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
    {isActive ? "Active" : "Inactive"}
  </span>
);

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: ElementType;
  iconStyle: string;
}

const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconStyle,
}: SummaryCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </h3>

        <p className="mt-2 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconStyle}`}
      >
        <Icon size={23} />
      </div>
    </div>
  </div>
);

interface ModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({
  title,
  subtitle,
  onClose,
  children,
}: ModalProps) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
    <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-6">
        {children}
      </div>
    </div>
  </div>
);

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

const FormField = ({ label, children }: FormFieldProps) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [formData, setFormData] =
    useState<UserFormData>(initialFormData);

  // Load all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers();

      setUsers(data);
    } catch (err: unknown) {
      console.error("Load users error:", err);

      setError(
        "Unable to load users. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalUsers = users.length;

  const totalAdmins = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const totalTrainers = users.filter(
    (user) => user.role === "TRAINER"
  ).length;

  const totalCustomers = users.filter(
    (user) => user.role === "CUSTOMER"
  ).length;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        user.userId.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  const openAddModal = () => {
    setFormData(initialFormData);
    setError("");
    setShowAddModal(true);
  };

  const handleCreateUser = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const newUser = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setUsers((previous) => [newUser, ...previous]);

      setShowAddModal(false);
      setFormData(initialFormData);

      showSuccess("New user created successfully.");
    } catch (err: any) {
      console.error("Create user error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create user. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setError("");
    setShowEditModal(true);
  };

  const handleUpdateUser = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedUser) return;

    try {
      setSaving(true);
      setError("");

      const updatedUser = await updateUser(
        selectedUser.userId,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
        }
      );

      setUsers((previous) =>
        previous.map((user) =>
          user.userId === selectedUser.userId
            ? updatedUser
            : user
        )
      );

      setShowEditModal(false);
      setSelectedUser(null);

      showSuccess("User details updated successfully.");
    } catch (err: any) {
      console.error("Update user error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const updatedUser = await updateUser(user.userId, {
        isActive: nextStatus,
      });

      setUsers((previous) =>
        previous.map((item) =>
          item.userId === user.userId ? updatedUser : item
        )
      );

      showSuccess(
        `${user.name} has been ${
          nextStatus ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (err: any) {
      console.error("Change user status error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update user status."
      );
    }
  };

  const openDetailsModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedUser(null);
    setError("");
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-7">

        {/* Page Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <PawPrint size={16} />
              <span>Administration</span>
              <span>/</span>
              <span className="font-medium text-teal-600">
                User Management
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              User Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage administrators, trainers and customers
              across PawPath.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
          >
            <Plus size={19} />
            Add New User
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={19} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && !showAddModal && !showEditModal && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Users"
            value={totalUsers}
            description="All registered accounts"
            icon={Users}
            iconStyle="bg-teal-50 text-teal-600"
          />

          <SummaryCard
            title="Administrators"
            value={totalAdmins}
            description="System administrators"
            icon={ShieldCheck}
            iconStyle="bg-purple-50 text-purple-600"
          />

          <SummaryCard
            title="Trainers"
            value={totalTrainers}
            description="Professional trainers"
            icon={GraduationCap}
            iconStyle="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Customers"
            value={totalCustomers}
            description="Registered pet owners"
            icon={UserRound}
            iconStyle="bg-amber-50 text-amber-600"
          />
        </div>

        {/* User Table Section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                All Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage registered PawPath users.
              </p>
            </div>

            <button
              type="button"
              onClick={loadUsers}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search ID, name or email..."
                className={`${inputClass} pl-11`}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as RoleFilter)
              }
              className={inputClass}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="TRAINER">Trainers</option>
              <option value="CUSTOMER">Customers</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              className={inputClass}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Result Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {users.length}
              </span>{" "}
              users
            </p>

            {(searchTerm ||
              roleFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-20">
              <LoaderCircle
                size={35}
                className="animate-spin text-teal-600"
              />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading users...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <AlertCircle size={35} className="text-red-400" />
              <p className="mt-3 font-semibold text-slate-700">
                Unable to load users
              </p>
              <button
                type="button"
                onClick={loadUsers}
                className="mt-4 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={30} />
              </div>

              <h3 className="mt-4 font-bold text-slate-700">
                No users found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                No users match your current search or filter.
              </p>
            </div>
          ) : (
            /* Users Table */
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">User ID</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Joined Date</th>
                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.userId}
                      className="transition hover:bg-slate-50/80"
                    >
                      {/* User Information */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {user.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                              <Mail size={12} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-600">
                          {user.userId}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge isActive={user.isActive} />
                      </td>

                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {formatDate(user.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailsModal(user)}
                            title="View details"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Edit user"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-600"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            title={
                              user.isActive
                                ? "Deactivate user"
                                : "Activate user"
                            }
                            className={`rounded-lg p-2 transition ${
                              user.isActive
                                ? "text-slate-500 hover:bg-red-50 hover:text-red-600"
                                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                          >
                            <Power size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {!loading && filteredUsers.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
              <p className="text-xs text-slate-500">
                User information is managed securely through
                the PawPath administration system.
              </p>
            </div>
          )}
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <Modal
            title="Add New User"
            subtitle="Create a new PawPath account."
            onClose={closeModals}
          >
            <form
              onSubmit={handleCreateUser}
              className="space-y-5"
            >
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <FormField label="Full Name">
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter full name"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Email Address">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      email: event.target.value,
                    })
                  }
                  placeholder="example@email.com"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Temporary Password">
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        password: event.target.value,
                      })
                    }
                    placeholder="Minimum 8 characters"
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  The password must contain at least 8 characters.
                </p>
              </FormField>

              <FormField label="User Role">
                <select
                  value={formData.role}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      role: event.target.value as UserRole,
                    })
                  }
                  className={inputClass}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="TRAINER">Trainer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </FormField>

              <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                <p className="text-sm font-semibold text-teal-800">
                  Account Information
                </p>
                <p className="mt-1 text-xs leading-5 text-teal-700">
                  A unique User ID will be generated automatically
                  according to the selected role.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus size={17} />
                  )}
                  {saving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <Modal
            title="Edit User"
            subtitle={`Update account details for ${selectedUser.name}.`}
            onClose={closeModals}
          >
            <form
              onSubmit={handleUpdateUser}
              className="space-y-5"
            >
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Current User ID
                </p>
                <p className="mt-1 font-mono font-bold text-slate-700">
                  {selectedUser.userId}
                </p>
              </div>

              <FormField label="Full Name">
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Email Address">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      email: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="User Role">
                <select
                  value={formData.role}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      role: event.target.value as UserRole,
                    })
                  }
                  className={inputClass}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="TRAINER">Trainer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </FormField>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  Important: Changing a user's role
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Your backend generates a new User ID when the role
                  changes. The user's existing role-based ID will
                  therefore be replaced.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <Modal
            title="User Details"
            subtitle="View registered account information."
            onClose={closeModals}
          >
            <div className="space-y-6">
              <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-teal-700">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>

                <h3 className="mt-3 text-xl font-bold text-slate-800">
                  {selectedUser.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedUser.email}
                </p>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge isActive={selectedUser.isActive} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    User ID
                  </p>
                  <p className="mt-2 font-mono font-bold text-slate-700">
                    {selectedUser.userId}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Account Role
                  </p>
                  <p className="mt-2 font-semibold text-slate-700">
                    {getRoleLabel(selectedUser.role)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Account Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge isActive={selectedUser.isActive} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Registered Date
                  </p>
                  <p className="mt-2 font-semibold text-slate-700">
                    {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  <Pencil size={16} />
                  Edit User
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
