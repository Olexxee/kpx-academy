import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Award, BadgeCheck, FileCheck2, Search, ShieldCheck, UploadCloud } from "lucide-react";
import { PublicPageHero } from "../components/ui/PublicPageHero";
import { siteImages } from "../config/siteImages";
import { registrationApi } from "../lib/registrationApi";
import { prepareUploadFile } from "../lib/fileCompression";
import { useTrainingPrograms } from "../features/training/hooks/useTrainingPrograms";

type CertificateVerification = {
  certificateNumber: string;
  studentName: string;
  trainingProgramTitle: string;
  issuedAt: string;
  status: "ISSUED" | "REVOKED" | string;
  valid: boolean;
  revokedAt?: string | null;
  revocationReason?: string | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/15";

const labelClass = "block text-sm font-semibold text-primary";

export default function CertificatesPage() {
  const [searchParams] = useSearchParams();
  const { data: programs = [], isLoading: programsLoading, isError: programsError, refetch } = useTrainingPrograms();
  const availablePrograms = useMemo(() => programs.filter((program) => program.active), [programs]);

  const [certificateNumber, setCertificateNumber] = useState("");
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [submissionNotice, setSubmissionNotice] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyCertificate = useCallback(async (number: string) => {
    setVerification(null);
    setVerifyError("");

    if (!number) {
      setVerifyError("Enter the certificate number printed on the certificate.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await registrationApi.get<ApiEnvelope<CertificateVerification>>(
        `/certificates/verify/${encodeURIComponent(number)}`,
      );
      setVerification(response.data.data);
    } catch (error) {
      setVerifyError(errorMessage(error, "We could not verify this certificate. Please check the number and try again."));
    } finally {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    const number = searchParams.get("number")?.trim();
    if (!number) return;

    setCertificateNumber(number);
    void verifyCertificate(number);
  }, [searchParams, verifyCertificate]);

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await verifyCertificate(certificateNumber.trim());
  };

  const handleSubmission = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionNotice("");
    setSubmissionError("");

    if (!proof) {
      setSubmissionError("Select a proof-of-work file to upload.");
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(proof.type)) {
      setSubmissionError("Upload a PDF, JPEG, PNG, or WebP file.");
      return;
    }
    const uploadProof = await prepareUploadFile(proof);
    if (uploadProof.size > 10 * 1024 * 1024) {
      setSubmissionError("The proof file must not exceed 10 MB after image optimization.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("studentName", studentName.trim());
      formData.append("studentEmail", studentEmail.trim());
      formData.append("trainingProgramId", trainingProgramId);
      if (notes.trim()) formData.append("notes", notes.trim());
      formData.append("proof", uploadProof);

      const response = await registrationApi.post<ApiEnvelope<{ studentName: string }>>(
        "/certificates/submissions",
        formData,
      );
      setSubmissionNotice(
        response.data.message || "Your proof of work has been submitted for review.",
      );
      setStudentName("");
      setStudentEmail("");
      setTrainingProgramId("");
      setProof(null);
      setNotes("");
      const fileInput = document.getElementById("proof") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setSubmissionError(
        errorMessage(error, "Your submission could not be sent. Please check your details and try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHero
        eyebrow="Student certificate services"
        title="Your learning deserves to be recognised."
        description="Verify a KPX Academy certificate or submit your proof of work for review by our team."
        icon={Award}
        image={siteImages.certificates}
        actions={
          <>
            <a href="#verify-certificate" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17324D] transition hover:bg-[#FAF8F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <ShieldCheck size={17} aria-hidden="true" /> Verify a certificate
            </a>
            <a href="#submit-proof" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <UploadCloud size={17} aria-hidden="true" /> Submit proof of work
            </a>
          </>
        }
      />
      <div className="mx-auto w-full max-w-container px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <section id="verify-certificate" className="scroll-mt-28 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F4DCD6] text-secondary">
                <BadgeCheck size={23} />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">Verify a certificate</h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Enter the certificate number to check its authenticity and current status.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="mt-7 space-y-4">
              <label className={labelClass} htmlFor="certificateNumber">
                Certificate number
                <input
                  id="certificateNumber"
                  value={certificateNumber}
                  onChange={(event) => setCertificateNumber(event.target.value)}
                  placeholder="e.g. KPX-2026-XXXXXXXXXX"
                  autoComplete="off"
                  className={inputClass}
                />
              </label>
              <button type="submit" disabled={isVerifying} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60">
                <Search size={17} /> {isVerifying ? "Checking certificate…" : "Verify certificate"}
              </button>
            </form>

            {verifyError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{verifyError}</p>}
            {verification && (
              <div className={`mt-5 rounded-xl border p-5 ${verification.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${verification.valid ? "bg-emerald-600" : "bg-red-600"}`} />
                  <p className={`text-sm font-bold ${verification.valid ? "text-emerald-800" : "text-red-800"}`}>
                    {verification.valid ? "Valid certificate" : "Certificate revoked"}
                  </p>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-text-muted">Certificate number</dt><dd className="mt-1 break-all font-mono font-semibold text-primary">{verification.certificateNumber}</dd></div>
                  <div><dt className="text-text-muted">Student</dt><dd className="mt-1 font-semibold text-text">{verification.studentName}</dd></div>
                  <div><dt className="text-text-muted">Training programme</dt><dd className="mt-1 font-semibold text-text">{verification.trainingProgramTitle}</dd></div>
                  <div><dt className="text-text-muted">Date issued</dt><dd className="mt-1 font-semibold text-text">{new Date(verification.issuedAt).toLocaleDateString()}</dd></div>
                  {!verification.valid && verification.revocationReason && <div><dt className="text-text-muted">Revocation reason</dt><dd className="mt-1 text-red-800">{verification.revocationReason}</dd></div>}
                </dl>
              </div>
            )}
          </section>

          <section id="submit-proof" className="scroll-mt-28 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F4DCD6] text-secondary">
                <FileCheck2 size={23} />
              </span>
              <div>
                <h2 className="font-heading text-2xl font-bold text-primary">Submit proof of work</h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Send your completed work for review. A certificate is issued only after an administrator approves your submission.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmission} className="mt-7 space-y-5">
              <label className={labelClass} htmlFor="studentName">
                Full name
                <input id="studentName" required minLength={2} maxLength={120} value={studentName} onChange={(event) => setStudentName(event.target.value)} autoComplete="name" className={inputClass} placeholder="Enter the name for your certificate" />
              </label>
              <label className={labelClass} htmlFor="studentEmail">
                Email address
                <input id="studentEmail" required type="email" maxLength={254} value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} autoComplete="email" className={inputClass} placeholder="you@example.com" />
              </label>
              <label className={labelClass} htmlFor="trainingProgramId">
                Training programme
                <select id="trainingProgramId" required value={trainingProgramId} onChange={(event) => setTrainingProgramId(event.target.value)} disabled={programsLoading || programsError} className={inputClass}>
                  <option value="">{programsLoading ? "Loading programmes…" : "Select your programme"}</option>
                  {availablePrograms.map((program) => <option key={program.id} value={program.id}>{program.title}</option>)}
                </select>
              </label>
              {programsError && <div className="text-sm text-red-700"><p>Training programmes could not be loaded.</p><button type="button" onClick={() => void refetch()} className="mt-1 font-semibold underline">Try again</button></div>}
              {!programsLoading && !programsError && availablePrograms.length === 0 && <p className="text-sm text-text-muted">There are no active training programmes available right now.</p>}

              <div>
                <label className={labelClass} htmlFor="proof">Proof-of-work file</label>
                <div className="mt-2 rounded-xl border border-dashed border-border bg-background p-4">
                  <input id="proof" required type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setProof(event.target.files?.[0] ?? null)} className="block w-full text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
                  <p className="mt-2 text-xs leading-5 text-text-muted">PDF, JPEG, PNG or WebP. Maximum file size: 10 MB.</p>
                  {proof && <p className="mt-2 break-all text-xs font-medium text-primary">Selected: {proof.name}</p>}
                </div>
              </div>

              <label className={labelClass} htmlFor="notes">
                Additional notes <span className="font-normal text-text-muted">(optional)</span>
                <textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={3} className={inputClass} placeholder="Add context that may help us review your work." />
              </label>

              {submissionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{submissionError}</p>}
              {submissionNotice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">{submissionNotice}</p>}

              <button type="submit" disabled={isSubmitting || programsLoading || programsError || availablePrograms.length === 0} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60">
                <UploadCloud size={17} /> {isSubmitting ? "Submitting proof…" : "Submit for review"}
              </button>
              <p className="text-xs leading-5 text-text-muted">Submitting proof does not automatically issue a certificate. Our team reviews submissions before any certificate is issued.</p>
            </form>
          </section>
        </div>

        <div className="mt-8 rounded-2xl bg-[#FAF8F5] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
          <div>
            <h2 className="font-heading text-lg font-bold text-primary">Need to enrol first?</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">Explore available programmes and register with KPX Academy.</p>
          </div>
          <Link to="/programs" className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary sm:mt-0">Explore programmes</Link>
        </div>
      </div>
    </div>
  );
}
