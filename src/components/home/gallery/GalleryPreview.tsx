import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../../ui/Container";
import { getPublicCategories } from "../../../api/siteContent.api";

export const GalleryPreview = () => {
  const query = useQuery({ queryKey: ["site-content", "gallery", "categories"], queryFn: getPublicCategories });
  const categories = (query.data ?? []);
  return <section aria-labelledby="gallery-preview-heading" className="bg-background py-16 sm:py-20 lg:py-28">
    <Container>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl"><span className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Learning in Practice</span><h2 id="gallery-preview-heading" className="mt-4 font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl">Knowledge is powerful. Putting it into practice matters.</h2></div>
        <div className="max-w-md"><p className="leading-7 text-text-muted">Explore real projects, training activities, and creative work shared by KPX Academy.</p><Link to="/gallery" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary">Explore the gallery <ArrowRight size={16}/></Link></div>
      </div>
      {query.isLoading && <div className="mt-10 grid gap-5 md:grid-cols-3"><div className="h-72 animate-pulse rounded-2xl bg-slate-100"/><div className="h-72 animate-pulse rounded-2xl bg-slate-100"/><div className="h-72 animate-pulse rounded-2xl bg-slate-100"/></div>}
      {!query.isLoading && categories.length > 0 && <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">{categories.map((category, index) => {
        const cover = category.images?.[0];
        return <Link key={category.id} to={`/gallery?category=${encodeURIComponent(category.slug)}`} className="group relative flex min-h-[300px] overflow-hidden rounded-2xl bg-[#07152F] text-white focus:outline-none focus:ring-4 focus:ring-secondary/30">
          {cover && <img src={cover.url} alt={cover.altText} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"/>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07152F]/95 via-[#07152F]/30 to-transparent"/>
          <div className="relative mt-auto w-full p-6 sm:p-7"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#F4DCD6]">{String(index + 1).padStart(2, "0")} / Gallery</span><ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/></div><h3 className="font-heading text-2xl font-semibold">{category.name}</h3>{category.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/80">{category.description}</p>}</div>
        </Link>;
      })}</div>}
      {!query.isLoading && categories.length === 0 && <div className="mt-10 rounded-2xl border border-border bg-white px-6 py-10 text-center"><Images className="mx-auto text-secondary" size={30}/><p className="mt-3 text-sm text-text-muted">New gallery collections will appear here as they are published.</p></div>}
    </Container>
  </section>;
};
