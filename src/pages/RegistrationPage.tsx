import React, { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck, User } from "lucide-react";
import { initializePayment } from "../features/payment/payments.api";
import { useTrainingPrograms } from "../features/training/hooks/useTrainingPrograms";
import { Container } from "../components/ui/Container";

interface RegistrationFormValues {
  fullName: string;
  email: string;
  trainingProgramId: string;
}

type FormErrors = Partial<Record<keyof RegistrationFormValues, string>>;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: { data?: { message?: string } };
      }
    ).response;

    if (response?.data?.message) return response.data.message;
  }

  if (error instanceof Error) return error.message;

  return "Unable to initialize payment. Please try again.";
};

const formatPrice = (amount: number | string, currency: string) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "Price unavailable";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "NGN"} ${value.toLocaleString("en-NG")}`;
  }
};

export default function RegistrationForm() {
  const [searchParams] = useSearchParams();

  const {
    data: programs = [],
    isLoading: programsLoading,
    isError: programsError,
    refetch: refetchPrograms,
  } = useTrainingPrograms();

  const [form, setForm] = useState<RegistrationFormValues>({
    fullName: "",
    email: "",
    trainingProgramId: searchParams.get("program") ?? "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentError, setPaymentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePrograms = useMemo(
    () => programs.filter((program) => program.active),
    [programs],
  );

  const selectedProgram = useMemo(
    () =>
      availablePrograms.find(
        (program) => program.id === form.trainingProgramId,
      ),
    [availablePrograms, form.trainingProgramId],
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setPaymentError("");

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (!form.trainingProgramId) {
      nextErrors.trainingProgramId = "Please select a training programme.";
    } else if (!selectedProgram) {
      nextErrors.trainingProgramId =
        "This programme is unavailable. Please select another.";
    }

    if (!fullName) {
      nextErrors.fullName = "Full name is required.";
    } else if (fullName.length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setPaymentError("");

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const payment = await initializePayment({
        name: form.fullName.trim(),
        email: form.email.trim(),
        trainingProgramId: form.trainingProgramId,
      });

      if (!payment.authorizationUrl) {
        throw new Error("Paystack checkout URL was not returned.");
      }

      // The backend initializes checkout; Paystack handles the payment.
      window.location.assign(payment.authorizationUrl);
    } catch (error: unknown) {
      setPaymentError(getErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  if (programsLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background">
        <p className="text-text-muted">Loading programmes...</p>
      </div>
    );
  }

  if (programsError) {
    return (
      <section className="bg-background py-24">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-heading text-3xl font-bold text-primary">
              Unable to load programmes
            </h1>
            <p className="mt-4 leading-7 text-text-muted">
              Please try again before proceeding with registration.
            </p>
            <button
              type="button"
              onClick={() => void refetchPrograms()}
              className="mt-6 rounded-control bg-primary px-6 py-3 font-semibold text-white hover:bg-secondary"
            >
              Try again
            </button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background py-10 sm:py-16">
      <Container>
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition hover:text-secondary"
        >
          <ArrowLeft size={16} />
          Back to programmes
        </Link>

        <div className="mx-auto mt-8 grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              KPX Academy
            </p>

            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-primary sm:text-5xl">
              Start your learning journey.
            </h1>

            <p className="mt-5 max-w-lg leading-7 text-text-muted">
              Choose your training programme, provide your details, and continue
              to secure checkout.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-6">
              <div>
                <label
                  htmlFor="trainingProgramId"
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Training programme
                </label>

                <select
                  id="trainingProgramId"
                  name="trainingProgramId"
                  value={form.trainingProgramId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.trainingProgramId)}
                  aria-describedby={
                    errors.trainingProgramId ? "program-error" : undefined
                  }
                  className="w-full rounded-control border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-60"
                >
                  <option value="">Select a programme</option>
                  {availablePrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>

                {errors.trainingProgramId && (
                  <p id="program-error" className="mt-2 text-sm text-error">
                    {errors.trainingProgramId}
                  </p>
                )}

                {availablePrograms.length === 0 && (
                  <p className="mt-2 text-sm text-text-muted">
                    No active programmes are currently available for
                    registration.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={
                      errors.fullName ? "name-error" : undefined
                    }
                    className="w-full rounded-control border border-border bg-surface py-3 pl-10 pr-4 text-text outline-none transition placeholder:text-text-muted/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-60"
                  />
                </div>

                {errors.fullName && (
                  <p id="name-error" className="mt-2 text-sm text-error">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full rounded-control border border-border bg-surface py-3 pl-10 pr-4 text-text outline-none transition placeholder:text-text-muted/70 focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:opacity-60"
                  />
                </div>

                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-error">
                    {errors.email}
                  </p>
                )}
              </div>

              {paymentError && (
                <div
                  role="alert"
                  className="rounded-control border border-error/20 bg-error/5 p-4 text-sm text-error"
                >
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || availablePrograms.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-control bg-primary px-6 py-4 font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Initializing secure checkout...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Continue to payment
                  </>
                )}
              </button>

              <p className="text-center text-sm leading-6 text-text-muted">
                You will be redirected to Paystack to complete payment.
              </p>
            </form>
          </div>

          <aside className="h-fit rounded-card border border-border bg-surface p-6 sm:p-8 lg:mt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Registration summary
            </p>

            <h2 className="mt-5 font-heading text-2xl font-bold text-primary">
              {selectedProgram?.title ?? "Select a programme"}
            </h2>

            {selectedProgram?.shortDescription && (
              <p className="mt-3 leading-7 text-text-muted">
                {selectedProgram.shortDescription}
              </p>
            )}

            <div className="my-6 border-t border-border" />

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-text-muted">Programme fee</span>
              <span className="text-right font-heading text-xl font-bold text-primary">
                {selectedProgram
                  ? formatPrice(selectedProgram.price, selectedProgram.currency)
                  : "—"}
              </span>
            </div>

            {selectedProgram?.duration && (
              <div className="mt-5 flex justify-between gap-4 text-sm">
                <span className="text-text-muted">Duration</span>
                <span className="text-right font-medium text-primary">
                  {selectedProgram.duration}
                </span>
              </div>
            )}

            {selectedProgram?.deliveryMode && (
              <div className="mt-4 flex justify-between gap-4 text-sm">
                <span className="text-text-muted">Delivery</span>
                <span className="text-right font-medium text-primary">
                  {selectedProgram.deliveryMode === "PHYSICAL"
                    ? "In-person"
                    : selectedProgram.deliveryMode === "ONLINE"
                      ? "Online"
                      : selectedProgram.deliveryMode === "HYBRID"
                        ? "Hybrid"
                        : selectedProgram.deliveryMode}
                </span>
              </div>
            )}

            <div className="mt-6 rounded-control bg-background p-4">
              <p className="text-sm font-semibold text-primary">
                Secure payment
              </p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Your payment is processed through Paystack. Registration
                confirmation and access instructions depend on successful
                backend payment verification.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
