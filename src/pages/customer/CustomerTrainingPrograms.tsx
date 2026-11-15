import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Search,
  GraduationCap,
  Clock,
  PawPrint,
  CalendarDays,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Banknote,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getActiveTrainingPrograms } from "../../service/training-program.service";
import { createCustomerTrainingBooking } from "../../service/customer-training-booking.service";

import type { TrainingProgram } from "../../types/training-program.types";

interface BookingFormData {
  petName: string;
  species: string;
  breed: string;
  ageMonths: string;
  initialCondition: string;
  appointmentDate: string;
  appointmentTime: string;
}

const initialFormData: BookingFormData = {
  petName: "",
  species: "",
  breed: "",
  ageMonths: "",
  initialCondition: "",
  appointmentDate: "",
  appointmentTime: "",
};

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatPrice = (price: number): string =>
  `LKR ${price.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const CustomerTrainingPrograms = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [animalFilter, setAnimalFilter] = useState("ALL");

  const [selectedProgram, setSelectedProgram] =
    useState<TrainingProgram | null>(null);

  const [formData, setFormData] =
    useState<BookingFormData>(initialFormData);

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getActiveTrainingPrograms();
        setPrograms(data);
      } catch (err: unknown) {
        console.error("Failed to load training programs:", err);
        setError(
          "Unable to load training programs. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const animalTypes = useMemo(
    () =>
      Array.from(
        new Set(programs.map((program) => program.animalType))
      ).sort(),
    [programs]
  );

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        program.name.toLowerCase().includes(search) ||
        program.animalType.toLowerCase().includes(search) ||
        program.description.toLowerCase().includes(search);

      const matchesAnimal =
        animalFilter === "ALL" ||
        program.animalType === animalFilter;

      return matchesSearch && matchesAnimal;
    });
  }, [programs, searchTerm, animalFilter]);

  const openBookingModal = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setFormData(initialFormData);
    setBookingError("");
    setSuccessMessage("");
  };

  const closeBookingModal = () => {
    if (submitting) return;

    setSelectedProgram(null);
    setFormData(initialFormData);
    setBookingError("");
  };

  const handleFormChange = (
    field: keyof BookingFormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleBookingSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedProgram) return;

    setBookingError("");
    setSuccessMessage("");

    const ageMonths = Number(formData.ageMonths);

    if (
      !Number.isInteger(ageMonths) ||
      ageMonths < 0 ||
      ageMonths > 1200
    ) {
      setBookingError("Please enter a valid pet age in months.");
      return;
    }

    try {
      setSubmitting(true);

      const booking = await createCustomerTrainingBooking({
        trainingProgramId: selectedProgram._id,
        petName: formData.petName.trim(),
        species: formData.species.trim(),
        breed: formData.breed.trim(),
        ageMonths,
        initialCondition: formData.initialCondition.trim(),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
      });

      setSuccessMessage(
        `Booking request ${booking.bookingId} submitted successfully!`
      );

      setFormData(initialFormData);
    } catch (err: unknown) {
      console.error("Training booking failed:", err);

      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? String(err.response.data.message)
          : "Unable to submit your booking. Please try again.";

      setBookingError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="space-y-7">
        {/* Page Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-600">
              <GraduationCap size={18} />
              Pet Training Services
            </div>

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Training Programs
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Discover professional training programs for your beloved pets.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {programs.length}
              </p>
              <p className="text-xs font-medium text-slate-500">
                Available Programs
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search programs..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <select
              value={animalFilter}
              onChange={(event) => setAnimalFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:w-52"
            >
              <option value="ALL">All Animal Types</option>
              {animalTypes.map((animal) => (
                <option key={animal} value={animal}>
                  {animal}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 size={35} className="animate-spin text-teal-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading training programs...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto text-red-500" size={30} />
            <p className="mt-3 font-semibold text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Program Cards */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Available Programs
              </h2>
              <p className="text-sm text-slate-500">
                {filteredPrograms.length} result(s)
              </p>
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <BookOpen
                  size={42}
                  className="mx-auto text-slate-300"
                />
                <h3 className="mt-4 font-semibold text-slate-700">
                  No training programs found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or animal type filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredPrograms.map((program) => (
                  <div
                    key={program._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg"
                  >
                    <div className="relative flex h-36 items-center justify-center bg-linear-to-br from-[#142B45] to-teal-700">
                      <div className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        Active
                      </div>

                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-white">
                        <GraduationCap size={42} />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                          {program.animalType}
                        </span>

                        <span className="text-xs font-medium text-slate-400">
                          {program._id}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800">
                        {program.name}
                      </h3>

                      <p className="mt-2 line-clamp-3 min-h-15 text-sm leading-6 text-slate-500">
                        {program.description}
                      </p>

                      <div className="my-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={16} />
                            <span className="text-xs">Duration</span>
                          </div>
                          <p className="mt-1 font-bold text-slate-800">
                            {program.durationWeeks} Weeks
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Banknote size={16} />
                            <span className="text-xs">Program Fee</span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {formatPrice(program.price)}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => openBookingModal(program)}
                        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        <CalendarDays size={17} />
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between bg-[#142B45] p-5 text-white sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                  Training Booking Request
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  {selectedProgram.name}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedProgram.animalType} ·{" "}
                  {selectedProgram.durationWeeks} weeks ·{" "}
                  {formatPrice(selectedProgram.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBookingModal}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                aria-label="Close booking form"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
                {successMessage && (
                  <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <CheckCircle2
                      size={21}
                      className="shrink-0"
                    />
                    <div>
                      <p className="font-semibold">Booking submitted!</p>
                      <p className="mt-1">{successMessage}</p>
                      <p className="mt-1">
                        Your request is pending admin approval.
                      </p>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={19} className="shrink-0" />
                    {bookingError}
                  </div>
                )}

                {!successMessage && (
                  <>
                    {/* Pet Details */}
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <PawPrint size={19} className="text-teal-600" />
                        <h3 className="font-bold text-slate-800">
                          Pet Information
                        </h3>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Pet Name *
                          </label>
                          <input
                            required
                            maxLength={100}
                            value={formData.petName}
                            onChange={(event) =>
                              handleFormChange("petName", event.target.value)
                            }
                            placeholder="Enter pet name"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Animal Type *
                          </label>
                          <input
                            required
                            maxLength={100}
                            value={formData.species}
                            onChange={(event) =>
                              handleFormChange("species", event.target.value)
                            }
                            placeholder="e.g. Dog, Cat"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Breed *
                          </label>
                          <input
                            required
                            maxLength={100}
                            value={formData.breed}
                            onChange={(event) =>
                              handleFormChange("breed", event.target.value)
                            }
                            placeholder="Enter pet breed"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Age (Months) *
                          </label>
                          <input
                            required
                            type="number"
                            min={0}
                            max={1200}
                            step={1}
                            value={formData.ageMonths}
                            onChange={(event) =>
                              handleFormChange("ageMonths", event.target.value)
                            }
                            placeholder="e.g. 12"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Initial Pet Condition *
                        </label>
                        <textarea
                          required
                          maxLength={1000}
                          rows={3}
                          value={formData.initialCondition}
                          onChange={(event) =>
                            handleFormChange(
                              "initialCondition",
                              event.target.value
                            )
                          }
                          placeholder="Describe your pet's current behaviour, health or training condition..."
                          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Appointment Details */}
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <CalendarDays
                          size={19}
                          className="text-teal-600"
                        />
                        <h3 className="font-bold text-slate-800">
                          Appointment Details
                        </h3>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Appointment Date *
                          </label>
                          <input
                            required
                            type="date"
                            min={getTodayDate()}
                            value={formData.appointmentDate}
                            onChange={(event) =>
                              handleFormChange(
                                "appointmentDate",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Appointment Time *
                          </label>
                          <input
                            required
                            type="time"
                            value={formData.appointmentTime}
                            onChange={(event) =>
                              handleFormChange(
                                "appointmentTime",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-semibold">Please note</p>
                      <p className="mt-1 leading-6">
                        Your booking will be submitted as a pending request.
                        The admin team must approve it before training begins.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:px-6">
                {successMessage ? (
                  <button
                    type="button"
                    onClick={closeBookingModal}
                    className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    Done
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={closeBookingModal}
                      disabled={submitting}
                      className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Booking Request"
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerTrainingPrograms;