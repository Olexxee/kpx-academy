import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import type {
  CreateTrainingData,
  TrainingProgram
} from "../../../api/training.api";
import {
  useCreateTrainingProgram,
  useUpdateTrainingProgram,
} from "../../../features/admin/training/training.mutations";
import type{ TrainingProgramFormValues } from "../../../types/training.types"

import { StringListEditor } from "./StringListEditor";

interface Props {
  program: TrainingProgram | null;
  onClose: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D4ED8] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

const ERROR_INPUT_CLASS =
  "w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-sm text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;

const DELIVERY_MODES = [
  { value: "PHYSICAL", label: "Physical" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
] as const;

// ============================================================================
// HELPERS
// ============================================================================

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// API returns ISO datetimes; <input type="date"> wants YYYY-MM-DD.
const toDateInput = (value: string | null | undefined): string =>
  value ? value.slice(0, 10) : "";

const emptyForm = (): TrainingProgramFormValues => ({
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: 0,
  currency: "NGN",
  duration: "",
  deliveryMode: "PHYSICAL",
  location: "",
  startDate: "",
  endDate: "",
  registrationDeadline: "",
  capacity: null,
  active: true,
  featured: false,
  displayOrder: 0,
  highlights: [],
  curriculum: [],
  requirements: [],
  benefits: [],
});

const toFormValues = (p: TrainingProgram): TrainingProgramFormValues => ({
  title: p.title,
  slug: p.slug,
  shortDescription: p.shortDescription ?? "",
  description: p.description ?? "",
  price: Number(p.price),
  currency: p.currency,
  duration: p.duration ?? "",
  deliveryMode: p.deliveryMode,
  location: p.location ?? "",
  startDate: toDateInput(p.startDate),
  endDate: toDateInput(p.endDate),
  registrationDeadline: toDateInput(p.registrationDeadline),
  capacity: p.capacity ?? null,
  active: p.active,
  featured: p.featured,
  displayOrder: p.displayOrder,
  highlights: p.highlights ?? [],
  curriculum: p.curriculum ?? [],
  requirements: p.requirements ?? [],
  benefits: p.benefits ?? [],
});

const toPayload = (v: TrainingProgramFormValues): CreateTrainingData => ({
  title: v.title.trim(),
  slug: v.slug.trim() || slugify(v.title),
  shortDescription: v.shortDescription.trim() || null,
  description: v.description.trim() || null,
  price: v.price,
  currency: v.currency,
  duration: v.duration.trim() || null,
  deliveryMode: v.deliveryMode,
  location: v.location.trim() || null,
  startDate: v.startDate || null,
  endDate: v.endDate || null,
  registrationDeadline: v.registrationDeadline || null,
  capacity: v.capacity,
  active: v.active,
  featured: v.featured,
  displayOrder: v.displayOrder,
  highlights: v.highlights,
  curriculum: v.curriculum,
  requirements: v.requirements,
  benefits: v.benefits,
});

// ============================================================================
// FORM
// ============================================================================

export default function TrainingForm({ program, onClose }: Props) {
  const createMutation = useCreateTrainingProgram();
  const updateMutation = useUpdateTrainingProgram();

  const [form, setForm] = useState<TrainingProgramFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Slug is auto-derived from title until the user types into it manually.
  // On edit, we start "locked" so we never clobber an existing slug.
  const [slugLocked, setSlugLocked] = useState(!!program);

  useEffect(() => {
    if (!program) {
      setForm(emptyForm());
      setSlugLocked(false);
      setErrors({});
      return;
    }
    setForm(toFormValues(program));
    setSlugLocked(true);
    setErrors({});
  }, [program]);

  const setField = <K extends keyof TrainingProgramFormValues>(
    field: K,
    value: TrainingProgramFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field as string];
      return next;
    });
  };

  const handleTitleChange = (value: string) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugLocked ? current.slug : slugify(value),
    }));
    setErrors((c) => {
      if (!c.title) return c;
      const next = { ...c };
      delete next.title;
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.title.trim()) next.title = "Title is required";
    if (form.price < 0) next.price = "Price cannot be negative";
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      next.endDate = "End date must be on or after start date";
    }
    if (
      form.registrationDeadline &&
      form.startDate &&
      form.registrationDeadline > form.startDate
    ) {
      next.registrationDeadline =
        "Registration deadline should be before the start date";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = toPayload(form);
    if (program) {
      await updateMutation.mutateAsync({ id: program.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const title = program ? "Edit training program" : "Create training program";
  const subtitle = program
    ? "Update the details and save to apply changes."
    : "Fill in the details below. You can add media after saving.";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1D4ED8]/50 p-4 sm:p-6">
      <div className="my-4 w-full max-w-4xl rounded-2xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* ─── Basics ──────────────────────────────────────────── */}
          <Section index={1} title="Basics">
            <Field
              label="Title"
              value={form.title}
              required
              error={errors.title}
              onChange={handleTitleChange}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  setField("slug", e.target.value);
                }}
                placeholder="auto-generated from title"
                className={INPUT_CLASS}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {slugLocked
                  ? "Manually set. Clear the field to auto-generate again."
                  : "Auto-generated from the title."}
              </p>
            </div>

            <Textarea
              label="Short description"
              value={form.shortDescription}
              onChange={(v) => setField("shortDescription", v)}
              rows={2}
              hint="Shown on the programs list and cards."
            />

            <Textarea
              label="Full description"
              value={form.description}
              onChange={(v) => setField("description", v)}
              rows={6}
            />
          </Section>

          {/* ─── Pricing & schedule ──────────────────────────────── */}
          <Section index={2} title="Pricing & schedule">
            <div className="grid gap-5 sm:grid-cols-3">
              <NumberField
                label="Price"
                value={form.price}
                onChange={(v) => setField("price", v ?? 0)}
                error={errors.price}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  className={INPUT_CLASS}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Duration"
                value={form.duration}
                placeholder="e.g. 6 weeks"
                onChange={(v) => setField("duration", v)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <DateField
                label="Start date"
                value={form.startDate}
                onChange={(v) => setField("startDate", v)}
              />
              <DateField
                label="End date"
                value={form.endDate}
                error={errors.endDate}
                onChange={(v) => setField("endDate", v)}
              />
              <DateField
                label="Registration deadline"
                value={form.registrationDeadline}
                error={errors.registrationDeadline}
                onChange={(v) => setField("registrationDeadline", v)}
              />
            </div>
          </Section>

          {/* ─── Delivery ────────────────────────────────────────── */}
          <Section index={3} title="Delivery">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Delivery mode
              </label>
              <div className="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-1">
                {DELIVERY_MODES.map((mode) => {
                  const active = form.deliveryMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setField("deliveryMode", mode.value)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Location"
                value={form.location}
                placeholder="e.g. Lagos, Nigeria"
                onChange={(v) => setField("location", v)}
              />
              <NumberField
                label="Capacity"
                value={form.capacity}
                onChange={(v) => setField("capacity", v)}
                hint="Leave empty for unlimited."
                integer
              />
            </div>
          </Section>

          {/* ─── Content ─────────────────────────────────────────── */}
          <Section
            index={4}
            title="Content"
            description="List items render as bullet points on the storefront."
          >
            <StringListEditor
              label="Curriculum"
              description="Each item is a module or session. Drag order using the arrows."
              placeholder="e.g. Introduction to product design"
              values={form.curriculum}
              onChange={(v) => setField("curriculum", v)}
              numbered
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <StringListEditor
                label="Highlights"
                description="What makes this program stand out."
                placeholder="e.g. Live mentorship"
                values={form.highlights}
                onChange={(v) => setField("highlights", v)}
                maxItems={8}
              />
              <StringListEditor
                label="Requirements"
                description="What learners need before joining."
                placeholder="e.g. Basic computer skills"
                values={form.requirements}
                onChange={(v) => setField("requirements", v)}
                maxItems={10}
              />
              <StringListEditor
                label="Benefits"
                description="Outcomes at the end of the program."
                placeholder="e.g. Job-ready portfolio"
                values={form.benefits}
                onChange={(v) => setField("benefits", v)}
                maxItems={10}
              />
            </div>
          </Section>

          {/* ─── Visibility ──────────────────────────────────────── */}
          <Section index={5} title="Visibility">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Active"
                description="Visible on the storefront"
                checked={form.active}
                onChange={(v) => setField("active", v)}
              />
              <Toggle
                label="Featured"
                description="Highlight on the programs page"
                checked={form.featured}
                onChange={(v) => setField("featured", v)}
              />
              <div className="sm:col-span-2">
                <NumberField
                  label="Display order"
                  value={form.displayOrder}
                  onChange={(v) => setField("displayOrder", v ?? 0)}
                  hint="Lower numbers appear first."
                  integer
                />
              </div>
            </div>
          </Section>

          {/* ─── Footer ──────────────────────────────────────────── */}
          <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending
                ? "Saving..."
                : program
                  ? "Update program"
                  : "Create program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// LAYOUT PRIMITIVES
// ============================================================================

function Section({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8] text-xs font-semibold text-white">
          {index}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ─── Field wrappers ──────────────────────────────────────────────────────

function Field({
  label,
  value,
  type = "text",
  required,
  placeholder,
  error,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={error ? ERROR_INPUT_CLASS : INPUT_CLASS}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Textarea({
  label,
  value,
  placeholder,
  hint,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} resize-y`}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function DateField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? ERROR_INPUT_CLASS : INPUT_CLASS}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Buffers the raw string so the input can be truly empty (Number("") === 0
 * would silently overwrite real values on blur). Emits `null` for empty,
 * a number otherwise. External value changes re-sync the buffer, but our
 * own emissions don't reset it — so typing stays undisturbed.
 */
function NumberField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  integer = false,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  integer?: boolean;
}) {
  const [text, setText] = useState(
    value === null || value === undefined ? "" : String(value),
  );
  const lastEmitted = useRef<number | null>(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(value === null || value === undefined ? "" : String(value));
      lastEmitted.current = value;
    }
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    if (raw === "") {
      lastEmitted.current = null;
      onChange(null);
      return;
    }
    const parsed = integer ? Number.parseInt(raw, 10) : Number(raw);
    if (Number.isFinite(parsed)) {
      lastEmitted.current = parsed;
      onChange(parsed);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type="number"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        step={integer ? "1" : "any"}
        className={error ? ERROR_INPUT_CLASS : INPUT_CLASS}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {!error && hint && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 rounded-xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-slate-300"
      />
    </label>
  );
}
