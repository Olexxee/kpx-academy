import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Check, FileCheck2, Mail, Plus, RefreshCw, ShieldAlert, X } from "lucide-react";
import { registrationApi } from "../../lib/registrationApi";

type View = "submissions" | "certificates" | "issue";
type Submission = { id: string; studentName: string; studentEmail: string; trainingProgramTitle?: string; trainingProgram?: { title: string }; status: string; createdAt: string; notes?: string | null };
type Certificate = { id: string; certificateNumber: string; studentName: string; studentEmail: string; trainingProgramTitle: string; status: string; issuedAt?: string; revokedAt?: string | null };

export default function AdminCertificatesPage() {
  const [view, setView] = useState<View>("submissions");
  const [search, setSearch] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [programTitle, setProgramTitle] = useState("");
  const [notice, setNotice] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const client = useQueryClient();

  const submissionsQuery = useQuery({
    queryKey: ["admin", "certificate-submissions", search],
    queryFn: async () => { const response = await registrationApi.get<{ data: { items: Submission[] } }>("/certificates/admin/submissions", { params: { page: 1, limit: 50, search: search.trim() || undefined } }); return response.data.data.items; },
    enabled: view === "submissions",
  });
  const certificatesQuery = useQuery({
    queryKey: ["admin", "certificates", search],
    queryFn: async () => { const response = await registrationApi.get<{ data: { items: Certificate[] } }>("/certificates/admin", { params: { page: 1, limit: 50, search: search.trim() || undefined } }); return response.data.data.items; },
    enabled: view === "certificates",
  });

  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["admin", "certificate-submissions"] }),
      client.invalidateQueries({ queryKey: ["admin", "certificates"] }),
    ]);
  };

  const review = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      registrationApi.patch(`/certificates/admin/submissions/${encodeURIComponent(id)}/review`, { status, reviewNotes: reviewNotes.trim() || undefined }),
    onSuccess: async () => { setNotice("Submission review saved."); setReviewNotes(""); await invalidate(); },
    onError: () => setNotice("The review could not be saved. Confirm the certificate API is deployed."),
  });
  const issueSubmission = useMutation({
    mutationFn: async (id: string) => registrationApi.post(`/certificates/admin/submissions/${encodeURIComponent(id)}/issue`),
    onSuccess: async () => { setNotice("Certificate issuance request completed."); await invalidate(); },
    onError: () => setNotice("Certificate could not be issued. Only approved submissions can be issued."),
  });
  const directIssue = useMutation({
    mutationFn: async () => registrationApi.post("/certificates/admin/issue", { studentName: studentName.trim(), studentEmail: studentEmail.trim(), trainingProgramTitle: programTitle.trim() }),
    onSuccess: async () => { setNotice("Direct certificate issuance request completed."); setStudentName(""); setStudentEmail(""); setProgramTitle(""); setView("certificates"); await invalidate(); },
    onError: () => setNotice("Direct issuance failed. Check the entered details and API response."),
  });
  const resend = useMutation({
    mutationFn: async (id: string) => registrationApi.post(`/certificates/admin/${encodeURIComponent(id)}/resend`),
    onSuccess: () => setNotice("Certificate resend request completed."),
    onError: () => setNotice("Certificate email could not be resent."),
  });
  const revoke = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => registrationApi.patch(`/certificates/admin/${encodeURIComponent(id)}/revoke`, { reason }),
    onSuccess: async () => { setNotice("Certificate revocation request completed."); await invalidate(); },
    onError: () => setNotice("Certificate could not be revoked."),
  });

  const loading = view === "submissions" ? submissionsQuery.isLoading : view === "certificates" ? certificatesQuery.isLoading : false;
  const submissions = submissionsQuery.data ?? [];
  const certificates = certificatesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kpx-deep-magenta)]">Student records</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Certificates</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Review student proof, issue certificates, resend delivery emails, and revoke certificates when necessary.</p></div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--kpx-soft-blush)] text-[var(--kpx-deep-magenta)]"><Award size={24} /></span>
      </div>
      <div className="mt-7 flex flex-wrap gap-2 border-b border-gray-200">
        {([{ id: "submissions", label: "Proof submissions" }, { id: "certificates", label: "Issued certificates" }, { id: "issue", label: "Direct issue" }] as const).map((item) => <button key={item.id} onClick={() => { setView(item.id); setNotice(""); }} className={`border-b-2 px-4 py-3 text-sm font-semibold ${view === item.id ? "border-[var(--kpx-royal-blue)] text-[var(--kpx-royal-blue)]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{item.label}</button>)}
      </div>
      {notice && <p role="status" className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">{notice}</p>}
      {view === "issue" ? (
        <form onSubmit={(event) => { event.preventDefault(); directIssue.mutate(); }} className="mt-6 max-w-2xl rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-7">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[var(--kpx-royal-blue)]"><FileCheck2 size={19} /></span><div><h2 className="font-semibold">Issue a certificate directly</h2><p className="text-sm text-gray-500">For historical students or cases without a registration record.</p></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Student name<input required value={studentName} onChange={(event) => setStudentName(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-[var(--kpx-royal-blue)]" /></label>
            <label className="text-sm font-medium">Student email<input required type="email" value={studentEmail} onChange={(event) => setStudentEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-[var(--kpx-royal-blue)]" /></label>
            <label className="text-sm font-medium sm:col-span-2">Training program title<input required value={programTitle} onChange={(event) => setProgramTitle(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-[var(--kpx-royal-blue)]" /></label>
          </div>
          <p className="mt-4 rounded-xl bg-[var(--kpx-warm-white)] p-3 text-xs leading-5 text-gray-600">Direct issuance does not search for or require a registration. Verify the recipient and program details before issuing.</p>
          <button disabled={directIssue.isPending} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--kpx-royal-blue)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} />{directIssue.isPending ? "Issuing…" : "Issue certificate"}</button>
        </form>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student, email, or certificate number" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--kpx-royal-blue)]" /></div>
            <button onClick={() => { void submissionsQuery.refetch(); void certificatesQuery.refetch(); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold"><RefreshCw size={15} /> Refresh</button>
          </div>
          {loading && <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading certificate records…</div>}
          {(submissionsQuery.isError && view === "submissions" || certificatesQuery.isError && view === "certificates") && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="mr-2 inline" size={16} />Could not load records. Ensure the certificate-management backend branch is deployed and the admin session is valid.</div>}
          {view === "submissions" && <div className="mt-5 space-y-3">{!loading && submissions.length === 0 && !submissionsQuery.isError && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No proof submissions found.</div>}{submissions.map((item) => <article key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold">{item.studentName}</h2><p className="mt-1 text-sm text-gray-500">{item.studentEmail}</p><p className="mt-2 text-sm">{item.trainingProgramTitle ?? item.trainingProgram?.title ?? "Training program"}</p><p className="mt-1 text-xs text-gray-400">Submitted {new Date(item.createdAt).toLocaleDateString()}</p>{item.notes && <p className="mt-3 text-sm text-gray-600">{item.notes}</p>}</div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : item.status === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span></div>{item.status === "PENDING" && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4"><input value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Optional review note" className="min-w-48 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs" /><button disabled={review.isPending} onClick={() => review.mutate({ id: item.id, status: "APPROVED" })} className="inline-flex items-center gap-1 rounded-lg bg-[var(--kpx-royal-blue)] px-3 py-2 text-xs font-semibold text-white"><Check size={14} /> Approve</button><button disabled={review.isPending} onClick={() => review.mutate({ id: item.id, status: "REJECTED" })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold"><X size={14} /> Reject</button></div>}{item.status === "APPROVED" && <button disabled={issueSubmission.isPending} onClick={() => issueSubmission.mutate(item.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--kpx-royal-blue)] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Award size={14} /> Issue certificate</button>}</article>)}</div>}
          {view === "certificates" && <div className="mt-5 space-y-3">{!loading && certificates.length === 0 && !certificatesQuery.isError && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No certificates found.</div>}{certificates.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5"><div><h2 className="font-semibold">{item.studentName}</h2><p className="mt-1 text-sm text-gray-500">{item.studentEmail}</p><p className="mt-2 text-sm">{item.trainingProgramTitle}</p><p className="mt-1 font-mono text-xs text-[var(--kpx-royal-blue)]">{item.certificateNumber}</p><span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${item.status === "REVOKED" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{item.status}</span></div><div className="flex flex-wrap gap-2"><button disabled={item.status === "REVOKED" || resend.isPending} onClick={() => resend.mutate(item.id)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold disabled:opacity-40"><Mail size={14} /> Resend email</button>{item.status !== "REVOKED" && <button onClick={() => { const reason = window.prompt("Reason for revoking this certificate:"); if (reason?.trim()) revoke.mutate({ id: item.id, reason: reason.trim() }); }} disabled={revoke.isPending} className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"><ShieldAlert size={14} /> Revoke</button>}</div></article>)}</div>}
        </>
      )}
    </div>
  );
}
