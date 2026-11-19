import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import { Container } from "../../../components/ui/Container";
import { requestGuestSouvenirEnquiryAccessCode, verifyGuestSouvenirEnquiryAccessCode } from "../api";

const field = "mt-2 min-h-12 w-full rounded-control border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";

export const SouvenirEnquiryTrackerPage = () => {
  const navigate = useNavigate();
  const [reference, setReference] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const request = useMutation({ mutationFn: requestGuestSouvenirEnquiryAccessCode, onSuccess: (result) => setChallengeToken(result.challengeToken) });
  const verify = useMutation({
    mutationFn: () => verifyGuestSouvenirEnquiryAccessCode({ reference, challengeToken, code }),
    onSuccess: (result) => navigate(result.accessUrlPath, { replace: true }),
  });
  const submitReference = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); request.mutate(reference.trim().toUpperCase()); };
  const submitCode = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); verify.mutate(); };
  return <section className="min-h-[70vh] bg-background py-14 sm:py-20"><Container><div className="mx-auto max-w-xl rounded-card border border-border bg-white p-6 shadow-sm sm:p-10">
    <Link to="/souvenirs" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"><ArrowLeft size={16}/> Souvenir catalogue</Link>
    <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4DCD6] text-secondary">{challengeToken ? <MailCheck size={24}/> : <ShieldCheck size={24}/>}</div>
    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-secondary">KPX Academy · Guest access</p>
    <h1 className="mt-3 font-heading text-3xl font-bold text-primary sm:text-4xl">Track your custom souvenir enquiry</h1>
    <p className="mt-4 text-sm leading-7 text-text-muted">Enter the enquiry reference from your acknowledgement email. We’ll send a one-time verification code to the email address registered with that enquiry.</p>
    {!challengeToken ? <form onSubmit={submitReference} aria-busy={request.isPending} className="mt-8 space-y-5">
      <div><label htmlFor="souvenir-reference" className="block text-sm font-semibold text-text">Enquiry reference</label><input id="souvenir-reference" value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="KPX-ENQ-XXXXXXXXXX" autoComplete="off" required minLength={8} maxLength={80} className={field}/></div>
      {request.isPending && <p role="status" aria-live="polite">Checking your enquiry reference…</p>}
      <button type="submit" disabled={request.isPending || !reference.trim()} className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50">{request.isPending ? "Checking reference…" : "Send verification code"}</button>
      {request.isError && <p role="alert" className="text-sm text-red-700">{request.error instanceof Error ? request.error.message : "We couldn’t process that request. Please try again."}</p>}
    </form> : <form onSubmit={submitCode} aria-busy={verify.isPending} className="mt-8 space-y-5">
      <div role="status" aria-live="polite" aria-atomic="true" className="rounded-control bg-background p-4"><p className="text-sm font-semibold text-primary">Check your email</p><p className="mt-1 text-sm leading-6 text-text-muted">If the reference is valid, a six-digit code has been sent to its registered email address. The code expires in five minutes.</p></div>
      <div><label htmlFor="souvenir-verification-code" className="block text-sm font-semibold text-text">Six-digit verification code</label><input id="souvenir-verification-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required className={field + " text-center text-2xl font-bold tracking-[0.45em]"}/></div>
      {verify.isPending && <p role="status" aria-live="polite">Verifying your code…</p>}
      <button type="submit" disabled={verify.isPending || code.length !== 6} className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50">{verify.isPending ? "Verifying…" : "Verify and view enquiry"}</button>
      {verify.isError && <p role="alert" className="text-sm text-red-700">{verify.error instanceof Error ? verify.error.message : "That code could not be verified. Request a new code and try again."}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><button type="button" onClick={() => { setChallengeToken(""); setCode(""); request.reset(); verify.reset(); }} className="font-semibold text-secondary underline">Request a new code</button><span className="text-text-muted">Reference: {reference.trim().toUpperCase()}</span></div>
    </form>}
    <p className="mt-8 border-t border-border pt-5 text-xs leading-6 text-text-muted">For your protection, the enquiry reference alone never reveals enquiry details. Verification codes are single-use, expire after five minutes and allow a maximum of five attempts.</p>
  </div></Container></section>;
};
