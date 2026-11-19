import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { registrationApi } from "../../lib/registrationApi";
import { ImagePlus, X, FileVideo, ChevronDown, ChevronUp, Send, Save } from "lucide-react";

type Status = "NEW" | "UNDER_REVIEW" | "RESPONDED" | "ACCEPTED" | "DECLINED" | "CLOSED";
type Media = { url: string; mimeType?: string | null; originalName?: string | null; bytes?: number };
type Quote = { id: string; version: number; status: string; currency: string; totalAmount: number | string; message?: string | null; terms?: string | null; expiresAt?: string | null; items: Array<{ name: string; quantity: number; unitPrice: number | string; lineTotal: number | string }>; media: Media[] };
type Enquiry = {
  id: string; publicReference: string; customerName: string; customerEmail: string; customerWhatsApp: string;
  product?: { id: string; name: string; slug: string } | null; requestedQuantity?: number | null;
  designDescription: string; status: Status; adminNotes?: string | null; responseMessage?: string | null;
  media: Media[]; quotes: Quote[]; createdAt: string; updatedAt: string;
};
type Page = { items: Enquiry[]; pagination: { page: number; limit: number; total: number } };
type Envelope<T> = { success: boolean; data: T; message?: string };
const statuses: Status[] = ["NEW", "UNDER_REVIEW", "RESPONDED", "ACCEPTED", "DECLINED", "CLOSED"];
const field = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8B1E5A]";
const btn = "rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50";
const unwrap = <T,>(p: Promise<{data: Envelope<T>}>) => p.then(r => r.data.data);
const list = async (status: string, page: number) => unwrap(registrationApi.get<Envelope<Page>>("/souvenirs/admin/enquiries", { params: { page, limit: 10, ...(status ? {status} : {})} }));
const update = async (id: string, payload: Partial<Pick<Enquiry, "status" | "adminNotes" | "responseMessage">>) => unwrap(registrationApi.patch<Envelope<Enquiry>>(`/souvenirs/admin/enquiries/${encodeURIComponent(id)}`, payload));
const createQuote = async (id: string, payload: {currency: string; message: string; terms: string; items: Array<{name: string; quantity: number; unitPrice: number}>}) => unwrap(registrationApi.post<Envelope<Quote>>(`/souvenirs/admin/enquiries/${encodeURIComponent(id)}/quotes`, payload));
const attachQuoteMedia = async (id: string, quoteId: string, files: File[]) => {
  const form = new FormData(); files.forEach(file => form.append("media", file));
  return unwrap(registrationApi.post<Envelope<Quote>>(`/souvenirs/admin/enquiries/${encodeURIComponent(id)}/quotes/${encodeURIComponent(quoteId)}/media`, form));
};
const sendQuote = async (id: string, quoteId: string) => unwrap(registrationApi.post<Envelope<Quote>>(`/souvenirs/admin/enquiries/${encodeURIComponent(id)}/quotes/${encodeURIComponent(quoteId)}/send`, {}));
const money = (value: number | string, currency = "NGN") => new Intl.NumberFormat("en-NG", {style:"currency", currency, maximumFractionDigits:2}).format(Number(value));
const messageOf = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as {response?:{data?:{message?:string}}}).response?.data;
    if (data?.message) return data.message;
  }
  return error instanceof Error ? error.message : "The request failed.";
};

