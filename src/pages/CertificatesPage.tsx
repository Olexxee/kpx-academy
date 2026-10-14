import React, { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  FileCheck2,
  FileUp,
  Search,
  ShieldCheck,
  ShieldX,
  UploadCloud,
} from "lucide-react";
import { registrationApi } from "../lib/registrationApi";
import { Container } from "../components/ui/Container";
import { useTrainingPrograms } from "../features/training/hooks/useTrainingPrograms";

type CertificateView = "verify" | "submit";

interface VerificationResult {
  certificateNumber: string;
  studentName: string;
  trainingProgramTitle: string;
  issuedAt: string;
  status: "ISSUED" | "REVOKED" | string;
  valid: boolean;
  revokedAt?: string | null;
  revocationReason?: string | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as {
      response?: { data?: { message?: string } };
    }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

export default function CertificatesPage() {
  const [view, setView] = useState<CertificateView>("verify");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: programs = [],
    isLoading: programsLoading,
    isError: programsError,
    refetch: refetchPrograms,
  } = useTrainingPrograms();

  const availablePrograms = useMemo(
    () => programs.filter((program) => program.active),
    [programs],
  );

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const number = certificateNumber.trim().toUpperCase();
    if (!number) {
      setVerificationError("Enter the certificate number to verify.");
      setVerification(null);
      return;
    }

    setIsVerifying(true);
    setVerification(null);
    setVerificationError("");

