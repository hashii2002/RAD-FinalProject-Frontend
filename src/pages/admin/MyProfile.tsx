import { useEffect, useState, type FormEvent } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
  LockKeyhole,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import api from "../../service/api";

interface ProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "TRAINER" | "CUSTOMER";
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const MyProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getErrorMessage = (error: unknown): string => {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
      message?: string;
    };

    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Something went wrong. Please try again."
    );
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get<ApiResponse<ProfileData>>(
        "/auth/me"
      );

      const user = response.data.data;

      setProfile(user);
      setName(user.name);
      setEmail(user.email);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleUpdateProfile = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim()) {
      setErrorMessage("Name and email are required.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.patch<ApiResponse<ProfileData>>(
        "/auth/me",
        {
          name: name.trim(),
          email: email.trim(),
        }
      );

      const updatedUser = response.data.data;

      setProfile(updatedUser);
      setName(updatedUser.name);
      setEmail(updatedUser.email);

      setIsEditing(false);
      setSuccessMessage(
        response.data.message || "Profile updated successfully."
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }

    setIsEditing(false);
    setErrorMessage("");
  };

  const handleChangePassword = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.patch<{
        success: boolean;
        message: string;
      }>("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        response.data.message || "Password changed successfully."
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (value: string) => {
    return value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-500">
              Loading your profile...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-red-500" />

            <h2 className="mt-3 text-lg font-bold text-slate-800">
              Unable to Load Profile
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {errorMessage || "Please try again."}
            </p>

            <button
              onClick={() => void loadProfile()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <UserRound className="h-5 w-5 text-indigo-600" />
            </div>

            <span className="text-sm font-semibold text-indigo-600">
              PAWPATH ACCOUNT
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

            <p className="flex-1 text-sm font-medium text-green-700">
              {successMessage}
            </p>

            <button
              onClick={() => setSuccessMessage("")}
              className="text-sm font-semibold text-green-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

            <p className="flex-1 text-sm font-medium text-red-700">
              {errorMessage}
            </p>

            <button
              onClick={() => setErrorMessage("")}
              className="text-sm font-semibold text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Profile Overview */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-28 bg-gradient-to-r from-[#18365C] via-[#254B73] to-[#269DA3]" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-700 shadow-sm">
                  {getInitials(profile.name)}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-1">
                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                  {profile.role}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    profile.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {profile.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5">
                  <UserRound className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">User ID</p>
                  <p className="text-sm font-bold text-slate-800">
                    {profile.userId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-50 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Account Role</p>
                  <p className="text-sm font-bold text-slate-800">
                    Administrator
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-50 p-2.5">
                  <CalendarDays className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">Account Status</p>
                  <p className="text-sm font-bold text-slate-800">
                    {profile.isActive ? "Active Account" : "Inactive Account"}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and update your administrator account details.
              </p>
            </div>

            {!isEditing && (
              <button
                onClick={() => {
                  setName(profile.name);
                  setEmail(profile.email);
                  setIsEditing(true);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={!isEditing || savingProfile}
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={!isEditing || savingProfile}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  User ID
                </label>

                <input
                  type="text"
                  value={profile.userId}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Your unique user ID cannot be changed.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Account Role
                </label>

                <input
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500"
                />
              </div>

            </div>

            {isEditing && (
              <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-orange-50 p-3">
              <LockKeyhole className="h-6 w-6 text-orange-600" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>

                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    disabled={changingPassword}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  disabled={changingPassword}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                  placeholder="Enter new password"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Minimum 8 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  disabled={changingPassword}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                  placeholder="Confirm new password"
                />
              </div>

            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {changingPassword ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LockKeyhole size={16} />
                )}

                {changingPassword
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Information */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Account Security
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Your password is securely encrypted before being stored.
              Never share your password with anyone. Use a strong,
              unique password to protect your administrator account.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
