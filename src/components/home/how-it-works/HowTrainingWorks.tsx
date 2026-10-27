import { Container } from "../../ui/Container";

const steps = [
  {
    number: "01",
    title: "Choose what you want to learn",
    description:
      "Explore our available training programmes and select the one that aligns with your interests, learning goals, or business aspirations. Review the program details to understand what the training offers before proceeding.",
    icon: "compass",
  },
  {
    number: "02",
    title: "Complete your registration",
    description:
      "Fill out the registration form with your full name and a valid email address. Ensure your name is entered correctly as you want it to appera on your certificate, and provide an email address you can access to recieve your enrolment confirmation and class access instructions.",
    icon: "clipboard-check",
  },
  {
    number: "03",
    title: "Complete your payment",
    description:
      "Review the applicable programme fee and follow the payment  instructions provided on the website. Once your payment has been verified, your enrolment will be confirmed",
    icon: "shield-check",
  },
  {
    number: "04",
    title: "Begin your learning journey",
    description:
      "Check your email for your enrolment confirmation and instructions for accessing your training. Follow the information provided to join your class and begin your learning journey.",
    icon: "graduation-cap",
  },
];

const StepIcon = ({ name }: { name: string }) => {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "compass":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m16.2 7.8-2.7 5.7-5.7 2.7 2.7-5.7 5.7-2.7Z" />
        </svg>
      );

    case "clipboard-check":
      return (
        <svg {...commonProps}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4.5V3h6v1.5M8.5 12l2.2 2.2 4.8-4.8" />
        </svg>
      );

    case "shield-check":
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" />
          <path d="M6 12v5c3.5 3 8.5 3 12 0v-5" />
        </svg>
      );
  }
};

export const HowTrainingWorks = () => {
  return (
    <section
      aria-labelledby="how-training-works-heading"
      className="bg-background py-16 sm:py-20 lg:py-28"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            How It Works
          </span>

          <h2
            id="how-training-works-heading"
            className="mt-4 font-heading text-3xl font-semibold leading-tight text-primary sm:text-4xl lg:text-5xl"
          >
            From choosing a skill to getting started.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-muted sm:text-lg">
            Getting started with KPX Academy is straightforward. Follow these
            four steps to register for your chosen training and begin your
            learning journey.
          </p>
        </div>

        <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative flex flex-col rounded-card border border-border bg-white p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-control bg-[#F4DCD6] text-secondary">
                  <StepIcon name={step.icon} />
                </div>

                <span className="font-heading text-sm font-semibold tracking-wider text-secondary">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-7 font-heading text-lg font-semibold leading-snug text-primary">
                {step.title}
              </h3>

              <p className="mt-3 flex-1 text-sm leading-7 text-text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-3 border-l-2 border-secondary bg-white/70 px-5 py-4 sm:items-center">
          <span className="mt-0.5 shrink-0 text-secondary sm:mt-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 11v5M12 7h.01" />
            </svg>
          </span>

          <p className="text-sm leading-6 text-text-muted">
            <span className="font-semibold text-primary">
              Your access matters.
            </span>{" "}
            Onboarding instructions are provided after payment
            verification.
          </p>
        </div>
      </Container>
    </section>
  );
};
