import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { getSouvenirProducts } from "../api";
import type { SouvenirProduct } from "../types";

const money = (amount: number | string, currency = "NGN") => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Price on request";
  try { return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${value.toLocaleString("en-NG")}`; }
};

export const SouvenirCataloguePage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["souvenirs", "catalogue"], queryFn: getSouvenirProducts, staleTime: 300000,
  });

  return <div className="min-h-screen bg-background">
    <section className="bg-primary py-16 text-white sm:py-20 lg:py-28">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 sm:text-sm">KPX Academy · Custom and ready-made</p>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">Souvenirs made for <span className="text-[#F4DCD6]">your moment.</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">Explore souvenir packages for celebrations, events, gifting, and branded occasions. Choose an available package or tell us what you have in mind.</p>
        <Link to="/souvenirs/enquire" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-control bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-primary">Request a custom design</Link>
      </Container>
    </section>
    <section className="py-12 sm:py-16 lg:py-20"><Container>
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">The catalogue</p><h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">Available souvenir packages</h2></div>
        {!isLoading && !isError && <p className="text-sm text-text-muted">{data?.length ?? 0} packages available</p>}
      </div>
      {isLoading ? <div aria-busy="true" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n)=><div key={n} className="animate-pulse overflow-hidden rounded-card border border-border bg-white"><div className="aspect-[4/3] bg-border"/><div className="space-y-3 p-6"><div className="h-5 w-2/3 rounded bg-border"/><div className="h-4 rounded bg-border"/></div></div>)}</div>
      : isError ? <div role="alert" className="mt-10 rounded-card border border-border bg-white p-8 text-center"><h3 className="font-heading text-xl font-bold text-primary">The catalogue is temporarily unavailable.</h3><p className="mt-3 text-sm leading-7 text-text-muted">Please try again in a moment.</p><button type="button" onClick={()=>void refetch()} className="mt-5 rounded-control bg-secondary px-5 py-3 font-semibold text-white hover:bg-primary">Try again</button></div>
      : !data?.length ? <div className="mt-10 rounded-card border border-border bg-white p-10 text-center"><h3 className="font-heading text-xl font-bold text-primary">New packages are coming soon.</h3><p className="mt-3 leading-7 text-text-muted">You can still send us a custom request and describe the souvenir you need.</p><Link to="/souvenirs/enquire" className="mt-5 inline-flex rounded-control bg-secondary px-5 py-3 font-semibold text-white hover:bg-primary">Request a custom design</Link></div>
      : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((product)=><SouvenirCard key={product.id} product={product}/>)}</div>}
    </Container></section>
  </div>;
};

function SouvenirCard({ product }: { product: SouvenirProduct }) {
  const image = product.media?.find((item)=>item.isPrimary) ?? product.media?.[0];
  const tier = product.priceTiers?.[0];
  return <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white transition hover:-translate-y-1 hover:shadow-md">
    <Link to={`/souvenirs/${product.slug}`} aria-label={`View ${product.name}`} className="block bg-[#F4DCD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset">
      <div className="relative aspect-[4/3] overflow-hidden">{image ? <img src={image.url} alt={image.altText || product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"/> : <div className="flex h-full items-end bg-primary p-6"><p className="font-heading text-2xl font-bold text-white">{product.name}</p></div>}
      {product.featured && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary">Featured</span>}</div>
    </Link>
    <div className="flex flex-1 flex-col p-5 sm:p-6"><h3 className="font-heading text-xl font-bold text-primary"><Link to={`/souvenirs/${product.slug}`} className="hover:text-secondary">{product.name}</Link></h3><p className="mt-3 flex-1 text-sm leading-7 text-text-muted">{product.description || "A souvenir package that can be tailored to your event and quantity."}</p>
      <div className="mt-5 border-t border-border pt-4">{tier ? <><p className="text-xs text-text-muted">Packages from</p><p className="mt-1 font-heading text-lg font-bold text-primary">{money(tier.totalPrice,tier.currency)}</p><p className="mt-1 text-xs text-text-muted">{tier.label}</p></> : <p className="font-semibold text-primary">Request pricing</p>}<Link to={`/souvenirs/${product.slug}`} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-control bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary">View package</Link></div>
    </div>
  </article>;
}
