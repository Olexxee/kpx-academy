export type TestimonialStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  message: string;
  rating: number;
  imageUrl: string | null;
  status: TestimonialStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TestimonialStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ListTestimonialsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TestimonialStatus | "ALL";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateTestimonialInput {
  name: string;
  role?: string;
  message: string;
  rating: number;
  imageUrl?: string;
}