export default function AdminSouvenirEnquiries() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [preview, setPreview] = useState<Media | null>(null);
  const [notes, setNotes] = useState<Record<string,string>>({});
  const [response, setResponse] = useState<Record<string,string>>({});
  const [quoteName, setQuoteName] = useState<Record<string,string>>({});
  const [quoteQuantity, setQuoteQuantity] = useState<Record<string,string>>({});
  const [quotePrice, setQuotePrice] = useState<Record<string,string>>({});
  const [quoteMessage, setQuoteMessage] = useState<Record<string,string>>({});
  const [quoteTerms, setQuoteTerms] = useState<Record<string,string>>({});
  const [quoteFiles, setQuoteFiles] = useState<Record<string,File[]>>({});
  const [draftQuoteId, setDraftQuoteId] = useState<Record<string,string>>({});
  const query = useQuery({queryKey:["admin","souvenir-enquiries",status,page], queryFn:()=>list(status,page)});
  const invalidate = async () => { await qc.invalidateQueries({queryKey:["admin","souvenir-enquiries"]}); };
  const save = useMutation({mutationFn:({id,payload}:{id:string;payload:Partial<Pick<Enquiry,"status"|"adminNotes"|"responseMessage">>})=>update(id,payload),onSuccess:invalidate});
  const draft = useMutation({mutationFn:({id,payload}:{id:string;payload:{currency:string;message:string;terms:string;items:Array<{name:string;quantity:number;unitPrice:number}>}})=>createQuote(id,payload),onSuccess:async(q,{id})=>{setDraftQuoteId(v=>({...v,[id]:q.id}));await invalidate();}});
  const upload = useMutation({mutationFn:({id,quoteId,files}:{id:string;quoteId:string;files:File[]})=>attachQuoteMedia(id,quoteId,files),onSuccess:invalidate});
  const send = useMutation({mutationFn:({id,quoteId}:{id:string;quoteId:string})=>sendQuote(id,quoteId),onSuccess:invalidate});
  const enquiries = query.data?.items ?? [];
  const totalPages = Math.max(1,Math.ceil((query.data?.pagination.total ?? 0)/(query.data?.pagination.limit ?? 10)));
  return <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900">Customer design enquiries</h2><p className="mt-1 text-sm text-slate-500">Review customer briefs and reference uploads, record internal notes, and prepare quotations.</p></div>
      <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className={field+" mt-0 w-auto"}><option value="">All statuses</option>{statuses.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select>
    </div>
    {query.isLoading ? <p className="py-8 text-sm text-slate-500">Loading enquiries…</p> : query.isError ? <p role="alert" className="py-8 text-sm text-red-700">{messageOf(query.error)}</p> : !enquiries.length ? <p className="py-8 text-sm text-slate-500">No enquiries match this filter.</p> : <div className="mt-4 space-y-3">
      {enquiries.map(item=><article key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
        <button type="button" className="flex w-full flex-wrap items-center justify-between gap-3 text-left" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
          <span className="min-w-0"><span className="block font-semibold text-slate-900">{item.customerName} · {item.publicReference}</span><span className="mt-1 block text-xs text-slate-500">{item.product?.name ?? "Custom package"} · {item.requestedQuantity ? `${item.requestedQuantity} units` : "Quantity not specified"} · {new Date(item.createdAt).toLocaleString()}</span></span>
          <span className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.status.replaceAll("_"," ")}</span>{expanded===item.id?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</span>
        </button>
        {expanded===item.id && <EnquiryReview item={item} notes={notes[item.id] ?? item.adminNotes ?? ""} setNotes={v=>setNotes(p=>({...p,[item.id]:v}))} response={response[item.id] ?? item.responseMessage ?? ""} setResponse={v=>setResponse(p=>({...p,[item.id]:v}))} quoteName={quoteName[item.id] ?? item.product?.name ?? "Custom souvenir"} setQuoteName={v=>setQuoteName(p=>({...p,[item.id]:v}))} quantity={quoteQuantity[item.id] ?? String(item.requestedQuantity ?? 1)} setQuantity={v=>setQuoteQuantity(p=>({...p,[item.id]:v}))} price={quotePrice[item.id] ?? ""} setPrice={v=>setQuotePrice(p=>({...p,[item.id]:v}))} quoteMessage={quoteMessage[item.id] ?? ""} setQuoteMessage={v=>setQuoteMessage(p=>({...p,[item.id]:v}))} terms={quoteTerms[item.id] ?? ""} setTerms={v=>setQuoteTerms(p=>({...p,[item.id]:v}))} files={quoteFiles[item.id] ?? []} setFiles={v=>setQuoteFiles(p=>({...p,[item.id]:v}))} draftId={draftQuoteId[item.id]} onPreview={setPreview} onSave={()=>save.mutate({id:item.id,payload:{adminNotes:(notes[item.id] ?? item.adminNotes ?? "").trim() || null,responseMessage:(response[item.id] ?? item.responseMessage ?? "").trim() || null,status:item.status==="NEW"?"UNDER_REVIEW":item.status}})} onStatus={next=>save.mutate({id:item.id,payload:{status:next}})} onDraft={()=>draft.mutate({id:item.id,payload:{currency:"NGN",message:quoteMessage[item.id] ?? "",terms:quoteTerms[item.id] ?? "",items:[{name:quoteName[item.id] ?? item.product?.name ?? "Custom souvenir",quantity:Number(quoteQuantity[item.id] ?? item.requestedQuantity ?? 1),unitPrice:Number(quotePrice[item.id])}]}})} onUpload={()=>upload.mutate({id:item.id,quoteId:draftQuoteId[item.id]!,files:quoteFiles[item.id] ?? []},{onSuccess:()=>setQuoteFiles(p=>({...p,[item.id]:[]}))})} onSend={quoteId=>send.mutate({id:item.id,quoteId})} pending={save.isPending||draft.isPending||upload.isPending||send.isPending} error={[save.error,draft.error,upload.error,send.error].find(Boolean)} />
        }
      </article>)}
    </div>}
    {query.data && <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{query.data.pagination.total} enquiries · Page {page} of {totalPages}</span><div className="flex gap-2"><button className={btn+" border border-slate-200"} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><button className={btn+" border border-slate-200"} disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button></div></div>}
    {preview && <div role="dialog" aria-modal="true" aria-label="Customer reference preview" onClick={()=>setPreview(null)} className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 p-4"><button type="button" aria-label="Close preview" onClick={()=>setPreview(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"><X/></button>{preview.mimeType?.startsWith("video/")?<video src={preview.url} controls autoPlay className="max-h-[88vh] max-w-full"/>:<img src={preview.url} alt={preview.originalName ?? "Customer reference"} className="max-h-[88vh] max-w-full rounded-xl object-contain"/>}</div>}
  </section>;
}

