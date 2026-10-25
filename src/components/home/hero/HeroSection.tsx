import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Container } from "../../ui/Container";
import { HeroContent } from "./HeroContent";
import { HeroVisual } from "./HeroVisual";
import { getPublicHeroSlides } from "../../../api/siteContent.api";

export const HeroSection = () => {
  const slides = useQuery({ queryKey: ["site-content", "hero-slides"], queryFn: getPublicHeroSlides, staleTime: 300000 });
  const [activeIndex, setActiveIndex] = useState(0);
  const items = slides.data ?? [];
  const active = items.length ? items[Math.min(activeIndex, items.length - 1)] : null;

  if (!active) {
    return <section aria-labelledby="home-hero-title" className="overflow-hidden bg-neutral">
      <Container className="grid min-h-[620px] items-center gap-12 py-16 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <HeroContent />
        <HeroVisual />
      </Container>
    </section>;
  }

  const primaryHref = active.primaryCtaUrl || "/programs";
  const secondaryHref = active.secondaryCtaUrl || "/about";
  const isExternal = (url: string) => /^https?:\/\//i.test(url);
  return <section aria-label="Homepage highlights" className="overflow-hidden bg-neutral">
    <Container className="grid min-h-[620px] items-center gap-10 py-14 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
      <div className="relative z-10 max-w-xl">
        {active.eyebrow && <p className="mb-5 text-sm font-semibold uppercase tracking-[.16em] text-secondary">{active.eyebrow}</p>}
        <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-primary sm:text-5xl lg:text-6xl">{active.heading}{active.highlightText && <span className="mt-2 block text-secondary">{active.highlightText}</span>}</h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-text-muted sm:text-lg">{active.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {active.primaryCtaLabel && (isExternal(primaryHref) ? <a href={primaryHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-control bg-secondary px-6 py-3 text-sm font-semibold text-white hover:bg-primary">{active.primaryCtaLabel}</a> : <Link to={primaryHref} className="inline-flex min-h-12 items-center justify-center rounded-control bg-secondary px-6 py-3 text-sm font-semibold text-white hover:bg-primary">{active.primaryCtaLabel}</Link>)}
          {active.secondaryCtaLabel && (isExternal(secondaryHref) ? <a href={secondaryHref} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-control border border-border px-6 py-3 text-sm font-semibold text-primary hover:bg-white">{active.secondaryCtaLabel}</a> : <Link to={secondaryHref} className="inline-flex min-h-12 items-center justify-center rounded-control border border-border px-6 py-3 text-sm font-semibold text-primary hover:bg-white">{active.secondaryCtaLabel}</Link>)}
        </div>
        <div className="mt-8 flex items-center gap-3" aria-label="Choose homepage slide">
          {items.map((item, index) => <button key={item.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show slide ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-secondary" : "w-2.5 bg-primary/25 hover:bg-primary/50"}`} />)}
          <span className="ml-1 text-xs text-text-muted">{activeIndex + 1} / {items.length}</span>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
        <div aria-hidden="true" className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-accent-blush/70 sm:-right-7 sm:-top-7 sm:h-40 sm:w-40" />
        <div className="relative overflow-hidden rounded-card border border-border bg-white p-2 shadow-xl">
          {active.imageUrl ? <img key={active.id} src={active.imageUrl} alt={active.imageAltText || active.heading} className="aspect-[4/4.5] w-full rounded-[10px] object-cover sm:aspect-[5/4.5] lg:aspect-[4/5]" fetchPriority="high" /> : <div className="grid aspect-[4/4.5] place-items-center rounded-[10px] bg-accent-blush p-8 text-center font-heading text-2xl font-semibold text-primary">{active.heading}</div>}
          <div className="absolute inset-x-5 bottom-5 rounded-control border border-white/40 bg-white/95 p-4 shadow-lg sm:inset-x-7 sm:bottom-7 sm:p-5"><p className="font-heading text-sm font-semibold text-primary sm:text-base">{active.imageAltText || active.heading}</p><p className="mt-1 text-sm leading-6 text-text-muted">{active.eyebrow || "Practical knowledge. Real possibilities."}</p></div>
        </div>
      </div>
    </Container>
  </section>;
};
