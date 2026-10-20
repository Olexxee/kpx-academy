import { useQuery } from "@tanstack/react-query";
import { BookOpenText, Download, FileText, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getPublicResources, getResourceDownloadUrl } from "../api/siteContent.api";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["site-content", "resources", search], queryFn: () => getPublicResources(search || undefined) });
  const resources = query.data ?? [];
  return <div className="min-h-[70vh] bg-[#FAF8F5]">
    <section className="bg-[#07152F] px-5 py-16 text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#F4DCD6]">KPX learning library</p>
        <h1 className="mt-4 max-w-3xl font-[Sora] text-4xl font-extrabold tracking-tight sm:text-6xl">Resources to keep you learning.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">Read training manuals and practical guides online, or download a copy to use offline.</p>
        <label className="mt-8 flex max-w-xl items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 focus-within:ring-2 focus-within:ring-[#F4DCD6]">
          <Search size={19} className="shrink-0 text-white/70" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search guides and manuals" aria-label="Search resources" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/50" />
        </label>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {query.isLoading && <p className="text-sm text-slate-500">Loading resources…</p>}
      {query.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Resources could not be loaded. Please try again.</p>}
      {!query.isLoading && !query.isError && resources.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><BookOpenText className="mx-auto text-[#8B1E5A]" size={32}/><h2 className="mt-4 text-xl font-bold">No resources found</h2><p className="mt-2 text-sm text-slate-500">Try another search term or check back later.</p></div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => <article key={resource.id} className="flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          {resource.coverImageUrl ? <img src={resource.coverImageUrl} alt="" className="h-40 w-full object-cover"/> : <div className="grid h-40 place-items-center bg-[#F4DCD6] text-[#8B1E5A]"><FileText size={40}/></div>}
          <div className="flex flex-1 flex-col p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8B1E5A]">{resource.trainingProgram?.title ?? "KPX Academy resource"}</p>
            <h2 className="mt-2 text-lg font-bold leading-snug text-[#212529]">{resource.title}</h2>
            {resource.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{resource.description}</p>}
            <div className="mt-auto flex flex-wrap gap-3 pt-5">
              <Link to={`/resources/${resource.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#8B1E5A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6e1747]">Read online</Link>
              <a href={getResourceDownloadUrl(resource.slug)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download size={15}/> Download</a>
            </div>
          </div>
        </article>)}
      </div>
    </section>
  </div>;
}
