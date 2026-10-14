import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTestimonial, updateTestimonialStatus } from "../api";
import type { TestimonialStatus } from "../types";
import { testimonialKeys } from "./useAdminTestimonials";

const invalidateTestimonialCaches = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: testimonialKeys.adminLists() });
  qc.invalidateQueries({ queryKey: testimonialKeys.stats() });
  qc.invalidateQueries({ queryKey: testimonialKeys.public() });
};

export const useUpdateTestimonialStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TestimonialStatus }) =>
      updateTestimonialStatus(id, status),

    onSuccess: () => invalidateTestimonialCaches(qc),
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => invalidateTestimonialCaches(qc),
  });
};
