import { Link } from "react-router-dom";
import { Container } from "../../ui/Container";

const workshopCards = [
  {
    number: "01",
    type: "RESIN_ART",
    title: "Resin Art",
    description: "Turn colour, texture, and imagination into a hands-on creative experience for your group.",
    tone: "bg-[#F4DCD6]",
    text: "text-primary",
  },
  {
    number: "02",
    type: "LIP_CARE_FORMULATION",
    title: "Lip-care Formulation",
    description: "Explore the craft of creating lip-care products in a practical, guided group session.",
    tone: "bg-white",
    text: "text-primary",
  },
  {
    number: "03",
    type: "CUSTOM_GROUP",
    title: "Custom Group Workshops",
    description: "Planning a team activity, celebration, or special gathering? We can shape a session around your group.",
    tone: "bg-[#1D4ED8]",
    text: "text-white",
  },
];

export const CreativeWorkshopsPreview = () => (
  <section aria-labelledby="creative-workshops-heading" className="bg-[#FAF8F5] py-16 sm:py-20 lg:py-28">
    <Container>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Create together</p>
          <h2 id="creative-workshops-heading" className="mt-4 font-heading text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
            A different kind of event—made by you.
          </h2>
        </div>
        <p className="max-w-xl leading-7 text-text-muted">
          Give your team, friends, or community a shared experience with practical creative workshops led by KPX Academy. Choose resin art, lip-care formulation, or a custom group session.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14">
        {workshopCards.map((workshop) => (
          <article key={workshop.number} className={`flex min-h-[290px] flex-col justify-between rounded-card p-6 sm:p-8 ${workshop.tone}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-[0.16em] ${workshop.text}`}>KPX Creative Workshop</span>
              <span aria-hidden="true" className={`font-heading text-sm opacity-60 ${workshop.text}`}>{workshop.number}</span>
            </div>
            <div className="mt-12">
              <h3 className={`font-heading text-2xl font-bold ${workshop.text}`}>{workshop.title}</h3>
              <p className={`mt-3 text-sm leading-7 opacity-80 ${workshop.text}`}>{workshop.description}</p>
              <Link
                to={`/workshops/book?type=${workshop.type}`}
                className={`mt-5 inline-flex min-h-10 items-center text-sm font-semibold underline underline-offset-4 transition hover:opacity-75 ${workshop.text}`}
              >
                Book this workshop <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-text-muted">Tell us your preferred date, group size, and venue. We’ll review the details with you before confirming your event.</p>
        <Link to="/workshops/book" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-control bg-secondary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
          Book a creative workshop <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Container>
  </section>
);
