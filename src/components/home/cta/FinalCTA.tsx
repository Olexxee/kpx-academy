import { Link } from "react-router-dom";
import { Container } from "../../ui/Container";

export const FinalCTA = () => {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="bg-background py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="relative overflow-hidden rounded-card bg-[#1D4ED8] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          {/* Restrained decorative accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 right-20 h-40 w-40 rounded-full border border-[#F4DCD6]/40 sm:h-56 sm:w-56"
          />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F4DCD6] sm:text-sm">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#F4DCD6]"
              />
              Your next step starts here
            </span>

            <h2
              id="final-cta-heading"
              className="mt-5 font-heading text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-6xl"
            >
              Ready to explore what you can learn?
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Discover practical training, explore your interests, and take the
              first step towards developing new skills with KPX Academy.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/programs"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-[#8B1E5A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8D8D3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D4ED8]"
              >
                Explore Programmes
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                to="/about"
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8D8D3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1D4ED8]"
              >
                Discover KPX Academy
              </Link>
            </div>

            <p className="mt-6 font-heading text-sm font-medium tracking-wide text-[#F4DCD6]">
              Practical Skills. More Possibilities.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};
