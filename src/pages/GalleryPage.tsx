import { useQuery } from "@tanstack/react-query";
import { Images } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { getPublicCategories, getPublicGallery } from "../api/siteContent.api";

export default function GalleryPage() {
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get("category") ?? "";
  const categoriesQuery = useQuery({ queryKey: ["site-content", "gallery", "categories"], queryFn: getPublicCategories });
  const galleryQuery = useQuery({ queryKey: ["site-content", "gallery", activeCategory], queryFn: () => getPublicGallery(activeCategory || undefined) });
  const categories = categoriesQuery.data ?? [];
  const images = galleryQuery.data ?? [];
  return <main className="min-h-[70vh] bg-[#FAF8F5]">
    <section className="bg-[#07152F] px-5 py-16 text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#F4DCD6]">Learning in practice</p><h1 className="mt-4 font-[Sora] text-4xl font-extrabold tracking-tight sm:text-6xl">Real work. Practical skills.</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">Explore published projects, practical training activities, and creative work from KPX Academy.</p></div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 flex flex-wrap gap-2"><button onClick={() => setParams({})} className={`rounded-full border px-4 py-2 text-sm font-semibold ${!activeCategory ? "border-[#1D4ED8] bg-[#1D4ED8] text-white" : "border-slate-200 bg-white text-slate-600"}`}>All categories</button>{categories.map((category) => <button key={category.id} onClick={() => setParams({ category: category.slug })} className={`rounded-full border px-4 py-2 text-sm font-semibold ${activeCategory === category.slug ? "border-[#1D4ED8] bg-[#1D4ED8] text-white" : "border-slate-200 bg-white text-slate-600"}`}>{category.name}</button>)}</div>
      {galleryQuery.isLoading && <p className="text-sm text-slate-500">Loading gallery…</p>}
      {galleryQuery.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Gallery images could not be loaded. Please try again.</p>}
      {!galleryQuery.isLoading && !galleryQuery.isError && images.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><Images className="mx-auto text-[#8B1E5A]" size={36}/><h2 className="mt-4 text-xl font-bold">Gallery coming soon</h2><p className="mt-2 text-sm text-slate-500">Published gallery images will appear here.</p></div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{images.map((image) => <figure key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><img src={image.url} alt={image.altText} loading="lazy" className="aspect-[4/3] w-full object-cover"/><figcaption className="p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8B1E5A]">{image.category?.name}</p>{image.caption && <h2 className="mt-2 font-bold text-slate-900">{image.caption}</h2>}{image.description && <p className="mt-2 text-sm leading-6 text-slate-600">{image.description}</p>}</figcaption></figure>)}</div>
    </section>
  </main>;
}
