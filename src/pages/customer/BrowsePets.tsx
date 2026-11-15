import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  PawPrint,
  Search,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  X,
  Phone,
  MessageSquare,
  CheckCircle2,
  LoaderCircle,
  Eye,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";

import { searchPets } from "../../service/pet.service";
import { createCustomerPetOrder } from "../../service/customer-pet-order.service";

import type { Pet } from "../../types/pet.types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount || 0);

const formatAge = (months: number) => {
  if (months < 12) {
    return `${months} months`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return remainingMonths > 0
    ? `${years} years ${remainingMonths} months`
    : `${years} years`;
};

const BrowsePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Search and filter states
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Selected pet and modal states
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Order form states
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPets = useCallback(
    async (filters?: {
      name?: string;
      species?: string;
      breed?: string;
      minPrice?: number | "";
      maxPrice?: number | "";
    }) => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const availablePets = await searchPets({
          ...filters,
          status: "AVAILABLE",
        });

        setPets(availablePets);
      } catch (error: unknown) {
        console.error("Browse pets error:", error);

        const errorMsg = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;

        setErrorMessage(
          errorMsg || "Unable to load available pets."
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleSearch = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");

    await fetchPets({
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      minPrice: minPrice === "" ? "" : Number(minPrice),
      maxPrice: maxPrice === "" ? "" : Number(maxPrice),
    });
  };

  const handleReset = () => {
    setName("");
    setSpecies("");
    setBreed("");
    setMinPrice("");
    setMaxPrice("");
    setSuccessMessage("");

    fetchPets();
  };

  const handleOrderSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedPet) return;

    if (!customerPhone.trim()) {
      setOrderError("Please enter your contact number.");
      return;
    }

    try {
      setIsSubmitting(true);
      setOrderError("");

      await createCustomerPetOrder({
        petId: selectedPet._id,
        customerPhone: customerPhone.trim(),
        message: message.trim(),
      });

      setSuccessMessage(
        `Your order request for ${selectedPet.name} has been submitted successfully.`
      );

      setSelectedPet(null);
      setShowOrderForm(false);
      setCustomerPhone("");
      setMessage("");

      await fetchPets({
        name: name.trim(),
        species: species.trim(),
        breed: breed.trim(),
        minPrice: minPrice === "" ? "" : Number(minPrice),
        maxPrice: maxPrice === "" ? "" : Number(maxPrice),
      });
    } catch (error: unknown) {
      console.error("Pet order submission error:", error);

      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      setOrderError(
        errorMsg || "Unable to submit your order request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPetDetails = (pet: Pet) => {
    setSelectedPet(pet);
    setShowOrderForm(false);
    setOrderError("");
  };

  const closeModal = () => {
    setSelectedPet(null);
    setShowOrderForm(false);
    setOrderError("");
    setCustomerPhone("");
    setMessage("");
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* PAGE HEADER */}

        <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#142B45] to-[#20536A] p-7 text-white shadow-lg sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold tracking-wider text-teal-300">
              PAWPATH PET COLLECTION
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              Find Your Perfect Companion
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
              Explore our available pets and find a lovely companion
              to become a part of your family.
            </p>
          </div>

          <PawPrint
            className="absolute -right-8 -top-8 h-56 w-56 rotate-12 text-white/5"
            strokeWidth={1}
          />
        </section>

        {/* SUCCESS MESSAGE */}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 size={21} className="mt-0.5 shrink-0" />

            <div className="flex-1 text-sm font-medium">
              {successMessage}
            </div>

            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SEARCH AND FILTERS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <SlidersHorizontal size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Find Your Pet
              </h2>

              <p className="text-sm text-slate-500">
                Search and filter available pets
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Pet Name
                </label>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Search by pet name"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Species
                </label>

                <input
                  type="text"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="e.g. Dog, Cat"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Breed
                </label>

                <input
                  type="text"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Search by breed"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Minimum Price (LKR)
                </label>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Minimum price"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Maximum Price (LKR)
                </label>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Maximum price"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#18365C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245078] disabled:opacity-60"
                >
                  <Search size={17} />
                  Search Pets
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  Reset
                </button>
              </div>

            </div>
          </form>
        </section>

        {/* PET LIST HEADER */}

        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Available Pets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Explore pets currently available for order
              </p>
            </div>

            <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              {pets.length} Pets Available
            </span>
          </div>

          {/* LOADING */}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="h-56 bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="h-10 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>

          ) : errorMessage ? (

            /* ERROR */

            <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
              <AlertCircle
                size={38}
                className="mx-auto text-red-500"
              />

              <h3 className="mt-4 font-bold text-slate-800">
                Unable to Load Pets
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {errorMessage}
              </p>

              <button
                onClick={() => fetchPets()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245078]"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>

          ) : pets.length === 0 ? (

            /* EMPTY STATE */

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <PawPrint size={32} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No Pets Found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn't find any available pets matching your
                search. Try changing your search filters.
              </p>

              <button
                onClick={handleReset}
                className="mt-5 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245078]"
              >
                View All Available Pets
              </button>
            </div>

          ) : (

            /* PET CARDS */

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {pets.map((pet) => (
                <div
                  key={pet._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <PawPrint size={65} />
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                      Available
                    </span>

                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/50 to-transparent p-4 pt-12">
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(pet.price)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          {pet.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {pet.species} • {pet.breed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                        <PawPrint size={21} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Age
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatAge(pet.ageMonths)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Pet ID
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {pet._id}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {pet.description || "No additional description available."}
                    </p>

                    <button
                      onClick={() => openPetDetails(pet)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18365C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#245078]"
                    >
                      <Eye size={17} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PET DETAILS / ORDER MODAL */}

        {selectedPet && (
          <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div
              className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {showOrderForm ? "Request Pet Order" : "Pet Details"}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {selectedPet._id}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">

                {!showOrderForm ? (

                  /* DETAILS VIEW */

                  <>
                    {selectedPet.imageUrl ? (
                      <img
                        src={selectedPet.imageUrl}
                        alt={selectedPet.name}
                        className="h-64 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
                        <PawPrint size={70} />
                      </div>
                    )}

                    <div className="mt-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">
                            {selectedPet.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {selectedPet.species} • {selectedPet.breed}
                          </p>
                        </div>

                        <p className="text-xl font-bold text-teal-700">
                          {formatCurrency(selectedPet.price)}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">Age</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {formatAge(selectedPet.ageMonths)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">Pet ID</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {selectedPet._id}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h4 className="font-bold text-slate-800">
                          About this Pet
                        </h4>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedPet.description ||
                            "No additional description available."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowOrderForm(true);
                        setOrderError("");
                      }}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                      <ShoppingBag size={18} />
                      Request to Order
                    </button>
                  </>

                ) : (

                  /* ORDER FORM */

                  <form onSubmit={handleOrderSubmit}>
                    <div className="rounded-xl bg-teal-50 p-4">
                      <p className="text-xs font-medium text-teal-700">
                        Selected Pet
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-800">
                            {selectedPet.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {selectedPet._id} • {selectedPet.breed}
                          </p>
                        </div>

                        <p className="font-bold text-teal-700">
                          {formatCurrency(selectedPet.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Contact Number *
                      </label>

                      <div className="relative">
                        <Phone
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Enter your contact number"
                          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Additional Message
                      </label>

                      <div className="relative">
                        <MessageSquare
                          size={17}
                          className="absolute left-3 top-4 text-slate-400"
                        />

                        <textarea
                          rows={4}
                          maxLength={1000}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write any additional information or questions..."
                          className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        />
                      </div>

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {message.length}/1000 characters
                      </p>
                    </div>

                    {orderError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {orderError}
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOrderForm(false);
                          setOrderError("");
                        }}
                        className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Back to Details
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle size={18} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default BrowsePets;
