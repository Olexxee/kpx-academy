import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { SiteImage } from "../../../components/ui/SiteImage";
import { siteImages } from "../../../config/siteImages";
import { useTrainingPrograms } from "../hooks/useTrainingPrograms";
import { useTrainingMedia } from "../hooks/useTrainingMedia";
import { formatPrice } from "../utils/format";
import { getPrimaryImage } from "../utils/media";
import type { DeliveryMode, TrainingProgram } from "../types";

type DeliveryFilter = "ALL" | DeliveryMode;

const deliveryLabels: Record<DeliveryFilter, string> = {
  ALL: "All delivery types",
  PHYSICAL: "In-person",
  ONLINE: "Online",
  HYBRID: "Hybrid",
};

export const TrainingProgramsPage = () => {
  const { data: programmes, isLoading, isError, refetch } = useTrainingPrograms();
  const [search, setSearch] = useState("");
  const [delivery, setDelivery] = useState<DeliveryFilter>("ALL");

  const visibleProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (programmes ?? [])
      .filter((program) => program.active)
      .filter((program) => delivery === "ALL" || program.deliveryMode === delivery)
      .filter((program) => {
        if (!query) return true;
        const searchable = [
          program.title,
          program.shortDescription,
          program.description,
          program.duration,
          program.location,
          ...(program.highlights ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder);
  }, [programmes, search, delivery]);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative isolate overflow-hidden bg-primary text-white">
        <SiteImage src={siteImages.programmes} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17324D]/95 via-[#17324D]/80 to-[#17324D]/50" />
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 sm:text-sm">KPX Academy · Learn with purpose</p>
          <div className="mt-5 max-w-3xl">
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find a skill worth <span className="text-[#F4DCD6]">learning.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              Explore practical training programmes designed to help you develop your knowledge, strengthen your skills, and put what you learn into practice.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/90">
            <span className="rounded-full border border-white/25 px-4 py-2">Practical learning</span>
            <span className="rounded-full border border-white/25 px-4 py-2">Detailed training</span>
            <span className="rounded-full border border-white/25 px-4 py-2">Online and in-person options</span>
          </div>
        </Container>
      </section>

      <section aria-labelledby="programme-list-heading" className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="flex flex-col gap-6 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Explore the catalogue</p>
              <h2 id="programme-list-heading" className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
                Training programmes
              </h2>
              <p className="mt-3 max-w-xl leading-7 text-text-muted">
                Compare programme details, delivery formats, and fees before choosing your next step.
              </p>
            </div>
            <p className="text-sm text-text-muted" aria-live="polite">
              {isLoading ? "Loading programmes…" : `${visibleProgrammes.length} ${visibleProgrammes.length === 1 ? "programme" : "programmes"} found`}
            </p>
          </div>

          <div className="mt-7 grid gap-4 rounded-card border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text">Search programmes</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by skill, topic, or programme name"
                className="min-h-12 w-full rounded-control border border-border bg-white px-4 text-sm text-text placeholder:text-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text">Delivery format</span>
              <select
                value={delivery}
                onChange={(event) => setDelivery(event.target.value as DeliveryFilter)}
                className="min-h-12 w-full rounded-control border border-border bg-white px-4 text-sm text-text focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              >
                {(Object.keys(deliveryLabels) as DeliveryFilter[]).map((value) => (
                  <option key={value} value={value}>{deliveryLabels[value]}</option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div aria-label="Loading training programmes" aria-busy="true" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse overflow-hidden rounded-card border border-border bg-surface">
                  <div className="aspect-[4/3] bg-border" />
                  <div className="space-y-4 p-6">
                    <div className="h-3 w-1/3 rounded bg-border" />
                    <div className="h-6 w-3/4 rounded bg-border" />
                    <div className="h-4 rounded bg-border" />
                    <div className="h-10 rounded bg-border" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div role="alert" className="mt-10 rounded-card border border-border bg-surface px-6 py-12 text-center">
              <h3 className="font-heading text-xl font-bold text-primary">We couldn’t load the programmes.</h3>
              <p className="mt-3 text-sm leading-7 text-text-muted">Please check your connection and try again.</p>
              <button type="button" onClick={() => void refetch()} className="mt-6 rounded-control bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
                Try again
              </button>
            </div>
          ) : visibleProgrammes.length === 0 ? (
            <div className="mt-10 rounded-card border border-border bg-surface px-6 py-12 text-center">
              <h3 className="font-heading text-xl font-bold text-primary">No matching programmes</h3>
              <p className="mt-3 text-sm leading-7 text-text-muted">Try another search term or choose a different delivery format.</p>
              <button type="button" onClick={() => { setSearch(""); setDelivery("ALL"); }} className="mt-6 rounded-control border border-secondary px-6 py-3 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProgrammes.map((program) => <ProgrammeCard key={program.id} program={program} />)}
            </div>
          )}
        </Container>
      </section>

      <section className="border-t border-border bg-[#F4DCD6]/50 py-14 sm:py-16">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Ready when you are</p>
              <h2 className="mt-3 font-heading text-2xl font-bold text-primary sm:text-3xl">Found a programme that fits your goals?</h2>
              <p className="mt-3 leading-7 text-text-muted">Review the programme details, then continue to registration and secure payment when you are ready.</p>
            </div>
            <Link to="/register" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-control bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
              Start registration
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

function ProgrammeCard({ program }: { program: TrainingProgram }) {
  const { data: media } = useTrainingMedia(program.id);
  const image = getPrimaryImage(media ?? program.media);

  const deliveryLabel =
    program.deliveryMode === "PHYSICAL" ? "In-person" :
    program.deliveryMode === "ONLINE" ? "Online" :
    program.deliveryMode === "HYBRID" ? "Hybrid" : program.deliveryMode;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link to={`/programs/${program.slug}`} aria-label={`View ${program.title}`} className="block overflow-hidden bg-[#F4DCD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset">
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img src={image.url} alt={program.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-end bg-primary p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">KPX Academy</p>
                <p className="mt-2 max-w-xs font-heading text-2xl font-bold text-white">Practical Skills. More Possibilities.</p>
              </div>
            </div>
          )}
          {program.featured && <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-secondary">Featured</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#F4DCD6]/70 px-3 py-1 text-xs font-semibold text-secondary">{deliveryLabel}</span>
          {program.duration && <span className="text-xs font-medium text-text-muted">{program.duration}</span>}
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold leading-snug text-primary">
          <Link to={`/programs/${program.slug}`} className="transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">{program.title}</Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-text-muted">
          {program.shortDescription || "Explore this programme to learn about its content, delivery, and training details."}
        </p>
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-border pt-5">
          <div>
            <p className="text-xs text-text-muted">Programme fee</p>
            <p className="mt-1 font-heading text-lg font-bold text-primary">{formatPrice(program.price, program.currency)}</p>
          </div>
          <Link to={`/programs/${program.slug}`} className="inline-flex min-h-10 items-center justify-center rounded-control bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
