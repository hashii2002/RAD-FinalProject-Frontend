import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PawPrint,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

import { registerUser } from "../../service/auth";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (name.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.success) {
        setSuccessMessage("Your account has been created successfully.");
        window.setTimeout(() => navigate("/login"), 1200);
      } else {
        setErrorMessage(response.message || "Registration failed.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Unable to create your account. Please try again."
        );
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
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#269DA3]/20" />
          <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-[#F39A36]/10" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#269DA3]">
              <PawPrint size={27} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PawPath</h1>
              <p className="text-xs tracking-widest text-blue-200">
                PET SALES & TRAINING
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-teal-100">
              Join Our Community
            </span>

            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              A Better Journey
              <span className="mt-2 block text-[#55C5C2]">
                For Every Pet.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-blue-100">
              Create your PawPath account to explore available pets,
              discover training programs and keep track of your pet journey.
            </p>

            <div className="mt-9 space-y-4">
              {[
                "Explore available pets",
                "Request professional training",
                "Manage your orders and bookings",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={19} className="text-[#55C5C2]" />
                  <span className="text-sm text-blue-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-200">
            © {new Date().getFullYear()} PawPath. All rights reserved.
          </p>
        </section>

        {/* Registration form */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#269DA3] text-white">
                <PawPrint size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#18365C]">PawPath</h1>
                <p className="text-xs tracking-wider text-slate-500">
                  PET SALES & TRAINING
                </p>
              </div>
            </div>

            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#269DA3]">
                Create Account
              </p>
              <h2 className="text-3xl font-bold text-[#18365C] sm:text-4xl">
                Get started today
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Create your customer account to get started with PawPath.
              </p>
            </div>

            {errorMessage && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div role="status" className="mb-5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <UserRound size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    minLength={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-[#269DA3] focus:bg-white focus:ring-4 focus:ring-[#269DA3]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your password"
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

              <p className="text-xs leading-5 text-slate-500">
                By creating an account, you agree to provide accurate information
                for managing your PawPath orders and training bookings.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18365C] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#18365C]/15 transition hover:bg-[#269DA3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#269DA3] hover:text-[#18365C]">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;