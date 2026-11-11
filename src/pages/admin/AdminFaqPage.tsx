import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFaq, deleteFaq, getAdminFaqs, updateFaq, type FaqItem } from "../../api/siteContent.api";

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#2A7F7F] focus:ring-2 focus:ring-[#2A7F7F]/15";

const emptyForm = { question: "", answer: "", displayOrder: 0 };

export default function AdminFaqPage() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const faqs = useQuery({ queryKey: ["site-content", "faq", "admin"], queryFn: getAdminFaqs });

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["site-content", "faq", "admin"] }),
      client.invalidateQueries({ queryKey: ["site-content", "faq", "public"] }),
    ]);
  };
  const save = useMutation({
    mutationFn: () => editing
      ? updateFaq(editing.id, form)
      : createFaq(form),
    onSuccess: async () => {
      setNotice(editing ? "FAQ updated." : "FAQ created as a draft.");
      setEditing(null);
      setForm(emptyForm);
      await refresh();
    },
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FaqItem["status"] }) => updateFaq(id, { status }),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: deleteFaq, onSuccess: refresh });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    save.mutate();
  };

  const startEdit = (item: FaqItem) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer, displayOrder: item.displayOrder });
    setNotice("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  if (faqs.isLoading) return <section className="p-6 lg:p-10"><p className="text-sm text-slate-500">Loading FAQs…</p></section>;
  if (faqs.isError) return <section className="p-6 lg:p-10"><p role="alert" className="text-sm text-red-700">Could not load FAQs. Refresh the page to try again.</p></section>;

  return (
    <section className="mx-auto max-w-6xl space-y-7 p-4 sm:p-6 lg:p-10">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2A7F7F]">Site administration</p>
        <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Frequently asked questions</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">Create answers for visitors, control their publication status, and set the order in which published questions appear. New FAQs remain drafts until published.</p>
      </header>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit FAQ" : "Add a question"}</h2>
          {editing && <button type="button" onClick={cancelEdit} className="text-sm font-semibold text-slate-600 underline underline-offset-4">Cancel editing</button>}
        </div>
        <label className="block text-sm font-semibold text-slate-700">Question
          <input required minLength={5} maxLength={300} value={form.question} onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))} className={inputClass} placeholder="Enter the question visitors ask" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">Answer
          <textarea required maxLength={10000} rows={5} value={form.answer} onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))} className={inputClass} placeholder="Write a clear, complete answer" />
        </label>
        <label className="block max-w-xs text-sm font-semibold text-slate-700">Display order
          <input type="number" min={0} max={100000} step={1} value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value) }))} className={inputClass} />
          <span className="mt-1 block text-xs font-normal text-slate-500">Lower numbers appear first. Questions with the same order use publication date as a secondary sort.</span>
        </label>
        {save.isError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{save.error instanceof Error ? save.error.message : "Could not save this FAQ."}</p>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        <button type="submit" disabled={save.isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2A7F7F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236b6b] disabled:opacity-60">{save.isPending ? "Saving…" : editing ? "Save changes" : "Create FAQ draft"}</button>
      </form>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">All questions</h2><span className="text-xs text-slate-500">{faqs.data?.length ?? 0} total</span></div>
        {(faqs.data ?? []).length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No FAQs yet. Add the first question above.</p>}
        {(faqs.data ?? []).map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : item.status === "ARCHIVED" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{item.status}</span>
                  <span className="text-xs text-slate-500">Order: {item.displayOrder}</span>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{item.question}</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Edit</button>
                {item.status === "PUBLISHED" ? (
                  <button type="button" disabled={changeStatus.isPending} onClick={() => changeStatus.mutate({ id: item.id, status: "DRAFT" })} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Unpublish</button>
                ) : (
                  <button type="button" disabled={changeStatus.isPending} onClick={() => changeStatus.mutate({ id: item.id, status: "PUBLISHED" })} className="rounded-lg bg-[#2A7F7F] px-3 py-2 text-xs font-semibold text-white hover:bg-[#236b6b]">Publish</button>
                )}
                <button type="button" disabled={remove.isPending} onClick={() => { if (window.confirm("Delete this FAQ permanently?")) remove.mutate(item.id); }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
          </article>
        ))}
        {(changeStatus.isError || remove.isError) && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">The requested FAQ action failed. Refresh the list and try again.</p>}
      </section>
    </section>
  );
}
