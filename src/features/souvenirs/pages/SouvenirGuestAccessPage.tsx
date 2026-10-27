import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { getGuestSouvenirEnquiry, getGuestSouvenirOrder, respondToSouvenirQuote, verifySouvenirPayment } from "../api";
import type { SouvenirGuestEnquiry, SouvenirGuestOrder } from "../types";

const money = (amount: number | string, currency = "NGN") => {
  const value = Number(amount);
  try { return new Intl.NumberFormat("en-NG", {style:"currency",currency,maximumFractionDigits:2}).format(value); }
  catch { return `${currency} ${value}`; }
};
const niceDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric"}) : null;

export const SouvenirGuestAccessPage = () => {
  const { resource = "", token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const paymentReference = searchParams.get("reference");
  const isEnquiry = resource === "enquiries";
  const valid = isEnquiry || resource === "orders";
  const client = useQueryClient();
  const key = ["souvenirs","guest",resource,token];
  const query = useQuery<SouvenirGuestOrder | SouvenirGuestEnquiry>({
    queryKey: key,
    queryFn: async (): Promise<SouvenirGuestOrder | SouvenirGuestEnquiry> =>
      isEnquiry
        ? getGuestSouvenirEnquiry(token)
        : getGuestSouvenirOrder(token),
    enabled: valid && Boolean(token),
    retry: false,
  });
  const paymentVerification = useQuery({
    queryKey: ["souvenirs", "payment-verification", paymentReference],
    queryFn: async () => {
      const result = await verifySouvenirPayment(paymentReference as string);
      await client.invalidateQueries({ queryKey: key });
      return result;
    },
    enabled: resource === "orders" && Boolean(paymentReference),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn:({quoteId,decision}:{quoteId:string;decision:"ACCEPT"|"DECLINE"})=>respondToSouvenirQuote(token,quoteId,decision),
    onSuccess:()=>client.invalidateQueries({queryKey:key}),
  });

  if (!valid) return <Message title="Private link unavailable" body="This private link is not recognised." />;
  if (query.isLoading) return <section className="py-24"><Container><p className="text-text-muted">Loading your secure page…</p></Container></section>;
  if (query.isError||!query.data) return <Message title="We could not find this request" body="Check that you opened the complete private link." retry={()=>void query.refetch()} />;
  if (!isEnquiry) {
    const order=query.data as SouvenirGuestOrder;
    return <section className="min-h-[65vh] bg-background py-12 sm:py-20"><Container><div className="mx-auto max-w-2xl rounded-card border border-border bg-white p-6 sm:p-10">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Private order page</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary">Souvenir order status</h1>
      <div className="mt-6 rounded-control bg-background p-5"><p className="text-xs text-text-muted">Order reference</p><p className="mt-1 font-heading text-xl font-bold text-primary">{order.publicReference}</p><p className="mt-3 inline-flex rounded-full bg-[#F4DCD6] px-3 py-1 text-sm font-semibold text-secondary">{order.status.replaceAll("_"," ")}</p></div>
      {paymentReference && paymentVerification.isLoading && <p role="status" className="mt-4 text-sm text-text-muted">Verifying your Paystack payment…</p>}
      {paymentReference && paymentVerification.data?.status === "SUCCESS" && <p role="status" className="mt-4 rounded-control bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Payment verified successfully. Your order status is being refreshed.</p>}
      {paymentReference && paymentVerification.isError && <p role="alert" className="mt-4 rounded-control bg-amber-50 p-3 text-sm text-amber-800">We could not verify this payment automatically. Your order is not marked paid unless Paystack confirms it. Refresh this page shortly or contact KPX Academy with your payment reference.</p>}
      <dl className="mt-5 divide-y divide-border">{[["Customer",order.customerName],["Package",order.productName],["Quantity",String(order.quantity)],["Order total",money(order.totalPrice,order.currency)],["Submitted",niceDate(order.createdAt)??"—"]].map(([label,value])=><div key={label} className="flex justify-between gap-5 py-4 text-sm"><dt className="text-text-muted">{label}</dt><dd className="text-right font-semibold text-primary">{value}</dd></div>)}</dl>
      <p className="mt-5 text-sm font-semibold text-primary">Selected colours</p><div className="mt-2 flex flex-wrap gap-2">{order.colors.map((color,i)=><span key={color.nameSnapshot+i} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm"><span className="h-4 w-4 rounded-full border border-black/10" style={{backgroundColor:color.colorHexSnapshot}}/>{color.nameSnapshot}</span>)}</div>
      {order.customerNotes&&<p className="mt-5 whitespace-pre-line text-sm leading-7 text-text-muted">{order.customerNotes}</p>}
      <p className="mt-6 text-sm leading-7 text-text-muted">This page shows the current request status. A submitted request is not a payment confirmation.</p><Link to="/souvenirs" className="mt-4 inline-flex font-semibold text-secondary">Browse souvenirs →</Link>
    </div></Container></section>;
  }

  const enquiry=query.data as SouvenirGuestEnquiry;
  const quote=enquiry.latestQuote;
  const canRespond=quote?.status==="SENT"&&(!quote.expiresAt||new Date(quote.expiresAt).getTime()>Date.now());
  return <section className="min-h-screen bg-background py-12 sm:py-20"><Container><div className="mx-auto max-w-3xl">
    <div className="rounded-card border border-border bg-white p-6 sm:p-9"><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Private enquiry page</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">Your custom souvenir enquiry</h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-control bg-background p-4"><div><p className="text-xs text-text-muted">Reference</p><p className="mt-1 font-heading text-lg font-bold text-primary">{enquiry.publicReference}</p></div><span className="rounded-full bg-[#F4DCD6] px-3 py-1 text-sm font-semibold text-secondary">{enquiry.status.replaceAll("_"," ")}</span></div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-text-muted">Submitted by</dt><dd className="mt-1 font-semibold text-primary">{enquiry.customerName}</dd></div><div><dt className="text-sm text-text-muted">Package</dt><dd className="mt-1 font-semibold text-primary">{enquiry.product?.name??"Custom request"}</dd></div>{enquiry.requestedQuantity&&<div><dt className="text-sm text-text-muted">Quantity</dt><dd className="mt-1 font-semibold text-primary">{enquiry.requestedQuantity}</dd></div>}</dl>
      <h2 className="mt-6 font-heading text-lg font-bold text-primary">Your design brief</h2><p className="mt-2 whitespace-pre-line leading-7 text-text-muted">{enquiry.designDescription}</p>
      {enquiry.media.length>0&&<div className="mt-6"><h2 className="font-heading text-lg font-bold text-primary">Your reference files</h2><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{enquiry.media.map((item,i)=>item.mimeType?.startsWith("video/")?<video key={item.url} src={item.url} controls preload="metadata" className="aspect-square w-full rounded-control bg-primary object-cover"/>:<a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-control border border-border"><img src={item.url} alt={item.originalName||`Reference ${i+1}`} loading="lazy" className="aspect-square w-full object-cover"/></a>)}</div></div>}
      {enquiry.responseMessage&&<div className="mt-6 rounded-control border-l-4 border-secondary bg-[#F4DCD6]/35 p-4"><h2 className="font-semibold text-primary">Message from KPX Academy</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{enquiry.responseMessage}</p></div>}
    </div>
    {quote?<div className="mt-6 rounded-card border border-border bg-white p-6 sm:p-9"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">Quotation · Version {quote.version}</p><h2 className="mt-2 font-heading text-2xl font-bold text-primary">Your proposed package</h2></div><span className="rounded-full border border-border px-3 py-1 text-sm font-semibold text-primary">{quote.status.replaceAll("_"," ")}</span></div>
      {quote.message&&<p className="mt-4 whitespace-pre-line leading-7 text-text-muted">{quote.message}</p>}
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[400px] text-left text-sm"><thead><tr className="border-b border-border text-text-muted"><th className="py-3 pr-3">Item</th><th className="px-2 py-3 text-right">Qty</th><th className="px-2 py-3 text-right">Unit price</th><th className="py-3 pl-2 text-right">Amount</th></tr></thead><tbody>{quote.items.map(item=><tr key={item.id} className="border-b border-border"><td className="py-4 pr-3"><p className="font-semibold text-primary">{item.name}</p>{item.description&&<p className="mt-1 text-xs text-text-muted">{item.description}</p>}</td><td className="px-2 py-4 text-right">{item.quantity}</td><td className="px-2 py-4 text-right">{money(item.unitPrice,quote.currency)}</td><td className="py-4 pl-2 text-right font-semibold text-primary">{money(item.lineTotal,quote.currency)}</td></tr>)}</tbody><tfoot><tr><th colSpan={3} className="py-4 pr-2 text-right text-primary">Quote total</th><td className="py-4 pl-2 text-right font-heading text-xl font-bold text-secondary">{money(quote.totalAmount,quote.currency)}</td></tr></tfoot></table></div>
      {quote.terms&&<div className="mt-5 rounded-control bg-background p-4"><h3 className="font-semibold text-primary">Quotation terms</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-muted">{quote.terms}</p></div>}
      {quote.expiresAt&&<p className="mt-4 text-sm text-text-muted">Valid until {niceDate(quote.expiresAt)}.</p>}
      {quote.media.length>0&&<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{quote.media.map((item,i)=><a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-control border border-border"><img src={item.url} alt={item.originalName||`Quote reference ${i+1}`} loading="lazy" className="aspect-square w-full object-cover"/></a>)}</div>}
      {canRespond&&<div className="mt-7 border-t border-border pt-6"><h3 className="font-heading text-xl font-bold text-primary">Would you like to accept this quotation?</h3><p className="mt-2 text-sm leading-6 text-text-muted">Your response is recorded for the team. Accepting does not initiate payment.</p>{mutation.isError&&<p role="alert" className="mt-3 text-sm text-red-700">{mutation.error instanceof Error?mutation.error.message:"Your response could not be saved."}</p>}{mutation.isSuccess&&<p role="status" className="mt-3 text-sm font-semibold text-secondary">Your response has been recorded.</p>}<div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={mutation.isPending} onClick={()=>mutation.mutate({quoteId:quote.id,decision:"ACCEPT"})} className="min-h-12 flex-1 rounded-control bg-secondary px-5 py-3 font-semibold text-white hover:bg-primary disabled:opacity-50">{mutation.isPending?"Saving…":"Accept quotation"}</button><button type="button" disabled={mutation.isPending} onClick={()=>mutation.mutate({quoteId:quote.id,decision:"DECLINE"})} className="min-h-12 flex-1 rounded-control border border-border px-5 py-3 font-semibold text-primary hover:border-secondary hover:text-secondary disabled:opacity-50">Decline quotation</button></div></div>}
      {!canRespond&&quote.status==="SENT"&&<p className="mt-5 text-sm text-text-muted">This quotation has expired. Contact KPX Academy to discuss an updated quotation.</p>}
      {!canRespond&&quote.status!=="SENT"&&<p className="mt-5 text-sm text-text-muted">This quotation is no longer awaiting a response.</p>}
    </div>:<div className="mt-6 rounded-card border border-border bg-white p-8"><h2 className="font-heading text-xl font-bold text-primary">Your quotation is being prepared</h2><p className="mt-3 leading-7 text-text-muted">No quotation has been published here yet. Keep this private link to review it when the team makes it available.</p></div>}
    <p className="mt-5 text-xs leading-6 text-text-muted">Keep this private link secure. Quote acceptance or decline records your decision only; payment is handled separately.</p>
  </div></Container></section>;
};

function Message({title,body,retry}:{title:string;body:string;retry?:()=>void}) {
  return <section className="min-h-[60vh] py-24"><Container><div className="mx-auto max-w-xl text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-secondary">KPX Academy</p><h1 className="mt-3 font-heading text-3xl font-bold text-primary">{title}</h1><p className="mt-4 leading-7 text-text-muted">{body}</p>{retry&&<button type="button" onClick={retry} className="mt-5 rounded-control bg-secondary px-5 py-3 font-semibold text-white">Try again</button>}<div><Link to="/souvenirs" className="mt-5 inline-flex text-secondary underline">Back to souvenir catalogue</Link></div></div></Container></section>;
}
