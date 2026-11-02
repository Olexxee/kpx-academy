import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Eye, EyeOff, Trash2, Star, X } from "lucide-react";
import { getAdminSouvenirProducts, createAdminSouvenirProduct, updateAdminSouvenirProduct, setAdminSouvenirProductActive, createAdminSouvenirPriceTier, updateAdminSouvenirPriceTier, setAdminSouvenirPriceTierActive, uploadAdminSouvenirProductMedia, updateAdminSouvenirProductMedia, deleteAdminSouvenirProductMedia, deleteAdminSouvenirProduct, archiveAdminSouvenirProduct, restoreAdminSouvenirProduct } from "../../features/souvenirs/api";
import type { SouvenirProduct } from "../../features/souvenirs/types";

const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1D4ED8]";
const label = "block text-sm font-semibold text-slate-700";
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminSouvenirsPage() {
  const client = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; altText: string } | null>(null);
  const products = useQuery({ queryKey: ["souvenirs", "admin"], queryFn: getAdminSouvenirProducts });
  const save = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => payload.id ? updateAdminSouvenirProduct(payload.id, payload.data) : createAdminSouvenirProduct(payload.data),
    onSuccess: async () => { setNotice("Souvenir package saved."); setEditing(null); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminSouvenirProductActive(id, active),
    onSuccess: async () => { setNotice("Catalogue visibility updated."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const createTier = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { label: string; minQuantity: number; maxQuantity: number | null; unitPrice: number; currency: string; displayOrder: number } }) => createAdminSouvenirPriceTier(productId, data),
    onSuccess: async () => { setNotice("Price tier saved and activated."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const updateTier = useMutation({ mutationFn: ({ id, data }: { id: string; data: { unitPrice: number } }) => updateAdminSouvenirPriceTier(id, data), onSuccess: async () => { setNotice("Per-piece rate saved."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); } });
  const toggleTier = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminSouvenirPriceTierActive(id, active),
    onSuccess: async () => { setNotice("Price tier status updated."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const uploadMedia = useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) => uploadAdminSouvenirProductMedia(productId, files),
    onSuccess: async () => { setNotice("Reference images uploaded."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const setPrimaryMedia = useMutation({
    mutationFn: (mediaId: string) => updateAdminSouvenirProductMedia(mediaId, { isPrimary: true }),
    onSuccess: async () => { setNotice("Primary package image updated."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const deleteMedia = useMutation({
    mutationFn: (mediaId: string) => deleteAdminSouvenirProductMedia(mediaId),
    onSuccess: async (result) => { setNotice(result.promotedMediaId ? "Image deleted and another image promoted to primary." : "Image deleted."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const deleteProduct = useMutation({
    mutationFn: (productId: string) => deleteAdminSouvenirProduct(productId),
    onSuccess: async () => { setNotice("Souvenir package permanently deleted."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const archiveProduct = useMutation({
    mutationFn: (productId: string) => archiveAdminSouvenirProduct(productId),
    onSuccess: async () => { setNotice("Package archived and removed from the public catalogue."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const restoreProduct = useMutation({
    mutationFn: (productId: string) => restoreAdminSouvenirProduct(productId),
    onSuccess: async () => { setNotice("Package restored as a draft. Publish it when ready."); await client.invalidateQueries({ queryKey: ["souvenirs"] }); },
  });
  const startEdit = (product: SouvenirProduct) => {
    setEditing(product.id);
    const form = document.querySelector<HTMLFormElement>("#souvenir-product-form");
    if (!form) return;
    const values: Record<string, string> = { name: product.name, slug: product.slug, description: product.description ?? "", bookingTerms: product.bookingTerms ?? "", productionLeadTimeDays: product.productionLeadTimeDays == null ? "" : String(product.productionLeadTimeDays), displayOrder: String(product.displayOrder ?? 0), featured: String(product.featured) };
    Object.entries(values).forEach(([name, value]) => { const el = form.elements.namedItem(name); if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = value; });
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    save.mutate({ ...(editing ? { id: editing } : {}), data: { name, slug: String(form.get("slug") || slugify(name)), description: String(form.get("description") || ""), bookingTerms: String(form.get("bookingTerms") || ""), productionLeadTimeDays: String(form.get("productionLeadTimeDays") || "") ? Number(form.get("productionLeadTimeDays")) : null, displayOrder: Number(form.get("displayOrder") || 0), featured: form.get("featured") === "on" } });
    event.currentTarget.reset();
  };
  return <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-7 xl:px-8">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8B1E5A]">Catalogue management</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-900">Souvenir packages</h1>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Create and maintain ready-made souvenir packages shown on the public catalogue. Product images and quantity pricing are managed here. Customers choose their colours directly from the fixed palette when placing an order.</p>
    {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {save.isError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{save.error instanceof Error ? save.error.message : "Could not save package."}</p>}
    <div className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]">
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Catalogue inventory</h2><span className="text-sm text-slate-500">{products.data?.length ?? 0} packages</span></div>
        {products.isLoading ? <p className="py-8 text-sm text-slate-500">Loading packages…</p> : products.isError ? <p role="alert" className="py-8 text-sm text-red-700">Could not load souvenir packages. Refresh and try again.</p> : <div className="mt-4 divide-y divide-slate-100">
          {(products.data ?? []).map((product) => <article key={product.id} className="space-y-4 rounded-2xl border border-slate-100 p-3 sm:p-4">
            <div className="flex min-w-0 items-start gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">{(product.media?.find((item) => item.isPrimary) ?? product.media?.[0])?.url && <img src={(product.media.find((item) => item.isPrimary) ?? product.media[0]).url} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{product.name}</h3><span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.archivedAt ? "bg-amber-50 text-amber-800" : product.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{product.archivedAt ? "Archived" : product.active ? "Published" : "Draft"}</span></div><p className="mt-1 truncate text-xs text-slate-500">/{product.slug} · {product.priceTiers?.length ?? 0} price tiers</p><div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
<button type="button" onClick={() => startEdit(product)} className="text-[#1D4ED8] hover:underline">Edit details</button>
{product.archivedAt ? <button type="button" disabled={restoreProduct.isPending} onClick={() => restoreProduct.mutate(product.id)} className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 disabled:opacity-50"><Eye size={13}/> Restore draft</button> : <>
<button type="button" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: product.id, active: !product.active })} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900">{product.active ? <EyeOff size={13}/> : <Eye size={13}/>} {product.active ? "Hide from catalogue" : "Publish"}</button>
<button type="button" disabled={archiveProduct.isPending} onClick={() => { if (window.confirm(`Archive "${product.name}"? It will be removed from the public catalogue but its records and order history will be preserved.`)) archiveProduct.mutate(product.id); }} className="text-amber-800 hover:text-amber-950 disabled:opacity-50">Archive</button>
</>}
<button type="button" disabled={deleteProduct.isPending || !product.archivedAt} title={!product.archivedAt ? "Archive this package before permanent deletion" : "Permanently delete this package"} onClick={() => { if (window.confirm(`Permanently delete "${product.name}"? This is blocked when order history exists. This action also removes its Cloudinary reference images.`)) deleteProduct.mutate(product.id); }} className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 disabled:opacity-50"><Trash2 size={13}/> Delete</button>
</div></div>
            </div>
            <div className="border-t border-slate-100 bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Package reference images</p>
              <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(product.media ?? []).map((image) => <div key={image.id} className="min-w-0 rounded-xl border border-slate-200 p-2">
                  <button type="button" onClick={() => setPreviewImage({ url: image.url, altText: image.altText || product.name })} className="block w-full overflow-hidden rounded-lg bg-slate-100" aria-label={`Preview ${image.altText || product.name}`}>
                    <img src={image.url} alt={image.altText || product.name} className="h-28 w-full object-cover" />
                  </button>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">{image.isPrimary ? "Primary image" : "Reference image"}</span>
                    <div className="flex gap-2">
                      {!image.isPrimary && <button type="button" title="Set as primary" aria-label="Set as primary" disabled={setPrimaryMedia.isPending} onClick={() => setPrimaryMedia.mutate(image.id)} className="text-xs font-semibold text-[#1D4ED8] disabled:opacity-50"><Star size={14}/></button>}
                      <button type="button" title="Delete image" aria-label="Delete image" disabled={deleteMedia.isPending} onClick={() => { if (window.confirm("Delete this reference image?")) deleteMedia.mutate(image.id); }} className="text-xs font-semibold text-red-700 disabled:opacity-50"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>)}
              </div>
              {(setPrimaryMedia.isError || deleteMedia.isError || deleteProduct.isError || archiveProduct.isError || restoreProduct.isError) && <p role="alert" className="mb-2 text-xs text-red-700">{(setPrimaryMedia.error ?? deleteMedia.error ?? deleteProduct.error ?? archiveProduct.error ?? restoreProduct.error)?.message || "Could not update package media."}</p>}
              <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const picker = form.elements.namedItem("media") as HTMLInputElement;
                const files = Array.from(picker.files ?? []);
                if (!files.length) return;
                uploadMedia.mutate({ productId: product.id, files }, { onSuccess: () => { form.reset(); } });
              }}>
                <input name="media" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required className="min-w-0 flex-1 text-xs" />
                <button type="submit" disabled={uploadMedia.isPending} className="rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{uploadMedia.isPending ? "Uploading…" : "Upload images"}</button>
              </form>
              {uploadMedia.isError && <p role="alert" className="mt-2 text-xs text-red-700">{uploadMedia.error instanceof Error ? uploadMedia.error.message : "Could not upload images."}</p>}
              <p className="mt-2 text-xs text-slate-500">Images guide customers; they do not select an image as a product option.</p>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/70 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Volume-based per-piece pricing</p>
              {(product.priceTiers ?? []).map((tier) => <div key={tier.id} className="border-b border-slate-200 py-3 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><p className="text-sm font-medium text-slate-800">{tier.label} · {tier.minQuantity}{tier.maxQuantity == null ? "+" : "–" + tier.maxQuantity} units</p><p className="text-xs text-slate-500">{tier.unitPrice == null ? "Needs per-piece rate" : `${tier.currency} ${Number(tier.unitPrice).toLocaleString()} per piece`} · {tier.active === false ? "Inactive" : "Active"}</p></div>
                  <button type="button" disabled={toggleTier.isPending || tier.unitPrice == null} onClick={() => toggleTier.mutate({ id: tier.id, active: tier.active === false })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-50">{tier.active === false ? "Activate" : "Deactivate"}</button></div>
                <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); updateTier.mutate({ id: tier.id, data: { unitPrice: Number(form.get("unitPrice")) } }); }}>
                  <input name="unitPrice" aria-label="Unit price per piece" required type="number" min="0.01" step="0.01" defaultValue={tier.unitPrice ?? ""} placeholder="Unit price per piece (NGN)" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1D4ED8]"/>
                  <button type="submit" disabled={updateTier.isPending} className="rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">Save rate</button>
                </form>
              </div>)}
              <form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                createTier.mutate({ productId: product.id, data: {
                  label: String(form.get("tierLabel") || "").trim(),
                  minQuantity: Number(form.get("minQuantity")),
                  maxQuantity: String(form.get("maxQuantity") || "").trim() ? Number(form.get("maxQuantity")) : null,
                  unitPrice: Number(form.get("unitPrice")),
                  currency: String(form.get("currency") || "NGN"),
                  displayOrder: (product.priceTiers ?? []).length,
                }});
                event.currentTarget.reset();
              }}>
                <input name="tierLabel" required minLength={2} placeholder="Tier label (e.g. 50–99 units)" className={field}/>
                <input name="minQuantity" required type="number" min="1" placeholder="Minimum quantity" className={field}/>
                <input name="maxQuantity" type="number" min="1" placeholder="Maximum quantity (optional)" className={field}/>
                <input name="unitPrice" required type="number" min="0.01" step="0.01" placeholder="Unit price per piece (NGN)" className={field}/>
                <input type="hidden" name="currency" value="NGN" />
                <button type="submit" disabled={createTier.isPending} className="rounded-xl bg-[#1D4ED8] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{createTier.isPending ? "Saving tier…" : "Add active tier"}</button>
              </form>
              {(createTier.isError || toggleTier.isError || updateTier.isError) && <p role="alert" className="mt-2 text-xs text-red-700">{(createTier.error ?? toggleTier.error ?? updateTier.error)?.message || "Could not update pricing."}</p>}
            </div>
          </article>)}
          {!products.data?.length && <p className="py-8 text-sm text-slate-500">No souvenir packages yet. Create the first one.</p>}
        </div>}
      </section>
      <form id="souvenir-product-form" onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit package details" : "Create package"}</h2>{editing && <button type="button" className="text-sm font-semibold text-slate-500" onClick={() => { setEditing(null); document.querySelector<HTMLFormElement>("#souvenir-product-form")?.reset(); }}>Cancel edit</button>}</div>
        <div><label className={label}>Package name</label><input required minLength={2} name="name" className={field} onChange={(event) => { const form = event.currentTarget.form; const slug = form?.elements.namedItem("slug"); if (!editing && slug instanceof HTMLInputElement) slug.value = slugify(event.currentTarget.value); }} /></div>
        <div><label className={label}>URL slug</label><input required name="slug" minLength={2} className={field} placeholder="custom-branded-mugs" /></div>
        <div><label className={label}>Description</label><textarea name="description" rows={4} className={field} /></div>
        <div><label className={label}>Booking terms</label><textarea name="bookingTerms" rows={3} className={field} placeholder="Minimum order, proof approval, delivery notes…" /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className={label}>Production lead time (days)</label><input name="productionLeadTimeDays" type="number" min="0" max="365" className={field} /></div><div><label className={label}>Display order</label><input name="displayOrder" type="number" min="0" defaultValue="0" className={field} /></div></div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" name="featured" /> Feature this package</label>
        <button disabled={save.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"><Plus size={16} className="hidden" /><Save size={16}/>{save.isPending ? "Saving…" : editing ? "Save changes" : "Create package"}</button>
        <p className="text-xs leading-5 text-slate-500">This editor manages package details, reference image uploads, catalogue visibility, and volume-based per-piece pricing. Customers choose their preferred colours during checkout. Reference images are visual guides for customers; customers choose colours separately when placing an order.</p>
      </form>
    </div>
    {previewImage && <div role="dialog" aria-modal="true" aria-label="Image preview" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4" onClick={() => setPreviewImage(null)}>
      <button type="button" onClick={() => setPreviewImage(null)} aria-label="Close image preview" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X size={22}/></button>
      <img src={previewImage.url} alt={previewImage.altText} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"/>
    </div>}
  </div>;
}