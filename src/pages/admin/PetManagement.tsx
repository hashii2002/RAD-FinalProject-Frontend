import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  PackageOpen,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  X,
  PawPrint,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";

import {
  createPet,
  deletePet,
  getAllPets,
  searchPets,
  updatePet,
} from "../../service/pet.service";

import type {
  Pet,
  PetFormData,
  PetStatus,
} from "../../types/pet.types";

interface PetFormState {
  name: string;
  species: string;
  breed: string;
  ageMonths: string;
  price: string;
  description: string;
  status: PetStatus;
}

const initialFormData: PetFormState = {
  name: "",
  species: "",
  breed: "",
  ageMonths: "",
  price: "",
  description: "",
  status: "AVAILABLE",
};

const statusStyles: Record<PetStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  SOLD: "bg-blue-50 text-blue-700 border-blue-100",
  RESERVED: "bg-orange-50 text-orange-700 border-orange-100",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#269DA3] focus:ring-4 focus:ring-teal-50";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(price || 0);

const PetManagement = () => {
  const [pets, setPets] = useState<Pet[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  // Search Filters
  const [nameFilter, setNameFilter] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [breedFilter, setBreedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PetStatus | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState<PetFormState>(initialFormData);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadPets = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await getAllPets();
      setPets(data);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      setPageError(
        err.response?.data?.message || "Unable to load pet records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  // Image Preview
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const preview = URL.createObjectURL(selectedImage);
    setImagePreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [selectedImage]);

  // Search Pets
  const handleSearch = async () => {
    if (
      minPrice !== "" &&
      maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)
    ) {
      setPageError("Minimum price cannot be greater than maximum price.");
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const data = await searchPets({
        name: nameFilter.trim() || undefined,
        species: speciesFilter.trim() || undefined,
        breed: breedFilter.trim() || undefined,
        status: statusFilter,
        minPrice: minPrice === "" ? "" : Number(minPrice),
        maxPrice: maxPrice === "" ? "" : Number(maxPrice),
      });

      setPets(data);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      setPageError(
        err.response?.data?.message || "Unable to search pets."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setNameFilter("");
    setSpeciesFilter("");
    setBreedFilter("");
    setStatusFilter("");
    setMinPrice("");
    setMaxPrice("");

    loadPets();
  };

  // Open Add page
  const openAddModal = () => {
    setEditingPet(null);
    setFormData(initialFormData);
    setSelectedImage(null);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open Edit page
  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);

    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageMonths: String(pet.ageMonths),
      price: String(pet.price),
      description: pet.description || "",
      status: pet.status,
    });

    setSelectedImage(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingPet(null);
    setFormData(initialFormData);
    setSelectedImage(null);
    setFormError("");
  };

  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setSelectedImage(file);
  };

  // Save Pet
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !Number.isFinite(Number(formData.ageMonths)) ||
      Number(formData.ageMonths) < 0
    ) {
      setFormError("Please enter a valid pet age.");
      return;
    }

    if (
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      setFormError("Please enter a valid pet price.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const petData: PetFormData = {
        name: formData.name.trim(),
        species: formData.species.trim(),
        breed: formData.breed.trim(),
        ageMonths: Number(formData.ageMonths),
        price: Number(formData.price),
        description: formData.description.trim(),
        status: formData.status,
        image: selectedImage,
      };

      if (editingPet) {
        await updatePet(editingPet._id, petData);
      } else {
        await createPet(petData);
      }

      setIsModalOpen(false);
      setEditingPet(null);
      setFormData(initialFormData);
      setSelectedImage(null);

      await loadPets();
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      setFormError(
        err.response?.data?.message ||
          "Unable to save pet. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Pet
  const handleDelete = async (pet: Pet) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${pet.name}?`
    );

    if (!confirmed) return;

    try {
      setPageError("");

      await deletePet(pet._id);

      setPets((previous) =>
        previous.filter((item) => item._id !== pet._id)
      );
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };

      setPageError(
        err.response?.data?.message || "Unable to delete pet."
      );
    }
  };

  // Summary Counts
  const availableCount = pets.filter(
    (pet) => pet.status === "AVAILABLE"
  ).length;

  const reservedCount = pets.filter(
    (pet) => pet.status === "RESERVED"
  ).length;

  const soldCount = pets.filter(
    (pet) => pet.status === "SOLD"
  ).length;

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#269DA3]">
              <PawPrint size={17} />
              <span>PAWPATH MANAGEMENT SYSTEM</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-[#18365C] sm:text-3xl">
              Pet Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage pet listings, information, pricing and availability.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244c76]"
          >
            <Plus size={19} />
            Add New Pet
          </button>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <PawPrint size={23} />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                INVENTORY
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Total Pets
            </p>
            <h2 className="mt-1 text-3xl font-bold text-[#18365C]">
              {pets.length}
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Pets in current results
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <CheckCircle2 size={23} />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                AVAILABLE
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Available Pets
            </p>
            <h2 className="mt-1 text-3xl font-bold text-teal-700">
              {availableCount}
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Ready for purchase
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ShoppingBag size={23} />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                RESERVED
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Reserved Pets
            </p>
            <h2 className="mt-1 text-3xl font-bold text-orange-600">
              {reservedCount}
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Currently reserved
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <ShoppingBag size={23} />
              </div>
              <span className="text-xs font-semibold text-slate-400">
                SOLD
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              Sold Pets
            </p>
            <h2 className="mt-1 text-3xl font-bold text-purple-700">
              {soldCount}
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Successfully sold
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                <SlidersHorizontal size={21} />
              </div>

              <div>
                <h2 className="font-bold text-[#18365C]">
                  Search & Filters
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Find pets using different criteria.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <input
              type="text"
              placeholder="Search by pet name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className={inputClass}
            />

            <input
              type="text"
              placeholder="Filter by species"
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className={inputClass}
            />

            <input
              type="text"
              placeholder="Filter by breed"
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              className={inputClass}
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as PetStatus | "")
              }
              className={inputClass}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Minimum price (LKR)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={inputClass}
            />

            <input
              type="number"
              min="0"
              placeholder="Maximum price (LKR)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#244c76] disabled:opacity-50"
            >
              <Search size={17} />
              Search Pets
            </button>

            <button
              onClick={resetFilters}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Reset Filters
            </button>
          </div>
        </section>

        {/* Error Message */}
        {pageError && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <AlertCircle size={19} className="shrink-0" />
              {pageError}
            </div>

            <button
              onClick={loadPets}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Pet Listings */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="font-bold text-[#18365C]">
                Pet Listings
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                View, edit and manage registered pets.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <PawPrint size={16} className="text-teal-600" />
              {pets.length} records
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
                <Loader2
                  className="animate-spin text-teal-700"
                  size={28}
                />
              </div>

              <p className="font-semibold text-[#18365C]">
                Loading Pet Records
              </p>
              <p className="text-sm text-slate-400">
                Please wait while we fetch pet information...
              </p>
            </div>
          ) : pets.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <PackageOpen size={32} />
              </div>

              <h3 className="mt-4 font-bold text-[#18365C]">
                No Pets Found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                No pet records match your current filters. Try another
                search or add a new pet.
              </p>

              <button
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#18365C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#244c76]"
              >
                <Plus size={17} />
                Add Your First Pet
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Pet Details</th>
                    <th className="px-5 py-4 font-semibold">Pet ID</th>
                    <th className="px-5 py-4 font-semibold">Species / Breed</th>
                    <th className="px-5 py-4 font-semibold">Age</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pets.map((pet) => (
                    <tr
                      key={pet._id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {pet.imageUrl ? (
                            <img
                              src={pet.imageUrl}
                              alt={pet.name}
                              className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <ImageIcon size={21} />
                            </div>
                          )}

                          <span className="font-semibold text-[#18365C]">
                            {pet.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {pet._id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {pet.species}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {pet.breed}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {pet.ageMonths} months
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-[#18365C]">
                        {formatPrice(pet.price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles[pet.status]}`}
                        >
                          {pet.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(pet)}
                            title="Edit pet"
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(pet)}
                            title="Delete pet"
                            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#142B45]/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
                  <PawPrint size={15} />
                  PawPath Pet Management
                </div>

                <h2 className="mt-2 text-xl font-bold text-[#18365C]">
                  {editingPet ? "Edit Pet Details" : "Add New Pet"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingPet
                    ? "Update the pet information below."
                    : "Enter the details to register a new pet."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">

                {formError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                    Pet Image
                  </label>

                  <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 sm:flex-row">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {imagePreview || editingPet?.imageUrl ? (
                        <img
                          src={imagePreview || editingPet?.imageUrl}
                          alt="Pet preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={35} className="text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#18365C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#244c76]">
                        <UploadCloud size={17} />
                        Choose Image

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Supported formats: JPG, PNG and WEBP.
                        Maximum file size: 5MB.
                      </p>

                      {selectedImage && (
                        <p className="mt-2 break-all text-xs font-medium text-teal-700">
                          Selected: {selectedImage.name}
                        </p>
                      )}

                      {!selectedImage && editingPet?.imageUrl && (
                        <p className="mt-2 text-xs text-slate-400">
                          Current image will be kept if no new image is selected.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pet Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                    Pet Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter pet name"
                    className={inputClass}
                  />
                </div>

                {/* Species and Breed */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                      Species *
                    </label>

                    <input
                      type="text"
                      name="species"
                      value={formData.species}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Dog, Cat"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                      Breed *
                    </label>

                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Persian"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Age and Price */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                      Age (Months) *
                    </label>

                    <input
                      type="number"
                      name="ageMonths"
                      value={formData.ageMonths}
                      onChange={handleInputChange}
                      min="0"
                      required
                      placeholder="Enter age in months"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                      Price (LKR) *
                    </label>

                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="Enter pet price"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                    Status *
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className={inputClass}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#18365C]">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Enter pet description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#18365C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#244c76] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingPet ? "Update Pet" : "Save Pet"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PetManagement;

