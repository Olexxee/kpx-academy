import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Compass,
  Lightbulb,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getFounderProfile } from "../api/siteContent.api";
import { PublicPageHero } from "../components/ui/PublicPageHero";
import { siteImages } from "../config/siteImages";

const values = [
  {
    number: "01",
    title: "Practical Learning",
    description:
      "We value clear instruction, hands-on experience and meaningful application. We focus on helping people understand processes, develop their abilities and gain knowledge they can put to use.",
  },
  {
    number: "02",
    title: "Quality and Integrity",
    description:
      "We are committed to maintaining quality in what we offer. From the information we share to the resources and guidance we provide, we value accuracy, transparency and honesty in everything we do.",
  },
  {
    number: "03",
    title: "Creativity and Innovation",
    description:
      "We embrace curiosity, fresh ideas and the freedom to explore new possibilities. We encourage creative thinking, experimentation and the development of ideas across different areas.",
  },
  {
    number: "04",
    title: "Accessibility and Empowerment",
    description:
      "We believe opportunities to develop useful skills and knowledge should be more accessible. We are committed to providing affordable programmes, relevant resources and guidance that empower people to make informed use of what they acquire.",
  },
];

const areas = [
  "Creative Skills & Crafts",
  "Beauty & Lip Care",
  "Entrepreneurship & Business Skills",
  "Creative Workshops & Experiences",
  "Souvenirs & Custom Gifts",
  "And More",
];

function Eyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-[#f4dcd6]" : "text-[#8b1e5a]"
      }`}
    >
      {children}
    </p>
  );
}

export default function AboutPage() {
  const founder = useQuery({
    queryKey: ["founder-profile"],
    queryFn: getFounderProfile,
  });

  return (
    <div className="overflow-hidden bg-[#faf8f5] text-[#212529]">
      <PublicPageHero
        eyebrow="Get to Know KPX Academy"
        title="Skills are the start. Possibility is the point."
        description="We bring together practical skills, creative development and entrepreneurial knowledge to help people discover interests, develop their abilities and explore new possibilities. Through our programmes and services, we make useful knowledge and opportunities more accessible to people with different interests, goals and aspirations."
        icon={Compass}
        image={siteImages.about}
        variant="split"
        brandPalette="current"
        actions={
          <>
            <Link
              to="/programs"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f4dcd6] px-6 py-3 text-sm font-bold text-[#212529] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explore our programmes <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              href="#our-story"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Our story <ArrowDownRight size={17} aria-hidden="true" />
            </a>
          </>
        }
        aside={
          <div className="relative">
            <div className="rounded-[2rem] border border-white/20 bg-white/[0.08] p-7 backdrop-blur-sm sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b1e5a]">
                  <Compass size={18} aria-hidden="true" />
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                  The KPX Academy brand promise
                </p>
              </div>
              <div className="my-7 h-px bg-white/20" />
              <p className="text-3xl font-semibold leading-tight sm:text-4xl">
                Practical Knowledge.
              </p>
              <p className="mt-3 text-3xl font-semibold leading-tight text-[#f4dcd6] sm:text-4xl">
                Detailed Training.
              </p>
              <p className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Real Value.
              </p>
              <p className="mt-7 text-sm leading-7 text-white/80">
                We are committed to delivering detailed, practical training
                that helps you understand what you learn, build your skills
                through practice, and move forward with greater confidence —
                whether you learn online or in person.
              </p>
              <div className="mt-6 border-t border-white/20 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">
                  Our tagline
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Practical Skills. More Possibilities.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <section id="our-story" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <Eyebrow>Why We Exist</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Learning should lead to something meaningful.
              </h2>
              <p className="mt-6 text-base leading-8 text-[#212529]/70">
                Clear explanations, proper demonstrations, useful resources
                and knowledge learners can apply.
              </p>
              <div className="mt-8 inline-flex items-center gap-3 border-l-2 border-[#8b1e5a] py-2 pl-4">
                <Compass className="shrink-0 text-[#8b1e5a]" size={22} />
                <p className="text-sm font-semibold leading-6">
                  Understand the process. Practise where applicable. Put
                  knowledge to use.
                </p>
              </div>
            </div>
            <div className="space-y-5 text-base leading-8 text-[#212529]/75">
              <p>
                At KPX Academy, we believe that gaining a skill or acquiring
                new knowledge should go beyond simply knowing how something
                works. It should involve understanding the process, having
                the opportunity to practise where applicable, and knowing
                how to put what you have acquired to use.
              </p>
              <p>
                This belief shapes how we approach everything we do. We bring
                together practical skills, creative development and
                entrepreneurial knowledge to make useful information and
                opportunities more accessible to people with different
                interests, abilities and aspirations. As we grow, we remain
                open to introducing new programmes, creative opportunities
                and services that reflect our vision.
              </p>
              <p>
                Whether you are discovering a new interest, developing an
                existing ability, exploring your creativity or considering a
                business idea, we want you to find something valuable in what
                we offer.
              </p>
              <p>
                Our focus is on providing detailed instruction, relevant
                resources, practical demonstrations where applicable and
                guidance that makes each programme worthwhile. We understand
                that everyone has different goals and approaches their
                journey at a different pace. Our responsibility is to provide
                useful knowledge and support, while each person’s progress
                depends on how they choose to practise, apply and build on
                what they acquire.
              </p>
              <p>
                Ultimately, we exist to make practical knowledge, creative
                opportunities and entrepreneurial development more
                accessible, giving people room to discover their abilities
                and explore what they can do with them.
              </p>
              <p className="border-l-2 border-[#8b1e5a] pl-5 font-semibold text-[#1d4ed8]">
                Because gaining knowledge is a beginning; what you do with
                it is where new possibilities emerge.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="mx-auto w-full max-w-md lg:sticky lg:top-24">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#f4dcd6]">
                {founder.data?.mediaUrl ? (
                  <img
                    src={founder.data.mediaUrl}
                    alt={
                      founder.data.mediaAltText ||
                      founder.data.name ||
                      "Kepemi Oluwafunke, founder of KPX Academy"
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1d4ed8] text-3xl font-semibold text-white">
                      KO
                    </div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#8b1e5a]">
                      The founder
                    </p>
                    <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#212529]/70">
                      Founder portrait coming soon.
                    </p>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-[#1d4ed8]/90 p-4 text-white backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-white/65">
                    The person behind the vision
                  </p>
                  <p className="mt-1 font-semibold">
                    {founder.data?.name ?? "Kepemi Oluwafunke (Keplex)"}
                  </p>
                  <p className="text-sm text-white/70">
                    {founder.data?.role ?? "Founder, KPX Academy"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Eyebrow>Meet the Founder</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Kepemi Oluwafunke (Keplex)
              </h2>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#8b1e5a]">
                Founder, KPX Academy
              </p>
              <div className="mt-7 space-y-5 text-base leading-8 text-[#212529]/75">
                <p>
                  My name is Kepemi Oluwafunke, popularly known as Keplex. I am
                  an entrepreneur, creative enthusiast and the founder of KPX
                  Academy. My journey has been shaped by a passion for
                  creating, sharing knowledge and exploring opportunities
                  across different areas, including resin art and crafts,
                  beauty and lip care, China importation, entrepreneurship and
                  other creative ventures.
                </p>
                <p>
                  My decision to share my skills and knowledge with others
                  was influenced not only by my own experiences but also by
                  the challenges I encountered while seeking worthwhile
                  training. I understand what it feels like to invest in a
                  programme and still be left wanting more clarity, proper
                  guidance or the practical understanding needed to apply
                  what you have paid to learn. I came to realise that people
                  deserve more than access to a training group or a
                  collection of lessons. They deserve clear instruction,
                  proper demonstrations where applicable, the opportunity
                  to ask questions and meaningful support throughout their
                  training.
                </p>
                <p>
                  That understanding became one of the reasons I decided to
                  create opportunities for others to benefit from the skills
                  and knowledge I had acquired.
                </p>
                <p>
                  In 2022, I began organising training programmes through a
                  platform known as Keplex, using WhatsApp to connect with
                  learners and share practical knowledge. What started as an
                  opportunity to teach the skills I had developed and share
                  what I knew gradually became something much more meaningful.
                  As people joined the programmes, participated in the
                  sessions and recognised the value of the instruction,
                  resources and guidance they received, I became increasingly
                  encouraged to continue. Their interest, feedback and
                  continued participation strengthened my belief in the
                  importance of making useful knowledge accessible and
                  sharing it in a way people can understand and apply.
                </p>
                <p>
                  As the community grew, so did my vision. I began to see the
                  need for a more organised platform that could bring the
                  different areas of training and services I offered
                  together, make information easier to access and create a
                  clearer experience for people interested in developing
                  their abilities, exploring new opportunities and gaining
                  useful knowledge.
                </p>
                <p>That vision led to the rebranding and development of KPX Academy.</p>
                <p>
                  Today, KPX Academy represents the growth of that initial
                  idea into a platform built around practical skills,
                  creativity and entrepreneurial knowledge. I want our
                  programmes to offer more than information. My intention is
                  to provide detailed instruction, practical demonstrations
                  where relevant, useful resources and guidance that help
                  learners understand what they are engaging in and make
                  meaningful use of what they acquire.
                </p>
                <p>
                  I believe that acquiring a skill or gaining knowledge is
                  only part of the journey. What follows depends on how each
                  person chooses to use it—their willingness to practise,
                  remain consistent, explore possibilities and put their
                  knowledge into action. My role is to share what I know,
                  provide guidance and create an environment where people
                  have the opportunity to develop their abilities and take
                  meaningful steps towards their individual goals.
                </p>
                <p>
                  Looking back, what began with my own experiences and the
                  decision to share my skills has grown into something I am
                  proud to continue building. Every programme, every learner
                  and every opportunity to share knowledge forms part of
                  that journey.
                </p>
                <p>
                  KPX Academy is more than a rebranded platform to me. It is
                  the continuation of a journey that began with Keplex in
                  2022, shaped by experience and driven by a commitment to
                  making practical skills, useful knowledge and new
                  opportunities more accessible to others.
                </p>
              </div>
              <div className="mt-8 border-t border-[#212529]/10 pt-5">
                <p className="font-semibold">
                  — {founder.data?.name ?? "Kepemi Oluwafunke (Keplex)"}
                </p>
                <p className="mt-1 text-sm text-[#212529]/70">
                  {founder.data?.role ?? "Founder, KPX Academy"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1d4ed8] py-20 text-white sm:py-28">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow light>Our Purpose</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Making practical knowledge and creative opportunities more
              accessible.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/80 sm:text-lg">
              To make practical skills, useful knowledge and creative
              opportunities more accessible, opening doors for people to
              strengthen their abilities, explore their interests and
              discover new possibilities for personal and professional
              development.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-7 sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b1e5a]">
                <Compass size={21} aria-hidden="true" />
              </span>
              <h3 className="mt-7 text-2xl font-semibold">Our Mission</h3>
              <p className="mt-4 leading-8 text-white/80">
                To provide accessible, quality programmes, practical
                knowledge and meaningful guidance that empower people to
                develop their abilities, explore their creativity and make
                informed use of the opportunities available to them.
              </p>
            </article>
            <article className="rounded-[1.75rem] border border-white/15 bg-white/[0.06] p-7 sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8b1e5a] text-[#1d4ed8]">
                <Lightbulb size={21} aria-hidden="true" />
              </span>
              <h3 className="mt-7 text-2xl font-semibold">Our Vision</h3>
              <p className="mt-4 leading-8 text-white/80">
                To build KPX Academy into a trusted and recognised platform
                for practical skills, creativity and entrepreneurial
                development, continually expanding our programmes and
                reaching more people with opportunities to discover,
                develop and make use of their abilities.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <Eyebrow>What Guides Us</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                The principles behind everything we do.
              </h2>
              <p className="mt-5 leading-7 text-[#212529]/70">
                Our values shape how we share knowledge, deliver our
                programmes and services, support our learners and approach
                every opportunity to grow and improve.
              </p>
            </div>
            <div className="border-t border-[#212529]/15">
              {values.map((value) => (
                <article
                  key={value.number}
                  className="grid gap-3 border-b border-[#212529]/15 py-6 sm:grid-cols-[3.5rem_0.8fr_1.2fr] sm:gap-6 sm:py-8"
                >
                  <span className="text-sm font-bold tracking-widest text-[#8b1e5a]">
                    {value.number}
                  </span>
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm leading-7 text-[#212529]/70 sm:text-base">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4dcd6] py-20 sm:py-24">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>What You Can Explore</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Practical learning across different interests.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-[#212529]/75">
                Explore opportunities to develop your abilities, discover
                new interests and engage with different areas of creativity
                and entrepreneurship.
              </p>
            </div>
            <ul className="divide-y divide-[#1d4ed8]/15 border-y border-[#1d4ed8]/15">
              {areas.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-3 py-4 text-sm font-semibold sm:text-base"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8b1e5a] text-white">
                    <Check size={15} aria-hidden="true" />
                  </span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#1d4ed8] py-20 text-white sm:py-24">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow light>Your Next Chapter Starts Here</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Discover what you can do with the right skills.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/85">
              Explore a new interest, develop your creativity, or take a step
              towards a business idea. Your next possibility could begin
              with what you learn today.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/programs"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#1d4ed8] transition hover:bg-[#faf8f5]"
              >
                Explore programmes <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Start learning
              </Link>
            </div>
            <p className="mt-9 text-sm font-semibold tracking-wide text-white/85">
              KPX Academy — Practical Skills. More Possibilities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