    try {
      const response = await registrationApi.get<ApiEnvelope<VerificationResult>>(
        `/certificates/verify/${encodeURIComponent(number)}`,
      );
      setVerification(response.data.data);
    } catch (error) {
      setVerificationError(
        getErrorMessage(
          error,
          "We could not verify this certificate. Check the number and try again.",
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionMessage("");
    setSubmissionError("");

    if (!proof) {
      setSubmissionError("Select your proof-of-work file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("studentName", studentName.trim());
    formData.append("studentEmail", studentEmail.trim());
    formData.append("trainingProgramId", trainingProgramId);
    if (notes.trim()) formData.append("notes", notes.trim());
    formData.append("proof", proof);

    setIsSubmitting(true);
    try {
      const response = await registrationApi.post<ApiEnvelope<unknown>>(
        "/certificates/submissions",
        formData,
      );
      setSubmissionMessage(
        response.data.message ??
          "Your proof has been submitted for review. Keep an eye on your email for updates.",
      );
      setStudentName("");
      setStudentEmail("");
      setTrainingProgramId("");
      setNotes("");
      setProof(null);
      const fileInput = document.getElementById("proof-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setSubmissionError(
        getErrorMessage(
          error,
          "Your submission could not be completed. Please review the details and try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#212529]">
      <section className="relative isolate overflow-hidden bg-[#1D4ED8] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/15 sm:h-[30rem] sm:w-[30rem]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-20 h-52 w-52 rounded-full border border-white/15 sm:right-24 sm:top-24 sm:h-72 sm:w-72" />
        <Container className="relative py-16 sm:py-24 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                KPX Academy credentials
              </p>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Your hard work deserves to be <span className="text-[#F4DCD6]">recognised.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                Verify a KPX Academy certificate or submit your proof of work for review. Our public verification tool helps employers and recipients confirm certificate status.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => { setView("verify"); document.getElementById("certificate-tools")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1D4ED8] transition hover:bg-[#F4DCD6]"
                >
                  Verify a certificate <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => { setView("submit"); document.getElementById("certificate-tools")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Submit proof of work
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4DCD6] text-[#8B1E5A]">
                    <Award size={25} />
                  </div>
                  <span className="rounded-full border border-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                    Official record
                  </span>
                </div>
                <div className="mt-8 border-t border-white/20 pt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">KPX Academy</p>
                  <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">Certificate verification</h2>
                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Check the recipient, programme, issue date, and current validity status using the unique certificate number.
                  </p>
                </div>
                <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <ShieldCheck size={22} className="shrink-0 text-[#F4DCD6]" />
                  <p className="text-xs leading-5 text-white/80">Verification results come from the KPX Academy certificate register.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="certificate-tools" className="scroll-mt-24 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B1E5A]">Certificate services</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">How can we help you?</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#212529]/70">
                Verify an existing certificate or send your completed work to the academy for review.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 rounded-2xl border border-[#212529]/10 bg-white p-1.5">
              <button
                type="button"
                onClick={() => { setView("verify"); setSubmissionError(""); setSubmissionMessage(""); }}
                aria-pressed={view === "verify"}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition sm:text-base ${view === "verify" ? "bg-[#1D4ED8] text-white shadow-sm" : "text-[#212529]/65 hover:bg-[#FAF8F5]"}`}
              >
                <Search size={17} /> Verify certificate
              </button>
              <button
                type="button"
                onClick={() => { setView("submit"); setVerification(null); setVerificationError(""); }}
                aria-pressed={view === "submit"}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition sm:text-base ${view === "submit" ? "bg-[#1D4ED8] text-white shadow-sm" : "text-[#212529]/65 hover:bg-[#FAF8F5]"}`}
              >
                <FileCheck2 size={17} /> Submit proof
              </button>
            </div>

            {view === "verify" ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-[#212529]/10 bg-white p-6 sm:p-8">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4DCD6] text-[#8B1E5A]">
                    <ShieldCheck size={23} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">Verify a certificate</h3>
                  <p className="mt-2 text-sm leading-6 text-[#212529]/65">
                    Enter the certificate number exactly as it appears on the certificate.
                  </p>
                  <form onSubmit={handleVerify} className="mt-6 space-y-4">
                    <label htmlFor="certificate-number" className="block text-sm font-semibold">
                      Certificate number
                    </label>
                    <input
                      id="certificate-number"
                      value={certificateNumber}
                      onChange={(event) => setCertificateNumber(event.target.value.toUpperCase())}
                      placeholder="e.g. KPX-2026-XXXXXXXXXX"
                      autoComplete="off"
                      required
                      className="w-full rounded-xl border border-[#212529]/15 bg-[#FAF8F5] px-4 py-3 font-mono text-sm outline-none transition focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                    />
                    {verificationError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{verificationError}</p>}
                    <button
                      type="submit"
                      disabled={isVerifying || !certificateNumber.trim()}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8B1E5A] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Search size={17} /> {isVerifying ? "Checking record…" : "Verify certificate"}
                    </button>
                  </form>
                  <p className="mt-4 text-xs leading-5 text-[#212529]/55">
                    Certificate numbers are unique. If you cannot find your number, check the original document and try again.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#212529]/10 bg-white p-6 sm:p-8">
                  {!verification && !verificationError && (
                    <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#FAF8F5] text-[#1D4ED8]">
                        <FileCheck2 size={26} />
                      </div>
                      <h3 className="mt-5 text-lg font-bold">Verification results</h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-[#212529]/60">
                        The certificate details and validity status will appear here after you search.
                      </p>
                    </div>
                  )}

                  {verification && (
                    <div aria-live="polite">
                      <div className={`flex items-start gap-3 rounded-2xl p-4 ${verification.valid ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                        {verification.valid ? <CheckCircle2 size={23} className="mt-0.5 shrink-0" /> : <ShieldX size={23} className="mt-0.5 shrink-0" />}
                        <div>
                          <h3 className="font-bold">{verification.valid ? "Certificate verified" : "Certificate is not valid"}</h3>
                          <p className="mt-1 text-sm leading-6">
                            {verification.valid
                              ? "This certificate is recorded as issued by KPX Academy."
                              : verification.status === "REVOKED"
                                ? "This certificate has been revoked and should not be treated as valid."
                                : "The certificate record is not currently valid."}
                          </p>
                        </div>
                      </div>
                      <dl className="mt-6 divide-y divide-[#212529]/10">
                        <div className="py-4">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-[#212529]/50">Certificate number</dt>
                          <dd className="mt-1 break-all font-mono text-sm font-semibold">{verification.certificateNumber}</dd>
                        </div>
                        <div className="py-4">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-[#212529]/50">Recipient</dt>
                          <dd className="mt-1 text-base font-semibold">{verification.studentName}</dd>
                        </div>
                        <div className="py-4">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-[#212529]/50">Training programme</dt>
                          <dd className="mt-1 text-sm leading-6">{verification.trainingProgramTitle}</dd>
                        </div>
                        <div className="py-4">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-[#212529]/50">Date issued</dt>
                          <dd className="mt-1 text-sm">{formatDate(verification.issuedAt)}</dd>
                        </div>
                        <div className="py-4">
                          <dt className="text-xs font-semibold uppercase tracking-wider text-[#212529]/50">Current status</dt>
                          <dd className="mt-2">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${verification.valid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                              {verification.valid ? "VALID — ISSUED" : verification.status}
                            </span>
                          </dd>
                        </div>
                        {verification.revokedAt && (
                          <div className="py-4">
                            <dt className="text-xs font-semibold uppercase tracking-wider text-[#212529]/50">Date revoked</dt>
                            <dd className="mt-1 text-sm">{formatDate(verification.revokedAt)}</dd>
                            {verification.revocationReason && <dd className="mt-2 text-sm leading-6 text-red-700">Reason: {verification.revocationReason}</dd>}
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="h-fit rounded-3xl bg-[#8B1E5A] p-6 text-white sm:p-8">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
                    <UploadCloud size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold">Submit your proof of work</h3>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    Completed a KPX Academy programme and ready to request a certificate? Send your details and supporting file for review by the academy team.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-white/90">
                    <li className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /> Use the name you want printed on your certificate.</li>
                    <li className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /> Upload a PDF, JPEG, PNG, or WebP file.</li>
                    <li className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /> Your submission is reviewed before issuance.</li>
                  </ul>
                  <p className="mt-6 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/75">
                    Maximum file size: 10 MB. Submission does not automatically issue a certificate.
                  </p>
                </aside>

                <form onSubmit={handleSubmission} className="rounded-3xl border border-[#212529]/10 bg-white p-6 sm:p-8">
                  <h3 className="text-xl font-bold">Your details</h3>
                  <p className="mt-2 text-sm leading-6 text-[#212529]/60">Complete each required field and attach your proof file.</p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Full name
                      <input required minLength={2} maxLength={120} value={studentName} onChange={(event) => setStudentName(event.target.value)} autoComplete="name" placeholder="Name for your certificate" className="mt-2 w-full rounded-xl border border-[#212529]/15 px-4 py-3 font-normal outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15" />
                    </label>
                    <label className="text-sm font-semibold">
                      Email address
                      <input required type="email" maxLength={254} value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#212529]/15 px-4 py-3 font-normal outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15" />
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                      Training programme
                      <select required value={trainingProgramId} onChange={(event) => setTrainingProgramId(event.target.value)} disabled={programsLoading || programsError || availablePrograms.length === 0} className="mt-2 w-full rounded-xl border border-[#212529]/15 bg-white px-4 py-3 font-normal outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 disabled:bg-[#FAF8F5]">
                        <option value="">{programsLoading ? "Loading programmes…" : "Select your programme"}</option>
                        {availablePrograms.map((program) => <option key={program.id} value={program.id}>{program.title}</option>)}
                      </select>
                      {programsError && <span className="mt-2 block text-xs font-normal text-red-700">Could not load programmes. <button type="button" onClick={() => void refetchPrograms()} className="font-semibold underline">Try again</button></span>}
                      {!programsLoading && !programsError && availablePrograms.length === 0 && <span className="mt-2 block text-xs font-normal text-[#212529]/60">No active programmes are currently available.</span>}
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                      Notes <span className="font-normal text-[#212529]/50">(optional)</span>
                      <textarea rows={3} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context about your completed work (optional)" className="mt-2 w-full resize-y rounded-xl border border-[#212529]/15 px-4 py-3 font-normal outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15" />
                    </label>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="proof-file" className="block text-sm font-semibold">Proof-of-work file</label>
                    <label htmlFor="proof-file" className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#212529]/20 bg-[#FAF8F5] px-5 py-7 text-center transition hover:border-[#1D4ED8]">
                      <FileUp size={25} className="text-[#1D4ED8]" />
                      <span className="mt-3 text-sm font-semibold">{proof ? proof.name : "Choose a file to upload"}</span>
                      <span className="mt-1 text-xs text-[#212529]/55">PDF, JPEG, PNG or WebP · Maximum 10 MB</span>
                      <input
                        id="proof-file"
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setProof(file);
                          setSubmissionError("");
                          if (file && file.size > 10 * 1024 * 1024) {
                            setSubmissionError("The selected file exceeds the 10 MB limit.");
                            setProof(null);
                            event.target.value = "";
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {submissionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">{submissionError}</p>}
                  {submissionMessage && <div role="status" aria-live="polite" className="mt-4 flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><CheckCircle2 size={20} className="mt-0.5 shrink-0" /><p>{submissionMessage}</p></div>}

                  <button
                    type="submit"
                    disabled={isSubmitting || programsLoading || programsError || availablePrograms.length === 0}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8B1E5A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UploadCloud size={18} /> {isSubmitting ? "Submitting proof…" : "Submit for review"}
                  </button>
                  <p className="mt-4 text-center text-xs leading-5 text-[#212529]/55">
                    By submitting, you confirm that the details and file provided are accurate and relate to your training.
                  </p>
                </form>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-[#212529]/10 bg-white py-12 sm:py-16">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B1E5A]">Continue learning</p>
              <h2 className="mt-2 text-2xl font-bold">Ready for your next skill?</h2>
              <p className="mt-2 text-sm leading-6 text-[#212529]/65">Explore practical training programmes from KPX Academy.</p>
            </div>
            <Link to="/programs" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#8B1E5A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]">
              Explore programmes <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
