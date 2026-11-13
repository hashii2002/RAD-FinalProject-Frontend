import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  BookOpen,
  Clock,
  PawPrint,
  DollarSign,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getAllTrainingPrograms,
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
} from "../../service/training-program.service";

import type {
  TrainingProgram,
  TrainingProgramFormData,
  TrainingProgramStatus,
} from "../../types/training-program.types";

const initialForm: TrainingProgramFormData = {
  name: "",
  animalType: "",
  description: "",
  durationWeeks: 1,
  price: 0,
  status: "ACTIVE",
};

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: { data?: { message?: string } };
      }
    ).response;

    return response?.data?.message || "Something went wrong.";
  }

  return error instanceof Error ? error.message : "Something went wrong.";
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(price);

const TrainingPrograms = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [animalFilter, setAnimalFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] =
    useState<TrainingProgram | null>(null);
  const [selectedProgram, setSelectedProgram] =
    useState<TrainingProgram | null>(null);

  const [formData, setFormData] =
    useState<TrainingProgramFormData>(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setPageError("");

      const data = await getAllTrainingPrograms();
      setPrograms(data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPrograms();
  }, []);

  const animalTypes = useMemo(
    () =>
      Array.from(
        new Set(
          programs
            .map((program) => program.animalType.trim())
            .filter(Boolean)
        )
      ),
    [programs]
  );

  const filteredPrograms = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesSearch =
        program.name.toLowerCase().includes(search) ||
        program._id.toLowerCase().includes(search) ||
        program.animalType.toLowerCase().includes(search);

      const matchesAnimal =
        animalFilter === "ALL" || program.animalType === animalFilter;

      const matchesStatus =
        statusFilter === "ALL" || program.status === statusFilter;

      return matchesSearch && matchesAnimal && matchesStatus;
    });
  }, [programs, searchTerm, animalFilter, statusFilter]);

  const activeCount = programs.filter(
    (program) => program.status === "ACTIVE"
  ).length;

  const inactiveCount = programs.length - activeCount;

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData(initialForm);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (program: TrainingProgram) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      animalType: program.animalType,
      description: program.description,
      durationWeeks: program.durationWeeks,
      price: program.price,
      status: program.status,
    });
    setFormError("");
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setIsFormOpen(false);
    setEditingProgram(null);
    setFormData(initialForm);
    setFormError("");
  };

  const handleFormChange = (
    field: keyof TrainingProgramFormData,
    value: string | number
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (
      !formData.name.trim() ||
      !formData.animalType.trim() ||
      !formData.description.trim()
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (!Number.isInteger(formData.durationWeeks) || formData.durationWeeks < 1) {
      setFormError("Duration must be at least 1 whole week.");
      return;
    }

    if (!Number.isFinite(formData.price) || formData.price < 0) {
      setFormError("Please enter a valid program price.");
      return;
    }

    const payload: TrainingProgramFormData = {
      ...formData,
      name: formData.name.trim(),
      animalType: formData.animalType.trim(),
      description: formData.description.trim(),
    };

    try {
      setSaving(true);

      if (editingProgram) {
        const updated = await updateTrainingProgram(
          editingProgram._id,
          payload
        );

        setPrograms((previous) =>
          previous.map((program) =>
            program._id === updated._id ? updated : program
          )
        );

        setSelectedProgram((previous) =>
          previous?._id === updated._id ? updated : previous
        );

        setSuccessMessage("Training program updated successfully.");
      } else {
        const created = await createTrainingProgram(payload);

        setPrograms((previous) => [...previous, created]);
        setSuccessMessage("Training program created successfully.");
      }

      setIsFormOpen(false);
      setEditingProgram(null);
      setFormData(initialForm);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    program: TrainingProgram,
    status: TrainingProgramStatus
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark "${program.name}" as ${status}?`
    );

    if (!confirmed) return;

    setPageError("");
    setSuccessMessage("");

    try {
      const updated = await updateTrainingProgram(program._id, { status });

      setPrograms((previous) =>
        previous.map((item) =>
          item._id === updated._id ? updated : item
        )
      );

      setSelectedProgram((previous) =>
        previous?._id === updated._id ? updated : previous
      );

      setSuccessMessage(
        `Program status changed to ${status}.`
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  };

  const handleDelete = async (program: TrainingProgram) => {
    const confirmed = window.confirm(
      `Delete "${program.name}" (${program._id})? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(program._id);
      setPageError("");
      setSuccessMessage("");

      await deleteTrainingProgram(program._id);

      setPrograms((previous) =>
        previous.filter((item) => item._id !== program._id)
      );

      setSelectedProgram((previous) =>
        previous?._id === program._id ? null : previous
      );

      setSuccessMessage("Training program deleted successfully.");
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status: TrainingProgramStatus) => (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        status === "ACTIVE"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#18365C]">
              Training Programs
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, manage and monitor pet training programs.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#269DA3] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#20868B]"
          >
            <Plus size={18} />
            Add Training Program
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              aria-label="Close success message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {pageError && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{pageError}</span>
            <button
              onClick={() => setPageError("")}
              aria-label="Close error message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Programs</p>
                <p className="mt-2 text-2xl font-bold text-[#18365C]">
                  {programs.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <BookOpen size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Programs</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <PawPrint size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Inactive Programs</p>
                <p className="mt-2 text-2xl font-bold text-slate-600">
                  {inactiveCount}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                <Clock size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by ID, name or animal..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
              />
            </div>

            <select
              value={animalFilter}
              onChange={(event) => setAnimalFilter(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#269DA3]"
            >
              <option value="ALL">All Animal Types</option>
              {animalTypes.map((animal) => (
                <option key={animal} value={animal}>
                  {animal}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#269DA3]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Programs table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#18365C]">
                Training Program List
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredPrograms.length} program(s) found
              </p>
            </div>

            <button
              onClick={() => void loadPrograms()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#269DA3]" />
              <p className="text-sm text-slate-500">
                Loading training programs...
              </p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <BookOpen className="mx-auto text-slate-300" size={38} />
              <p className="mt-3 font-medium text-slate-600">
                No training programs found
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-262.5 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Program</th>
                    <th className="px-5 py-4 font-semibold">Animal Type</th>
                    <th className="px-5 py-4 font-semibold">Duration</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPrograms.map((program) => (
                    <tr
                      key={program._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#18365C]">
                          {program.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {program._id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {program.animalType}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {program.durationWeeks} weeks
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {formatPrice(program.price)}
                      </td>

                      <td className="px-5 py-4">
                        {statusBadge(program.status)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedProgram(program)}
                            title="View details"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() => openEditModal(program)}
                            title="Edit program"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              void handleStatusChange(
                                program,
                                program.status === "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE"
                              )
                            }
                            title={
                              program.status === "ACTIVE"
                                ? "Deactivate program"
                                : "Activate program"
                            }
                            className="rounded-lg px-2 py-2 text-xs font-semibold text-[#269DA3] transition hover:bg-teal-50"
                          >
                            {program.status === "ACTIVE" ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => void handleDelete(program)}
                            disabled={deletingId === program._id}
                            title="Delete program"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            {deletingId === program._id ? (
                              <span className="text-xs">...</span>
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  {editingProgram ? "Edit Training Program" : "Add Training Program"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingProgram
                    ? `Update ${editingProgram._id}`
                    : "Enter the new program details below."}
                </p>
              </div>

              <button
                onClick={closeFormModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      handleFormChange("name", event.target.value)
                    }
                    placeholder="e.g. Basic Obedience Training"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Animal Type *
                  </label>
                  <input
                    type="text"
                    value={formData.animalType}
                    onChange={(event) =>
                      handleFormChange("animalType", event.target.value)
                    }
                    placeholder="e.g. Dog, Cat"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Duration (Weeks) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.durationWeeks}
                    onChange={(event) =>
                      handleFormChange(
                        "durationWeeks",
                        Number(event.target.value)
                      )
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Program Price (LKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(event) =>
                      handleFormChange("price", Number(event.target.value))
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      handleFormChange(
                        "status",
                        event.target.value as TrainingProgramStatus
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#269DA3]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Program Description *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(event) =>
                      handleFormChange("description", event.target.value)
                    }
                    placeholder="Describe what this training program includes..."
                    required
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#269DA3] focus:ring-2 focus:ring-[#269DA3]/10"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#269DA3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20868B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingProgram
                      ? "Save Changes"
                      : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#18365C]">
                  Program Details
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedProgram._id}
                </p>
              </div>

              <button
                onClick={() => setSelectedProgram(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <h3 className="text-xl font-bold text-[#18365C]">
                  {selectedProgram.name}
                </h3>
                <div className="mt-2">
                  {statusBadge(selectedProgram.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <PawPrint size={16} />
                    <span className="text-xs">Animal Type</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-700">
                    {selectedProgram.animalType}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span className="text-xs">Duration</span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-700">
                    {selectedProgram.durationWeeks} weeks
                  </p>
                </div>

                <div className="col-span-2 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <DollarSign size={16} />
                    <span className="text-xs">Program Price</span>
                  </div>
                  <p className="mt-2 text-lg font-bold text-[#269DA3]">
                    {formatPrice(selectedProgram.price)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-slate-700">
                  Description
                </h4>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedProgram.description}
                </p>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => {
                    const program = selectedProgram;
                    setSelectedProgram(null);
                    openEditModal(program);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#269DA3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#20868B]"
                >
                  <Pencil size={16} />
                  Edit Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TrainingPrograms;
