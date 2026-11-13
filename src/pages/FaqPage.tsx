import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircleQuestion, Search } from "lucide-react";
import { PublicPageHero } from "../components/ui/PublicPageHero";
import { getPublicFaqs } from "../api/siteContent.api";

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const faqs = useQuery({
    queryKey: ["site-content", "faq", "public"],
    queryFn: getPublicFaqs,
    staleTime: 5 * 60 * 1000,
  });
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return faqs.data ?? [];
    return (faqs.data ?? []).filter((item) =>
      item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term),
    );
  }, [faqs.data, search]);

  return (
    <div className="min-h-[70vh] bg-[#FAF8F5] text-[#212529]">
      <PublicPageHero
        eyebrow="KPX Academy support"
        title="Frequently asked questions"
        description="Clear answers to common questions about learning with KPX Academy."
        icon={MessageCircleQuestion}
      >
        <label className="mt-7 flex min-h-12 max-w-xl items-center gap-3 rounded-xl border border-white/50 bg-white/10 px-4 py-3 focus-within:ring-2 focus-within:ring-[#F4DCD6] focus-within:ring-offset-2 focus-within:ring-offset-[#17324D]">
          <Search aria-hidden="true" size={18} className="shrink-0 text-white/80" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions and answers" aria-label="Search FAQs" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/65" />
        </label>
      </PublicPageHero>
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        {faqs.isLoading && <p className="text-sm text-slate-500">Loading frequently asked questions…</p>}
        {faqs.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">FAQs could not be loaded. Please refresh the page.</p>}
        {!faqs.isLoading && !faqs.isError && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-lg font-semibold">{search ? "No matching questions" : "FAQs are being prepared"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{search ? "Try a different search term." : "Please check back soon for answers to common questions."}</p>
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((item) => (
            <details key={item.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#2A7F7F]/40 sm:p-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-semibold text-slate-900 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A7F7F]">
                <span>{item.question}</span>
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F7F5F0] text-lg text-[#2A7F7F] transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">{item.answer}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
