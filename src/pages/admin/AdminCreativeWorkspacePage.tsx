import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert,
  Eye, EyeOff, LoaderCircle, Plus, Save, Users, X,
} from "lucide-react";
import type { WorkshopType } from "../../features/workshops/types";
import {
  createAdminWorkshopOffering,
  createAdminWorkshopTier,
  getAdminWorkshopBookings,
  getAdminWorkshopOfferings,
  setAdminWorkshopOfferingActive,
  setAdminWorkshopTierActive,
  updateAdminWorkshopBooking,
  updateAdminWorkshopOffering,
  updateAdminWorkshopTier,
  type AdminWorkshopBooking,
  type AdminWorkshopOffering,
  type AdminWorkshopTier,
  type WorkshopBookingStatus,
} from "../../features/workshops/adminApi";

type Tab = "offerings" | "bookings";
type OfferingForm = {
  title: string; slug: string; workshopType: WorkshopType; description: string;
  bookingTerms: string; contactEmail: string; contactWhatsApp: string;
  featured: boolean; displayOrder: number;
};
type TierForm = { label: string; participantCount: number; price: number; currency: string; displayOrder: number };

const emptyOffering: OfferingForm = {
  title: "", slug: "", workshopType: "RESIN_ART", description: "",
  bookingTerms: "", contactEmail: "", contactWhatsApp: "", featured: false, displayOrder: 0,
};
const emptyTier: TierForm = { label: "", participantCount: 1, price: 0, currency: "NGN", displayOrder: 0 };
const statuses: WorkshopBookingStatus[] = ["NEW", "UNDER_REVIEW", "PROPOSAL_SENT", "ACCEPTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const statusStyle: Record<WorkshopBookingStatus, string> = {
  NEW: "bg-blue-50 text-blue-700", UNDER_REVIEW: "bg-amber-50 text-amber-700",
  PROPOSAL_SENT: "bg-violet-50 text-violet-700", ACCEPTED: "bg-cyan-50 text-cyan-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700", IN_PROGRESS: "bg-indigo-50 text-indigo-700",
  COMPLETED: "bg-green-50 text-green-700", CANCELLED: "bg-slate-100 text-slate-600",
};

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return error instanceof Error ? error.message : "The request failed. Please try again.";
}
function money(value: number | string | null | undefined, currency = "NGN") {
  if (value === null || value === undefined || value === "") return "Not priced";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
}
function toOfferingForm(item: AdminWorkshopOffering): OfferingForm {
  return {
    title: item.title, slug: item.slug, workshopType: item.workshopType, description: item.description,
    bookingTerms: item.bookingTerms ?? "", contactEmail: item.contactEmail ?? "",
    contactWhatsApp: item.contactWhatsApp ?? "", featured: item.featured, displayOrder: item.displayOrder,
  };
}

export default function AdminCreativeWorkspacePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("offerings");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [offeringForm, setOfferingForm] = useState<OfferingForm>(emptyOffering);
  const [showOfferingForm, setShowOfferingForm] = useState(false);
  const [tierOffering, setTierOffering] = useState<AdminWorkshopOffering | null>(null);
  const [tierForm, setTierForm] = useState<TierForm>(emptyTier);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingTierForm, setEditingTierForm] = useState<TierForm>(emptyTier);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingDrafts, setBookingDrafts] = useState<Record<string, string>>({});
  const [bookingNotes, setBookingNotes] = useState<Record<string, string>>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const offeringsQuery = useQuery({
    queryKey: ["admin", "creative-workspace", "offerings"],
    queryFn: getAdminWorkshopOfferings,
  });
  const bookingsQuery = useQuery({
    queryKey: ["admin", "creative-workspace", "bookings", bookingPage, bookingStatus],
    queryFn: () => getAdminWorkshopBookings({ page: bookingPage, limit: 10, ...(bookingStatus ? { status: bookingStatus } : {}) }),
    enabled: tab === "bookings",
  });
  const offerings = offeringsQuery.data ?? [];
  const bookingData = bookingsQuery.data;
  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "creative-workspace", "offerings"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "creative-workspace", "bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["workshops"] }),
    ]);
  };

  const saveOfferingMutation = useMutation({
    mutationFn: () => editingId
      ? updateAdminWorkshopOffering(editingId, {
          ...offeringForm,
          slug: offeringForm.slug.trim() || undefined,
          bookingTerms: offeringForm.bookingTerms || null,
          contactEmail: offeringForm.contactEmail || null,
          contactWhatsApp: offeringForm.contactWhatsApp || null,
        })
      : createAdminWorkshopOffering({
          ...offeringForm,
          slug: offeringForm.slug.trim() || undefined,
          bookingTerms: offeringForm.bookingTerms || null,
          contactEmail: offeringForm.contactEmail || null,
          contactWhatsApp: offeringForm.contactWhatsApp || null,
        }),
    onSuccess: async () => {
      setShowOfferingForm(false); setEditingId(null); setOfferingForm(emptyOffering);
      await invalidateAll();
    },
  });
  const offeringStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminWorkshopOfferingActive(id, active),
    onSuccess: invalidateAll,
  });
  const createTierMutation = useMutation({
    mutationFn: () => {
      if (!tierOffering) throw new Error("Select a workshop first");
      return createAdminWorkshopTier(tierOffering.id, tierForm);
    },
    onSuccess: async () => { setTierForm(emptyTier); await invalidateAll(); },
  });
  const editTierMutation = useMutation({
    mutationFn: () => {
      if (!editingTierId) throw new Error("Select a price tier first");
      return updateAdminWorkshopTier(editingTierId, editingTierForm);
    },
    onSuccess: async () => { setEditingTierId(null); await invalidateAll(); },
  });
  const tierStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminWorkshopTierActive(id, active),
    onSuccess: invalidateAll,
  });
  const bookingMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: WorkshopBookingStatus; adminNotes: string }) =>
      updateAdminWorkshopBooking(id, { status, adminNotes: adminNotes || null }),
    onSuccess: invalidateAll,
  });

  const activeCount = offerings.filter((item) => item.active).length;
  const bookingTotal = bookingData?.pagination.total ?? 0;
  const bookingPages = Math.max(1, Math.ceil(bookingTotal / (bookingData?.pagination.limit ?? 10)));
  const error = [offeringsQuery.error, bookingsQuery.error, saveOfferingMutation.error, offeringStatusMutation.error, createTierMutation.error, editTierMutation.error, tierStatusMutation.error, bookingMutation.error].find(Boolean);
  const currentError = error ? errorMessage(error) : null;

  const startEditOffering = (item: AdminWorkshopOffering) => {
    setEditingId(item.id); setOfferingForm(toOfferingForm(item)); setShowOfferingForm(true);
  };
  const startCreateOffering = () => {
    setEditingId(null); setOfferingForm(emptyOffering); setShowOfferingForm(true);
  };
  const startEditTier = (tier: AdminWorkshopTier) => {
    setEditingTierId(tier.id);
    setEditingTierForm({ label: tier.label, participantCount: tier.participantCount, price: Number(tier.price), currency: tier.currency, displayOrder: tier.displayOrder });
  };

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[#8B1E5A] p-3 text-white"><Check size={23} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E5A]">KPX Academy · Admin</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Creative workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Manage creative workshop listings, participant pricing, publication, and incoming event requests from one place.</p>
          </div>
        </div>
        <div className="grid min-w-[210px] grid-cols-2 gap-3">
          <Stat label="Workshop types" value={offerings.length} />
          <Stat label="Published" value={activeCount} />
        </div>
      </div>

      {currentError && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><CircleAlert size={18} className="mt-0.5 shrink-0" /><span>{currentError}</span></div>}
      {saveOfferingMutation.isSuccess && <Notice>Workshop details saved.</Notice>}
      {bookingMutation.isSuccess && <Notice>Booking updated.</Notice>}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="flex gap-1">
          <TabButton active={tab === "offerings"} onClick={() => setTab("offerings")}>Workshop offerings</TabButton>
          <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")}>Booking requests</TabButton>
        </div>
        {tab === "offerings" && <button onClick={startCreateOffering} className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E5A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6e1747]"><Plus size={16} /> New workshop</button>}
      </div>

      {tab === "offerings" && (
        <>
          {showOfferingForm && (
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit workshop" : "Create workshop"}</h2><p className="mt-1 text-sm text-slate-500">New workshops start unpublished. Add at least one active price tier before publishing.</p></div><button onClick={() => { setShowOfferingForm(false); setEditingId(null); }} aria-label="Close editor" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); saveOfferingMutation.mutate(); }}>
                <Field label="Workshop title"><input required minLength={3} maxLength={180} value={offeringForm.title} onChange={(e) => setOfferingForm({ ...offeringForm, title: e.target.value })} className={inputClass} /></Field>
                <Field label="Slug (optional)"><input minLength={3} value={offeringForm.slug} onChange={(e) => setOfferingForm({ ...offeringForm, slug: e.target.value })} placeholder="Generated from title if blank" className={inputClass} /></Field>
                <Field label="Workshop category"><select value={offeringForm.workshopType} onChange={(e) => setOfferingForm({ ...offeringForm, workshopType: e.target.value as WorkshopType })} className={inputClass}><option value="RESIN_ART">Resin art</option><option value="LIP_CARE_FORMULATION">Lip-care formulation</option><option value="CUSTOM_GROUP">Custom group workshop</option></select></Field>
                <Field label="Display order"><input type="number" min={0} value={offeringForm.displayOrder} onChange={(e) => setOfferingForm({ ...offeringForm, displayOrder: Number(e.target.value) })} className={inputClass} /></Field>
                <div className="md:col-span-2"><Field label="Description"><textarea required minLength={10} maxLength={5000} rows={4} value={offeringForm.description} onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })} className={inputClass} /></Field></div>
                <div className="md:col-span-2"><Field label="Booking terms (optional)"><textarea rows={3} maxLength={5000} value={offeringForm.bookingTerms} onChange={(e) => setOfferingForm({ ...offeringForm, bookingTerms: e.target.value })} className={inputClass} /></Field></div>
                <Field label="Contact email"><input type="email" value={offeringForm.contactEmail} onChange={(e) => setOfferingForm({ ...offeringForm, contactEmail: e.target.value })} className={inputClass} /></Field>
                <Field label="Contact WhatsApp"><input value={offeringForm.contactWhatsApp} onChange={(e) => setOfferingForm({ ...offeringForm, contactWhatsApp: e.target.value })} placeholder="+234..." className={inputClass} /></Field>
                <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={offeringForm.featured} onChange={(e) => setOfferingForm({ ...offeringForm, featured: e.target.checked })} className="h-4 w-4 accent-[#8B1E5A]" /> Feature this workshop on the public page</label>
                <div className="flex justify-end gap-2 md:col-span-2"><button type="button" onClick={() => { setShowOfferingForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button disabled={saveOfferingMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E5A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} />{saveOfferingMutation.isPending ? "Saving…" : "Save workshop"}</button></div>
              </form>
            </section>
          )}

          {offeringsQuery.isLoading ? <Loading label="Loading workshops…" /> : offerings.length === 0 ? <Empty title="No workshop offerings yet" description="Create your first creative workshop to make it available for publication." /> : (
            <div className="space-y-4">
              {offerings.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-slate-900">{item.title}</h2><span className={item.active ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"}>{item.active ? "Published" : "Draft"}</span>{item.featured && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Featured</span>}</div>
                      <p className="mt-1 text-xs text-slate-500">/{item.slug} · {typeLabel(item.workshopType)} · Order {item.displayOrder}</p>
                      <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-slate-600">{item.description}</p>
                      {(item.contactEmail || item.contactWhatsApp) && <p className="mt-3 text-xs text-slate-500">{[item.contactEmail, item.contactWhatsApp].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => startEditOffering(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit details</button>
                      <button onClick={() => setTierOffering(tierOffering?.id === item.id ? null : item)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Users size={14} className="mr-1 inline" />Price tiers ({item.participantTiers.length})</button>
                      <button onClick={() => offeringStatusMutation.mutate({ id: item.id, active: !item.active })} disabled={offeringStatusMutation.isPending} className={item.active ? "inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50" : "inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"}>{item.active ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}</button>
                    </div>
                  </div>
                  {tierOffering?.id === item.id && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                      <div className="mb-4"><h3 className="font-semibold text-slate-900">Participant pricing</h3><p className="mt-1 text-xs text-slate-500">An offering needs one active tier before it can be published.</p></div>
                      {item.participantTiers.length > 0 && <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{item.participantTiers.map((tier) => <div key={tier.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        {editingTierId === tier.id ? <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); editTierMutation.mutate(); }}>
                          <Field label="Tier label"><input required value={editingTierForm.label} onChange={(e) => setEditingTierForm({ ...editingTierForm, label: e.target.value })} className={inputClass} /></Field>
                          <div className="grid grid-cols-2 gap-2"><Field label="Participants"><input type="number" min={1} required value={editingTierForm.participantCount} onChange={(e) => setEditingTierForm({ ...editingTierForm, participantCount: Number(e.target.value) })} className={inputClass} /></Field><Field label="Price"><input type="number" min={1} step="0.01" required value={editingTierForm.price} onChange={(e) => setEditingTierForm({ ...editingTierForm, price: Number(e.target.value) })} className={inputClass} /></Field></div>
                          <div className="flex gap-2"><button disabled={editTierMutation.isPending} className="rounded-lg bg-[#8B1E5A] px-3 py-2 text-xs font-semibold text-white">Save</button><button type="button" onClick={() => setEditingTierId(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">Cancel</button></div>
                        </form> : <>
                          <div className="flex items-start justify-between gap-2"><p className="font-semibold text-slate-900">{tier.label}</p><span className={tier.active ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700" : "rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500"}>{tier.active ? "Active" : "Inactive"}</span></div>
                          <p className="mt-2 text-xl font-semibold text-slate-900">{money(tier.price, tier.currency)}</p><p className="mt-1 text-xs text-slate-500">{tier.participantCount} participant{tier.participantCount === 1 ? "" : "s"}</p>
                          <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => startEditTier(tier)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium">Edit price</button><button onClick={() => tierStatusMutation.mutate({ id: tier.id, active: !tier.active })} disabled={tierStatusMutation.isPending} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-50">{tier.active ? "Deactivate" : "Activate"}</button></div>
                        </>}
                      </div>)}</div>}
                      <form className="grid gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 md:grid-cols-5" onSubmit={(e) => { e.preventDefault(); createTierMutation.mutate(); }}>
                        <Field label="Tier label"><input required value={tierForm.label} onChange={(e) => setTierForm({ ...tierForm, label: e.target.value })} placeholder="e.g. 10 participants" className={inputClass} /></Field>
                        <Field label="Participants"><input type="number" min={1} max={1000} required value={tierForm.participantCount} onChange={(e) => setTierForm({ ...tierForm, participantCount: Number(e.target.value) })} className={inputClass} /></Field>
                        <Field label="Total price (NGN)"><input type="number" min={1} step="0.01" required value={tierForm.price || ""} onChange={(e) => setTierForm({ ...tierForm, price: Number(e.target.value) })} className={inputClass} /></Field>
                        <Field label="Currency"><select value={tierForm.currency} onChange={(e) => setTierForm({ ...tierForm, currency: e.target.value })} className={inputClass}><option value="NGN">NGN</option><option value="USD">USD</option><option value="GBP">GBP</option></select></Field>
                        <div className="flex items-end"><button disabled={createTierMutation.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus size={15} /> Add tier</button></div>
                      </form>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "bookings" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div><h2 className="font-semibold text-slate-900">Workshop booking requests</h2><p className="mt-1 text-xs text-slate-500">Review customer requests, update the workflow status, and keep internal notes.</p></div>
            <select value={bookingStatus} onChange={(e) => { setBookingStatus(e.target.value); setBookingPage(1); }} className={inputClass + " w-auto min-w-[190px]"}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
          </div>
          {bookingsQuery.isLoading ? <Loading label="Loading booking requests…" /> : (bookingData?.items.length ?? 0) === 0 ? <Empty title="No booking requests found" description="New creative workshop requests will appear here." /> : (
            <div className="space-y-3">
              {bookingData?.items.map((booking) => <BookingCard key={booking.id} booking={booking} expanded={expandedBooking === booking.id} onToggle={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)} status={bookingDrafts[booking.id] ?? booking.status} notes={bookingNotes[booking.id] ?? booking.adminNotes ?? ""} onStatusChange={(value) => setBookingDrafts({ ...bookingDrafts, [booking.id]: value })} onNotesChange={(value) => setBookingNotes({ ...bookingNotes, [booking.id]: value })} onSave={() => bookingMutation.mutate({ id: booking.id, status: (bookingDrafts[booking.id] ?? booking.status) as WorkshopBookingStatus, adminNotes: bookingNotes[booking.id] ?? booking.adminNotes ?? "" })} saving={bookingMutation.isPending} />)}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><span className="text-slate-500">Page {bookingPage} of {bookingPages} · {bookingTotal} requests</span><div className="flex gap-2"><button disabled={bookingPage <= 1} onClick={() => setBookingPage((p) => p - 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronLeft size={16} /></button><button disabled={bookingPage >= bookingPages} onClick={() => setBookingPage((p) => p + 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ChevronRight size={16} /></button></div></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({ booking, expanded, onToggle, status, notes, onStatusChange, onNotesChange, onSave, saving }: {
  booking: AdminWorkshopBooking; expanded: boolean; onToggle: () => void; status: string; notes: string;
  onStatusChange: (value: string) => void; onNotesChange: (value: string) => void; onSave: () => void; saving: boolean;
}) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{booking.customerName}</h3><span className={statusStyle[booking.status]}>{booking.status.replaceAll("_", " ")}</span></div><p className="mt-1 text-xs text-slate-500">{booking.publicReference} · Submitted {new Date(booking.createdAt).toLocaleDateString()}</p><p className="mt-3 text-sm font-medium text-slate-800">{booking.workshopTitleSnapshot}</p><p className="mt-1 text-sm text-slate-500">{booking.customerEmail} · {booking.customerWhatsApp}</p><p className="mt-2 text-sm text-slate-700">{booking.participantCount} participants · {money(booking.priceSnapshot, booking.currency)}</p></div>
      <button onClick={onToggle} className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">{expanded ? "Hide details" : "Review request"}</button>
    </div>
    {expanded && <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
      <div className="space-y-3 text-sm"><Info label="Requested event date" value={new Date(booking.eventDate).toLocaleString()} /><Info label="Venue" value={booking.venueMode.replaceAll("_", " ")} /><Info label="Venue address" value={booking.venueAddress || "Not provided"} /><Info label="City" value={booking.city || "Not provided"} /><Info label="Custom workshop request" value={booking.customWorkshopDescription || "—"} /><Info label="Customer notes" value={booking.customerNotes || "—"} /></div>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <Field label="Workflow status"><select value={status} onChange={(e) => onStatusChange(e.target.value)} className={inputClass}>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></Field>
        <Field label="Internal admin notes"><textarea rows={5} maxLength={5000} value={notes} onChange={(e) => onNotesChange(e.target.value)} placeholder="Record proposal, call outcome, or follow-up…" className={inputClass} /></Field>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#8B1E5A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={15} /> Save booking update</button>
      </form>
    </div>}
  </article>;
}

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#8B1E5A] focus:ring-2 focus:ring-[#8B1E5A]/10";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-semibold text-slate-600">{label}{children}</label>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-slate-900">{value}</p></div>; }
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={active ? "rounded-xl bg-[#8B1E5A] px-4 py-2.5 text-sm font-semibold text-white" : "rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"}>{children}</button>; }
function Notice({ children }: { children: React.ReactNode }) { return <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><Check size={16} />{children}</div>; }
function Loading({ label }: { label: string }) { return <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" />{label}</div>; }
function Empty({ title, description }: { title: string; description: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><CalendarDays size={28} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-800">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{value}</p></div>; }
function typeLabel(type: WorkshopType) { return ({ RESIN_ART: "Resin art", LIP_CARE_FORMULATION: "Lip-care formulation", CUSTOM_GROUP: "Custom group" })[type]; }
