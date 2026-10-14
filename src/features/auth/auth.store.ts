import { useSyncExternalStore } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

interface SessionState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
}

let current: SessionState = {
  user: null,
  isAuthenticated: false,
  isHydrating: true,
};
const subscribers = new Set<() => void>();

function update(patch: Partial<SessionState>) {
  current = { ...current, ...patch };
  subscribers.forEach((subscriber) => subscriber());
}

export const authActions = {
  setUser(user: AdminUser | null) {
    update({ user, isAuthenticated: Boolean(user) });
  },
  setHydrating(isHydrating: boolean) {
    update({ isHydrating });
  },
  logout() {
    update({ user: null, isAuthenticated: false });
  },
};

export function useAuthStore<T>(selector: (state: SessionState) => T): T {
  const snapshot = useSyncExternalStore(
    (callback) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    () => current,
    () => current,
  );
  return selector(snapshot);
}
