import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicHero } from "../../api/siteContent.api";

const benefits = [
  "Detailed, practical training",
  "Knowledge you can put into practice",
  "Guidance as you learn and improve",
];

interface HeroSlide { title: string; eyebrow: string; description: string; category: string; image: string; alt: string; }

const heroSlides: HeroSlide[] = [
  {
    title: "Technology &\nDigital Skills",
    eyebrow: "Make technology work for you",
    description: "Build digital confidence and practical skills for the opportunities of today and tomorrow.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2200&q=85",
    alt: "Learners collaborating around a laptop during digital skills training",
  },
  {
    title: "Creative Skills.\nReal Possibilities.",
    eyebrow: "Turn your creativity into a skill",
    description: "Explore hands-on creative training, experiment with ideas, and learn by making something of your own.",
    category: "Creative & Craft",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=2200&q=85",
    alt: "Artist working with colourful materials in a creative workspace",
  },
  {
    title: "Business Skills\nThat Move You Forward.",
    eyebrow: "Build your next opportunity",
    description: "Strengthen your business mindset with practical knowledge you can apply to work, projects, and everyday decisions.",
    category: "Business",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=85",
    alt: "Small business team sharing ideas around a table",
  },
  {
    title: "Learn. Practise.\nCreate Something.",
    eyebrow: "Practical learning starts here",
    description: "Move beyond theory with guided, hands-on learning designed to help you build confidence through practice.",
    category: "Hands-on Training",
    image: "https://images.unsplash.com/photo-1524178252363-1fb2b075b655?auto=format&fit=crop&w=2200&q=85",
    alt: "Instructor leading a practical learning session with students",
  },
  {
    title: "Your Next Chapter\nStarts with a Skill.",
    eyebrow: "Discover what you can do",
    description: "Start with your curiosity, learn something useful, and take a confident step toward your personal goals.",
    category: "Personal Growth",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2200&q=85",
    alt: "Students learning together in a collaborative study session",
  },
];

