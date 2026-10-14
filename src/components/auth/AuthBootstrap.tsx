import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "../../features/auth/auth.queries";
import { authActions } from "../../features/auth/auth.store";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (data) authActions.setUser(data);
    if (isError || !isLoading) authActions.setHydrating(false);
  }, [data, isError, isLoading]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--kpx-warm-white)] text-[var(--kpx-dark-charcoal)]">Loading KPX Academy…</div>;
  }

  return children;
}
