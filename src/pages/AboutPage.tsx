import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFounderProfile } from "../api/siteContent.api";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";

const values = [
  {
    number: "01",
    title: "Practical Learning",
    description:
      "We believe learning should go beyond theory. Our training focuses on helping students understand what they learn, practise their skills, and apply their knowledge with confidence.",
  },
  {
    number: "02",
    title: "Integrity",
    description:
      "We value honesty, transparency, and genuine value. Students deserve to understand what they are paying to learn and receive training that respects their investment.",
  },
  {
    number: "03",
    title: "Creativity & Innovation",
    description:
      "We encourage learners to explore ideas, develop their abilities, experiment thoughtfully, and discover new ways to turn creativity into something meaningful.",
  },
  {
    number: "04",
    title: "Growth & Empowerment",
    description:
      "We want every learner to leave with more than information. Our aim is to help people develop their abilities, build confidence, and take meaningful steps towards their personal and business goals.",
  },
  {
    number: "05",
    title: "Accessibility & Support",
    description:
      "We believe practical knowledge should be within reach. We value accessible learning, meaningful guidance, and an environment that encourages students to keep improving.",
  },
];

const learningAreas = [
  "Creative skills and crafts",
  "Beauty and personal care",
  "Product development",
  "Entrepreneurial skills",
  "Practical, skill-based training",
  "Knowledge for personal and business growth",
];

