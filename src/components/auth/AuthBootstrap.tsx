import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "../../features/auth/auth.queries";
import { authActions } from "../../features/auth/auth.store";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (data) authActions.setUser(data);
    if (isError || !isLoading) authActions.setHydrating(false);
  }, [data, isError, isLoading]);

  return children;
}