function EnquiryReview({item,notes,setNotes,response,setResponse,quoteName,setQuoteName,quantity,setQuantity,price,setPrice,quoteMessage,setQuoteMessage,terms,setTerms,files,setFiles,draftId,onPreview,onSave,onStatus,onDraft,onUpload,onSend,pending,error}:{
 item:Enquiry;notes:string;setNotes:(v:string)=>void;response:string;setResponse:(v:string)=>void;quoteName:string;setQuoteName:(v:string)=>void;quantity:string;setQuantity:(v:string)=>void;price:string;setPrice:(v:string)=>void;quoteMessage:string;setQuoteMessage:(v:string)=>void;terms:string;setTerms:(v:string)=>void;files:File[];setFiles:(v:File[])=>void;draftId?:string;onPreview:(v:Media)=>void;onSave:()=>void;onStatus:(v:Status)=>void;onDraft:()=>void;onUpload:()=>void;onSend:(id:string)=>void;pending:boolean;error:unknown;
}) {
 const [quoteExpanded,setQuoteExpanded]=useState(true);
 return <div className="mt-4 space-y-5 border-t border-slate-100 pt-4">
  <div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-sm font-semibold">{item.customerName}</p><a className="text-sm text-[#8B1E5A] underline" href={`mailto:${item.customerEmail}`}>{item.customerEmail}</a><p className="text-sm text-slate-600">{item.customerWhatsApp}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request details</p><p className="mt-1 text-sm">{item.product?.name ?? "Custom souvenir"}</p><p className="text-sm text-slate-600">Quantity: {item.requestedQuantity ?? "Not specified"}</p><p className="text-xs text-slate-500">Submitted {new Date(item.createdAt).toLocaleString()}</p></div></div>
  <div><h3 className="text-sm font-bold">Design brief</h3><p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item.designDescription}</p></div>
  <div><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Customer reference uploads ({item.media.length})</h3><span className="text-xs text-slate-500">Select to preview</span></div>{item.media.length?<div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{item.media.map((media,i)=><button key={media.url+i} type="button" onClick={()=>onPreview(media)} className="overflow-hidden rounded-xl border border-slate-200 text-left">{media.mimeType?.startsWith("video/")?<span className="flex h-28 items-center justify-center bg-slate-100"><FileVideo size={28}/></span>:<img src={media.url} alt={media.originalName??"Reference upload"} className="h-28 w-full object-cover"/>}<span className="block truncate px-2 py-1.5 text-xs text-slate-600">{media.originalName??"Reference file"}</span></button>)}</div>:<p className="mt-2 text-sm text-slate-500">No reference files were uploaded.</p>}</div>
  <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Internal notes<textarea className={field} rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Visible to admins only"/></label><label className="text-sm font-semibold">Customer response message<textarea className={field} rows={3} value={response} onChange={e=>setResponse(e.target.value)} placeholder="Optional message for the customer"/></label></div>
  <div className="flex flex-wrap gap-2"><button type="button" disabled={pending} onClick={onSave} className={btn+" inline-flex items-center gap-2 bg-[#8B1E5A] text-white"}><Save size={14}/>Save review notes</button><select value={item.status} onChange={e=>onStatus(e.target.value as Status)} className={field+" mt-0 w-auto"}>{statuses.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></div>
  <div className="rounded-xl border border-slate-200 p-3"><button type="button" onClick={()=>setQuoteExpanded(v=>!v)} className="flex w-full items-center justify-between text-left"><span className="font-bold text-sm">Quotation history ({item.quotes.length})</span>{quoteExpanded?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>
  {quoteExpanded&&<div className="mt-3 space-y-3">{item.quotes.map(q=><div key={q.id} className="rounded-lg bg-slate-50 p-3"><div className="flex justify-between gap-2"><strong className="text-sm">Quote v{q.version}</strong><span className="text-xs font-semibold">{q.status}</span></div><p className="mt-1 text-sm">{money(q.totalAmount,q.currency)}</p><ul className="mt-2 list-disc pl-5 text-xs text-slate-600">{q.items.map((line,i)=><li key={line.name+i}>{line.name} · {line.quantity} × {money(line.unitPrice,q.currency)}</li>)}</ul>{q.media.length>0&&<div className="mt-2 flex flex-wrap gap-2">{q.media.map((m,i)=><button key={m.url+i} type="button" onClick={()=>onPreview(m)} className="text-xs text-[#8B1E5A] underline">{m.originalName??"Quote attachment"}</button>)}</div>}{q.status==="DRAFT"&&<button type="button" disabled={pending} onClick={()=>onSend(q.id)} className={btn+" mt-2 bg-[#8B1E5A] text-white"}><Send size={13} className="inline"/> Publish quote</button>}</div>)}
  {["NEW","UNDER_REVIEW","RESPONDED"].includes(item.status)&&<div className="border-t border-slate-200 pt-3"><h4 className="text-sm font-bold">Create quotation</h4><div className="mt-2 grid gap-2 sm:grid-cols-3"><input className={field} value={quoteName} onChange={e=>setQuoteName(e.target.value)} placeholder="Line item"/><input className={field} type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="Quantity"/><input className={field} type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Unit price (NGN)"/></div><textarea className={field} rows={2} value={quoteMessage} onChange={e=>setQuoteMessage(e.target.value)} placeholder="Message to customer"/><textarea className={field} rows={2} value={terms} onChange={e=>setTerms(e.target.value)} placeholder="Quotation terms"/><button type="button" disabled={pending||!quoteName.trim()||Number(quantity)<1||Number(price)<=0} onClick={onDraft} className={btn+" mt-2 bg-[#8B1E5A] text-white"}>Create quote draft</button>{draftId&&<div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3"><p className="text-xs font-semibold">Attach design/proof files to the new draft</p><input className="mt-2 block w-full text-xs" type="file" multiple accept="image/*,video/*" onChange={e=>setFiles(Array.from(e.target.files??[]))}/><button type="button" disabled={pending||!files.length} onClick={onUpload} className={btn+" mt-2 border border-slate-300"}><ImagePlus size={13} className="inline"/>Upload attachments</button></div>}</div>}</div>}
  {error&&<p role="alert" className="text-sm text-red-700">{messageOf(error)}</p>}
 </div>;
}
