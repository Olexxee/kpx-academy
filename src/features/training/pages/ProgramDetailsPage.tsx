import { Link, useParams } from "react-router-dom";
import { Container } from "../../../components/ui/Container";
import { useTrainingProgram } from "../hooks/useTrainingPrograms";
import { useTrainingMedia } from "../hooks/useTrainingMedia";
import type { ProgramMedia } from "../types";

const formatPrice = (value: number | string, currency = "NGN") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Price unavailable";

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-NG")}`;
  }
};

const formatDeliveryMode = (mode: string) => {
  switch (mode) {
    case "PHYSICAL":
      return "In-person training";
    case "ONLINE":
      return "Online training";
    case "HYBRID":
      return "Hybrid training";
    default:
      return mode;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const isImageMedia = (media: ProgramMedia) =>
  media.type === "IMAGE" || media.mimeType?.startsWith("image/");

const isVideoMedia = (media: ProgramMedia) =>
  media.type === "VIDEO" || media.mimeType?.startsWith("video/");

const getOrderedMedia = (media: ProgramMedia[]) =>
  [...media].sort(
    (a, b) =>
      Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
  );

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-border py-4 last:border-b-0">
    <p className="text-sm text-text-muted">{label}</p>
    <p className="mt-1 font-semibold text-primary">{value}</p>
  </div>
);

export const ProgramDetailsPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const {
    data: program,
    isLoading,
    isError,
    refetch,
  } = useTrainingProgram(slug);

  const { data: fetchedMedia, isError: isMediaError } = useTrainingMedia(
    program?.id,
  );

  if (isLoading) {
    return (
      <section className="bg-background py-24">
        <Container>
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-4 w-32 rounded bg-border" />
            <div className="mt-8 h-12 max-w-2xl rounded bg-border" />
            <div className="mt-5 h-5 max-w-xl rounded bg-border" />
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
              <div className="aspect-[4/3] rounded-card bg-border" />
              <div className="h-72 rounded-card bg-surface" />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (isError || !program) {
    return (
      <section className="bg-background py-24">
        <Container>
          <div className="mx-auto max-w-2xl py-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              KPX Academy
            </p>

            <h1 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
              Programme unavailable
            </h1>

            <p className="mx-auto mt-4 max-w-lg leading-7 text-text-muted">
              {isError
                ? "We couldn't load this programme. Please try again."
                : "This programme could not be found. It may have been removed or the link may be incorrect."}
            </p>

            {isError && (
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-7 rounded-control bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                Try again
              </button>
            )}

            <div>
              <Link
                to="/programs"
                className="mt-5 inline-flex font-semibold text-secondary underline-offset-4 hover:underline"
              >
                Browse all programmes
              </Link>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const media = getOrderedMedia(fetchedMedia ?? program.media ?? []);

  const images = media.filter(isImageMedia);
  const primaryImage = images.find((item) => item.isPrimary) ?? images[0];

  const highlights = program.highlights ?? [];
  const curriculum = program.curriculum ?? [];
  const requirements = program.requirements ?? [];
  const benefits = program.benefits ?? [];

  const startDate = formatDate(program.startDate);
  const endDate = formatDate(program.endDate);
  const deadline = formatDate(program.registrationDeadline);

  const registrationUrl = `/register?program=${encodeURIComponent(program.id)}`;
  const isRegistrationOpen =
    program.active &&
    (!program.registrationDeadline ||
      new Date(program.registrationDeadline).getTime() >= Date.now());

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 py-4 text-sm text-text-muted"
          >
            <Link to="/" className="hover:text-secondary">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/programs" className="hover:text-secondary">
              Programmes
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-primary" aria-current="page">
              {program.title}
            </span>
          </nav>
        </Container>
      </div>

      {/* Programme introduction */}
      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)] lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                KPX Academy · Training Programme
              </p>

              <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">
                {program.title}
              </h1>

              {program.shortDescription && (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-text-muted sm:text-xl">
                  {program.shortDescription}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-primary">
                  {formatDeliveryMode(program.deliveryMode)}
                </span>

                {program.duration && (
                  <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-primary">
                    {program.duration}
                  </span>
                )}
              </div>

              {program.description && (
                <div className="mt-9 max-w-2xl">
                  <h2 className="font-heading text-xl font-bold text-primary">
                    About this programme
                  </h2>
                  <p className="mt-4 whitespace-pre-line leading-8 text-text-muted">
                    {program.description}
                  </p>
                </div>
              )}
            </div>

            {/* Registration panel */}
            <aside className="overflow-hidden rounded-card border border-border bg-surface">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={program.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-end bg-primary p-7">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                      KPX Academy
                    </p>
                    <p className="mt-3 font-heading text-2xl font-bold text-white">
                      Practical Skills. More Possibilities.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-7">
                <p className="text-sm text-text-muted">Programme fee</p>
                <p className="mt-2 font-heading text-3xl font-bold text-primary">
                  {formatPrice(program.price, program.currency)}
                </p>

                <div className="mt-5">
                  {startDate && <InfoItem label="Starts" value={startDate} />}
                  {endDate && <InfoItem label="Ends" value={endDate} />}
                  {deadline && (
                    <InfoItem label="Registration deadline" value={deadline} />
                  )}
                  {program.location && (
                    <InfoItem label="Location" value={program.location} />
                  )}
                  {typeof program.capacity === "number" && (
                    <InfoItem
                      label="Programme capacity"
                      value={String(program.capacity)}
                    />
                  )}
                </div>

                {isRegistrationOpen ? (
                  <Link
                    to={registrationUrl}
                    className="mt-6 flex w-full items-center justify-center rounded-control bg-primary px-6 py-3.5 text-center font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                  >
                    Register for this programme
                  </Link>
                ) : (
                  <p className="mt-6 rounded-control bg-background px-4 py-3 text-center text-sm font-semibold text-text-muted">
                    Registration is currently unavailable.
                  </p>
                )}

                <p className="mt-4 text-center text-sm leading-6 text-text-muted">
                  Registration and payment are handled through our secure
                  enrolment process. Training delivery instructions are provided
                  after the required verification.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Programme highlights */}
      {highlights.length > 0 && (
        <section className="border-y border-border bg-surface py-14 sm:py-16">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                What you will explore
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
                Programme highlights
              </h2>
            </div>

            <ul className="mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight, index) => (
                <li key={`${highlight}-${index}`} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary"
                  >
                    ✓
                  </span>
                  <span className="leading-7 text-text">{highlight}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Curriculum */}
      {curriculum.length > 0 && (
        <section className="py-14 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Learning outline
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
                What the programme covers
              </h2>
              <p className="mt-4 leading-7 text-text-muted">
                Explore the topics included in this programme.
              </p>
            </div>

            <ol className="mt-8 max-w-4xl divide-y divide-border border-y border-border">
              {curriculum.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-5 py-5 sm:gap-7"
                >
                  <span className="font-heading text-lg font-bold text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="leading-7 text-text">{item}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* Requirements and benefits */}
      {(requirements.length > 0 || benefits.length > 0) && (
        <section className="border-y border-border bg-surface py-14 sm:py-20">
          <Container>
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              {requirements.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-primary">
                    What you need
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {requirements.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex gap-3 leading-7 text-text-muted"
                      >
                        <span className="text-secondary" aria-hidden="true">
                          •
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {benefits.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-primary">
                    What is included
                  </h2>
                  <ul className="mt-6 space-y-4">
                    {benefits.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex gap-3 leading-7 text-text-muted"
                      >
                        <span className="text-secondary" aria-hidden="true">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Gallery */}
      {media.length > 0 && !isMediaError && (
        <section className="py-14 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                Inside the programme
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">
                Programme gallery
              </h2>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-card border border-border bg-surface"
                >
                  {isImageMedia(item) ? (
                    <img
                      src={item.url}
                      alt={`${program.title} gallery`}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : isVideoMedia(item) ? (
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      className="aspect-[4/3] w-full bg-primary object-cover"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-background p-6 text-sm text-text-muted">
                      Media preview unavailable
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Final call to action */}
      <section className="bg-primary py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              KPX Academy
            </p>
            <h2 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to explore this programme?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
              Review the programme details and continue to registration when you
              are ready.
            </p>

            {isRegistrationOpen && (
              <Link
                to={registrationUrl}
                className="mt-8 inline-flex items-center justify-center rounded-control bg-white px-7 py-3.5 font-semibold text-primary transition hover:bg-[#F3D7CC] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
              >
                Continue to registration
              </Link>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};
