import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Save } from "lucide-react";
import { getAdminSouvenirOrders, updateAdminSouvenirOrder, type AdminSouvenirOrder } from "../../features/souvenirs/api";

const statuses = ["SUBMITTED", "AWAITING_PAYMENT", "PAID", "IN_PRODUCTION", "READY", "FULFILLED", "CANCELLED", "REJECTED"];
const nextStatuses: Record<string, string[]> = {
  SUBMITTED: ["AWAITING_PAYMENT", "CANCELLED", "REJECTED"],
  AWAITING_PAYMENT: ["CANCELLED", "REJECTED"],
  PAID: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["READY", "CANCELLED"],
  READY: ["FULFILLED"],
  FULFILLED: [], CANCELLED: [], REJECTED: [],
};
const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#17324D]";
const money = (value: number | string, currency = "NGN") => new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value));
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "The request failed.";

export default function AdminSouvenirOrders() {
  const client = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["admin", "souvenir-orders", status, page], queryFn: () => getAdminSouvenirOrders(status, page) });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status?: string; adminNotes?: string | null } }) => updateAdminSouvenirOrder(id, payload),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["admin", "souvenir-orders"] }); },
  });
  const items = query.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((query.data?.pagination.total ?? 0) / (query.data?.pagination.limit ?? 10)));
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Souvenir orders</h2><p className="mt-1 text-sm text-slate-500">Review customer orders, payment state and production progress.</p></div>
      <select aria-label="Filter orders by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={field + " mt-0 w-auto"}><option value="">All statuses</option>{[item.status, ...(nextStatuses[item.status] ?? [])].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
    </div>
    {query.isLoading ? <p className="py-8 text-sm text-slate-500">Loading souvenir orders…</p> : query.isError ? <p role="alert" className="py-8 text-sm text-red-700">{errorMessage(query.error)}</p> : !items.length ? <p className="py-8 text-sm text-slate-500">No souvenir orders match this filter.</p> : <div className="mt-4 space-y-3">
      {items.map((item: AdminSouvenirOrder) => <OrderRow key={item.id} item={item} expanded={expanded === item.id} onToggle={() => setExpanded(expanded === item.id ? null : item.id)} notes={notes[item.id] ?? item.adminNotes ?? ""} setNotes={(value) => setNotes((current) => ({ ...current, [item.id]: value }))} onStatus={(next) => update.mutate({ id: item.id, payload: { status: next } })} onSaveNotes={() => update.mutate({ id: item.id, payload: { adminNotes: (notes[item.id] ?? item.adminNotes ?? "").trim() || null } })} pending={update.isPending} />)}
    </div>}
    {update.isError && <p role="alert" className="mt-3 text-sm text-red-700">{errorMessage(update.error)}</p>}
    {query.data && <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{query.data.pagination.total} orders · Page {page} of {totalPages}</span><div className="flex gap-2"><button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>}
  </section>;
}

function OrderRow({ item, expanded, onToggle, notes, setNotes, onStatus, onSaveNotes, pending }: {
  item: AdminSouvenirOrder; expanded: boolean; onToggle: () => void; notes: string; setNotes: (value: string) => void; onStatus: (status: string) => void; onSaveNotes: () => void; pending: boolean;
}) {
  return <article className="rounded-xl border border-slate-200 p-3 sm:p-4">
    <button type="button" className="flex w-full flex-wrap items-center justify-between gap-3 text-left" onClick={onToggle}>
      <span className="min-w-0"><span className="block font-semibold text-slate-900">{item.customerName} · {item.publicReference}</span><span className="mt-1 block text-xs text-slate-500">{item.productNameSnapshot} · {item.quantity} units · {money(item.totalPriceSnapshot, item.currency)} · {new Date(item.createdAt).toLocaleString()}</span></span>
      <span className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.status.replaceAll("_", " ")}</span>{expanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</span>
    </button>
    {expanded && <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-2">
      <div className="space-y-2 text-sm"><p><strong>Customer:</strong> {item.customerName}</p><p><strong>Email:</strong> <a className="text-[#17324D] underline" href={`mailto:${item.customerEmail}`}>{item.customerEmail}</a></p><p><strong>WhatsApp:</strong> {item.customerWhatsApp || "Not provided"}</p><p><strong>Unit price:</strong> {money(item.unitPriceSnapshot, item.currency)}</p><p><strong>Order total:</strong> {money(item.totalPriceSnapshot, item.currency)}</p><p><strong>Colour selections:</strong></p>{item.colorSelections?.length ? <div className="flex flex-wrap gap-2">{item.colorSelections.map((color, index) => <span key={index} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-2.5 py-1 text-xs"><span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.colorHexSnapshot }}/>{color.nameSnapshot}</span>)}</div> : <p className="text-xs text-slate-500">No colour selections recorded.</p>}{item.customerNotes && <p><strong>Customer notes:</strong> {item.customerNotes}</p>}</div>
      <div className="space-y-3"><div><label className="block text-sm font-semibold text-slate-700">Order status</label><select aria-label={`Update status for ${item.publicReference}`} className={field} value={item.status} disabled={pending} onChange={(event) => onStatus(event.target.value)}>{[item.status, ...(nextStatuses[item.status] ?? [])].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><p className="mt-1 text-xs text-slate-500">The backend enforces valid status transitions. Customers are emailed when the status changes.</p></div><div><label className="block text-sm font-semibold text-slate-700">Internal admin notes</label><textarea rows={3} className={field} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Internal fulfilment notes…" /><button type="button" disabled={pending} onClick={onSaveNotes} className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#17324D] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save size={14}/> Save notes</button></div></div>
    </div>}
  </article>;
}
