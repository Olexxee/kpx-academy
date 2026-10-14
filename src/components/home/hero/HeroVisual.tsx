export const HeroVisual = () => {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
      <div
        aria-hidden="true"
        className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-accent-blush/70 sm:-right-7 sm:-top-7 sm:h-40 sm:w-40"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-5 h-28 w-28 rounded-full bg-accent-blush sm:-bottom-7 sm:-left-7 sm:h-36 sm:w-36"
      />

      <div className="relative overflow-hidden rounded-card border border-border bg-white p-2 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85"
          alt="A learner working with digital learning materials"
          className="aspect-[4/4.5] w-full rounded-[10px] object-cover sm:aspect-[5/4.5] lg:aspect-[4/5]"
          fetchPriority="high"
        />

        <div className="absolute inset-x-5 bottom-5 rounded-control border border-white/40 bg-white/95 p-4 shadow-lg sm:inset-x-7 sm:bottom-7 sm:p-5">
          <p className="font-heading text-sm font-semibold text-primary sm:text-base">
            Learn it. Build with it.
          </p>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Practical knowledge for real-world possibilities.
          </p>
        </div>
      </div>
    </div>
  );
};
