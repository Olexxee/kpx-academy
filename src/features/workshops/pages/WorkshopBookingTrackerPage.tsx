import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { Container } from "../../../components/ui/Container";
import { requestGuestWorkshopAccessCode, verifyGuestWorkshopAccessCode } from "../api";

const fieldClass = "mt-2 min-h-12 w-full rounded-control border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";

export const WorkshopBookingTrackerPage = () => {
  const navigate = useNavigate();
  const [reference, setReference] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const requestMutation = useMutation({
    mutationFn: requestGuestWorkshopAccessCode,
    onSuccess: (result) => setChallengeToken(result.challengeToken),
  });
  const verifyMutation = useMutation({
    mutationFn: () => verifyGuestWorkshopAccessCode({ reference, challengeToken, code }),
    onSuccess: (result) => navigate(result.accessUrlPath, { replace: true }),
  });
  const requestCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    requestMutation.mutate(reference.trim().toUpperCase());
  };
  const verifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    verifyMutation.mutate();
  };

  return (
    <section className="min-h-[70vh] bg-background py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-xl rounded-card border border-border bg-white p-6 shadow-sm sm:p-10">
          <Link to="/workshops/book" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"><ArrowLeft size={16} /> Creative workshops</Link>
          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4DCD6] text-secondary">{challengeToken ? <MailCheck size={24} /> : <ShieldCheck size={24} />}</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-secondary">KPX Academy · Guest access</p>
          <h1 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">Track your workshop booking</h1>
          <p className="mt-4 text-sm leading-7 text-text-muted">Enter the booking reference you received after submitting your request. We’ll send a one-time verification code to the email address registered with that booking.</p>
          {!challengeToken ? (
            <form onSubmit={requestCode} className="mt-8 space-y-5">
              <div><label htmlFor="booking-reference" className="block text-sm font-semibold text-text">Booking reference</label><input id="booking-reference" value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="KPX-WKS-XXXXXXXXXX" autoComplete="off" required minLength={8} maxLength={80} className={fieldClass} /></div>
              <button type="submit" disabled={requestMutation.isPending || !reference.trim()} className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50">{requestMutation.isPending ? "Checking reference…" : "Send verification code"}</button>
              {requestMutation.isError && <p role="alert" className="text-sm text-red-700">{requestMutation.error instanceof Error ? requestMutation.error.message : "We couldn’t process that request. Please try again."}</p>}
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-8 space-y-5">
              <div className="rounded-control bg-background p-4"><p className="text-sm font-semibold text-primary">Check your email</p><p className="mt-1 text-sm leading-6 text-text-muted">If the reference is valid, a six-digit code has been sent to the email address on the booking. The code expires in five minutes.</p></div>
              <div><label htmlFor="verification-code" className="block text-sm font-semibold text-text">Six-digit verification code</label><input id="verification-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required className={fieldClass + " text-center text-2xl font-bold tracking-[0.45em]"} /></div>
              <button type="submit" disabled={verifyMutation.isPending || code.length !== 6} className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50">{verifyMutation.isPending ? "Verifying…" : "Verify and view booking"}</button>
              {verifyMutation.isError && <p role="alert" className="text-sm text-red-700">{verifyMutation.error instanceof Error ? verifyMutation.error.message : "That code could not be verified. Request a new code and try again."}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><button type="button" onClick={() => { setChallengeToken(""); setCode(""); requestMutation.reset(); verifyMutation.reset(); }} className="font-semibold text-secondary underline">Request a new code</button><span className="text-text-muted">Reference: {reference.trim().toUpperCase()}</span></div>
            </form>
          )}
          <p className="mt-8 border-t border-border pt-5 text-xs leading-6 text-text-muted">For your protection, the booking reference alone never reveals booking details. Verification codes are single-use and expire after five minutes.</p>
        </div>
      </Container>
    </section>
  );
};
