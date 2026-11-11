import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";

import useAuth from "../../hooks/useAuth";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);
      
      const loggedInUser = await login(email.trim(), password);

      setSuccessMessage(`Welcome back, ${loggedInUser.name}!`);

      switch (loggedInUser.role) {
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;

        case "TRAINER":
          navigate("/trainer/dashboard", { replace: true });
          break;

        case "CUSTOMER":
          navigate("/customer/dashboard", { replace: true });
          break;

        default:
          navigate("/login", { replace: true });
      }


    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Unable to log in. Please try again."
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F7FA] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

        <section className="relative hidden overflow-hidden bg-[#18365C] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">

          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-[#269DA3]/20" />
          <div className="absolute -bottom-32 -left-28 h-96 w-96 rounded-full bg-[#F39A36]/10" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#269DA3]">
              <PawPrint size={27} strokeWidth={2.3} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-wide">
                PawPath
              </h1>
              <p className="text-xs tracking-widest text-blue-200">
                PET SALES & TRAINING
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-teal-100">
              Welcome to PawPath
            </span>

            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              Every Pet Deserves
              <span className="mt-2 block text-[#55C5C2]">
                A Loving Journey.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
              Find your perfect companion and give them the care,
              guidance and training they deserve. Your pet's journey
              starts here.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#18365C] bg-[#F39A36] text-lg">
                  🐶
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#18365C] bg-[#269DA3] text-lg">
                  🐱
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#18365C] bg-[#E8B7A0] text-lg">
                  🐾
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Care. Love. Companionship.
                </p>
                <p className="text-xs text-blue-200">
                  Making every pet journey special.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-200">
            © {new Date().getFullYear()} PawPath. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20">

          <div className="w-full max-w-md">

            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#269DA3] text-white">
                <PawPrint size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#18365C]">
                  PawPath
                </h1>
                <p className="text-xs tracking-wider text-slate-500">
                  PET SALES & TRAINING
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#269DA3]">
                Welcome Back
              </p>

              <h2 className="text-3xl font-bold text-[#18365C] sm:text-4xl">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your credentials to access your PawPath account.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800"
              >
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-[#269DA3] transition hover:text-[#18365C]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#18365C]"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18365C] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#18365C]/15 transition hover:bg-[#269DA3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#269DA3] transition hover:text-[#18365C]"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-10 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs leading-6 text-slate-400">
                Secure access for PawPath administrators, trainers and customers.
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;