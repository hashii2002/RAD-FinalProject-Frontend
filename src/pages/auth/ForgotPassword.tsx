import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import axios from "axios";

import { requestPasswordReset } from "../../service/auth";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setIsLoading(true);

      const response = await requestPasswordReset(email.trim().toLowerCase());

      setSuccessMessage(
        response.message ||
          "If an active account exists for this email, a reset link will be sent."
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Unable to process your request. Please try again."
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
          <Mail size={30} />
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-[#269DA3]">
            <PawPrint size={19} />
            <span className="text-sm font-bold tracking-wider">PAWPATH ACCOUNT</span>
          </div>

          <h1 className="text-3xl font-bold text-[#18365C] sm:text-4xl">
            Forgot your password?
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            No worries. Enter the email address associated with your PawPath
            account and we will send you instructions to reset your password.
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            <label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18365C] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#269DA3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={17} />
            {isLoading ? "Sending request..." : "Send Reset Instructions"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs leading-6 text-slate-400">
          For security, the response does not reveal whether an account exists
          for the email address provided.
        </p>
      </div>
    </main>
  );
}

export default ForgotPassword;