import { registrationApi } from "../../lib/registrationApi";
import type {
  CreateTestimonialInput,
  ListTestimonialsParams,
  PaginationMeta,
  Testimonial,
  TestimonialStats,
  TestimonialStatus,
} from "./types";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

// ============================================================================
// PUBLIC
// ============================================================================

export const getPublicTestimonials = async (): Promise<Testimonial[]> => {
  const res =
    await registrationApi.get<Envelope<Testimonial[]>>("/testimonial");

  return res.data.data;
};

export const submitTestimonial = async (
  data: CreateTestimonialInput,
): Promise<Testimonial> => {
  const res = await registrationApi.post<Envelope<Testimonial>>(
    "/testimonial",
    data,
  );

  return res.data.data;
};

// ============================================================================
// ADMIN — READ
// ============================================================================

export const listAdminTestimonials = async (
  params: ListTestimonialsParams = {},
): Promise<{
  testimonials: Testimonial[];
  pagination?: PaginationMeta;
}> => {
  const { status, ...rest } = params;

  const res = await registrationApi.get<Envelope<Testimonial[]>>(
    "/testimonial/admin",
    {
      params: {
        ...rest,
        ...(status && status !== "ALL" ? { status } : {}),
      },
    },
  );

  return {
    testimonials: res.data.data,
    pagination: res.data.meta,
  };
};

export const getTestimonialStats = async (): Promise<TestimonialStats> => {
  const res = await registrationApi.get<Envelope<TestimonialStats>>(
    "/testimonial/admin/stats",
  );

  return res.data.data;
};

// ============================================================================
// ADMIN — WRITE
// ============================================================================

export const updateTestimonialStatus = async (
  id: string,
  status: TestimonialStatus,
): Promise<Testimonial> => {
  const res = await registrationApi.patch<Envelope<Testimonial>>(
    `/testimonial/admin/${id}/status`,
    { status },
  );

  return res.data.data;
};

export const deleteTestimonial = async (
  id: string,
): Promise<{ id: string }> => {
  const res = await registrationApi.delete<Envelope<{ id: string }>>(
    `/testimonial/admin/${id}`,
  );

  return res.data.data;
};