function Eyebrow({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`mb-4 text-xs font-bold uppercase tracking-[0.2em] ${
        light ? "text-white/75" : "text-[#8B1E5A]"
      }`}
    >
      {children}
    </p>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  centered = false,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>

      <h2
        className={`text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl ${
          light ? "text-white" : "text-[#212529]"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-5 text-base leading-8 sm:text-lg ${
            light ? "text-white/75" : "text-[#212529]/70"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}


export default function AboutPage() {
  return (
    <div className="overflow-hidden bg-[#FAF8F5] text-[#212529]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#1D4ED8] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10 sm:h-[30rem] sm:w-[30rem]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-16 h-56 w-56 rounded-full border border-white/10 sm:right-16 sm:top-20 sm:h-72 sm:w-72"
        />

        <Container className="relative py-20 sm:py-28 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="max-w-3xl">
              <Eyebrow light>About KPX Academy</Eyebrow>

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
                Turning practical skills into{" "}
                <span className="text-[#F4DCD6]">possibilities.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                We believe learning a skill should be more than acquiring
                knowledge. It should give you the understanding, practical
                ability, and confidence to do something meaningful with what you
                learn.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/programs"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-bold text-[#1D4ED8] transition hover:bg-[#F4DCD6]"
                >
                  Explore our programmes
                </Link>

                <a
                  href="#our-story"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Discover our story
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-6 backdrop-blur-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">
                  The KPX promise
                </p>

                <div className="my-8 h-px bg-white/20" />

                <p className="text-3xl font-bold leading-snug sm:text-4xl">
                  Practical Knowledge.
                </p>
                <p className="mt-3 text-3xl font-bold leading-snug text-[#F4DCD6] sm:text-4xl">
                  Detailed Training.
                </p>
                <p className="mt-3 text-3xl font-bold leading-snug sm:text-4xl">
                  Real Value.
                </p>

                <div className="my-8 h-px bg-white/20" />

                <p className="text-sm leading-7 text-white/75">
                  Learn with purpose. Build through practice. Discover what your
                  skills can make possible.
                </p>
              </div>

              <div className="absolute -bottom-5 -left-3 rounded-2xl bg-[#F4DCD6] px-5 py-4 text-[#212529] shadow-lg sm:-left-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8B1E5A]">
                  Our tagline
                </p>
                <p className="mt-1 font-bold">Practical Skills.</p>
                <p className="font-bold">More Possibilities.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our story */}
      <section id="our-story" className="scroll-mt-20 py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionTitle
                eyebrow="Our story"
                title="Built on experience. Driven by possibility."
                description="KPX Academy grew from a simple belief: people deserve more than a brief introduction to a skill. They deserve the knowledge and practical understanding to use it."
              />

              <div className="mt-8 hidden border-l-2 border-[#8B1E5A] pl-5 sm:block">
                <p className="text-lg font-semibold leading-8 text-[#212529]">
                  “A skill is not just something you learn. It is something you
                  can develop, put into practice, and build upon.”
                </p>
              </div>
            </div>

            <div className="space-y-6 text-base leading-8 text-[#212529]/75">
              <p>
                Our story grew from a journey through entrepreneurship,
                exploring resin art and crafts, beauty and lip care,
                importation, and other creative ventures. These experiences
                showed us that knowing a skill is only one part of the journey.
                Understanding the process, practising properly, and learning how
                to apply that knowledge are just as important.
              </p>

              <p>
                That understanding inspired the creation of KPX Academy: a
                platform where people can access detailed, practical training
                across different skill-based fields. Our aim is to help learners
                understand what they are learning and give them a stronger
                foundation to build upon.
              </p>

              <p>
                Every learner starts from a different place. Some want to
                explore a new interest, others want to develop an existing
                talent, and many hope to turn their skills into an income stream
                or a business of their own. We want to help them take their next
                steps with greater confidence.
              </p>

              <p>
                As KPX Academy grows, our vision is to reach more learners,
                expand our training opportunities, and build a trusted skills
                development brand where people can learn, create, improve, and
                discover new possibilities for themselves.
              </p>

              <p className="font-semibold text-[#212529]">
                Welcome to KPX Academy — where skills become opportunities.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Founder */}
      <section className="bg-white py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="mx-auto w-full max-w-sm">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F4DCD6]">
                <div className="absolute inset-5 rounded-[1.5rem] border border-[#8B1E5A]/20" />

                {founder.data?.mediaUrl ? (
                  <img src={founder.data.mediaUrl} alt={founder.data.mediaAltText || founder.data.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#8B1E5A] text-3xl font-bold text-white">KO</div>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#8B1E5A]">Founder portrait</p>
                    <p className="mt-2 max-w-[15rem] text-sm leading-6 text-[#212529]/65">Portrait will appear here when added by the site administrator.</p>
                  </div>
                )}

                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-[#8B1E5A]/20"
                />
              </div>

              <p className="mt-5 text-center text-sm text-[#212529]/55">
                {founder.data?.name ?? "Kepemi Oluwafunke (Keplex)"}, {founder.data?.role ?? "Founder"}
              </p>
            </div>

            <div>
              <SectionTitle
                eyebrow="Meet the founder"
                title="The person behind the vision."
              />

              <div className="mt-7 space-y-5 text-base leading-8 text-[#212529]/75">
                <p>
                  I am Kepemi Oluwafunke, known as Keplex, an entrepreneur and
                  the founder of KPX Academy.
                </p>

                <p>
                  My journey has taken me through different areas of
                  entrepreneurship, including resin art and crafts, beauty and
                  lip care, importation, and other creative ventures. Each
                  experience has shaped how I approach learning, creating, and
                  building a business. Most importantly, they have shown me how
                  valuable practical knowledge can be when it is properly
                  understood and applied.
                </p>

                <p>
                  As I explored different skills and opportunities, I came to
                  appreciate the importance of sharing knowledge in a way that
                  helps others move forward. I wanted to bring together my
                  experience, my passion for practical skills, and my desire to
                  help people discover what they could achieve with the right
                  training.
                </p>

                <p>
                  My approach is built around a simple principle: people deserve
                  to understand what they are paying to learn. I value detailed
                  instruction, practical application, and the opportunity for
                  students to ask questions, practise, and continue improving.
                </p>

                <p>
                  For me, KPX Academy is a way to share what I have learned,
                  bring different skill-based opportunities under one platform,
                  and help others take meaningful steps towards their own goals.
                </p>

                <p className="font-semibold text-[#212529]">
                  I am building KPX Academy to help people learn with purpose,
                  grow through practice, and turn their skills into
                  opportunities.
                </p>
              </div>

              <p className="mt-7 text-sm font-bold uppercase tracking-[0.12em] text-[#8B1E5A]">
                Kepemi Oluwafunke (Keplex)
              </p>
              <p className="mt-1 text-sm text-[#212529]/60">
                Founder, KPX Academy
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission and vision */}
      <section className="bg-[#212529] py-20 text-white sm:py-28">
        <Container>
          <SectionTitle
            eyebrow="Our purpose"
            title="Why KPX Academy exists."
            description="We want learning to lead somewhere: to stronger abilities, new ideas, and opportunities learners can pursue."
            light
            centered
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
            <article className="rounded-[1.5rem] border border-white/15 p-7 sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1D4ED8] text-xl font-bold">
                M
              </span>

              <h3 className="mt-7 text-2xl font-bold sm:text-3xl">
                Our mission
              </h3>

              <p className="mt-5 leading-8 text-white/75">
                To empower people with practical skills, entrepreneurial
                knowledge, and ongoing guidance to turn their creativity into
                valuable products, their knowledge into opportunities, and their
                ambitions into sustainable businesses.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/15 p-7 sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#8B1E5A] text-xl font-bold">
                V
              </span>

              <h3 className="mt-7 text-2xl font-bold sm:text-3xl">
                Our vision
              </h3>

              <p className="mt-5 leading-8 text-white/75">
                To grow KPX Academy into a trusted learning platform where
                people can access practical knowledge, develop valuable skills,
                and discover opportunities for personal and business growth. We
                aspire to reach more learners, expand our programmes, and build
                a community where learning leads to action, creativity, and
                continuous improvement.
              </p>
            </article>
          </div>
        </Container>
      </section>

      {/* Core values */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionTitle
            eyebrow="What guides us"
            title="The values behind every learning experience."
            description="These principles shape how we approach our training, support our learners, and build KPX Academy for the future."
          />

          <div className="mt-12 border-t border-[#212529]/15">
            {values.map((value) => (
              <article
                key={value.number}
                className="grid gap-4 border-b border-[#212529]/15 py-7 sm:grid-cols-[5rem_0.8fr_1.2fr] sm:gap-8 sm:py-9"
              >
                <span className="text-sm font-bold tracking-widest text-[#8B1E5A]">
                  {value.number}
                </span>

                <h3 className="text-xl font-bold sm:text-2xl">{value.title}</h3>

                <p className="text-base leading-7 text-[#212529]/70">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Learning and support */}
      <section className="bg-[#F4DCD6] py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <Eyebrow>Learning with purpose</Eyebrow>

              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                More than learning a skill. Building the confidence to use it.
              </h2>

              <p className="mt-6 leading-8 text-[#212529]/75">
                Our commitment is to detailed, practical training that helps
                learners understand what they learn, build their abilities
                through practice, and move forward with greater confidence.
                Whether learning online or in person, we want students to
                receive meaningful value from their training.
              </p>

              <p className="mt-4 leading-8 text-[#212529]/75">
                We recognise that learning does not look the same for everyone.
                Our goal is to create opportunities for people at different
                stages of their journey, from exploring a new interest to
                developing skills for a business.
              </p>
            </div>

            <div className="self-center">
              <h3 className="text-xl font-bold sm:text-2xl">
                A platform for practical possibilities
              </h3>

              <p className="mt-3 leading-7 text-[#212529]/70">
                We bring different skill-based learning opportunities together
                under one platform.
              </p>

              <ul className="mt-7 divide-y divide-[#212529]/15 border-y border-[#212529]/15">
                {learningAreas.map((area, index) => (
                  <li key={area} className="flex items-start gap-4 py-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#8B1E5A] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium leading-6 text-[#212529]/85 sm:text-base">
                      {area}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-[#8B1E5A] py-20 text-white sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow light>Your next chapter starts here</Eyebrow>

            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Discover what you can do with the right skills.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              Whether you are exploring a new interest, developing your
              creativity, or preparing to build a business, your next
              opportunity could begin with what you learn today.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/programs"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-[#8B1E5A] transition hover:bg-[#F4DCD6]"
              >
                Explore our programmes
              </Link>

              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/50 px-8 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Start your learning journey
              </Link>
            </div>

            <p className="mt-10 text-sm font-semibold tracking-wide text-white/75">
              KPX Academy — Practical Skills. More Possibilities.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
