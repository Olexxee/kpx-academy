import { useQuery } from "@tanstack/react-query";
import { meRequest } from "../../api/auth/auth";

export const useCurrentUser = (enabled = true) =>
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: meRequest,
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
