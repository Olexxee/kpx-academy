import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, CircleDot, Clock3, XCircle } from "lucide-react";
import { Container } from "../../../components/ui/Container";
import { getGuestWorkshopBooking } from "../api";

const money = (amount: number | string | null, currency = "NGN") => {
  if (amount == null) return "To be confirmed";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount));
};

const dateTime = (value: string) => new Date(value).toLocaleString("en-NG", {
  dateStyle: "long",
  timeStyle: "short",
});

const venueLabel: Record<string, string> = {
  CLIENT_VENUE: "Client venue",
  KPX_VENUE: "KPX-arranged venue",
  UNDECIDED: "To be arranged",
};

const statusDetails: Record<string, { title: string; description: string }> = {
  NEW: { title: "Request received", description: "Your request has reached KPX Academy and is waiting for review." },
  UNDER_REVIEW: { title: "Under review", description: "The team is reviewing your requirements, preferred date and arrangements." },
  PROPOSAL_SENT: { title: "Proposal sent", description: "KPX Academy has prepared a proposal. Check your email for the proposal details and next steps." },
  ACCEPTED: { title: "Proposal accepted", description: "Your acceptance has been recorded. The team will complete the confirmation process." },
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
  const query = useQuery({
    queryKey: ["workshops", "guest-booking", reference, token],
    queryFn: () => getGuestWorkshopBooking(reference, token),
    enabled: Boolean(reference && token),
    retry: false,
  });

  if (query.isLoading) {
    return <section className="py-24"><Container><p className="text-text-muted">Loading your private booking…</p></Container></section>;
  }

  if (query.isError || !query.data) {
    return <section className="min-h-[60vh] py-24"><Container><div className="mx-auto max-w-xl text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">KPX Academy</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary">Private booking link unavailable</h1><p className="mt-4 leading-7 text-text-muted">We could not retrieve this booking. Check that you opened the complete private link.</p><a href="/workshops/book" className="mt-6 inline-flex font-semibold text-secondary underline">Return to workshops</a></div></Container></section>;
  }

  const booking = query.data;
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
              {entry.action === "RESCHEDULED" && entry.previousEventDate && entry.newEventDate && <p className="mt-2 text-sm text-text-muted">Date changed from {dateTime(entry.previousEventDate)} to {dateTime(entry.newEventDate)}.</p>}
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
