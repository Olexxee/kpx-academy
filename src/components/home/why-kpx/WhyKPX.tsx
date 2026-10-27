import { Container } from "../../ui/Container";

const reasons = [
  {
    number: "01",
    title: "Practical Learning",
    description:
      " We focus on useful knowledge and practical skills that learners can develop and apply beyond the training.",
  },
  {
    number: "02",
    title: "Detailed Instructions",
    description:
      "We breakdown concepts and processes into clear, structured lessons to support understanding and skill developemnt.",
  },
  {
    number: "03",
    title: "Relevant Learning Opportunities",
    description:
      "We offer trainning across creative, beauty, and enterpreneurial fields, giving learners different paths to explore their interests.",
  },
  {
    number: "04",
    title: "Growth and Empowerment",
    description:
      "We encourage learners to build confidence in thier abilities, strengthen their skills, and explore opportunities for personal and business growth.",
  },
];

export const WhyKPX = () => {
  return (
    <section
      aria-labelledby="why-kpx-heading"
      className="bg-white py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-secondary"
              />
              The KPX Approach
            </span>

            <h2
              id="why-kpx-heading"
              className="mt-5 max-w-lg font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl"
            >
              More than learning. Knowledge with purpose.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-8 text-text-muted">
              Our approach combines practical knowledge, detailed intruction, and valuable learning experiences to help learners develop usefull skills and grow with confidence.
            </p>

            <div className="mt-8 border-l-2 border-secondary pl-5">
              <p className="font-heading text-lg font-semibold text-primary">
                Practical Knowledge.
              </p>
              <p className="mt-1 font-heading text-lg font-semibold text-primary">
                Detailed Training.
              </p>
              <p className="mt-1 font-heading text-lg font-semibold text-primary">
                Real Value.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#DCE2E5] border-t border-[#DCE2E5]">
            {reasons.map((reason) => (
              <article
                key={reason.number}
                className="grid gap-3 py-7 sm:grid-cols-[64px_1fr] sm:gap-5 sm:py-8"
              >
                <span className="font-heading text-sm font-semibold tracking-wider text-secondary">
                  {reason.number}
                </span>

                <div>
                  <h3 className="font-heading text-xl font-semibold text-primary sm:text-2xl">
                    {reason.title}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-text-muted sm:text-base">
                    {reason.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
