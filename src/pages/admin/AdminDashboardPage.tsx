import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, GraduationCap, Image, MessageSquareQuote, Star } from "lucide-react";
import { useAdminTrainingPrograms } from "../../features/admin/training/training.queries";

export default function AdminDashboardPage() {
  const query = useAdminTrainingPrograms();
  const programs = query.data ?? [];
  const activeCount = programs.filter((program: { active?: boolean }) => program.active).length;
  const featuredCount = programs.filter((program: { featured?: boolean }) => program.featured).length;

  const stats = [
    { label: "Training programs", value: programs.length, icon: BookOpen, note: "Programs in the catalogue" },
    { label: "Active programs", value: activeCount, icon: CheckCircle2, note: "Visible to prospective students" },
    { label: "Featured programs", value: featuredCount, icon: Star, note: "Highlighted on the website" },
  ];

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="rounded-3xl bg-[var(--kpx-dark-charcoal)] p-6 text-white sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--kpx-soft-blush)]">Administrator workspace</p>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Welcome to KPX Academy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Manage learning programs, student registrations, website testimonials, and certificate issuance from one place.</p>
        <Link to="/admin/training" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--kpx-royal-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">Manage programs <ArrowRight size={16} /></Link>
      </div>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, note }) => <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-3 text-3xl font-semibold">{query.isLoading ? "—" : value}</p></div><span className="rounded-xl bg-[var(--kpx-soft-blush)] p-3 text-[var(--kpx-deep-magenta)]"><Icon size={20} /></span></div><p className="mt-3 text-xs text-gray-500">{note}</p></div>)}
      </div>
      {query.isError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Training program statistics could not be loaded.</p>}
      <section className="mt-8"><div className="mb-4"><h2 className="text-lg font-semibold">Management shortcuts</h2><p className="mt-1 text-sm text-gray-500">Jump directly to the most common tasks.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { title: "Training programs", detail: "Create programs and manage media.", to: "/admin/training", icon: GraduationCap },
          { title: "Registrations", detail: "Review student registration and payment status.", to: "/admin/registrations", icon: ClipboardList },
          { title: "Testimonials", detail: "Moderate feedback before publishing.", to: "/admin/testimonials", icon: MessageSquareQuote },
          { title: "Certificates", detail: "Review submissions and issue certificates.", to: "/admin/certificates", icon: Star },
          { title: "Site logo", detail: "Upload or replace the logo used in the public header and footer.", to: "/admin/logo", icon: Image },
        ].map(({ title, detail, to, icon: Icon }) => <Link key={title} to={to} className="group rounded-2xl border border-[var(--color-border)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--kpx-royal-blue)] hover:shadow-[var(--shadow-sm)]"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[var(--kpx-royal-blue)]"><Icon size={19} /></span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-500">{detail}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--kpx-royal-blue)]">Open section <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></Link>)}
      </div></section>
    </div>
  );
}
