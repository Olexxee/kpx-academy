import { useQuery } from "@tanstack/react-query";
import { meRequest } from "../../api/auth/auth";

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["auth", "me"],
    queryFn: meRequest,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
