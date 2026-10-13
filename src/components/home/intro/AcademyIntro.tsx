import { Container } from "../../ui/Container";

export const AcademyIntro = () => {
  return (
    <section
      aria-labelledby="academy-intro-heading"
      className="bg-white py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Section label */}
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-secondary"
              />
              Welcome to KPX Academy
            </span>

            <h2
              id="academy-intro-heading"
              className="mt-5 max-w-md font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl"
            >
              Learning that moves you forward.
            </h2>
          </div>

          {/* Introduction content */}
          <div className="max-w-2xl lg:pt-8">
            <p className="text-lg leading-8 text-text-muted sm:text-xl sm:leading-9">
              At KPX Academy, we believe learning should go beyond theory. Our
              focus is on practical knowledge and detailed training that help
              learners develop useful skills and explore new possibilities.
            </p>

            <p className="mt-5 leading-7 text-text-muted">
              Whether you are building your knowledge or developing a new
              capability, our programmes are designed around learning with
              purpose and putting knowledge into practice.
            </p>

            <div className="mt-8 border-l-2 border-secondary pl-5">
              <p className="font-heading text-base font-semibold text-primary sm:text-lg">
                Learn It. Build With It.
              </p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Practical Knowledge. Detailed Training. Real Value.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
