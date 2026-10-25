import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, CheckCircle2, FileText, Pencil, Plus, Send, Trash2, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import {
  createCategory, createGalleryImage, createHero, createResource, deleteGalleryImage, deleteResource,
  getAdminCategories, getAdminGallery, getAdminHeroes, getAdminResources, publishHero, updateCategory, updateHero, updateGalleryImage,
  updateResource, uploadGalleryImage, uploadHeroImage, uploadResourcePdf,
  type GalleryCategory, type GalleryImage, type HomepageHero, type Resource,
} from "../../api/siteContent.api";

type Mode = "hero" | "gallery" | "resources";
const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15";
const labelClass = "block text-sm font-semibold text-slate-700";
const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#2A7F7F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#236b6b] disabled:cursor-not-allowed disabled:opacity-60";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminSiteContentPage({ mode }: { mode: Mode }) {
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<{ eyebrow: string; heading: string; highlightText: string; description: string; primaryCtaLabel: string; secondaryCtaLabel: string; imageUrl: string } | null>(null);
  const [heroPreviewMode, setHeroPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const heroFormRef = useRef<HTMLFormElement>(null);
  const heroes = useQuery({ queryKey: ["site-content", "admin", "hero"], queryFn: getAdminHeroes, enabled: mode === "hero" });
  const categories = useQuery({ queryKey: ["site-content", "admin", "categories"], queryFn: getAdminCategories, enabled: mode === "gallery" });
  const gallery = useQuery({ queryKey: ["site-content", "admin", "gallery"], queryFn: getAdminGallery, enabled: mode === "gallery" });
  const resources = useQuery({ queryKey: ["site-content", "admin", "resources"], queryFn: getAdminResources, enabled: mode === "resources" });

  const refresh = async (...keys: string[][]) => Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
  const run = async <T,>(work: () => Promise<T>, keys: string[][]) => {
    setMessage(""); setError("");
    try { await work(); setMessage("Changes saved."); await refresh(...keys); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "The operation failed. Please try again."); }
  };

  const editHeroDraft = (hero: HomepageHero) => {
    setEditingHeroId(hero.id);
    setHeroPreview({ eyebrow: hero.eyebrow ?? "Practical learning starts here", heading: hero.heading, highlightText: hero.highlightText ?? "", description: hero.description, primaryCtaLabel: hero.primaryCtaLabel ?? "Explore programmes", secondaryCtaLabel: hero.secondaryCtaLabel ?? "Our story", imageUrl: hero.imageUrl ?? "" });
    const fields: Record<string, string> = { eyebrow: hero.eyebrow ?? "", heading: hero.heading, highlightText: hero.highlightText ?? "", description: hero.description, primaryCtaLabel: hero.primaryCtaLabel ?? "", primaryCtaUrl: hero.primaryCtaUrl ?? "", secondaryCtaLabel: hero.secondaryCtaLabel ?? "", secondaryCtaUrl: hero.secondaryCtaUrl ?? "", imageAltText: hero.imageAltText ?? "", displayOrder: String(hero.displayOrder ?? 0) };
    for (const [name, value] of Object.entries(fields)) {
      const field = heroFormRef.current?.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = value;
    }
    heroFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitHero = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    await run(async () => {
      let image: Awaited<ReturnType<typeof uploadHeroImage>> | undefined;
      const file = form.get("image");
      if (file instanceof File && file.size > 0) image = await uploadHeroImage(file);
      const payload = {
        eyebrow: String(form.get("eyebrow") || ""),
        heading: String(form.get("heading") || ""),
        highlightText: String(form.get("highlightText") || ""),
        description: String(form.get("description") || ""),
        primaryCtaLabel: String(form.get("primaryCtaLabel") || "Explore programmes"),
        primaryCtaUrl: String(form.get("primaryCtaUrl") || "/programs"),
        secondaryCtaLabel: String(form.get("secondaryCtaLabel") || ""),
        secondaryCtaUrl: String(form.get("secondaryCtaUrl") || ""),
        imageAltText: String(form.get("imageAltText") || ""),
        displayOrder: Number(form.get("displayOrder") || 0),
        ...(image ? { imageUrl: image.url, imagePublicId: image.publicId } : {}),
      };
      let saved: HomepageHero;
      if (editingHeroId) saved = await updateHero(editingHeroId, payload);
      else saved = await createHero(payload);
      if (saved.status !== "PUBLISHED") await publishHero(saved.id);
      formElement.reset();
      setEditingHeroId(null);
    }, [["site-content", "admin", "hero"], ["site-content", "hero"], ["site-content", "hero", "slides"]]);
  };

  const renameCategory = (category: GalleryCategory) => {
    const name = window.prompt("Rename gallery category", category.name);
    if (!name?.trim()) return;
    void run(() => updateCategory(category.id, { name: name.trim(), slug: slugify(name) }), [["site-content", "admin", "categories"], ["site-content", "admin", "gallery"], ["site-content", "gallery"]]);
  };
  const toggleCategory = (category: GalleryCategory) => {
    void run(() => updateCategory(category.id, { active: !category.active }), [["site-content", "admin", "categories"], ["site-content", "gallery"]]);
  };
  const reorderCategory = (categoryId: string, direction: -1 | 1) => {
    const ordered = [...(categories.data ?? [])];
    const index = ordered.findIndex((item) => item.id === categoryId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    void run(() => Promise.all(ordered.map((item, order) => updateCategory(item.id, { displayOrder: (order + 1) * 10 })),), [["site-content", "admin", "categories"], ["site-content", "gallery"]]);
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const name = String(form.get("name") || "");
    await run(async () => { await createCategory({ name, slug: slugify(String(form.get("slug") || name)), description: String(form.get("description") || ""), displayOrder: Number(form.get("displayOrder") || 0) }); formElement.reset(); }, [["site-content", "admin", "categories"], ["site-content", "admin", "gallery"]]);
  };

  const submitGalleryImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const file = form.get("image");
    if (!(file instanceof File) || file.size === 0) { setError("Choose an image to upload."); return; }
    await run(async () => {
      const asset = await uploadGalleryImage(file);
      await createGalleryImage({ categoryId: String(form.get("categoryId") || ""), url: asset.url, publicId: asset.publicId, altText: String(form.get("altText") || ""), caption: String(form.get("caption") || ""), description: String(form.get("description") || ""), displayOrder: Number(form.get("displayOrder") || 0), featured: form.get("featured") === "on" });
      formElement.reset();
    }, [["site-content", "admin", "gallery"], ["site-content", "admin", "categories"]]);
  };

  const submitResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const file = form.get("pdf");
    if (!(file instanceof File) || file.size === 0) { setError("Choose a PDF manual to upload."); return; }
    await run(async () => {
      const asset = await uploadResourcePdf(file);
      const title = String(form.get("title") || "");
      await createResource({ title, slug: slugify(String(form.get("slug") || title)), description: String(form.get("description") || ""), fileUrl: asset.url, filePublicId: asset.publicId, fileBytes: asset.bytes, ...(String(form.get("trainingProgramId") || "") ? { trainingProgramId: String(form.get("trainingProgramId")) } : {}) });
      formElement.reset();
    }, [["site-content", "admin", "resources"]]);
  };

  const title = mode === "hero" ? "Homepage slides" : mode === "gallery" ? "Gallery manager" : "Resources library";
  const subtitle = mode === "hero" ? "Create and publish multiple homepage slides. Published slides appear in the carousel in display order." : mode === "gallery" ? "Create categories and upload the real training images shown on the public site." : "Upload training manuals as PDFs. Published resources are publicly readable without an account.";
  return <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8B1E5A]">Site management</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p>
    </div>
    <div className="mb-6 flex flex-wrap gap-2">
      {[["hero","Homepage hero"],["gallery","Gallery"],["resources","Resources"]].map(([key,label]) => <Link key={key} to={key === "hero" ? "/admin/content" : key === "gallery" ? "/admin/gallery" : "/admin/resources"} className={`rounded-full border px-4 py-2 text-sm font-semibold ${mode === key ? "border-[#2A7F7F] bg-[#2A7F7F] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{label}</Link>)}
    </div>
    {message && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

    {mode === "hero" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]">
      <form ref={heroFormRef} onSubmit={submitHero} onInput={(event) => { const form = event.currentTarget; const values = new FormData(form); const file = values.get("image"); const current = heroPreview?.imageUrl ?? (heroes.data ?? []).find((hero) => hero.id === editingHeroId)?.imageUrl ?? ""; setHeroPreview({ eyebrow: String(values.get("eyebrow") || "Practical learning starts here"), heading: String(values.get("heading") || "Your headline goes here"), highlightText: String(values.get("highlightText") || ""), description: String(values.get("description") || "Your supporting description will appear here."), primaryCtaLabel: String(values.get("primaryCtaLabel") || "Explore programmes"), secondaryCtaLabel: String(values.get("secondaryCtaLabel") || "Our story"), imageUrl: file instanceof File && file.size ? URL.createObjectURL(file) : current }); }} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#2A7F7F]">Slide editor</p><h2 className="mt-1 text-xl font-bold text-[#17324D]">{editingHeroId ? "Edit homepage slide" : "Create a new slide"}</h2><p className="mt-1 text-sm text-slate-500">Build the content, preview it, then publish it live.</p></div><span className="rounded-full bg-[#F7F5F0] px-3 py-1.5 text-xs font-bold text-[#17324D]">Step 1 of 3</span></div>
        <div><label className={labelClass}>Eyebrow</label><input name="eyebrow" className={fieldClass} placeholder="Practical learning starts here"/></div>
        <div><label className={labelClass}>Headline</label><input name="heading" required minLength={3} className={fieldClass} placeholder="Learn practical skills"/></div>
        <div><label className={labelClass}>Highlighted headline text</label><input name="highlightText" className={fieldClass} placeholder="More possibilities"/></div>
        <div><label className={labelClass}>Description</label><textarea name="description" required minLength={10} rows={4} className={fieldClass} placeholder="Describe what learners can expect from KPX Academy."/></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Primary CTA label</label><input name="primaryCtaLabel" className={fieldClass} defaultValue="Explore programmes"/></div><div><label className={labelClass}>Primary CTA URL</label><input name="primaryCtaUrl" className={fieldClass} defaultValue="/programs"/></div><div><label className={labelClass}>Secondary CTA label</label><input name="secondaryCtaLabel" className={fieldClass} defaultValue="Our story"/></div><div><label className={labelClass}>Secondary CTA URL</label><input name="secondaryCtaUrl" className={fieldClass} defaultValue="/about"/></div></div>
        <div><label className={labelClass}>Hero image</label><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={fieldClass}/><p className="mt-1 text-xs text-slate-500">JPEG, PNG, WEBP or GIF; maximum 15 MB.</p></div>
        <div><label className={labelClass}>Image alt text</label><input name="imageAltText" className={fieldClass} placeholder="Describe the learning activity shown"/></div>
        <div><label className={labelClass}>Slide order</label><input name="displayOrder" type="number" min="0" defaultValue="0" className={fieldClass}/><p className="mt-1 text-xs text-slate-500">Lower numbers appear earlier in the homepage carousel.</p></div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5"><button type="button" onClick={() => { const form = heroFormRef.current; if (!form) return; const values = new FormData(form); const file = values.get("image"); const existing = (heroes.data ?? []).find((hero) => hero.id === editingHeroId)?.imageUrl ?? ""; setHeroPreview({ eyebrow: String(values.get("eyebrow") || "Practical learning starts here"), heading: String(values.get("heading") || "Your headline goes here"), highlightText: String(values.get("highlightText") || ""), description: String(values.get("description") || "Your supporting description will appear here."), primaryCtaLabel: String(values.get("primaryCtaLabel") || "Explore programmes"), secondaryCtaLabel: String(values.get("secondaryCtaLabel") || "Our story"), imageUrl: file instanceof File && file.size ? URL.createObjectURL(file) : existing }); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#2A7F7F] px-4 py-2.5 text-sm font-semibold text-[#2A7F7F]"><Pencil size={15}/> Preview slide</button><button className={buttonClass} type="submit"><Send size={15}/> {editingHeroId ? "Save & publish changes" : "Publish to homepage"}</button>{editingHeroId && <button type="button" onClick={() => { setEditingHeroId(null); heroFormRef.current?.reset(); setHeroPreview(null); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>}</div>
      </form>
      <section className="space-y-5">
        {heroPreview && <div className="overflow-hidden rounded-3xl border border-[#17324D]/10 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#2A7F7F]">Live preview</p><p className="text-sm font-semibold text-[#17324D]">Preview your slide before publishing.</p></div><div className="flex gap-1 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setHeroPreviewMode("desktop")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${heroPreviewMode === "desktop" ? "bg-white text-[#17324D] shadow-sm" : "text-slate-500"}`}>Desktop</button><button type="button" onClick={() => setHeroPreviewMode("mobile")} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${heroPreviewMode === "mobile" ? "bg-white text-[#17324D] shadow-sm" : "text-slate-500"}`}>Mobile</button></div></div><div className={`mx-auto p-2 sm:p-4 ${heroPreviewMode === "mobile" ? "max-w-[360px]" : "w-full"}`}><div className={`relative isolate flex overflow-hidden rounded-2xl bg-[#17324D] text-white ${heroPreviewMode === "mobile" ? "min-h-[490px]" : "min-h-[340px] sm:min-h-[420px]"}`}>{heroPreview.imageUrl && <img src={heroPreview.imageUrl} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover"/>}<div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10283f]/95 via-[#10283f]/75 to-[#10283f]/30"/><div className={`my-auto ${heroPreviewMode === "mobile" ? "p-5" : "max-w-2xl p-7 sm:p-10"}`}><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#F3D7CC]">{heroPreview.eyebrow}</p><h3 className={`mt-4 font-extrabold leading-[1.03] tracking-tight ${heroPreviewMode === "mobile" ? "text-3xl" : "text-4xl sm:text-6xl"}`}>{heroPreview.heading} {heroPreview.highlightText && <span className="text-[#F3D7CC]">{heroPreview.highlightText}</span>}</h3><p className={`mt-4 leading-6 text-white/85 ${heroPreviewMode === "mobile" ? "text-sm" : "max-w-xl text-base"}`}>{heroPreview.description}</p><div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-[#2A7F7F] px-4 py-2.5 text-xs font-bold">{heroPreview.primaryCtaLabel}</span>{heroPreview.secondaryCtaLabel && <span className="rounded-full border border-white/60 px-4 py-2.5 text-xs font-bold">{heroPreview.secondaryCtaLabel}</span>}</div></div></div></div></div>}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-[#17324D]">Homepage slide library</h2><p className="mt-1 text-sm text-slate-500">Published slides rotate on the public homepage. Edit, preview, and publish from here.</p></div><span className="rounded-full bg-[#F7F5F0] px-3 py-1.5 text-xs font-semibold text-[#17324D]">{(heroes.data ?? []).filter((hero) => hero.status === "PUBLISHED").length} published · {(heroes.data ?? []).length} total</span></div>
        {heroes.isLoading && <p className="mt-5 text-sm text-slate-500">Loading versions…</p>}
        <div className="mt-5 space-y-3">{(heroes.data ?? []).map((hero) => <HeroVersion key={hero.id} hero={hero} onEdit={() => editHeroDraft(hero)} onPublish={() => run(() => publishHero(hero.id), [["site-content","admin","hero"],["site-content","hero"]])}/>)}</div>
        {!heroes.isLoading && (heroes.data ?? []).length === 0 && <p className="mt-5 rounded-xl bg-[#F7F5F0] p-5 text-sm text-slate-600">No homepage slides yet. Create your first slide using the editor.</p>}
        </div>
      </section>
    </div>}

    {mode === "gallery" && <div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
      <div className="space-y-6">
        <form onSubmit={submitCategory} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Add category</h2>
          <div><label className={labelClass}>Category name</label><input name="name" required minLength={2} className={fieldClass} placeholder="Beauty & Formulation"/></div>
          <div><label className={labelClass}>Slug (optional)</label><input name="slug" className={fieldClass} placeholder="beauty-formulation"/></div>
          <div><label className={labelClass}>Description</label><textarea name="description" rows={2} className={fieldClass}/></div>
          <div><label className={labelClass}>Display order</label><input name="displayOrder" type="number" min="0" defaultValue="0" className={fieldClass}/></div>
          <button className={buttonClass} type="submit"><Plus size={16}/> Add category</button>
          <div className="border-t border-slate-100 pt-4"><p className="text-sm font-bold">Categories</p><div className="mt-3 space-y-2">{(categories.data ?? []).map((category, index) => <div key={category.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{category.name}</p><p className="mt-0.5 text-xs text-slate-500">{category._count?.images ?? 0} images · {category.active ? "Active" : "Archived"}</p></div><div className="flex shrink-0 gap-1"><button type="button" disabled={index === 0} onClick={() => reorderCategory(category.id, -1)} aria-label={"Move " + category.name + " up"} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-30"><ArrowUp size={13}/></button><button type="button" disabled={index === (categories.data?.length ?? 0) - 1} onClick={() => reorderCategory(category.id, 1)} aria-label={"Move " + category.name + " down"} className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-30"><ArrowDown size={13}/></button><button type="button" onClick={() => renameCategory(category)} aria-label={"Rename " + category.name} className="rounded-lg border border-slate-200 p-2 text-slate-600"><Pencil size={13}/></button><button type="button" onClick={() => toggleCategory(category)} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600">{category.active ? "Archive" : "Restore"}</button></div></div>)}</div></div>
        </form>
        <form onSubmit={submitGalleryImage} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Upload gallery image</h2>
          <div><label className={labelClass}>Image file</label><input name="image" required type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={fieldClass}/></div>
          <div><label className={labelClass}>Category</label><select name="categoryId" required className={fieldClass} defaultValue=""><option value="" disabled>Select category</option>{(categories.data ?? []).filter((item) => item.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><label className={labelClass}>Alt text</label><input name="altText" required minLength={3} className={fieldClass} placeholder="Learner creating a resin art piece"/></div>
          <div><label className={labelClass}>Caption</label><input name="caption" className={fieldClass}/></div>
          <div><label className={labelClass}>Description</label><textarea name="description" rows={2} className={fieldClass}/></div>
          <div><label className={labelClass}>Display order</label><input name="displayOrder" type="number" min="0" defaultValue="0" className={fieldClass}/></div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="featured" className="accent-[#1D4ED8]"/> Feature this image</label>
          <button className={buttonClass} type="submit"><UploadCloud size={16}/> Upload as draft</button>
        </form>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold">Gallery images</h2>
        {gallery.isLoading && <p className="mt-4 text-sm text-slate-500">Loading images…</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{(gallery.data ?? []).map((image) => <GalleryCard key={image.id} image={image} onPublish={() => run(() => updateGalleryImage(image.id, { status: "PUBLISHED" }), [["site-content","admin","gallery"],["site-content","gallery"],["site-content","gallery","categories"]])} onArchive={() => run(() => updateGalleryImage(image.id, { status: "ARCHIVED" }), [["site-content","admin","gallery"],["site-content","gallery"]])} onDelete={() => { if (window.confirm("Delete this gallery image?")) void run(() => deleteGalleryImage(image.id), [["site-content","admin","gallery"],["site-content","gallery"]]); }}/>)}</div>
        {!gallery.isLoading && (gallery.data ?? []).length === 0 && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Upload the first gallery image after creating a category.</p>}
      </section>
    </div>}

    {mode === "resources" && <div className="grid gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
      <form onSubmit={submitResource} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold">Upload a training manual</h2>
        <div><label className={labelClass}>Resource title</label><input name="title" required minLength={3} className={fieldClass} placeholder="Resin art training manual"/></div>
        <div><label className={labelClass}>Slug (optional)</label><input name="slug" className={fieldClass} placeholder="resin-art-training-manual"/></div>
        <div><label className={labelClass}>Description</label><textarea name="description" rows={4} className={fieldClass} placeholder="What will readers learn from this manual?"/></div>
        <div><label className={labelClass}>Training program ID (optional)</label><input name="trainingProgramId" className={fieldClass} placeholder="Link to an existing programme ID"/></div>
        <div><label className={labelClass}>PDF file</label><input name="pdf" required type="file" accept="application/pdf,.pdf" className={fieldClass}/><p className="mt-1 text-xs text-slate-500">PDF only, maximum 50 MB. Resources are saved as drafts.</p></div>
        <button className={buttonClass} type="submit"><UploadCloud size={16}/> Upload PDF</button>
      </form>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold">Published and draft resources</h2>
        {resources.isLoading && <p className="mt-4 text-sm text-slate-500">Loading resources…</p>}
        <div className="mt-5 space-y-3">{(resources.data ?? []).map((resource) => <ResourceRow key={resource.id} resource={resource} onEdit={() => { const title = window.prompt("Resource title", resource.title); if (!title?.trim()) return; const description = window.prompt("Resource description", resource.description ?? ""); if (description === null) return; void run(() => updateResource(resource.id, { title: title.trim(), slug: slugify(title), description }), [["site-content","admin","resources"],["site-content","resources"]]); }} onReplace={(file) => run(async () => { const asset = await uploadResourcePdf(file); await updateResource(resource.id, { fileUrl: asset.url, filePublicId: asset.publicId, fileBytes: asset.bytes }); }, [["site-content","admin","resources"],["site-content","resources"]])} onPublish={() => run(() => updateResource(resource.id, { status: "PUBLISHED" }), [["site-content","admin","resources"],["site-content","resources"]])} onArchive={() => run(() => updateResource(resource.id, { status: "ARCHIVED" }), [["site-content","admin","resources"],["site-content","resources"]])} onDelete={() => { if (window.confirm("Delete this resource and its stored PDF?")) void run(() => deleteResource(resource.id), [["site-content","admin","resources"],["site-content","resources"]]); }}/>)}</div>
        {!resources.isLoading && (resources.data ?? []).length === 0 && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No manuals uploaded yet.</p>}
      </section>
    </div>}
  </div>;
}

function HeroVersion({ hero, onPublish, onEdit }: { hero: HomepageHero; onPublish: () => void; onEdit: () => void }) {
  return <article className="overflow-hidden rounded-2xl border border-slate-200 transition hover:border-[#2A7F7F]/50 hover:shadow-sm">
    {hero.imageUrl ? <img src={hero.imageUrl} alt={hero.imageAltText ?? ""} className="h-32 w-full object-cover"/> : <div className="grid h-24 place-items-center bg-[#F7F5F0] text-sm text-slate-400">No image selected</div>}
    <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#2A7F7F]">Slide {hero.displayOrder ?? 0}</p><h3 className="mt-1 font-bold text-[#17324D]">{hero.heading}</h3><p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{hero.description}</p></div><Status status={hero.status}/></div>
    <div className="mt-4 flex flex-wrap gap-2"><SmallButton onClick={onEdit}><Pencil size={13}/> Edit</SmallButton>{hero.status !== "PUBLISHED" && <SmallButton onClick={onPublish}><Send size={13}/> Publish</SmallButton>}</div></div>
  </article>;
}
function GalleryCard({ image, onPublish, onArchive, onDelete }: { image: GalleryImage; onPublish: () => void; onArchive: () => void; onDelete: () => void }) {
  return <article className="overflow-hidden rounded-xl border border-slate-200">
    <img src={image.url} alt={image.altText} className="h-40 w-full object-cover"/>
    <div className="p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-slate-900">{image.caption || image.altText}</p><p className="mt-1 text-xs text-slate-500">{image.category?.name ?? "Uncategorised"}</p></div><Status status={image.status}/></div>
    <div className="mt-3 flex flex-wrap gap-2">{image.status !== "PUBLISHED" && <SmallButton onClick={onPublish}><CheckCircle2 size={13}/> Publish</SmallButton>}{image.status === "PUBLISHED" && <SmallButton onClick={onArchive}>Archive</SmallButton>}<SmallButton onClick={onDelete} danger><Trash2 size={13}/> Delete</SmallButton></div></div>
  </article>;
}
function ResourceRow({ resource, onPublish, onArchive, onDelete, onReplace, onEdit }: { resource: Resource; onPublish: () => void; onArchive: () => void; onDelete: () => void; onReplace: (file: File) => void; onEdit: () => void }) {
  return <article className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#F4DCD6] text-[#8B1E5A]"><FileText size={19}/></span><div className="min-w-0"><p className="font-semibold text-slate-900">{resource.title}</p><p className="mt-1 truncate text-xs text-slate-500">{resource.slug} · {(resource.fileBytes / (1024 * 1024)).toFixed(1)} MB</p><div className="mt-2 flex items-center gap-2"><Status status={resource.status}/><a className="text-xs font-semibold text-[#1D4ED8] hover:underline" href={resource.fileUrl} target="_blank" rel="noreferrer">Preview PDF</a></div></div></div>
    <div className="flex flex-wrap gap-2"><SmallButton onClick={onEdit}><Pencil size={13}/> Edit details</SmallButton><label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><UploadCloud size={13}/> Replace PDF<input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) onReplace(file); event.currentTarget.value = ""; }}/></label>{resource.status !== "PUBLISHED" && <SmallButton onClick={onPublish}><CheckCircle2 size={13}/> Publish</SmallButton>}{resource.status === "PUBLISHED" && <SmallButton onClick={onArchive}>Archive</SmallButton>}<SmallButton onClick={onDelete} danger><Trash2 size={13}/> Delete</SmallButton></div>
  </article>;
}
function Status({ status }: { status: string }) {
  const styles = status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : status === "ARCHIVED" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700";
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles}`}>{status}</span>;
}
function SmallButton({ children, onClick, danger = false }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold ${danger ? "border-red-200 text-red-700 hover:bg-red-50" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{children}</button>;
}
