import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Award, BookOpen, ClipboardList, FileText, GraduationCap, Images, LayoutDashboard, LogOut, MessageSquareQuote, PanelsTopLeft, Package, UserRound, Image, Menu, X } from "lucide-react";
import { useLogout } from "../../features/auth/auth.mutations";
import { useAuthStore } from "../../features/auth/auth.store";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/training", label: "Training programs", icon: GraduationCap },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { to: "/admin/creative-workspace", label: "Creative workspace", icon: BookOpen },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/content", label: "Homepage hero", icon: PanelsTopLeft },
  { to: "/admin/logo", label: "Site logo", icon: Image },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/resources", label: "Resources", icon: FileText },
  { to: "/admin/souvenirs", label: "Souvenirs", icon: Package },
  { to: "/admin/founder", label: "Founder media", icon: UserRound },
];

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileNavOpen(false), [location.pathname]);

  return (
    <div className="kpx-admin-shell min-h-screen bg-[var(--kpx-warm-white)] text-[var(--kpx-dark-charcoal)]">
      {mobileNavOpen && <button type="button" aria-label="Close admin navigation" className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden" onClick={() => setMobileNavOpen(false)} />}
      <aside id="admin-mobile-navigation" aria-label="Admin navigation" aria-hidden={!mobileNavOpen} inert={!mobileNavOpen} className={`fixed inset-y-0 left-0 z-50 flex w-[min(19rem,85vw)] flex-col bg-[var(--kpx-dark-charcoal)] text-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--kpx-royal-blue)]"><BookOpen size={21} /></span><div><p className="font-semibold">KPX Academy</p><p className="text-xs text-white/60">Administration</p></div></div>
          <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/80 hover:bg-white/10"><X size={20}/></button>
        </div>
        <p className="px-5 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Workspace</p>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? "bg-[var(--kpx-royal-blue)] font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><Icon size={18}/><span>{label}</span></NavLink>)}
        </nav>
        <div className="border-t border-white/10 p-4"><p className="truncate px-2 text-sm font-medium">{user?.name}</p><p className="truncate px-2 text-xs text-white/50">{user?.email}</p><button onClick={() => logout.mutate()} disabled={logout.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm hover:bg-white/10 disabled:opacity-60"><LogOut size={16}/>{logout.isPending ? "Signing out…" : "Sign out"}</button></div>
      </aside>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[var(--kpx-dark-charcoal)] text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--kpx-royal-blue)]"><BookOpen size={21} /></span>
          <div><p className="font-semibold">KPX Academy</p><p className="text-xs text-white/60">Administration</p></div>
        </div>
        <p className="px-5 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Workspace</p>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${isActive ? "bg-[var(--kpx-royal-blue)] font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate px-2 text-sm font-medium">{user?.name}</p>
          <p className="truncate px-2 text-xs text-white/50">{user?.email}</p>
          <button onClick={() => logout.mutate()} disabled={logout.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm hover:bg-white/10 disabled:opacity-60"><LogOut size={16} />{logout.isPending ? "Signing out…" : "Sign out"}</button>
        </div>
      </aside>
      <main className="min-h-screen min-w-0 lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-white/90 px-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="Open admin navigation" aria-controls="admin-mobile-navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"><Menu size={19}/></button><span className="truncate text-xs text-gray-500 sm:text-sm">KPX Academy <span className="mx-1 text-gray-300 sm:mx-2">/</span> Admin workspace</span></div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3"><span className="hidden h-2 w-2 rounded-full bg-emerald-500 sm:block" /><span className="hidden text-xs font-medium text-gray-600 sm:inline">Admin access</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--kpx-soft-blush)] font-bold text-[var(--kpx-deep-magenta)]">{user?.name?.slice(0, 1).toUpperCase() ?? "A"}</span></div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
