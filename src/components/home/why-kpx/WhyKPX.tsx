import { Container } from "../../ui/Container";

const reasons = [
  {
    number: "01",
    title: "Practical by design",
    description:
      "Focus on useful knowledge and skills that you can develop through your chosen training programme.",
  },
  {
    number: "02",
    title: "Detailed learning",
    description:
      "Explore your subject through structured training designed to help you build understanding step by step.",
  },
  {
    number: "03",
    title: "Different paths to explore",
    description:
      "Discover learning opportunities across beauty and formulation, creative skills, and trade and entrepreneurship.",
  },
  {
    number: "04",
    title: "Learning with purpose",
    description:
      "Choose training that aligns with your interests and the skills you want to develop.",
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
              The right learning experience starts with clear knowledge,
              thoughtful training, and the opportunity to develop skills
              relevant to your interests.
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
