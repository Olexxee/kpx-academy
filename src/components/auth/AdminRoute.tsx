import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";

export function AdminRoute() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  if (isHydrating) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--kpx-warm-white)] text-[var(--kpx-dark-charcoal)]">Checking administrator access…</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
