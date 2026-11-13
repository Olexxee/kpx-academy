import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { createSouvenirOrder, getSouvenirProduct } from "../api";
import { SOUVENIR_COLOR_PALETTE, type SouvenirOrderResult, type SouvenirPriceTier, type SouvenirPaletteColor } from "../types";
import { updatePageMetadata } from "../../../lib/seo";
import { getSouvenirMetadata } from "../../../lib/pageMetadata";

const money = (amount: number | string, currency = "NGN") => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Price on request";
  try { return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${value.toLocaleString("en-NG")}`; }
};
const matches = (tier: SouvenirPriceTier, quantity: number) => quantity >= tier.minQuantity && (tier.maxQuantity == null || quantity <= tier.maxQuantity);

export const SouvenirProductPage = () => {
  const { slug = "" } = useParams();
  const { data: product, isLoading, isError, refetch } = useQuery({ queryKey: ["souvenirs", "product", slug], queryFn: () => getSouvenirProduct(slug), enabled: Boolean(slug) });

  useEffect(() => {
    if (isLoading) return;
    if (isError || !product) {
      updatePageMetadata({
        title: "Souvenir Package Not Found | KPX Academy",
        description: "This KPX Academy souvenir package is unavailable. Browse the current souvenir catalogue.",
        canonicalPath: `/souvenirs/${encodeURIComponent(slug)}`,
        robots: "noindex, follow",
      });
      return;
    }
    updatePageMetadata(
      getSouvenirMetadata(product.name, product.description, product.slug),
    );
  }, [isError, isLoading, product, slug]);
  const [quantity, setQuantity] = useState(1);
  const [colors, setColors] = useState<SouvenirPaletteColor[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<SouvenirOrderResult | null>(null);
  const mutation = useMutation({ mutationFn: createSouvenirOrder, onSuccess: setResult });
  const tier = useMemo(() => product?.priceTiers?.find((item) => matches(item, quantity)), [product, quantity]);
  const estimatedTotal = tier ? Number(tier.unitPrice ?? 0) * quantity : null;
  const toggleColor = (color: SouvenirPaletteColor) => setColors((old) => old.some((item) => item.name === color.name) ? old.filter((item) => item.name !== color.name) : old.length < 5 ? [...old, color] : old);

  if (isLoading) return <section className="py-24"><Container><p className="text-text-muted">Loading souvenir package…</p></Container></section>;
  if (isError || !product) return <section className="py-24"><Container><div className="mx-auto max-w-xl text-center"><h1 className="font-heading text-3xl font-bold text-primary">Package unavailable</h1><p className="mt-4 leading-7 text-text-muted">We could not load this souvenir package.</p><button type="button" onClick={()=>void refetch()} className="mt-5 rounded-control bg-secondary px-5 py-3 font-semibold text-white">Try again</button><div><Link to="/souvenirs" className="mt-5 inline-flex text-secondary underline">Back to souvenirs</Link></div></div></Container></section>;

  if (result) return <section className="py-16 sm:py-24"><Container><div className="mx-auto max-w-2xl rounded-card border border-border bg-white p-7 sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Order created</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary">Complete your payment</h1><p className="mt-4 leading-7 text-text-muted">Your order has been recorded. Continue to Paystack to pay securely; the order is marked paid only after the payment is verified.</p><div className="mt-6 rounded-control bg-background p-4"><p className="text-xs text-text-muted">Order reference</p><p className="mt-1 font-heading text-lg font-bold text-primary">{result.order.publicReference}</p><p className="mt-3 text-sm text-text-muted">{result.order.productName} · Quantity {result.order.quantity}</p><p className="mt-1 font-semibold text-primary">{money(result.order.totalPrice,result.order.currency)}</p></div>{result.payment ? <a href={result.payment.authorizationUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-control bg-secondary px-6 py-3 font-semibold text-white hover:bg-primary">Continue to secure payment</a> : <p role="alert" className="mt-6 rounded-control bg-amber-50 p-4 text-sm leading-6 text-amber-900">{result.paymentError || "Secure checkout is temporarily unavailable. Open your private order page to retry."}</p>}<Link to={`/souvenirs/orders/access/${result.accessToken}`} className="mt-3 inline-flex min-h-12 items-center justify-center rounded-control border border-border px-6 py-3 font-semibold text-primary hover:border-secondary">View order status and payment options</Link><p className="mt-4 text-xs leading-6 text-text-muted">Save this private link somewhere secure. It grants access to your order.</p></div></Container></section>;

  const canSubmit = Boolean(tier && colors.length >= 1 && colors.length <= 5);
  return <div className="min-h-screen bg-background">
    <div className="border-b border-border bg-white"><Container><nav aria-label="Breadcrumb" className="flex gap-2 py-4 text-sm text-text-muted"><Link to="/" className="hover:text-secondary">Home</Link><span>/</span><Link to="/souvenirs" className="hover:text-secondary">Souvenirs</Link><span>/</span><span className="font-medium text-primary">{product.name}</span></nav></Container></div>
    <section className="py-10 sm:py-16"><Container><div className="grid items-start gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-14">
      <div><div className="overflow-hidden rounded-card border border-border bg-[#F4DCD6]">{product.media?.length ? <img src={(product.media.find((item)=>item.isPrimary) ?? product.media[0]).url} alt={(product.media.find((item)=>item.isPrimary) ?? product.media[0]).altText || product.name} className="aspect-[4/3] w-full object-cover"/> : <div className="flex aspect-[4/3] items-end bg-primary p-8"><p className="font-heading text-3xl font-bold text-white">{product.name}</p></div>}</div>
        {product.media?.length > 1 && <div className="mt-4 grid grid-cols-4 gap-3">{product.media.slice(0,4).map((item)=><img key={item.id} src={item.url} alt={item.altText || product.name} loading="lazy" className="aspect-square w-full rounded-control border border-border object-cover"/>)}</div>}
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-secondary">Souvenir package</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">{product.name}</h1><p className="mt-4 whitespace-pre-line leading-8 text-text-muted">{product.description || "Contact us to discuss how this package can fit your event."}</p>
        {product.productionLeadTimeDays != null && <p className="mt-5 text-sm text-text-muted">Estimated production lead time: <strong className="text-primary">{product.productionLeadTimeDays} days</strong></p>}
        {product.bookingTerms && <div className="mt-6 rounded-control border border-border bg-white p-4"><h2 className="font-semibold text-primary">Package terms</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{product.bookingTerms}</p></div>}
      </div>
      <form onSubmit={(event)=>{event.preventDefault();if(!canSubmit)return;mutation.mutate({customerName:name,customerEmail:email,customerWhatsApp:whatsApp,productId:product.id,quantity,colorSelections:colors,customerNotes:notes});}} className="rounded-card border border-border bg-white p-5 sm:p-7">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Place an order request</p><h2 className="mt-3 font-heading text-2xl font-bold text-primary">Choose your package</h2><p className="mt-2 text-sm leading-6 text-text-muted">Select a quantity and up to five colours. The per-piece rate decreases at higher quantity tiers.</p>
        <label className="mt-6 block"><span className="mb-2 block text-sm font-semibold text-text">Quantity</span><input type="number" min={1} max={100000} value={quantity} onChange={(event)=>setQuantity(Math.max(1,Number(event.target.value)||1))} required className="min-h-12 w-full rounded-control border border-border px-4 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"/></label>
        <div className="mt-4 rounded-control bg-background p-4">{tier ? <><p className="text-sm text-text-muted">{tier.label}</p><p className="mt-1 font-heading text-2xl font-bold text-primary">{money(tier.unitPrice ?? 0,tier.currency)} <span className="text-base font-medium">per piece</span></p><p className="mt-2 text-sm font-semibold text-primary">Estimated total: {money(estimatedTotal ?? 0,tier.currency)}</p><p className="mt-1 text-xs text-text-muted">Rate applies to quantities {tier.minQuantity}{tier.maxQuantity != null ? `–${tier.maxQuantity}` : "+"}. Final amount is calculated by the server.</p></> : <p className="text-sm font-medium text-secondary">No available package matches this quantity. Change the quantity or request a custom quote.</p>}</div>
        <fieldset className="mt-5"><legend className="text-sm font-semibold text-text">Choose your colours <span className="font-normal text-text-muted">(select 1–5)</span></legend><p className="mt-1 text-xs text-text-muted">{colors.length} of 5 selected. Pick directly from our colour palette.</p><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{SOUVENIR_COLOR_PALETTE.map((color)=><button type="button" key={color.name} onClick={()=>toggleColor(color)} aria-pressed={colors.some((item)=>item.name===color.name)} className={`group flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-control border px-2 py-3 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${colors.some((item)=>item.name===color.name) ? "border-secondary bg-[#F4DCD6]/40 text-primary ring-1 ring-secondary" : "border-border hover:border-secondary"}`}><span className="relative h-9 w-9 rounded-full border border-black/15 shadow-sm" style={{backgroundColor:color.colorHex}}>{colors.some((item)=>item.name===color.name)&&<span className={`absolute inset-0 grid place-items-center text-lg font-bold ${["White","Yellow","Sky Blue","Lime","Pink","Gold"].includes(color.name)?"text-slate-900":"text-white"}`}>✓</span>}</span><span>{color.name}</span></button>)}</div>{colors.length===5&&<p className="mt-2 text-xs font-medium text-secondary">You have selected the maximum of five colours.</p>}<div className="mt-3 flex flex-wrap gap-2">{colors.map((color)=><span key={color.name} className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-primary"><span className="h-3 w-3 rounded-full border border-black/10" style={{backgroundColor:color.colorHex}}/>{color.name}</span>)}</div></fieldset>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold text-text">Full name</span><input value={name} onChange={(e)=>setName(e.target.value)} autoComplete="name" required minLength={2} maxLength={100} className="min-h-12 w-full rounded-control border border-border px-3"/></label><label className="block"><span className="mb-2 block text-sm font-semibold text-text">Email address</span><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required maxLength={254} className="min-h-12 w-full rounded-control border border-border px-3"/></label></div>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-text">WhatsApp number</span><input type="tel" value={whatsApp} onChange={(e)=>setWhatsApp(e.target.value)} autoComplete="tel" required minLength={7} maxLength={30} pattern="\+?[0-9 ()-]+" className="min-h-12 w-full rounded-control border border-border px-3"/></label>
        <label className="mt-4 block"><span className="mb-2 block text-sm font-semibold text-text">Order notes <span className="font-normal text-text-muted">(optional)</span></span><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} maxLength={3000} rows={3} className="w-full rounded-control border border-border px-3 py-3"/></label>
        {mutation.isError&&<p role="alert" className="mt-4 text-sm text-red-700">{mutation.error instanceof Error?mutation.error.message:"We could not submit your request. Please try again."}</p>}
        <button type="submit" disabled={!canSubmit||mutation.isPending} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50">{mutation.isPending?"Preparing secure checkout…":"Continue to secure payment"}</button>
        <p className="mt-3 text-xs leading-5 text-text-muted">You will continue to Paystack to complete payment. Your order status changes to PAID only after server-side verification.</p>
        <div className="mt-6 border-t border-border pt-5"><h3 className="font-heading text-lg font-bold text-primary">Need a custom design?</h3><p className="mt-2 text-sm leading-6 text-text-muted">Send us your design brief and reference files for a tailored quotation.</p><Link to={`/souvenirs/enquire?product=${encodeURIComponent(product.slug)}`} className="mt-4 inline-flex font-semibold text-secondary hover:text-primary">Request a custom quote →</Link></div>
      </form>
    </div></Container></section>
  </div>;
};
