import { useState } from "react";
import { Check, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useAdminTestimonials } from "../hooks/useAdminTestimonials";
import { useTestimonialStats } from "../hooks/useTestimonialStats";
import { useDeleteTestimonial, useUpdateTestimonialStatus } from "../hooks/useTestimonialMutations";
import type { TestimonialStatus } from "../types";

export default function AdminTestimonialsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TestimonialStatus>("ALL");
  const list = useAdminTestimonials({ page: 1, limit: 30, search: search.trim() || undefined, status });
  const stats = useTestimonialStats();
  const update = useUpdateTestimonialStatus();
  const remove = useDeleteTestimonial();

  const changeStatus = async (id: string, nextStatus: TestimonialStatus) => {
    await update.mutateAsync({ id, status: nextStatus });
  };
  const deleteTestimonial = async (id: string, name: string) => {
    if (window.confirm(`Delete the testimonial from ${name}? This cannot be undone.`)) await remove.mutateAsync(id);
  };

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kpx-deep-magenta)]">Website content</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Testimonials</h1><p className="mt-2 text-sm text-gray-500">Review, publish, or remove customer feedback.</p></div>
        <button onClick={() => { void list.refetch(); void stats.refetch(); }} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"><RefreshCw size={16} /> Refresh</button>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", stats.data?.total ?? 0],
          ["Awaiting review", stats.data?.pending ?? 0],
          ["Published", stats.data?.approved ?? 0],
          ["Rejected", stats.data?.rejected ?? 0],
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className="mt-3 text-3xl font-semibold">{stats.isLoading ? "—" : value}</p></div>)}
      </div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search names and messages" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[var(--kpx-royal-blue)]" /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value as "ALL" | TestimonialStatus)} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--kpx-royal-blue)]"><option value="ALL">All statuses</option><option value="PENDING">Pending review</option><option value="APPROVED">Published</option><option value="REJECTED">Rejected</option></select>
      </div>
      {list.isError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load testimonials. Check the API connection and administrator access.</p>}
      <div className="mt-5 space-y-3">
        {list.isLoading && <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading testimonials…</div>}
        {!list.isLoading && !list.isError && (list.data?.testimonials.length ?? 0) === 0 && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No testimonials match these filters.</div>}
        {list.data?.testimonials.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--kpx-soft-blush)] font-semibold text-[var(--kpx-deep-magenta)]">{item.name.slice(0,1).toUpperCase()}</div><div><h2 className="font-semibold">{item.name}</h2><p className="text-xs text-gray-500">{item.role || "KPX Academy community"} · {new Date(item.createdAt).toLocaleDateString()}</p><p className="mt-2 text-sm text-amber-600">{"★".repeat(Math.max(0, Math.min(5, item.rating)))}<span className="ml-2 text-xs text-gray-500">{item.rating}/5</span></p></div></div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : item.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">{item.message}</p>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
              {item.status !== "APPROVED" && <button disabled={update.isPending} onClick={() => void changeStatus(item.id, "APPROVED")} className="inline-flex items-center gap-2 rounded-lg bg-[var(--kpx-royal-blue)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check size={14} /> Publish</button>}
              {item.status !== "REJECTED" && <button disabled={update.isPending} onClick={() => void changeStatus(item.id, "REJECTED")} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"><X size={14} /> Reject</button>}
              <button disabled={remove.isPending} onClick={() => void deleteTestimonial(item.id, item.name)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} /> Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
