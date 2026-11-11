import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
    <div className="mt-6 rounded-control bg-background p-5"><p className="text-xs text-text-muted">Booking reference</p><p className="mt-1 font-heading text-xl font-bold text-primary">{booking.publicReference}</p><span className="mt-3 inline-flex rounded-full bg-[#F4DCD6] px-3 py-1 text-sm font-semibold text-secondary">{booking.status.replaceAll("_", " ")}</span></div>
    <dl className="mt-5 divide-y divide-border">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-5 py-4 text-sm"><dt className="text-text-muted">{label}</dt><dd className="max-w-[65%] text-right font-semibold text-primary">{value}</dd></div>)}</dl>
    {booking.customWorkshopDescription && <div className="mt-5"><h2 className="font-semibold text-primary">Custom workshop brief</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{booking.customWorkshopDescription}</p></div>}
    {booking.customerNotes && <div className="mt-5"><h2 className="font-semibold text-primary">Additional notes</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{booking.customerNotes}</p></div>}
    <p className="mt-6 border-t border-border pt-5 text-sm leading-7 text-text-muted">This request is not a confirmed event. KPX Academy will contact you after reviewing availability and arrangements. Keep this private link secure.</p>
    <a href="/workshops/book" className="mt-5 inline-flex font-semibold text-secondary underline">Back to workshops</a>
  </div></Container></section>;
};
