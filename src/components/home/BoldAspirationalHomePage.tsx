import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "Detailed, practical training",
  "Knowledge you can put into practice",
  "Guidance as you learn and improve",
];

export const BoldAspirationalHomePage = () => (
  <div className="overflow-hidden bg-[#FAF8F5] text-[#212529]">
    <div className="bg-[#1D4ED8] px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
      Practical Skills. More Possibilities. <span className="mx-2 text-[#F4DCD6]">✳</span> Your next chapter starts here.
    </div>

    <section className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-16 pt-14 sm:px-8 md:pb-24 md:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-8 lg:px-12 lg:pt-24">
      <div className="relative z-10">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#212529]/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[.17em]">
          <Sparkles size={14} className="text-[#8B1E5A]" /> Skills for your next chapter
        </div>
        <h1 className="max-w-3xl text-[clamp(3.25rem,8vw,7.4rem)] font-extrabold leading-[.94] tracking-[-.075em]">
          DON’T JUST<br /><span className="text-[#1D4ED8]">DREAM IT.</span><br /><span className="relative inline-block">BUILD IT.<span className="absolute -bottom-1 left-0 -z-0 h-3 w-full -rotate-2 bg-[#F4DCD6] sm:h-5" /></span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-7 text-[#212529]/70 sm:text-lg sm:leading-8">
          Learn practical skills, grow your confidence, and discover what you can do with what you know. Start with an interest; build toward your own possibilities.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/programs" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#1D4ED8] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#173fb2] focus:outline-none focus:ring-4 focus:ring-[#1D4ED8]/20">
            Explore our courses <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#212529]/20 px-7 py-4 text-sm font-bold transition hover:border-[#8B1E5A] hover:text-[#8B1E5A]">
            Get to know us <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[#212529]/65 sm:text-sm">
          {benefits.map((benefit) => <span key={benefit} className="inline-flex items-center gap-2"><Check size={15} className="text-[#8B1E5A]" />{benefit}</span>)}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[610px] pb-8 pt-3 lg:ml-auto">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#F4DCD6] sm:h-44 sm:w-44" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#1D4ED8] sm:h-48 sm:w-48" />
        <div className="relative z-10 ml-8 mr-5 grid grid-cols-[1.08fr_.92fr] items-end gap-3 sm:ml-12 sm:mr-8 sm:gap-4">
          <div className="overflow-hidden rounded-t-[48%] rounded-b-2xl border-[6px] border-[#FAF8F5] shadow-xl sm:border-[10px]">
            <img src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=900&q=85" alt="Colourful creative materials arranged for hands-on making" className="h-[300px] w-full object-cover sm:h-[430px]" />
          </div>
          <div className="space-y-3 pb-10 sm:space-y-4 sm:pb-14">
            <div className="overflow-hidden rounded-2xl border-[5px] border-[#FAF8F5] shadow-lg sm:border-8">
              <img src="https://images.unsplash.com/photo-1455390582262-044c793b7baa?auto=format&fit=crop&w=700&q=85" alt="Notebook and tools ready for learning and planning" className="h-36 w-full object-cover sm:h-52" />
            </div>
            <div className="rounded-2xl bg-[#8B1E5A] p-4 text-white shadow-lg sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75 sm:text-xs">Learn it.</p>
              <p className="mt-1 font-[Sora] text-xl font-bold leading-tight sm:text-2xl">Build with it.</p>
              <ArrowDownRight className="mt-3" size={22} />
            </div>
          </div>
        </div>
        <div className="absolute left-0 top-[44%] z-20 -rotate-6 rounded-xl bg-[#F4DCD6] px-4 py-3 shadow-lg sm:px-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#8B1E5A]">Learn by doing</p>
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
