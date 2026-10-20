import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Check,
  FileCheck2,
  Mail,
  Plus,
  RefreshCw,
  ShieldAlert,
  X,
} from "lucide-react";
import { registrationApi } from "../../lib/registrationApi";

type View = "submissions" | "certificates" | "issue";
type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
type ReviewStatus = "APPROVED" | "REJECTED";

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  trainingProgramTitle?: string;
  trainingProgram?: { title: string };
  status: SubmissionStatus;
  createdAt: string;
  notes?: string | null;
}

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  studentEmail: string;
  trainingProgramTitle: string;
  status: string;
  issuedAt?: string;
  revokedAt?: string | null;
}

interface ListResponse<T> {
  data: {
    items: T[];
  };
}

interface NoticeProps {
  message: string;
}

function Notice({ message }: NoticeProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"
    >
      {message}
    </p>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700",
    ACTIVE: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    REJECTED: "bg-red-50 text-red-700",
    REVOKED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "secondary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-[var(--kpx-royal-blue)] text-white hover:opacity-90",
    secondary: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    danger: "border border-red-100 bg-white text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export default function AdminCertificatesPage() {
  const [view, setView] = useState<View>("submissions");
  const [search, setSearch] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [programTitle, setProgramTitle] = useState("");
  const [notice, setNotice] = useState("");

  // Keep review notes separate for each submission.
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  // Use an in-page confirmation form instead of window.prompt().
  const [revokingCertificateId, setRevokingCertificateId] = useState<
    string | null
  >(null);
  const [revokeReason, setRevokeReason] = useState("");

  const client = useQueryClient();

  const submissionsQuery = useQuery({
    queryKey: ["admin", "certificate-submissions", search],
    queryFn: async () => {
      const response = await registrationApi.get<ListResponse<Submission>>(
        "/certificates/admin/submissions",
        {
          params: {
            page: 1,
            limit: 50,
            search: search.trim() || undefined,
          },
        },
      );

      return response.data.data.items;
    },
    enabled: view === "submissions",
  });

  const certificatesQuery = useQuery({
    queryKey: ["admin", "certificates", search],
    queryFn: async () => {
      const response = await registrationApi.get<ListResponse<Certificate>>(
        "/certificates/admin",
        {
          params: {
            page: 1,
            limit: 50,
            search: search.trim() || undefined,
          },
        },
      );

      return response.data.data.items;
    },
    enabled: view === "certificates",
  });

  const invalidateRecords = async () => {
    await Promise.all([
      client.invalidateQueries({
        queryKey: ["admin", "certificate-submissions"],
      }),
      client.invalidateQueries({
        queryKey: ["admin", "certificates"],
      }),
    ]);
  };

  const review = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ReviewStatus;
      notes?: string;
    }) =>
      registrationApi.patch(
        `/certificates/admin/submissions/${encodeURIComponent(id)}/review`,
        { status, reviewNotes: notes?.trim() || undefined },
      ),
    onSuccess: async (_, variables) => {
      setNotice("Submission review saved.");
      setReviewNotes((current) => ({
        ...current,
        [variables.id]: "",
      }));
      await invalidateRecords();
    },
    onError: () =>
      setNotice(
        "The review could not be saved. Confirm the certificate API is deployed.",
      ),
  });
  const issueSubmission = useMutation({
    mutationFn: async (id: string) =>
      registrationApi.post(
        `/certificates/admin/submissions/${encodeURIComponent(id)}/issue`,
      ),
    onSuccess: async () => {
      setNotice("Certificate issuance request completed.");
      await invalidateRecords();
    },
    onError: () =>
      setNotice(
        "Certificate could not be issued. Only approved submissions can be issued.",
      ),
  });
  const directIssue = useMutation({
    mutationFn: async () =>
      registrationApi.post("/certificates/admin/issue", {
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        trainingProgramTitle: programTitle.trim(),
      }),
    onSuccess: async () => {
      setNotice("Direct certificate issuance request completed.");
      setStudentName("");
      setStudentEmail("");
      setProgramTitle("");
      setView("certificates");
      await invalidateRecords();
    },
    onError: () =>
      setNotice(
        "Direct issuance failed. Check the entered details and API response.",
      ),
  });
  const resend = useMutation({
    mutationFn: async (id: string) =>
      registrationApi.post(
        `/certificates/admin/${encodeURIComponent(id)}/resend`,
      ),
    onSuccess: () => setNotice("Certificate resend request completed."),
    onError: () => setNotice("Certificate email could not be resent."),
  });
  const revoke = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      registrationApi.patch(
        `/certificates/admin/${encodeURIComponent(id)}/revoke`,
        { reason },
      ),
    onSuccess: async () => {
      setNotice("Certificate revocation request completed.");
      await invalidateRecords();
    },
    onError: () => setNotice("Certificate could not be revoked."),
  });

  const submissions = submissionsQuery.data ?? [];
  const certificates = certificatesQuery.data ?? [];

  const isLoading =
    view === "submissions"
      ? submissionsQuery.isLoading
      : view === "certificates"
        ? certificatesQuery.isLoading
        : false;

  const isError =
    view === "submissions"
      ? submissionsQuery.isError
      : view === "certificates"
        ? certificatesQuery.isError
        : false;

  const refreshRecords = () => {
    if (view === "submissions") {
      void submissionsQuery.refetch();
    } else if (view === "certificates") {
      void certificatesQuery.refetch();
    }
  };

  const changeView = (nextView: View) => {
    setView(nextView);
    setNotice("");
  };

  const openRevocationForm = (id: string) => {
    setRevokingCertificateId(id);
    setRevokeReason("");
    setNotice("");
  };

  const cancelRevocation = () => {
    setRevokingCertificateId(null);
    setRevokeReason("");
  };

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      {/* Page header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kpx-deep-magenta)]">
            Student records
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-[var(--kpx-charcoal)] sm:text-3xl">
            Certificates
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Review student proof, issue certificates, resend delivery emails,
            and revoke certificates when necessary.
          </p>
        </div>

        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--kpx-soft-blush)] text-[var(--kpx-deep-magenta)]">
          <Award size={24} />
        </span>
      </header>

      {/* Navigation */}
      <nav
        aria-label="Certificate management sections"
        className="mt-7 flex flex-wrap gap-2 border-b border-gray-200"
      >
        {(
          [
            { id: "submissions", label: "Proof submissions" },
            { id: "certificates", label: "Issued certificates" },
            { id: "issue", label: "Direct issue" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeView(item.id)}
            aria-current={view === item.id ? "page" : undefined}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              view === item.id
                ? "border-[var(--kpx-royal-blue)] text-[var(--kpx-royal-blue)]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {notice && <Notice message={notice} />}

      {/* Direct issuance */}
      {view === "issue" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotice("");
            directIssue.mutate();
          }}
          className="mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[var(--kpx-royal-blue)]">
              <FileCheck2 size={19} />
            </span>

            <div>
              <h2 className="font-semibold">Issue a certificate directly</h2>
              <p className="text-sm text-gray-500">
                For historical students or cases without a registration record.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Student name
              <input
                required
                autoComplete="name"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-[var(--kpx-royal-blue)]"
              />
            </label>

            <label className="text-sm font-medium">
              Student email
              <input
                required
                type="email"
                autoComplete="email"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-[var(--kpx-royal-blue)]"
              />
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Training program title
              <input
                required
                value={programTitle}
                onChange={(event) => setProgramTitle(event.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-[var(--kpx-royal-blue)]"
              />
            </label>
          </div>

          <p className="mt-4 rounded-xl bg-[var(--kpx-warm-white)] p-3 text-xs leading-5 text-gray-600">
            Direct issuance does not require a registration record. Verify the
            recipient and program details before issuing.
          </p>

          <button
            type="submit"
            disabled={
              directIssue.isPending ||
              !studentName.trim() ||
              !studentEmail.trim() ||
              !programTitle.trim()
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--kpx-royal-blue)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            {directIssue.isPending ? "Issuing…" : "Issue certificate"}
          </button>
        </form>
      )}

      {/* Submission and certificate records */}
      {view !== "issue" && (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student, email, or certificate number"
              aria-label="Search certificate records"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--kpx-royal-blue)]"
            />

            <button
              type="button"
              onClick={refreshRecords}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {isLoading && (
            <div
              role="status"
              className="mt-5 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500"
            >
              Loading certificate records…
            </div>
          )}

          {isError && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <ShieldAlert className="mr-2 inline" size={16} />
              Could not load records. Check the certificate-management backend
              deployment and your admin session.
              <button
                type="button"
                onClick={refreshRecords}
                className="ml-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Proof submissions */}
          {view === "submissions" && !isLoading && !isError && (
            <div className="mt-5 space-y-3">
              {submissions.length === 0 && (
                <EmptyState message="No proof submissions found." />
              )}

              {submissions.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-semibold">{item.studentName}</h2>

                      <p className="mt-1 break-all text-sm text-gray-500">
                        {item.studentEmail}
                      </p>

                      <p className="mt-2 text-sm">
                        {item.trainingProgramTitle ??
                          item.trainingProgram?.title ??
                          "Training program"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Submitted{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>

                      {item.notes && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  {item.status === "PENDING" && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <label className="block text-xs font-medium text-gray-600">
                        Review note
                        <textarea
                          rows={2}
                          value={reviewNotes[item.id] ?? ""}
                          onChange={(event) =>
                            setReviewNotes((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                          placeholder="Optional note for this submission"
                          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--kpx-royal-blue)]"
                        />
                      </label>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <ActionButton
                          variant="primary"
                          disabled={review.isPending}
                          onClick={() => {
                            setNotice("");
                            review.mutate({
                              id: item.id,
                              status: "APPROVED",
                              notes: reviewNotes[item.id]?.trim(),
                            });
                          }}
                        >
                          <Check size={14} />
                          Approve
                        </ActionButton>

                        <ActionButton
                          disabled={review.isPending}
                          onClick={() => {
                            setNotice("");
                            review.mutate({
                              id: item.id,
                              status: "REJECTED",
                              notes: reviewNotes[item.id]?.trim(),
                            });
                          }}
                        >
                          <X size={14} />
                          Reject
                        </ActionButton>
                      </div>
                    </div>
                  )}

                  {item.status === "APPROVED" && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <ActionButton
                        variant="primary"
                        disabled={issueSubmission.isPending}
                        onClick={() => {
                          setNotice("");
                          issueSubmission.mutate(item.id);
                        }}
                      >
                        <Award size={14} />
                        {issueSubmission.isPending
                          ? "Issuing…"
                          : "Issue certificate"}
                      </ActionButton>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Issued certificates */}
          {view === "certificates" && !isLoading && !isError && (
            <div className="mt-5 space-y-3">
              {certificates.length === 0 && (
                <EmptyState message="No certificates found." />
              )}

              {certificates.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-semibold">{item.studentName}</h2>

                      <p className="mt-1 break-all text-sm text-gray-500">
                        {item.studentEmail}
                      </p>

                      <p className="mt-2 text-sm">
                        {item.trainingProgramTitle}
                      </p>

                      <p className="mt-1 break-all font-mono text-xs text-[var(--kpx-royal-blue)]">
                        {item.certificateNumber}
                      </p>

                      <div className="mt-3">
                        <StatusBadge status={item.status} />
                      </div>

                      {item.revokedAt && (
                        <p className="mt-2 text-xs text-gray-500">
                          Revoked{" "}
                          {new Date(item.revokedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        disabled={item.status === "REVOKED" || resend.isPending}
                        onClick={() => {
                          setNotice("");
                          resend.mutate(item.id);
                        }}
                      >
                        <Mail size={14} />
                        {resend.isPending ? "Sending…" : "Resend email"}
                      </ActionButton>

                      {item.status !== "REVOKED" && (
                        <ActionButton
                          variant="danger"
                          disabled={revoke.isPending}
                          onClick={() => openRevocationForm(item.id)}
                        >
                          <ShieldAlert size={14} />
                          Revoke
                        </ActionButton>
                      )}
                    </div>
                  </div>

                  {revokingCertificateId === item.id && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const reason = revokeReason.trim();

                        if (!reason) return;

                        setNotice("");
                        revoke.mutate({
                          id: item.id,
                          reason,
                        });
                      }}
                      className="mt-5 rounded-xl border border-red-100 bg-red-50/50 p-4"
                    >
                      <h3 className="text-sm font-semibold text-red-800">
                        Confirm certificate revocation
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        This action may invalidate the certificate for
                        verification. Enter the reason before proceeding.
                      </p>

                      <label className="mt-3 block text-sm font-medium">
                        Revocation reason
                        <textarea
                          required
                          minLength={1}
                          rows={3}
                          autoFocus
                          value={revokeReason}
                          onChange={(event) =>
                            setRevokeReason(event.target.value)
                          }
                          placeholder="Explain why this certificate is being revoked"
                          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400"
                        />
                      </label>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={revoke.isPending || !revokeReason.trim()}
                          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {revoke.isPending
                            ? "Revoking…"
                            : "Confirm revocation"}
                        </button>

                        <ActionButton
                          disabled={revoke.isPending}
                          onClick={cancelRevocation}
                        >
                          Cancel
                        </ActionButton>
                      </div>
                    </form>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