export const BoldAspirationalHomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroQuery = useQuery({ queryKey: ["site-content", "hero"], queryFn: getPublicHero, retry: 1 });
  const publishedHero = heroQuery.data;
  const slides: HeroSlide[] = publishedHero ? [{
    title: [publishedHero.heading, publishedHero.highlightText].filter(Boolean).join("\n"),
    eyebrow: publishedHero.eyebrow || "Practical learning starts here",
    description: publishedHero.description,
    category: "KPX Academy",
    image: publishedHero.imageUrl || heroSlides[0].image,
    alt: publishedHero.imageAltText || "KPX Academy practical learning",
  }] : heroSlides;
  const slide = slides[activeSlide % slides.length];

  useEffect(() => {
    if (publishedHero) { setActiveSlide(0); return; }
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [publishedHero]);

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <div className="overflow-hidden bg-[#FAF8F5] text-[#212529]">
      <div className="bg-[#1D4ED8] px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        Practical Skills. More Possibilities. <span className="mx-2 text-[#F4DCD6]">✳</span> Your next chapter starts here.
      </div>

      <section aria-label="Discover KPX Academy training" className="relative isolate min-h-[650px] overflow-hidden bg-[#07152F] text-white sm:min-h-[690px] lg:min-h-[720px]">
        <div className="absolute inset-0 -z-20">
          {slides.map((item, index) => (
            <img
              key={item.category}
              src={item.image}
              alt={index === activeSlide ? item.alt : ""}
              aria-hidden={index !== activeSlide}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 motion-reduce:transition-none ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          ))}
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06142F]/95 via-[#06142F]/80 to-[#06142F]/20 sm:via-[#06142F]/70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06142F]/85 via-transparent to-[#06142F]/15" />
        <div className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-[#8B1E5A]/35 blur-3xl sm:h-96 sm:w-96" />

        <div className="mx-auto flex min-h-[650px] max-w-[1440px] flex-col px-5 pb-7 pt-16 sm:min-h-[690px] sm:px-8 sm:pt-20 lg:min-h-[720px] lg:px-12 lg:pt-24">
          <div className="my-auto max-w-3xl pb-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.19em] text-white backdrop-blur-sm sm:text-xs">
              <Sparkles size={14} className="text-[#F4DCD6]" />
              {slide.eyebrow}
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-[#F4DCD6] sm:text-sm">KPX Academy · Practical skills. Real opportunities.</p>
            <h1 aria-live="polite" className="max-w-4xl whitespace-pre-line font-[Sora] text-[clamp(2.8rem,7.4vw,6.6rem)] font-extrabold leading-[.99] tracking-[-.065em]">
              {slide.title.split("\n").map((line, index) => (
                <span key={line} className="block">{index === 1 ? <span className="text-[#F4DCD6]">{line}</span> : line}</span>
              ))}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:mt-7 sm:text-lg sm:leading-8">{slide.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={publishedHero?.primaryCtaUrl || "/programs"} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#8B1E5A] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-[#a2266b] focus:outline-none focus:ring-4 focus:ring-white/30">
                {publishedHero?.primaryCtaLabel || "Explore our courses"} <ArrowRight size={18} />
              </a>
              <a href={publishedHero?.secondaryCtaUrl || "/about"} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/55 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/30">
                {publishedHero?.secondaryCtaLabel || "Get to know us"} <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-white/80 sm:text-sm">
              {benefits.map((benefit) => <span key={benefit} className="inline-flex items-center gap-2"><Check size={15} className="text-[#F4DCD6]" />{benefit}</span>)}
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-white/20 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/60">Explore our learning areas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {slides.map((item, index) => (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-pressed={activeSlide === index}
                    className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#07152F] sm:text-sm ${activeSlide === index ? "border-[#F4DCD6] bg-[#F4DCD6] text-[#212529]" : "border-white/30 bg-white/5 text-white hover:border-white/70 hover:bg-white/15"}`}
                  >
                    {item.category}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <p className="min-w-[100px] text-xs font-medium text-white/70"><span className="font-bold text-white">0{activeSlide + 1}</span> <span className="mx-1">/</span> 0{slides.length} <span className="hidden lg:inline">· Discover more</span></p>
              <div className="flex gap-2">
                <button type="button" onClick={showPreviousSlide} aria-label="Previous training image" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/10 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"><ArrowLeft size={18} /></button>
                <button type="button" onClick={showNextSlide} aria-label="Next training image" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/10 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"><ArrowRight size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

    <section className="bg-[#212529] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-[.7fr_1.3fr] md:items-center md:px-12 md:py-20">
        <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#F4DCD6]">A little about us</p><h2 className="mt-4 max-w-md text-3xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">Learning should lead to <span className="text-[#F4DCD6]">possibility.</span></h2></div>
        <div className="max-w-2xl md:justify-self-end"><p className="text-base leading-7 text-white/75 sm:text-lg sm:leading-8">KPX Academy brings practical, skill-based training together in one place. We help learners understand the process, practise with purpose, and explore ways to use their skills in everyday life or business.</p><Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#F4DCD6] hover:text-white">Our story <ArrowRight size={17} /></Link></div>
      </div>
    </section>

    <section className="px-5 pb-16 sm:px-8 md:px-12 md:pb-24">
      <div className="mx-auto grid max-w-[1344px] overflow-hidden rounded-[2rem] bg-[#F4DCD6] md:grid-cols-2">
        <div className="p-7 sm:p-10 md:p-14"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#8B1E5A]">Beyond the classroom</p><h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-.05em] sm:text-5xl">Bring creativity to your next event.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-[#212529]/75 sm:text-base">Make your next group activity creative, interactive, and memorable. Our workshops can bring hands-on resin art or lip-care formulation experiences to schools, teams, organisations, and private groups.</p><Link to="/workshops" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#8B1E5A] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#6e1747]">Explore creative workshops <ArrowRight size={17} /></Link></div>
        <div className="relative min-h-[260px] overflow-hidden md:min-h-[430px]"><img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85" alt="Creative art materials ready for a collaborative workshop" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#212529]/30 to-transparent" /><div className="absolute bottom-5 left-5 rounded-xl bg-[#FAF8F5] px-4 py-3 text-xs font-bold text-[#212529] sm:bottom-8 sm:left-8 sm:px-5 sm:py-4">Make something together. <span className="ml-2 text-[#8B1E5A]">✳</span></div></div>
      </div>
    </section>

    <section className="bg-[#1D4ED8] px-5 py-16 text-white sm:px-8 md:px-12 md:py-24">
      <div className="mx-auto flex max-w-[1344px] flex-col justify-between gap-8 md:flex-row md:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[.22em] text-white/75">Your journey can start here</p><h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-[-.06em] sm:text-6xl">One new skill can open up a new possibility.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-white/80">Explore what interests you, learn at your own pace where available, and take the next step with practical knowledge.</p></div>
        <Link to="/programs" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#FAF8F5] px-7 py-4 text-sm font-bold text-[#1D4ED8] transition hover:bg-[#F4DCD6]">Find your course <ArrowRight size={18} /></Link>
      </div>
    </section>
  </div>
  );
};
