// src/features/testimonials/hooks/useAdminTestimonials.ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listAdminTestimonials } from "../api";
import type { ListTestimonialsParams } from "../types";

export const testimonialKeys = {
  all: ["testimonials"] as const,

  public: () => [...testimonialKeys.all, "public"] as const,

  admin: () => [...testimonialKeys.all, "admin"] as const,
  adminLists: () => [...testimonialKeys.admin(), "list"] as const,
  adminList: (params: ListTestimonialsParams) =>
    [...testimonialKeys.adminLists(), params] as const,
  stats: () => [...testimonialKeys.admin(), "stats"] as const,
};

export const useAdminTestimonials = (params: ListTestimonialsParams = {}) =>
  useQuery({
    queryKey: testimonialKeys.adminList(params),
    queryFn: () => listAdminTestimonials(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
