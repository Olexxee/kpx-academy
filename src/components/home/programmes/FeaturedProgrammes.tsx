import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTrainingPrograms } from "../../../features/training/hooks/useTrainingPrograms";
import { useTrainingMedia } from "../../../features/training/hooks/useTrainingMedia";
import { formatPrice } from "../../../features/training/utils/format";
import { getPrimaryImage } from "../../../features/training/utils/media";
import type { TrainingProgram } from "../../../features/training/types";
import { Container } from "../../ui/Container";

export const FeaturedProgrammes = () => {
  const { data: programmes, isLoading, isError } = useTrainingPrograms();

  const featured = useMemo(() => {
    const active = (programmes ?? []).filter((program) => program.active);
    // Shuffle a copy so each homepage load gets a varied selection without
    // mutating the React Query cache or reshuffling on every render.
    const shuffled = [...active];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled.slice(0, 4);
  }, [programmes]);

  return (
    <section
      aria-labelledby="featured-programmes-heading"
      className="bg-white py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Explore Our Trainings
            </span>

            <h2
              id="featured-programmes-heading"
              className="mt-4 font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl"
            >
              Find a skill worth learning.
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-text-muted">
              Explore our available training programmes and discover where your next
              learning journey could begin.
            </p>
          </div>

          <Link
            to="/programs"
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-secondary transition-colors hover:text-primary"
          >
            View all programmes
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div
            aria-label="Loading featured programmes"
            aria-busy="true"
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-card border border-border"
              >
                <div className="aspect-[4/3] bg-neutral" />
                <div className="space-y-4 p-6">
                  <div className="h-4 w-1/3 rounded bg-neutral" />
                  <div className="h-6 w-3/4 rounded bg-neutral" />
                  <div className="h-4 rounded bg-neutral" />
                  <div className="h-4 w-2/3 rounded bg-neutral" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="mt-10 border-y border-border py-10">
            <h3 className="font-heading text-lg font-semibold text-primary">
              Programmes are temporarily unavailable.
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Please try again later or explore the full programmes page.
            </p>
            <Link
              to="/programs"
              className="mt-4 inline-flex font-semibold text-secondary hover:text-primary"
            >
              Browse programmes →
            </Link>
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-10 border-y border-border py-10">
            <h3 className="font-heading text-lg font-semibold text-primary">
              New learning opportunities are on the way.
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Visit our programmes page to explore the training currently
              available.
            </p>
            <Link
              to="/programs"
              className="mt-4 inline-flex font-semibold text-secondary hover:text-primary"
            >
              Explore programmes →
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
            {featured.map((program: TrainingProgram) => (
              <FeaturedProgrammeCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

function FeaturedProgrammeCard({ program }: { program: TrainingProgram }) {
  const { data: media } = useTrainingMedia(program.id);

  const image = getPrimaryImage(media ?? program.media);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white transition-shadow duration-200 hover:shadow-md">
      <Link
        to={`/programs/${program.slug}`}
        aria-label={`View ${program.title}`}
        className="block overflow-hidden bg-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={program.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#F4DCD6] px-6 text-center">
              <span className="font-heading text-xl font-semibold text-primary">
                KPX Academy
              </span>
            </div>
          )}

          {program.featured && (
            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-secondary">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
          {program.duration || "Training programme"}
        </p>

        <h3 className="mt-3 font-heading text-xl font-semibold leading-snug text-primary">
          <Link
            to={`/programs/${program.slug}`}
            className="transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {program.title}
          </Link>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-7 text-text-muted">
          {program.shortDescription ||
            "Explore this programme to learn more about its content and training details."}
        </p>

        <div className="mt-6 flex items-end justify-between gap-3 border-t border-border pt-5">
          <div>
            <p className="text-xs text-text-muted">Programme fee</p>
            <p className="mt-1 font-heading text-lg font-semibold text-primary">
              {formatPrice(program.price, program.currency)}
            </p>
          </div>

          <Link
            to={`/programs/${program.slug}`}
            className="inline-flex min-h-10 items-center justify-center rounded-control bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
