import { useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, CircleDot, Clock3, XCircle } from "lucide-react";
import { Container } from "../../../components/ui/Container";
import { getGuestWorkshopBooking, initializeWorkshopPayment, respondToWorkshopProposal } from "../api";
import { verifyPayment } from "../../payment/payments.api";

const money = (amount: number | string | null, currency = "NGN") => {
  if (amount == null) return "To be confirmed";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount));
};

const dateTime = (value: string) => new Date(value).toLocaleString("en-NG", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

const venueLabel: Record<string, string> = {
  CLIENT_VENUE: "Client venue",
  KPX_VENUE: "KPX-arranged venue",
  UNDECIDED: "To be arranged",
};

const statusDetails: Record<string, { title: string; description: string }> = {
  NEW: { title: "Request received", description: "Your request has reached KPX Academy and is waiting for review." },
  UNDER_REVIEW: { title: "Under review", description: "The team is reviewing your requirements, preferred date and arrangements." },
  PROPOSAL_SENT: { title: "Proposal sent", description: "KPX Academy has prepared a proposal and will contact you with the details and next steps." },
  ACCEPTED: { title: "Proposal accepted", description: "Your acceptance has been recorded. KPX Academy will follow up with the next steps." },
  DECLINED: { title: "Proposal declined", description: "You declined this proposal. Contact KPX Academy if you would like to discuss a revised proposal." },
  CONFIRMED: { title: "Booking confirmed", description: "Your workshop booking is confirmed. Keep this page to review any future updates." },
  IN_PROGRESS: { title: "Workshop in progress", description: "Your workshop has started." },
  COMPLETED: { title: "Workshop completed", description: "This workshop booking has been marked as completed." },
  CANCELLED: { title: "Booking cancelled", description: "This booking has been cancelled. Review the latest update below or contact KPX Academy if you need clarification." },
};

const historyLabel = (entry: { action: string; previousStatus: string | null; newStatus: string | null }) => {
  if (entry.action === "CREATED") return "Request submitted";
  if (entry.action === "RESCHEDULED") return "Event date changed";
  if (entry.action === "UPDATED") return "Booking details updated";
  if (entry.newStatus) return statusDetails[entry.newStatus]?.title ?? entry.newStatus.replaceAll("_", " ");
  return "Booking updated";
};

export const WorkshopGuestAccessPage = () => {
  const { reference = "", token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get("payment_reference") || searchParams.get("reference") || searchParams.get("trxref");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["workshops", "guest-booking", reference, token],
    queryFn: () => getGuestWorkshopBooking(reference, token),
    enabled: Boolean(reference && token),
    retry: false,
  });
  const responseMutation = useMutation({
    mutationFn: (decision: "ACCEPT" | "DECLINE") => respondToWorkshopProposal(reference, token, decision),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workshops", "guest-booking", reference, token] });
    },
  });
  const paymentMutation = useMutation({
    mutationFn: () => initializeWorkshopPayment(reference, token),
    onSuccess: (payment) => window.location.assign(payment.authorizationUrl),
  });
  const paymentQuery = useQuery({
    queryKey: ["payments", "verify", paymentReference],
    queryFn: () => verifyPayment(paymentReference as string),
    enabled: Boolean(paymentReference),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (paymentQuery.data?.status === "SUCCESS") {
      queryClient.invalidateQueries({ queryKey: ["workshops", "guest-booking", reference, token] });
    }
  }, [paymentQuery.data?.status, queryClient, reference, token]);

  if (query.isLoading) {
    return <section className="py-24"><Container><p className="text-text-muted">Loading your private booking…</p></Container></section>;
  }

  if (query.isError || !query.data) {
    return <section className="min-h-[60vh] py-24"><Container><div className="mx-auto max-w-xl text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">KPX Academy</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary">Private booking link unavailable</h1><p className="mt-4 leading-7 text-text-muted">We could not retrieve this booking. Check that you opened the complete private link.</p><a href="/workshops/book" className="mt-6 inline-flex font-semibold text-secondary underline">Return to workshops</a></div></Container></section>;
  }

  const booking = query.data;
  const proposalExpired = Boolean(booking.proposal?.expiresAt && new Date(booking.proposal.expiresAt) <= new Date());
  const canRespondToProposal = booking.status === "PROPOSAL_SENT" && Boolean(booking.proposal) && !proposalExpired;
  const currentStatus = statusDetails[booking.status] ?? {
    title: booking.status.replaceAll("_", " "),
    description: "Your booking status has been updated. Check the history below for the latest details.",
  };
  const rows: [string, string][] = [
    ["Workshop", booking.workshopTitle],
    ["Participants", String(booking.participantCount)],
    ["Indicative tier price", money(booking.price, booking.currency)],
    ["Preferred event date", dateTime(booking.eventDate)],
    ["Venue preference", venueLabel[booking.venueMode] ?? booking.venueMode],
    ...(booking.venueAddress ? [["Venue address", booking.venueAddress] as [string, string]] : []),
    ...(booking.city ? [["City", booking.city] as [string, string]] : []),
  ];

  return <section className="min-h-[65vh] bg-background py-12 sm:py-20"><Container><div className="mx-auto max-w-2xl rounded-card border border-border bg-white p-6 sm:p-10">
    <p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Private booking page</p>
    <h1 className="mt-3 font-heading text-3xl font-bold text-primary">Your workshop request</h1>

    <div className="mt-6 rounded-control bg-background p-5">
      <p className="text-xs text-text-muted">Booking reference</p>
      <p className="mt-1 font-heading text-xl font-bold text-primary">{booking.publicReference}</p>
      <span className="mt-3 inline-flex rounded-full bg-[#F4DCD6] px-3 py-1 text-sm font-semibold text-secondary">{currentStatus.title}</span>
      <p className="mt-3 text-sm leading-6 text-text-muted">{currentStatus.description}</p>
    </div>

    <dl className="mt-5 divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-5 py-4 text-sm"><dt className="text-text-muted">{label}</dt><dd className="max-w-[65%] text-right font-semibold text-primary">{value}</dd></div>)}</dl>

    {booking.proposal && <section className="mt-7 rounded-control border border-[#D4A85A]/40 bg-[#F7F5F0] p-5">
      <h2 className="font-heading text-xl font-bold text-primary">KPX Academy proposal</h2>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <span className="text-sm text-text-muted">Final proposed price</span>
        <strong className="text-xl text-primary">{money(booking.proposal.price, booking.proposal.currency)}</strong>
      </div>
      <div className="mt-4"><h3 className="text-sm font-semibold text-primary">Scope and deliverables</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{booking.proposal.details}</p></div>
      {booking.proposal.expiresAt && <p className="mt-4 text-xs text-text-muted">Respond by {dateTime(booking.proposal.expiresAt)} (West Africa Time).</p>}
      {canRespondToProposal && <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" disabled={responseMutation.isPending} onClick={() => responseMutation.mutate("ACCEPT")} className="rounded-xl bg-[#2A7F7F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{responseMutation.isPending ? "Submitting…" : "Accept proposal"}</button>
        <button type="button" disabled={responseMutation.isPending} onClick={() => responseMutation.mutate("DECLINE")} className="rounded-xl border border-[#8B1E5A] px-4 py-3 text-sm font-semibold text-[#8B1E5A] disabled:opacity-50">Decline proposal</button>
      </div>}
      {proposalExpired && booking.status === "PROPOSAL_SENT" && <p className="mt-4 text-sm font-semibold text-[#8B1E5A]">This proposal has expired. Contact KPX Academy to request an updated proposal.</p>}
      {booking.status === "ACCEPTED" && <div className="mt-5 rounded-xl border border-[#2A7F7F]/30 bg-white p-4">
        <p className="text-sm font-semibold text-primary">You accepted this proposal. Full payment is now required to confirm the booking.</p>
        <p className="mt-2 text-lg font-bold text-primary">{money(booking.proposal.price, booking.proposal.currency)}</p>
        <button type="button" disabled={paymentMutation.isPending} onClick={() => paymentMutation.mutate()} className="mt-4 w-full rounded-xl bg-[#17324D] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {paymentMutation.isPending ? "Preparing secure checkout…" : "Proceed to secure payment"}
        </button>
        {paymentMutation.isError && <p role="alert" className="mt-3 text-sm text-red-700">{paymentMutation.error instanceof Error ? paymentMutation.error.message : "We could not start checkout. Please try again."}</p>}
      </div>}
      {booking.status === "CONFIRMED" && <p className="mt-4 text-sm font-semibold text-[#2A7F7F]">Your payment has been verified and your workshop booking is confirmed.</p>}
      {booking.status === "DECLINED" && <p className="mt-4 text-sm font-semibold text-[#8B1E5A]">You declined this proposal.</p>}
      {paymentReference && <div className="mt-4 rounded-xl bg-white p-4">
        {paymentQuery.isLoading && <p className="text-sm text-text-muted">Verifying your payment with Paystack…</p>}
        {paymentQuery.data?.status === "SUCCESS" && <p className="text-sm font-semibold text-[#2A7F7F]">Payment verified successfully. Refreshing your booking status…</p>}
        {paymentQuery.data && paymentQuery.data.status !== "SUCCESS" && <div>
          <p className="text-sm text-text-muted">Payment status: {paymentQuery.data.status.replaceAll("_", " ").toLowerCase()}.</p>
          <button type="button" onClick={() => paymentQuery.refetch()} className="mt-2 text-sm font-semibold text-secondary underline">Check payment again</button>
        </div>}
        {paymentQuery.isError && <div>
          <p role="alert" className="text-sm text-red-700">We could not verify this payment yet.</p>
          <button type="button" onClick={() => paymentQuery.refetch()} className="mt-2 text-sm font-semibold text-secondary underline">Retry verification</button>
        </div>}
      </div>}
      {responseMutation.isError && <p role="alert" className="mt-3 text-sm text-red-700">{responseMutation.error instanceof Error ? responseMutation.error.message : "We could not record your response. Refresh and try again."}</p>}
    </section>}

    {booking.customWorkshopDescription && <div className="mt-5"><h2 className="font-semibold text-primary">Custom workshop brief</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{booking.customWorkshopDescription}</p></div>}
    {booking.customerNotes && <div className="mt-5"><h2 className="font-semibold text-primary">Additional notes</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{booking.customerNotes}</p></div>}

    <div className="mt-8 border-t border-border pt-6">
      <h2 className="font-heading text-xl font-bold text-primary">Booking history</h2>
      <p className="mt-1 text-sm text-text-muted">A record of updates made to your request.</p>
      <ol className="mt-5 space-y-5">
        {[...(booking.history ?? [])].reverse().map((entry, index) => (
          <li key={`${entry.createdAt}-${entry.action}-${index}`} className="relative flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-secondary">
              {entry.action === "CREATED" ? <CheckCircle2 size={17} /> : entry.action === "RESCHEDULED" ? <CalendarClock size={17} /> : entry.newStatus === "CANCELLED" ? <XCircle size={17} /> : entry.newStatus === "CONFIRMED" ? <CheckCircle2 size={17} /> : <CircleDot size={17} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary">{historyLabel(entry)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-text-muted"><Clock3 size={13} />{dateTime(entry.createdAt)}</p>
              {entry.previousStatus && entry.newStatus && entry.previousStatus !== entry.newStatus && <p className="mt-2 text-sm text-text-muted">Status changed from {statusDetails[entry.previousStatus]?.title ?? entry.previousStatus.replaceAll("_", " ")} to {statusDetails[entry.newStatus]?.title ?? entry.newStatus.replaceAll("_", " ")}.</p>}
              {entry.previousEventDate && entry.newEventDate && new Date(entry.previousEventDate).getTime() !== new Date(entry.newEventDate).getTime() && <p className="mt-2 text-sm text-text-muted">Date changed from {dateTime(entry.previousEventDate)} to {dateTime(entry.newEventDate)}.</p>}
              {entry.customerMessage && <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-muted">{entry.customerMessage}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>

    <p className="mt-7 border-t border-border pt-5 text-sm leading-7 text-text-muted">This private page shows the latest status and customer-facing updates. Keep the link secure. Admin notes and internal records are not displayed here.</p>
    <a href="/workshops/book" className="mt-5 inline-flex font-semibold text-secondary underline">Back to workshops</a>
  </div></Container></section>;
};
