import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Search,
  XCircle,
} from "lucide-react";
import { registrationApi } from "../../lib/registrationApi";

type RegistrationStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "ABANDONED"
  | "REVERSED";

interface RegistrationPayment {
  id: string;
  reference: string;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  trainingProgramId: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  trainingProgram?: {
    id: string;
    title: string;
    slug: string;
    price: string | number;
    currency: string;
    deliveryMode: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
  payments?: RegistrationPayment[];
}

interface RegistrationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

const registrationStatusStyles: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
  EXPIRED: "bg-slate-100 text-slate-600",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  SUCCESS: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  ABANDONED: "bg-slate-100 text-slate-600",
  REVERSED: "bg-orange-50 text-orange-700",
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: { data?: { message?: string } };
      }
    ).response;

    if (response?.data?.message) return response.data.message;
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
};

const fetchRegistrations = async ({
  page,
  status,
  email,
}: {
  page: number;
  status: string;
  email: string;
}): Promise<{
  registrations: Registration[];
  pagination: RegistrationPagination;
}> => {
  const response = await registrationApi.get("/registrations", {
    params: {
      page,
      limit: PAGE_SIZE,
      ...(status ? { status } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
    },
  });

  return {
    registrations: response.data.data,
    pagination: response.data.pagination,
  };
};

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");

  const query = useQuery({
    queryKey: ["admin", "registrations", page, status, email],
    queryFn: () => fetchRegistrations({ page, status, email }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await registrationApi.patch(
        `/registrations/${encodeURIComponent(id)}/cancel`,
      );

      return response.data.data as Registration;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "registrations"],
      });
    },
  });

  const registrations = query.data?.registrations ?? [];
  const pagination = query.data?.pagination;

  const applyEmailFilter = () => {
    setPage(1);
    setEmail(emailInput.trim());
  };

  const cancelRegistration = (registration: Registration) => {
    if (registration.status !== "PENDING") return;

    const confirmed = window.confirm(
      `Cancel the registration for ${registration.name} (${registration.email})?`,
    );

    if (confirmed) {
      cancelMutation.mutate(registration.id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#1D4ED8] p-3 text-white">
            <ClipboardList size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Registrations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review training registrations and their payment status.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">Matching registrations</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {pagination?.total === undefined
              ? "—"
              : pagination.total.toLocaleString()}
          </p>
        </div>
      </div>

      {query.isError && <ErrorBanner message={getErrorMessage(query.error)} />}

      {cancelMutation.isError && (
        <ErrorBanner message={getErrorMessage(cancelMutation.error)} />
      )}

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyEmailFilter();
          }}
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="Filter by exact email address"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF]"
          >
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
        >
          <option value="">All registrations</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <Th>Registrant</Th>
                <Th>Training program</Th>
                <Th>Registration</Th>
                <Th>Latest payment</Th>
                <Th>Registered on</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {query.isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-6">
                          <div className="h-4 rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : registrations.map((registration) => {
                    const payment = registration.payments?.[0];

                    return (
                      <tr
                        key={registration.id}
                        className="align-top transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-5">
                          <p className="font-medium text-slate-900">
                            {registration.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {registration.email}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `mailto:${registration.email}`,
                                "_self",
                              )
                            }
                            className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                          >
                            Contact <ExternalLink size={12} />
                          </button>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-medium text-slate-800">
                            {registration.trainingProgram?.title ??
                              "Program unavailable"}
                          </p>
                          {registration.trainingProgram && (
                            <p className="mt-1 text-xs text-slate-500">
                              {registration.trainingProgram.deliveryMode}
                              {registration.trainingProgram.location
                                ? ` · ${registration.trainingProgram.location}`
                                : ""}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${registrationStatusStyles[registration.status]}`}
                          >
                            {registration.status}
                          </span>
                          <p className="mt-2 text-xs text-slate-400">
                            ID: {registration.id}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          {payment ? (
                            <>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusStyles[payment.status]}`}
                              >
                                {payment.status}
                              </span>
                              <p className="mt-2 whitespace-nowrap text-sm font-medium text-slate-800">
                                {payment.currency}{" "}
                                {Number(payment.amount).toLocaleString()}
                              </p>
                              <p
                                className="mt-1 max-w-[190px] truncate text-xs text-slate-500"
                                title={payment.reference}
                              >
                                {payment.reference}
                              </p>
                              {payment.paidAt && (
                                <p className="mt-1 text-xs text-slate-400">
                                  Paid{" "}
                                  {new Date(
                                    payment.paidAt,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No payment record
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">
                          {new Date(
                            registration.createdAt,
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end">
                            {registration.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => cancelRegistration(registration)}
                                disabled={cancelMutation.isPending}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <XCircle size={14} />
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

              {!query.isLoading && registrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ClipboardList
                      size={28}
                      className="mx-auto mb-3 text-slate-300"
                    />
                    <p className="text-sm font-medium text-slate-700">
                      No registrations found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing the email or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination?.page ?? page}
          totalPages={pagination?.totalPages ?? 0}
          total={pagination?.total ?? 0}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return (
      <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
        {total} registration{total === 1 ? "" : "s"}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
      <p className="text-xs text-slate-500">
        Page {page} of {totalPages} · {total} registrations
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}
