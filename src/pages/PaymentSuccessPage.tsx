import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { verifyPayment } from "../features/payment/payments.api";

type VerificationState =
  | "verifying"
  | "success"
  | "pending"
  | "failed"
  | "error";

export const PaymentSuccessPage = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");

  const [status, setStatus] = useState<VerificationState>("verifying");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!reference) {
        setStatus("failed");
        return;
      }

      setStatus("verifying");

      try {
        const result = await verifyPayment(reference);

        if (cancelled) return;

        if (
          result.status === "SUCCESS" &&
          result.registrationStatus === "PAID"
        ) {
          setStatus("success");
        } else if (result.status === "PENDING") {
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [reference, attempt]);

  const retryVerification = () => {
    setStatus("verifying");
    setAttempt((current) => current + 1);
  };

  return (
    <section className="min-h-[65vh] bg-background py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl rounded-card border border-border bg-surface px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
            KPX Academy
          </p>

          {status === "verifying" && (
            <>
              <div
                className="mx-auto mt-8 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-secondary"
                role="status"
                aria-label="Verifying payment"
              />
              <h1 className="mt-6 font-heading text-3xl font-bold text-primary">
                Verifying your payment
              </h1>
              <p className="mt-4 leading-7 text-text-muted">
                Please wait while we confirm your transaction with the payment
                provider.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mt-7 text-5xl" aria-hidden="true">
                ✓
              </div>
              <h1 className="mt-5 font-heading text-3xl font-bold text-primary sm:text-4xl">
                Registration successful
              </h1>
              <p className="mt-4 leading-7 text-text-muted">
                Your payment has been confirmed and your registration is
                complete.
              </p>
              <p className="mt-3 leading-7 text-text-muted">
                Please check your email for further instructions. Any training
                access details will be provided through the official onboarding
                process.
              </p>

              {reference && (
                <p className="mt-6 break-all rounded-control bg-background p-4 font-mono text-xs text-text-muted">
                  Payment reference: {reference}
                </p>
              )}

              <Link
                to="/"
                className="mt-8 inline-flex rounded-control bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                Return home
              </Link>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="mt-7 text-5xl" aria-hidden="true">
                …
              </div>
              <h1 className="mt-5 font-heading text-3xl font-bold text-primary">
                Payment is still being confirmed
              </h1>
              <p className="mt-4 leading-7 text-text-muted">
                The payment provider has not yet returned a confirmed result.
                Your registration should not be treated as paid until
                verification succeeds.
              </p>

              {reference && (
                <p className="mt-6 break-all rounded-control bg-background p-4 font-mono text-xs text-text-muted">
                  Payment reference: {reference}
                </p>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={retryVerification}
                  className="rounded-control bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                >
                  Check again
                </button>
                <Link
                  to="/"
                  className="rounded-control border border-border px-6 py-3 font-semibold text-primary transition hover:bg-background"
                >
                  Return home
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="mt-8 font-heading text-3xl font-bold text-primary">
                We couldn't verify your payment
              </h1>
              <p className="mt-4 leading-7 text-text-muted">
                We couldn't reach the verification service. This does not
                necessarily mean your payment failed. Please retry verification
                before attempting another payment.
              </p>

              {reference && (
                <p className="mt-6 break-all rounded-control bg-background p-4 font-mono text-xs text-text-muted">
                  Payment reference: {reference}
                </p>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={retryVerification}
                  className="rounded-control bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary"
                >
                  Retry verification
                </button>
                <Link
                  to="/"
                  className="rounded-control border border-border px-6 py-3 font-semibold text-primary hover:bg-background"
                >
                  Return home
                </Link>
              </div>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="mt-7 text-5xl" aria-hidden="true">
                !
              </div>
              <h1 className="mt-5 font-heading text-3xl font-bold text-primary">
                Payment not confirmed
              </h1>
              <p className="mt-4 leading-7 text-text-muted">
                We couldn't confirm a successful payment. If money was deducted,
                contact the academy with your payment reference before trying
                another payment.
              </p>

              {reference && (
                <p className="mt-6 break-all rounded-control bg-background p-4 font-mono text-xs text-text-muted">
                  Payment reference: {reference}
                </p>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-control bg-primary px-6 py-3 font-semibold text-white transition hover:bg-secondary"
                >
                  Return to registration
                </Link>
                <Link
                  to="/"
                  className="rounded-control border border-border px-6 py-3 font-semibold text-primary hover:bg-background"
                >
                  Return home
                </Link>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
};
