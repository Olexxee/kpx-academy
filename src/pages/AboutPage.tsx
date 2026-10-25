import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, Check, Compass, Lightbulb, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getFounderProfile } from "../api/siteContent.api";
import { Container } from "../components/ui/Container";

const values = [
  { number: "01", title: "Practical by design", description: "Training should move beyond theory. We help learners understand the process, practise with purpose, and build skills they can use." },
  { number: "02", title: "Honest value", description: "We respect every learner's investment through clear expectations, detailed instruction, and a commitment to useful knowledge." },
  { number: "03", title: "Creativity with purpose", description: "We encourage curiosity, experimentation, and the confidence to turn ideas into products, services, and new possibilities." },
  { number: "04", title: "Growth for everyone", description: "Every learner starts somewhere different. We want practical knowledge and the chance to grow to feel within reach." },
];

const areas = [
  "Creative skills and crafts",
  "Beauty and personal care",
  "Product development",
  "Entrepreneurship and sourcing",
];

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-[#D8E9E6]" : "text-[#2A7F7F]"}`}>{children}</p>;
}

export default function AboutPage() {
  const founder = useQuery({ queryKey: ["founder-profile"], queryFn: getFounderProfile });

  return (
    <main className="overflow-hidden bg-[#F7F5F0] text-[#17324D]">
      <section className="relative isolate overflow-hidden bg-[#17324D] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-24 h-[26rem] w-[26rem] rounded-full border border-white/10 sm:h-[38rem] sm:w-[38rem]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-8 top-24 h-56 w-56 rounded-full border border-[#2A7F7F]/50 sm:right-24 sm:top-28 sm:h-80 sm:w-80" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-[35%] h-64 w-64 rounded-full bg-[#2A7F7F]/15 blur-3xl" />
        <Container className="relative py-20 sm:py-28 lg:py-36">
          <div className="grid items-end gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <Eyebrow light>Get to know KPX Academy</Eyebrow>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Skills are the start.
                <span className="mt-2 block text-[#F3D7CC]">Possibility is the point.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                We make practical learning feel closer, clearer, and more useful—so you can build your abilities and decide what comes next.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/programs" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#F3D7CC] px-6 py-3 text-sm font-bold text-[#17324D] transition hover:bg-white">
                  Explore our programmes <ArrowRight size={17} />
                </Link>
                <a href="#our-story" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Our story <ArrowDownRight size={17} />
                </a>
              </div>
            </div>
            <div className="relative lg:justify-self-end lg:max-w-sm">
              <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm sm:p-9">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A7F7F]"><Sparkles size={18} /></span>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">The KPX promise</p>
                </div>
                <div className="my-7 h-px bg-white/15" />
                <p className="text-3xl font-semibold leading-tight sm:text-4xl">Practical Knowledge.</p>
                <p className="mt-3 text-3xl font-semibold leading-tight text-[#F3D7CC] sm:text-4xl">Detailed Training.</p>
                <p className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Real Value.</p>
                <p className="mt-7 text-sm leading-7 text-white/65">Learn with purpose. Build through practice. Make room for what’s possible.</p>
              </div>
              <div className="absolute -bottom-5 -left-4 rounded-2xl bg-[#D4A85A] px-5 py-4 text-[#17324D] shadow-xl sm:-left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Our belief</p>
                <p className="mt-1 text-sm font-bold">Practical Skills.</p>
                <p className="text-sm font-bold">More Possibilities.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="our-story" className="scroll-mt-20 py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <Eyebrow>Why we exist</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Learning should lead to something real.</h2>
              <p className="mt-6 text-base leading-8 text-[#17324D]/70">A skill becomes more powerful when you understand how it works, have room to practise, and can see how it might fit into your life.</p>
              <div className="mt-8 inline-flex items-center gap-3 border-l-2 border-[#D4A85A] py-2 pl-4">
                <Compass className="shrink-0 text-[#2A7F7F]" size={22} />
                <p className="text-sm font-semibold leading-6">Clear instruction. Useful practice. More possibilities.</p>
              </div>
            </div>
            <div className="space-y-5 text-base leading-8 text-[#17324D]/75">
              <p>KPX Academy grew from experience across entrepreneurship, resin art and crafts, beauty and lip care, importation, and other creative ventures. Those experiences reinforced a simple lesson: knowing about a skill is only the beginning.</p>
              <p>Understanding the process, practising properly, and knowing how to apply what you learn can make the difference between information you forget and knowledge you can build on.</p>
              <p>We bring practical, skill-based training together in one place for people who want to explore an interest, develop an existing talent, or take a step towards a business idea.</p>
              <p className="font-semibold text-[#17324D]">Our aim is straightforward: make learning practical, worthwhile, and full of possibility.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="mx-auto w-full max-w-md">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F3D7CC]">
                {founder.data?.mediaUrl ? (
                  <img src={founder.data.mediaUrl} alt={founder.data.mediaAltText || founder.data.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#17324D] text-3xl font-semibold text-white">KO</div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#2A7F7F]">The founder</p>
                    <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#17324D]/65">Founder portrait coming soon.</p>
                  </div>
                )}
                <div aria-hidden="true" className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-[#17324D]/90 p-4 text-white backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/65">The person behind the vision</p>
                  <p className="mt-1 font-semibold">{founder.data?.name ?? "Kepemi Oluwafunke (Keplex)"}</p>
                  <p className="text-sm text-white/70">{founder.data?.role ?? "Founder, KPX Academy"}</p>
                </div>
              </div>
            </div>
            <div>
              <Eyebrow>Meet the founder</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Built from experience. Shared with purpose.</h2>
              <div className="mt-7 space-y-5 text-base leading-8 text-[#17324D]/75">
                <p>I am Kepemi Oluwafunke, known as Keplex, an entrepreneur and the founder of KPX Academy.</p>
                <p>My journey has taken me through different areas of entrepreneurship, including resin art and crafts, beauty and lip care, importation, and other creative ventures. Each experience has shaped how I approach learning, creating, and building a business.</p>
                <p>I believe people deserve to understand what they are paying to learn. Detailed instruction, practical application, and the opportunity to ask questions and keep improving should be part of a worthwhile learning experience.</p>
                <p>KPX Academy brings that belief into one place: a platform to share practical knowledge and help others take meaningful steps towards their own goals.</p>
              </div>
              <div className="mt-8 border-t border-[#17324D]/10 pt-5">
                <p className="font-semibold">{founder.data?.name ?? "Kepemi Oluwafunke (Keplex)"}</p>
                <p className="mt-1 text-sm text-[#17324D]/60">{founder.data?.role ?? "Founder, KPX Academy"}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#17324D] py-20 text-white sm:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow light>Our purpose</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Knowledge that helps you move forward.</h2>
            <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">We want practical learning to open doors to stronger abilities, new ideas, and opportunities learners can pursue.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/15 bg-white/[0.04] p-7 sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2A7F7F]"><Compass size={21} /></span>
              <h3 className="mt-7 text-2xl font-semibold">Our mission</h3>
              <p className="mt-4 leading-8 text-white/70">To empower people with practical skills, entrepreneurial knowledge, and guidance that helps them turn creativity into products, knowledge into opportunities, and ambitions into meaningful work.</p>
            </article>
            <article className="rounded-[1.75rem] border border-white/15 bg-white/[0.04] p-7 sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4A85A] text-[#17324D]"><Lightbulb size={21} /></span>
              <h3 className="mt-7 text-2xl font-semibold">Our vision</h3>
              <p className="mt-4 leading-8 text-white/70">To grow into a trusted learning platform where people can access practical knowledge, develop valuable skills, and discover opportunities for personal and business growth.</p>
            </article>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <Eyebrow>What guides us</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">The principles behind every learning experience.</h2>
              <p className="mt-5 leading-7 text-[#17324D]/65">These values shape how we teach, support learners, and build for the future.</p>
            </div>
            <div className="border-t border-[#17324D]/15">
              {values.map((value) => (
                <article key={value.number} className="grid gap-3 border-b border-[#17324D]/15 py-6 sm:grid-cols-[3.5rem_0.8fr_1.2fr] sm:gap-6 sm:py-8">
                  <span className="text-sm font-bold tracking-widest text-[#2A7F7F]">{value.number}</span>
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm leading-7 text-[#17324D]/70 sm:text-base">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#F3D7CC] py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>What you can explore</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Practical learning, across different interests.</h2>
              <p className="mt-5 max-w-xl leading-8 text-[#17324D]/70">From creative projects to business-minded skills, our programmes are designed to help you learn by understanding and doing.</p>
            </div>
            <ul className="divide-y divide-[#17324D]/15 border-y border-[#17324D]/15">
              {areas.map((area) => <li key={area} className="flex items-center gap-3 py-4 text-sm font-semibold sm:text-base"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2A7F7F] text-white"><Check size={15} /></span>{area}</li>)}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-[#2A7F7F] py-20 text-white sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow light>Your next chapter starts here</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Discover what you can do with the right skills.</h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/80">Explore a new interest, develop your creativity, or take a step towards a business idea. Your next possibility could begin with what you learn today.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/programs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#17324D] transition hover:bg-[#F7F5F0]">Explore programmes <ArrowRight size={17} /></Link>
              <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Start learning</Link>
            </div>
            <p className="mt-9 text-sm font-semibold tracking-wide text-white/75">KPX Academy — Practical Skills. More Possibilities.</p>
          </div>
        </Container>
      </section>
    </main>
  );
}
