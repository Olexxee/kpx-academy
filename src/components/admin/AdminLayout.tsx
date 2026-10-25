import { NavLink, Outlet } from "react-router-dom";
import { Award, BookOpen, ClipboardList, FileText, GraduationCap, Images, LayoutDashboard, LogOut, MessageSquareQuote, PanelsTopLeft, Package, UserRound } from "lucide-react";
import { useLogout } from "../../features/auth/auth.mutations";
import { useAuthStore } from "../../features/auth/auth.store";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/training", label: "Training programs", icon: GraduationCap },
  { to: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { to: "/admin/creative-workspace", label: "Creative workspace", icon: Sparkles },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/certificates", label: "Certificates", icon: Award },
  { to: "/admin/content", label: "Homepage hero", icon: PanelsTopLeft },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/resources", label: "Resources", icon: FileText },\n  { to: "/admin/souvenirs", label: "Souvenirs", icon: Package },\n  { to: "/admin/founder", label: "Founder media", icon: UserRound },
];

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <div className="kpx-admin-shell min-h-screen bg-[var(--kpx-warm-white)] text-[var(--kpx-dark-charcoal)]">
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white/90 px-4 backdrop-blur sm:px-8">
          <span className="text-sm text-gray-500">KPX Academy <span className="mx-2 text-gray-300">/</span> Admin workspace</span>
          <div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-xs font-medium text-gray-600">Admin access</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--kpx-soft-blush)] font-bold text-[var(--kpx-deep-magenta)]">{user?.name?.slice(0, 1).toUpperCase() ?? "A"}</span></div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
