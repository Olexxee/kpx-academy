import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { createSouvenirEnquiry, getSouvenirProducts } from "../api";
import type { SouvenirEnquiryResult } from "../types";

export const SouvenirEnquiryPage = () => {
  const [params] = useSearchParams();
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [whatsApp,setWhatsApp] = useState("");
  const [productId,setProductId] = useState("");
  const [quantity,setQuantity] = useState("");
  const [description,setDescription] = useState("");
  const [files,setFiles] = useState<File[]>([]);
  const [result,setResult] = useState<SouvenirEnquiryResult|null>(null);
  const productsQuery = useQuery({queryKey:["souvenirs","catalogue"],queryFn:getSouvenirProducts,staleTime:300000});
  const mutation = useMutation({mutationFn:createSouvenirEnquiry,onSuccess:setResult});

  if (result) return <section className="py-16 sm:py-24"><Container><div className="mx-auto max-w-2xl rounded-card border border-border bg-white p-7 sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Enquiry received</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary">Your custom request is in.</h1><p className="mt-4 leading-7 text-text-muted">We have recorded your enquiry. Keep the reference below and use the private link to review our response and any quotation.</p><div className="mt-6 rounded-control bg-background p-4"><p className="text-xs text-text-muted">Enquiry reference</p><p className="mt-1 font-heading text-lg font-bold text-primary">{result.enquiry.publicReference}</p><p className="mt-2 text-sm text-text-muted">Reference files: {result.enquiry.mediaCount}</p></div><Link to={`/souvenirs/enquiries/access/${result.accessToken}`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-control bg-secondary px-6 py-3 font-semibold text-white hover:bg-primary">Open secure enquiry page</Link><p className="mt-4 text-xs leading-6 text-text-muted">Save this private link somewhere secure. It grants access to your enquiry and quotation.</p></div></Container></section>;

  return <div className="min-h-screen bg-background">
    <section className="bg-primary py-14 text-white sm:py-20"><Container><p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">KPX Academy · Bespoke souvenirs</p><h1 className="mt-4 max-w-3xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">Tell us what you have in mind.</h1><p className="mt-5 max-w-2xl leading-8 text-white/80">Share your event details, preferred quantity, design ideas, and reference files. We will prepare a response through your private enquiry page.</p></Container></section>
    <section className="py-12 sm:py-16"><Container><div className="mx-auto max-w-3xl">
      <div className="mb-7"><Link to="/souvenirs" className="text-sm font-semibold text-secondary hover:text-primary">← Back to souvenir catalogue</Link></div>
      <form onSubmit={(event)=>{event.preventDefault();mutation.mutate({customerName:name,customerEmail:email,customerWhatsApp:whatsApp,productId:productId||productsQuery.data?.find((product)=>product.slug===params.get("product"))?.id,requestedQuantity:quantity?Number(quantity):undefined,designDescription:description,media:files});}} className="rounded-card border border-border bg-white p-6 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Custom request</p><h2 className="mt-3 font-heading text-2xl font-bold text-primary sm:text-3xl">Enquiry details</h2>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-text">Full name</span><input value={name} onChange={(e)=>setName(e.target.value)} autoComplete="name" required minLength={2} maxLength={100} className="min-h-12 w-full rounded-control border border-border px-3 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"/></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-text">Email address</span><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required maxLength={254} className="min-h-12 w-full rounded-control border border-border px-3 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"/></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-text">WhatsApp number</span><input type="tel" value={whatsApp} onChange={(e)=>setWhatsApp(e.target.value)} autoComplete="tel" required minLength={7} maxLength={30} pattern="\+?[0-9 ()-]+" className="min-h-12 w-full rounded-control border border-border px-3 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"/></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-text">Related package <span className="font-normal text-text-muted">(optional)</span></span><select value={productId || productsQuery.data?.find((product)=>product.slug===params.get("product"))?.id || ""} onChange={(e)=>setProductId(e.target.value)} className="min-h-12 w-full rounded-control border border-border bg-white px-3 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"><option value="">I have a custom idea</option>{(productsQuery.data??[]).map((product)=> <option key={product.id} value={product.id}>{product.name}</option>)}</select>{productsQuery.isError&&<span className="mt-1 block text-xs text-text-muted">The catalogue could not be loaded; you can still submit a custom request.</span>}</label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-text">Estimated quantity <span className="font-normal text-text-muted">(optional)</span></span><input type="number" min={1} max={100000} value={quantity} onChange={(e)=>setQuantity(e.target.value)} className="min-h-12 w-full rounded-control border border-border px-3"/></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-text">Describe your requirements</span><textarea value={description} onChange={(e)=>setDescription(e.target.value)} required minLength={10} maxLength={5000} rows={6} placeholder="Include the event or occasion, preferred design, branding, colours, deadline, and other requirements." className="w-full rounded-control border border-border px-3 py-3 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"/></label>
          <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-text">Reference files <span className="font-normal text-text-muted">(optional)</span></span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={(e)=>setFiles(Array.from(e.target.files??[]).slice(0,10))} className="block w-full text-sm text-text-muted file:mr-3 file:rounded-control file:border-0 file:bg-[#F4DCD6] file:px-4 file:py-2 file:font-semibold file:text-secondary"/><span className="mt-2 block text-xs leading-5 text-text-muted">{files.length} of 10 files selected. JPEG, PNG, WEBP, GIF, MP4, WEBM, or MOV up to 10 MB each.</span></label>
        </div>
        {mutation.isError&&<p role="alert" className="mt-5 text-sm text-red-700">{mutation.error instanceof Error?mutation.error.message:"We could not submit your enquiry. Please try again."}</p>}
        <button type="submit" disabled={mutation.isPending||files.length>10} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-primary disabled:opacity-50">{mutation.isPending?"Submitting enquiry…":"Submit custom enquiry"}</button>
        <p className="mt-4 text-xs leading-6 text-text-muted">We use your contact details to respond to this request. Submitting an enquiry does not require an account or initiate a payment.</p>
      </form>
    </div></Container></section>
  </div>;
};
