import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginRequest, logoutRequest } from "../../api/auth/auth";
import { authActions } from "./auth.store";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest(email, password),
    onSuccess: async (result) => {
      authActions.setUser(result.data.admin);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      authActions.logout();
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });
};
