import { Link } from "react-router-dom";
import { Container } from "../../ui/Container";

const galleryThemes = [
  {
    number: "01",
    title: "Beauty & Formulation",
    description:
      "Explore the world of beauty, product formulation, and hands-on creative learning.",
    className: "bg-[#F3D7CC]",
    accentClassName: "text-[#17324D]",
    label: "BEAUTY",
  },
  {
    number: "02",
    title: "Creative Skills",
    description:
      "Discover the possibilities of resin art, crafts, and creative expression.",
    className: "bg-[#E8EDE8]",
    accentClassName: "text-[#17324D]",
    label: "CREATIVITY",
  },
  {
    number: "03",
    title: "Trade & Entrepreneurship",
    description:
      "Build your understanding of sourcing, importation, and commercial opportunities.",
    className: "bg-[#17324D]",
    accentClassName: "text-white",
    label: "COMMERCE",
  },
];

export const GalleryPreview = () => {
  return (
    <section
      aria-labelledby="gallery-preview-heading"
      className="bg-[#F7F5F0] py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Learning in Practice
            </span>

            <h2
              id="gallery-preview-heading"
              className="mt-4 font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl"
            >
              Knowledge is powerful. Putting it into practice matters.
            </h2>
          </div>

          <p className="max-w-md leading-7 text-text-muted">
            From creative projects to practical product knowledge and commercial
            skills, discover the different areas of learning at KPX Academy.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {galleryThemes.map((theme) => (
            <article
              key={theme.number}
              className={`flex min-h-[320px] flex-col justify-between rounded-card p-6 sm:min-h-[360px] sm:p-8 ${theme.className}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`text-xs font-semibold tracking-[0.18em] ${theme.accentClassName}`}
                >
                  {theme.label}
                </span>

                <span
                  aria-hidden="true"
                  className={`font-heading text-sm ${theme.accentClassName} opacity-70`}
                >
                  {theme.number}
                </span>
              </div>

              <div>
                <h3
                  className={`font-heading text-2xl font-semibold leading-snug ${theme.accentClassName}`}
                >
                  {theme.title}
                </h3>

                <p
                  className={`mt-3 max-w-sm text-sm leading-7 ${theme.accentClassName} opacity-80`}
                >
                  {theme.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[#DCE2E5] pt-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-6 text-text-muted">
            Explore the Academy’s learning areas and see how practical knowledge
            can open up new possibilities.
          </p>

          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 font-semibold text-secondary transition-colors hover:text-primary"
          >
            Explore the gallery
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
};
