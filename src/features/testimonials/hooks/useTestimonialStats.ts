import { useQuery } from "@tanstack/react-query";
import { getTestimonialStats } from "../api";

export const useTestimonialStats = () =>
  useQuery({
    queryKey: ["testimonials", "admin", "stats"],
    queryFn: getTestimonialStats,
    staleTime: 30_000,
  });
