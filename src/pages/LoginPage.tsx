import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, LoaderCircle } from "lucide-react";
import { useLogin } from "../features/auth/auth.mutations";

interface LocationState { from?: { pathname?: string } }
interface ApiError { response?: { data?: { message?: string } } }

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/admin";
  const errorMessage = (login.error as ApiError | null)?.response?.data?.message
    ?? "Unable to sign in. Check your email and password.";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate(from, { replace: true });
    } catch {
      // React Query exposes the request error in the form below.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--kpx-warm-white)] px-5 py-12">
      <section className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[var(--kpx-royal-blue)]"><ArrowLeft size={16} /> Back to website</Link>
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--kpx-royal-blue)] text-white"><BookOpen size={23} /></span>
          <div><p className="font-semibold text-[var(--kpx-dark-charcoal)]">KPX Academy</p><p className="text-xs text-gray-500">Administration portal</p></div>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-7 shadow-[var(--shadow-md)] sm:p-9">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--kpx-deep-magenta)]">Secure workspace</p>
          <h1 className="text-2xl font-semibold tracking-tight">Administrator sign in</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">Sign in with your KPX Academy administrator account.</p>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div><label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label><input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--kpx-royal-blue)] focus:ring-4 focus:ring-blue-100" /></div>
            <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--kpx-royal-blue)] focus:ring-4 focus:ring-blue-100" /></div>
            {login.isError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}
            <button type="submit" disabled={login.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kpx-royal-blue)] px-4 py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{login.isPending && <LoaderCircle size={17} className="animate-spin" />}{login.isPending ? "Signing in…" : "Sign in to dashboard"}</button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">Access is restricted to authorised administrators.</p>
      </section>
    </main>
  );
}
