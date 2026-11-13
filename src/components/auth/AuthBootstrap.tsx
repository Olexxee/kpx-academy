import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentUser } from "../../features/auth/auth.queries";
import { authActions } from "../../features/auth/auth.store";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAdminLogin = location.pathname === "/admin/login";
  const requiresAdminSession =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  const shouldCheckSession = requiresAdminSession && !isAdminLogin;

  const { data, isLoading, isError } = useCurrentUser(shouldCheckSession);

  useEffect(() => {
    if (data) authActions.setUser(data);
    if (shouldCheckSession && isError) authActions.setUser(null);
    authActions.setHydrating(shouldCheckSession && isLoading);
  }, [data, isError, isLoading, shouldCheckSession]);

  return children;
}
