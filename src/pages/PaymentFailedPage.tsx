import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";

export const PaymentFailedPage = () => {
  return (
    <section className="min-h-[65vh] bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            KPX Academy
          </p>

          <div className="mt-7 text-5xl" aria-hidden="true">
            !
          </div>

          <h1 className="mt-5 font-heading text-3xl font-bold text-primary sm:text-4xl">
            Checkout not completed
          </h1>

          <p className="mt-4 leading-7 text-text-muted">
            You have returned without completing the checkout flow. Your payment
            status has not been verified on this page.
          </p>

          <p className="mt-3 leading-7 text-text-muted">
            If you completed a payment or money was deducted, check your payment
            confirmation before attempting another transaction.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="rounded-control bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            >
              Return to registration
            </Link>

            <Link
              to="/"
              className="rounded-control border border-border px-6 py-3 font-semibold text-primary transition hover:bg-background"
            >
              Return home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};
