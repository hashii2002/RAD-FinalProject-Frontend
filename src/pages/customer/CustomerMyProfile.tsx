import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Save,
  Pencil,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import useAuth from "../../hooks/useAuth";

import {
  updateCurrentUser,
  changeCurrentPassword,
} from "../../service/auth";

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = error.response as {
      data?: { message?: string };
    };

    return response.data?.message || "Something went wrong.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

const MyProfile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const handleProfileUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!name.trim() || !email.trim()) {
      setProfileError("Please fill in all profile fields.");
      return;
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      setProfileError("Name must contain 2 to 100 characters.");
      return;
    }

    try {
      setIsSavingProfile(true);

      const response = await updateCurrentUser({
        name: name.trim(),
        email: email.trim(),
      });

      updateUser(response.data);

      setName(response.data.name);
      setEmail(response.data.email);

      setIsEditing(false);
      setProfileMessage("Your profile has been updated successfully.");
    } catch (error) {
      setProfileError(getErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
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
        "New password must be different from the current password."
      );
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await changeCurrentPassword({
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        response.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* Page Heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account security.
          </p>
        </div>

        {/* Profile Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-32 bg-linear-to-r from-teal-600 to-emerald-500" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-teal-50 text-teal-700 shadow-sm">
                  <User size={42} />
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.name || "Customer"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>

              <span className="mb-1 inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <ShieldCheck size={15} />
                Active Account
              </span>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and update your account details.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setProfileMessage("");
                  setProfileError("");
                  setIsEditing(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {profileMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 size={18} />
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} />
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="grid gap-5 md:grid-cols-2">

              {/* User ID */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Customer ID
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <ShieldCheck size={18} className="text-gray-400" />

                  <input
                    type="text"
                    value={user?.userId || ""}
                    disabled
                    className="w-full bg-transparent text-sm text-gray-500 outline-none"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account Role
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <User size={18} className="text-gray-400" />

                  <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                    className="w-full bg-transparent text-sm text-gray-500 outline-none"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 focus-within:border-teal-500">
                  <User size={18} className="text-gray-400" />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    maxLength={100}
                    className="w-full text-sm text-gray-800 outline-none disabled:bg-white disabled:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 focus-within:border-teal-500">
                  <Mail size={18} className="text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full text-sm text-gray-800 outline-none disabled:bg-white disabled:text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || "");
                    setEmail(user?.email || "");
                    setIsEditing(false);
                    setProfileError("");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Change Password */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Lock size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keep your PawPath account secure.
              </p>
            </div>
          </div>

          {passwordMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 size={18} />
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={18} />
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-5 md:grid-cols-2">

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current Password
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 focus-within:border-teal-500">
                  <KeyRound size={18} className="text-gray-400" />

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full text-sm outline-none"
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 focus-within:border-teal-500">
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full text-sm outline-none"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 focus-within:border-teal-500">
                  <Lock size={18} className="text-gray-400" />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full text-sm outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Your new password must contain at least 8 characters.
              </p>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock size={16} />
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default MyProfile;
