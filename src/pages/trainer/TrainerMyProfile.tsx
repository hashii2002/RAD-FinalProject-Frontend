import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  PawPrint,
  UserRound,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import useAuth from "../../hooks/useAuth";
import api from "../../service/api";

const MyProfile = () => {
  const { user, updateUser } = useAuth();

  // Profile states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback messages
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Update profile
  const handleProfileUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!name.trim() || !email.trim()) {
      setProfileError("Name and email are required.");
      return;
    }

    try {
      setProfileLoading(true);

      const response = await api.patch("/auth/me", {
        name: name.trim(),
        email: email.trim(),
      });

      updateUser(response.data.data);

      setProfileMessage("Your profile has been updated successfully.");
    } catch (error: any) {
      setProfileError(
        error.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        response.data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(
        error.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-teal-50";

  const passwordInputStyle =
    "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-teal-50";

  return (
    <DashboardLayout role="TRAINER">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#18365C] to-[#245B72] p-6 text-white shadow-md sm:p-8">
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-teal-300">
              <PawPrint size={17} />
              PAWPATH TRAINER PORTAL
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              Manage your personal information and keep your account
              security up to date.
            </p>
          </div>

          <UserRound
            size={150}
            className="absolute -bottom-10 -right-5 text-white/10"
          />
        </div>

        {/* Profile Overview */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:p-8">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#18365C] to-[#269DA3] text-3xl font-bold text-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#18365C]">
                {user?.name || "Trainer"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {user?.email}
              </p>

              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-[#21878C]">
                  <ShieldCheck size={14} />
                  Verified Account
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18365C]/5 px-3 py-1 text-xs font-semibold text-[#18365C]">
                  <User size={14} />
                  Trainer
                </span>
              </div>
            </div>

            <div className="sm:ml-auto">
              <div className="rounded-xl bg-slate-50 px-5 py-3 text-center">
                <p className="text-xs font-medium text-slate-400">
                  TRAINER ID
                </p>
                <p className="mt-1 text-sm font-bold text-[#18365C]">
                  {user?.userId || "N/A"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Personal Information */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#269DA3]">
                <User size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500">
                  Update your basic account details
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Trainer ID */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Trainer ID
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={user?.userId || ""}
                    className={`${inputStyle} cursor-not-allowed bg-slate-100`}
                    disabled
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Trainer ID cannot be changed.
                </p>
              </div>

              {/* Profile Feedback */}
              {profileMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  {profileError}
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#269DA3] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#21878C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />
                {profileLoading ? "Saving Changes..." : "Save Changes"}
              </button>

            </form>
          </section>

          {/* Change Password */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#18365C]/5 text-[#18365C]">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  Change Password
                </h2>
                <p className="text-xs text-slate-500">
                  Protect your account with a strong password
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">

              {/* Current Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={passwordInputStyle}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#269DA3]"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>

                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={passwordInputStyle}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#269DA3]"
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={passwordInputStyle}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#269DA3]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Feedback */}
              {passwordMessage && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#122B49] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole size={17} />
                {passwordLoading ? "Updating Password..." : "Update Password"}
              </button>

            </form>
          </section>

        </div>

        {/* Security Information */}
        <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-5">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#269DA3]" size={22} />

          <div>
            <h3 className="text-sm font-bold text-[#18365C]">
              Account Security
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Keep your login credentials private. Never share your
              password with anyone. Use a strong password to protect
              your PawPath trainer account.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
