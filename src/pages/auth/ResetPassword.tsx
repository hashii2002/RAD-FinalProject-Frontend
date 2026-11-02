import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PawPrint, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import axios from "axios";

import { resetUserPassword } from "../../service/auth";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("The password reset link is missing its token. Please request a new link.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await resetUserPassword(token, newPassword);

      if (response.success) {
        setSuccessMessage("Your password has been reset successfully. Redirecting to sign in...");

        window.setTimeout(() => navigate("/login"), 1800);
      } else {
        setErrorMessage(response.message || "Unable to reset your password.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "The reset link may be invalid or expired. Please request a new one."
        );
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7FA] p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-xl sm:p-10 lg:p-12">
        <Link to="/login" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#269DA3]">
          <ArrowLeft size={17} />
          Back to sign in
        </Link>

        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#269DA3]/10 text-[#269DA3]">
          <Lock size={29} />
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-[#269DA3]">
            <PawPrint size={19} />
            <span className="text-sm font-bold tracking-wider">PAWPATH ACCOUNT</span>
          </div>

          <h1 className="text-3xl font-bold text-[#18365C] sm:text-4xl">
            Create a new password
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Choose a strong password to secure your PawPath account. Your new
            password must contain at least 8 characters.
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div role="status" className="mb-5 flex gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-4 text-sm leading-6 text-teal-800">
            <CheckCircle2 size={21} className="mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#18365C]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>

            <div className="relative">
              <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                id="confirm-new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#18365C]"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18365C] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#269DA3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Resetting password..." : "Reset Password"}
          </button>
        </form>

        {!token && (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            Don't have a valid reset link?{" "}
            <Link to="/forgot-password" className="font-semibold text-[#269DA3] hover:text-[#18365C]">
              Request a new one
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default ResetPassword;