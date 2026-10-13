import { HeroActions } from "./HeroActions";

export const HeroContent = () => {
  return (
    <div className="relative z-10 max-w-xl">
      <p className="mb-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-secondary"
        />
        Learn with purpose
      </p>

      <h1 className="font-heading text-4xl font-semibold leading-[1.12] tracking-tight text-primary sm:text-5xl lg:text-6xl">
        Practical Skills.
        <span className="mt-2 block text-secondary">
          More Possibilities.
        </span>
      </h1>

      <p className="mt-6 max-w-lg text-base leading-8 text-text-muted sm:text-lg">
        Build useful skills through practical training, detailed guidance,
        and learning experiences designed to help you put knowledge to work.
      </p>

      <div className="mt-8">
        <HeroActions />
      </div>

      <p className="mt-6 text-sm leading-6 text-text-muted">
        Practical Knowledge. Detailed Training. Real Value.
      </p>
    </div>
  );
};
