import { useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useAdminTrainingPrograms } from "../../features/admin/training/training.queries";
import {
  useDeleteTrainingProgram,
  useToggleTrainingFeatured,
  useToggleTrainingStatus,
} from "../../features/admin/training/training.mutations";
import type { TrainingProgram } from "../../api/training.api";
import TrainingForm from "../../components/admin/training/TrainingForm";
import TrainingMediaManager from "../../components/admin/training/TrainingMediaManager";


export default function AdminTrainingPage() {
  const query = useAdminTrainingPrograms();

  const deleteMutation = useDeleteTrainingProgram();
  const statusMutation = useToggleTrainingStatus();
  const featuredMutation = useToggleTrainingFeatured();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TrainingProgram | null>(null);
  const [mediaProgram, setMediaProgram] = useState<TrainingProgram | null>(
    null,
  );

  const programs: TrainingProgram[] = query.data ?? [];

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (program: TrainingProgram) => {
    setEditing(program);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (program: TrainingProgram) => {
    const confirmed = window.confirm(
      `Delete "${program.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    await deleteMutation.mutateAsync(program.id);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Training programs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage registration programs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] sm:w-auto"
        >
          <Plus size={17} />
          New program
        </button>
      </div>

      {/* Error */}
      {query.isError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load training programs.
        </div>
      )}

      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <Th>Program</Th>
                <Th>Price</Th>
                <Th>Mode</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {query.isLoading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <LoadingRow key={index} />
                ))}

              {!query.isLoading &&
                programs.map((program) => (
                  <TrainingTableRow
                    key={program.id}
                    program={program}
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === program.id
                    }
                    isStatusUpdating={
                      statusMutation.isPending &&
                      statusMutation.variables?.id === program.id
                    }
                    isFeaturedUpdating={
                      featuredMutation.isPending &&
                      featuredMutation.variables?.id === program.id
                    }
                    onEdit={() => handleEdit(program)}
                    onDelete={() => handleDelete(program)}
                    onManageMedia={() => setMediaProgram(program)}
                    onToggleStatus={() =>
                      statusMutation.mutate({
                        id: program.id,
                        active: !program.active,
                      })
                    }
                    onToggleFeatured={() =>
                      featuredMutation.mutate({
                        id: program.id,
                        featured: !program.featured,
                      })
                    }
                  />
                ))}

              {!query.isLoading && programs.length === 0 && (
                <EmptyTableState />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {query.isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}

        {!query.isLoading &&
          programs.map((program) => (
            <TrainingMobileCard
              key={program.id}
              program={program}
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables === program.id
              }
              isStatusUpdating={
                statusMutation.isPending &&
                statusMutation.variables?.id === program.id
              }
              isFeaturedUpdating={
                featuredMutation.isPending &&
                featuredMutation.variables?.id === program.id
              }
              onEdit={() => handleEdit(program)}
              onDelete={() => handleDelete(program)}
              onManageMedia={() => setMediaProgram(program)}
              onToggleStatus={() =>
                statusMutation.mutate({
                  id: program.id,
                  active: !program.active,
                })
              }
              onToggleFeatured={() =>
                featuredMutation.mutate({
                  id: program.id,
                  featured: !program.featured,
                })
              }
            />
          ))}

        {!query.isLoading && programs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">
              No training programs yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Create your first program to get started.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={14} />
              Create program
            </button>
          </div>
        )}
      </div>

      {/* Training form */}
      {showForm && (
        <TrainingForm
          program={editing}
          onClose={handleCloseForm}
        />
      )}

      {/* Media manager */}
      {mediaProgram && (
        <TrainingMediaManager
          program={mediaProgram}
          onClose={() => setMediaProgram(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   DESKTOP TABLE ROW
============================================================ */

function TrainingTableRow({
  program,
  isDeleting,
  isStatusUpdating,
  isFeaturedUpdating,
  onEdit,
  onDelete,
  onManageMedia,
  onToggleStatus,
  onToggleFeatured,
}: {
  program: TrainingProgram;
  isDeleting: boolean;
  isStatusUpdating: boolean;
  isFeaturedUpdating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onManageMedia: () => void;
  onToggleStatus: () => void;
  onToggleFeatured: () => void;
}) {
  const busy = isDeleting || isStatusUpdating || isFeaturedUpdating;

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-6 py-5">
        <p className="font-medium text-slate-900">
          {program.title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          /{program.slug}
        </p>
      </td>

      <td className="px-6 py-5 text-sm text-slate-700">
        {program.currency}{" "}
        {Number(program.price).toLocaleString()}
      </td>

      <td className="px-6 py-5 text-sm text-slate-700">
        {program.deliveryMode}
      </td>

      <td className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isStatusUpdating}
            onClick={onToggleStatus}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              program.active
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {program.active ? (
              <CheckCircle2 size={13} />
            ) : (
              <XCircle size={13} />
            )}

            {program.active ? "Active" : "Inactive"}
          </button>

          <button
            type="button"
            disabled={isFeaturedUpdating}
            onClick={onToggleFeatured}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              program.featured
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {program.featured ? "Featured" : "Not featured"}
          </button>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onManageMedia}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImageIcon size={14} />
            Media
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Edit3 size={14} />
            Edit
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE CARD
============================================================ */

function TrainingMobileCard({
  program,
  isDeleting,
  isStatusUpdating,
  isFeaturedUpdating,
  onEdit,
  onDelete,
  onManageMedia,
  onToggleStatus,
  onToggleFeatured,
}: {
  program: TrainingProgram;
  isDeleting: boolean;
  isStatusUpdating: boolean;
  isFeaturedUpdating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onManageMedia: () => void;
  onToggleStatus: () => void;
  onToggleFeatured: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900">
              {program.title}
            </h2>

            <p className="mt-1 truncate text-xs text-slate-500">
              /{program.slug}
            </p>
          </div>

          <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {program.deliveryMode}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Price
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-900">
            {program.currency}{" "}
            {Number(program.price).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Program status
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isStatusUpdating}
            onClick={onToggleStatus}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              program.active
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {program.active ? (
              <CheckCircle2 size={14} />
            ) : (
              <XCircle size={14} />
            )}

            {program.active ? "Active" : "Inactive"}
          </button>

          <button
            type="button"
            disabled={isFeaturedUpdating}
            onClick={onToggleFeatured}
            className={`min-h-11 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              program.featured
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {program.featured ? "Featured" : "Not featured"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 bg-slate-50/60 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onManageMedia}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImageIcon size={15} />
            Media
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onEdit}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Edit3 size={15} />
            Edit
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onDelete}
            className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            {isDeleting ? "Deleting..." : "Delete program"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE HELPERS
============================================================ */

function LoadingRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-5">
        <div className="h-4 w-40 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-5">
        <div className="h-4 w-20 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-5">
        <div className="h-4 w-20 rounded bg-slate-100" />
      </td>

      <td className="px-6 py-5">
        <div className="h-7 w-28 rounded-full bg-slate-100" />
      </td>

      <td className="px-6 py-5">
        <div className="ml-auto h-9 w-60 rounded bg-slate-100" />
      </td>
    </tr>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="h-5 w-2/3 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />

      <div className="mt-6 h-4 w-20 rounded bg-slate-100" />
      <div className="mt-2 h-6 w-28 rounded bg-slate-100" />

      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="h-11 rounded-xl bg-slate-100" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="h-11 rounded-xl bg-slate-100" />
        <div className="col-span-2 h-11 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function EmptyTableState() {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-16 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No training programs yet
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Create your first program to get started.
        </p>
      </td>
    </tr>
  );
}

/* ============================================================
   TABLE HEADER
============================================================ */

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
