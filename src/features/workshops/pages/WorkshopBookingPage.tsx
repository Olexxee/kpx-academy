import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { createWorkshopBooking, getWorkshopOfferings } from "../api";
import type { CreateWorkshopBookingPayload, WorkshopVenueMode } from "../types";

const workshopLabels: Record<string, string> = {
  RESIN_ART: "Resin art",
  LIP_CARE_FORMULATION: "Lip-care formulation",
  CUSTOM_GROUP: "Custom group workshop",
};

const venueLabels: Record<WorkshopVenueMode, string> = {
  CLIENT_VENUE: "At my venue",
  KPX_VENUE: "At a KPX-arranged venue",
  UNDECIDED: "Help me decide",
};

const formatPrice = (price: number | string, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(price));

const localDateMinimum = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-control border border-border bg-white px-4 py-3 text-sm text-text " +
  "placeholder:text-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";

const labelClass = "block text-sm font-semibold text-text";

export const WorkshopBookingPage = () => {
  const offeringsQuery = useQuery({
    queryKey: ["workshop-offerings"],
    queryFn: getWorkshopOfferings,
  });
  const offerings = offeringsQuery.data ?? [];
  const [offeringId, setOfferingId] = useState("");
  const selectedOffering = offerings.find((offering) => offering.id === offeringId) ?? offerings[0];
  const [tierId, setTierId] = useState("");
  const [venueMode, setVenueMode] = useState<WorkshopVenueMode>("UNDECIDED");
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerWhatsApp: "",
    eventDate: "",
    venueAddress: "",
    city: "",
    customWorkshopDescription: "",
    customerNotes: "",
  });
  const [submittedBooking, setSubmittedBooking] = useState<Awaited<ReturnType<typeof createWorkshopBooking>> | null>(null);

  const selectedTier = useMemo(
    () => selectedOffering?.participantTiers.find((tier) => tier.id === tierId) ?? selectedOffering?.participantTiers[0],
    [selectedOffering, tierId],
  );

  const bookingMutation = useMutation({
    mutationFn: createWorkshopBooking,
    onSuccess: (result) => setSubmittedBooking(result),
  });

  const updateField = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOffering || !selectedTier) return;

    const payload: CreateWorkshopBookingPayload = {
      customerName: form.customerName.trim(),
      customerEmail: form.customerEmail.trim(),
      customerWhatsApp: form.customerWhatsApp.trim(),
      offeringId: selectedOffering.id,
      participantTierId: selectedTier.id,
      eventDate: new Date(`${form.eventDate}T12:00:00`).toISOString(),
      venueMode,
      ...(venueMode === "CLIENT_VENUE" ? { venueAddress: form.venueAddress.trim() } : {}),
      ...(venueMode === "KPX_VENUE" ? { city: form.city.trim() } : {}),
      ...(selectedOffering.workshopType === "CUSTOM_GROUP"
        ? { customWorkshopDescription: form.customWorkshopDescription.trim() }
        : {}),
      ...(form.customerNotes.trim() ? { customerNotes: form.customerNotes.trim() } : {}),
    };
    bookingMutation.mutate(payload);
  };

  if (submittedBooking) {
    return (
      <div className="min-h-[70vh] bg-background py-16 sm:py-20">
        <Container>
          <section className="mx-auto max-w-2xl rounded-card border border-border bg-white p-7 sm:p-10">
            <span className="inline-flex rounded-full bg-[#F4DCD6] px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">Request received</span>
            <h1 className="mt-5 font-heading text-3xl font-bold text-primary sm:text-4xl">Your workshop request is in.</h1>
            <p className="mt-4 leading-7 text-text-muted">We’ve recorded your event details. KPX Academy will review the request and follow up to confirm the arrangements.</p>
            <div className="mt-7 rounded-control bg-background p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Booking reference</p>
              <p className="mt-2 font-heading text-2xl font-bold text-primary">{submittedBooking.publicReference}</p>
              <p className="mt-4 text-sm text-text-muted">{submittedBooking.workshopTitle} · {submittedBooking.participantCount} participants</p>
              {submittedBooking.price != null && <p className="mt-2 font-semibold text-primary">{formatPrice(submittedBooking.price, submittedBooking.currency)} <span className="font-normal text-text-muted">indicative tier price</span></p>}
            </div>
            {(submittedBooking.contactEmail || submittedBooking.contactWhatsApp) && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-text-muted">Need to add something to your request?</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-secondary">
                  {submittedBooking.contactEmail && <a href={`mailto:${submittedBooking.contactEmail}`}>Email KPX Academy</a>}
                  {submittedBooking.contactWhatsApp && <a href={`https://wa.me/${submittedBooking.contactWhatsApp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp KPX Academy</a>}
                </div>
              </div>
            )}
            <Link to="/" className="mt-8 inline-flex min-h-11 items-center justify-center rounded-control bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary">Back to homepage</Link>
          </section>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-14 text-white sm:py-20 lg:py-24">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 sm:text-sm">KPX Academy · Creative Workshops</p>
          <div className="mt-5 max-w-3xl">
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Make your next event <span className="text-[#F4DCD6]">hands-on.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">Bring people together to create, learn, and leave with something they made. Tell us about your event and we’ll help plan the workshop around your group.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/90">
            <span className="rounded-full border border-white/25 px-4 py-2">Resin art</span>
            <span className="rounded-full border border-white/25 px-4 py-2">Lip-care formulation</span>
            <span className="rounded-full border border-white/25 px-4 py-2">Custom group sessions</span>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <aside>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Plan an event</p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">A creative session made for your group.</h2>
              <p className="mt-5 leading-7 text-text-muted">Choose a workshop, select a participant tier, and share the date and venue details. Your request is reviewed by the KPX team before the event is confirmed.</p>
              <div className="mt-8 space-y-4 border-t border-border pt-6">
                <div><p className="font-semibold text-primary">01 · Choose your workshop</p><p className="mt-1 text-sm leading-6 text-text-muted">Select resin art, lip-care formulation, or a custom group session.</p></div>
                <div><p className="font-semibold text-primary">02 · Tell us your event details</p><p className="mt-1 text-sm leading-6 text-text-muted">Share the date, group size, and venue preference.</p></div>
                <div><p className="font-semibold text-primary">03 · Confirm the arrangements</p><p className="mt-1 text-sm leading-6 text-text-muted">We’ll follow up about availability, pricing, and any special requests.</p></div>
              </div>
              <p className="mt-8 text-sm leading-6 text-text-muted">Already have a question? <Link to="/about" className="font-semibold text-secondary hover:text-primary">Contact the Academy</Link>.</p>
            </aside>

            <div className="rounded-card border border-border bg-white p-5 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-primary">Request a workshop booking</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">Fields marked with * are required. Submitting this form does not confirm the event.</p>

              {offeringsQuery.isLoading ? (
                <div aria-busy="true" className="mt-7 space-y-4"><div className="h-12 animate-pulse rounded-control bg-neutral" /><div className="h-12 animate-pulse rounded-control bg-neutral" /><div className="h-32 animate-pulse rounded-control bg-neutral" /></div>
              ) : offeringsQuery.isError ? (
                <div role="alert" className="mt-7 rounded-control border border-border bg-background p-5">
                  <p className="font-semibold text-primary">We couldn’t load workshop options.</p>
                  <p className="mt-2 text-sm leading-6 text-text-muted">Please try again in a moment.</p>
                  <button type="button" onClick={() => void offeringsQuery.refetch()} className="mt-4 font-semibold text-secondary">Try again →</button>
                </div>
              ) : offerings.length === 0 ? (
                <div className="mt-7 rounded-control border border-border bg-background p-5">
                  <p className="font-semibold text-primary">Workshop bookings are being prepared.</p>
                  <p className="mt-2 text-sm leading-6 text-text-muted">The team is preparing current workshop options and participant pricing. Please check back soon.</p>
                </div>
              ) : (
                <form className="mt-7 space-y-5" onSubmit={submit}>
                  <label className={labelClass}>Workshop option *
                    <select required value={selectedOffering?.id ?? ""} onChange={(event) => { setOfferingId(event.target.value); setTierId(""); }} className={fieldClass}>
                      <option value="" disabled>Select a workshop</option>
                      {offerings.map((offering) => <option key={offering.id} value={offering.id}>{workshopLabels[offering.workshopType] ?? offering.title}</option>)}
                    </select>
                  </label>

                  {selectedOffering && <div className="rounded-control bg-background p-4"><p className="font-semibold text-primary">{selectedOffering.title}</p><p className="mt-2 text-sm leading-6 text-text-muted">{selectedOffering.description}</p>{selectedOffering.bookingTerms && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-muted">Booking terms: {selectedOffering.bookingTerms}</p>}{(selectedOffering.contactEmail || selectedOffering.contactWhatsApp) && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-sm font-semibold text-secondary">{selectedOffering.contactEmail && <a href={`mailto:${selectedOffering.contactEmail}`}>Email about this workshop</a>}{selectedOffering.contactWhatsApp && <a href={`https://wa.me/${selectedOffering.contactWhatsApp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp about this workshop</a>}</div>}</div>}

                  <label className={labelClass}>Participant tier *
                    <select required value={selectedTier?.id ?? ""} onChange={(event) => setTierId(event.target.value)} className={fieldClass}>
                      {!selectedOffering?.participantTiers.length && <option value="">No participant tiers available</option>}
                      {selectedOffering?.participantTiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.label} · {tier.participantCount} participants · {formatPrice(tier.price, tier.currency)}</option>)}
                    </select>
                  </label>
                  {selectedTier && <p className="-mt-2 text-sm text-text-muted">Selected tier: <strong className="text-primary">{selectedTier.participantCount} participants</strong> for <strong className="text-primary">{formatPrice(selectedTier.price, selectedTier.currency)}</strong>. Final arrangements are confirmed by the team.</p>}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>Your name *
                      <input required autoComplete="name" value={form.customerName} onChange={(event) => updateField("customerName", event.target.value)} className={fieldClass} placeholder="Full name" />
                    </label>
                    <label className={labelClass}>Email address *
                      <input required type="email" autoComplete="email" value={form.customerEmail} onChange={(event) => updateField("customerEmail", event.target.value)} className={fieldClass} placeholder="you@example.com" />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>WhatsApp number *
                      <input required type="tel" autoComplete="tel" value={form.customerWhatsApp} onChange={(event) => updateField("customerWhatsApp", event.target.value)} className={fieldClass} placeholder="+234..." />
                    </label>
                    <label className={labelClass}>Preferred event date *
                      <input required type="date" min={localDateMinimum()} value={form.eventDate} onChange={(event) => updateField("eventDate", event.target.value)} className={fieldClass} />
                    </label>
                  </div>

                  <fieldset>
                    <legend className={labelClass}>Where should the workshop take place? *</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {(Object.keys(venueLabels) as WorkshopVenueMode[]).map((mode) => (
                        <label key={mode} className={`flex cursor-pointer items-start gap-3 rounded-control border p-3 text-sm leading-5 transition ${venueMode === mode ? "border-secondary bg-[#F4DCD6]/40" : "border-border hover:border-secondary/50"}`}>
                          <input type="radio" name="venueMode" value={mode} checked={venueMode === mode} onChange={() => setVenueMode(mode)} className="mt-1 accent-[#8B1E5A]" />
                          <span className="font-medium text-text">{venueLabels[mode]}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {venueMode === "CLIENT_VENUE" && <label className={labelClass}>Venue address *
                    <textarea required rows={3} value={form.venueAddress} onChange={(event) => updateField("venueAddress", event.target.value)} className={fieldClass} placeholder="Enter the event venue address" />
                  </label>}
                  {venueMode === "KPX_VENUE" && <label className={labelClass}>Event city *
                    <input required value={form.city} onChange={(event) => updateField("city", event.target.value)} className={fieldClass} placeholder="City where the venue is needed" />
                  </label>}

                  {selectedOffering?.workshopType === "CUSTOM_GROUP" && <label className={labelClass}>Describe the workshop you have in mind *
                    <textarea required minLength={10} rows={4} value={form.customWorkshopDescription} onChange={(event) => updateField("customWorkshopDescription", event.target.value)} className={fieldClass} placeholder="Tell us about your group, occasion, interests, and any custom requirements." />
                  </label>}

                  <label className={labelClass}>Additional details
                    <textarea rows={4} value={form.customerNotes} onChange={(event) => updateField("customerNotes", event.target.value)} className={fieldClass} placeholder="Occasion, timing preferences, accessibility needs, or other notes" />
                  </label>

                  {bookingMutation.isError && <div role="alert" className="rounded-control border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{(bookingMutation.error as any)?.response?.data?.message ?? "Your request could not be submitted. Please review the details and try again."}</div>}

                  <button type="submit" disabled={bookingMutation.isPending || !selectedTier} className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                    {bookingMutation.isPending ? "Submitting request…" : "Submit workshop request"}
                  </button>
                  <p className="text-xs leading-5 text-text-muted">Your details will be used to respond to this event booking request.</p>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
