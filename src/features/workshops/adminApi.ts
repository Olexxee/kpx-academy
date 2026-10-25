import { registrationApi } from "../../lib/registrationApi";
import type { WorkshopType, WorkshopVenueMode } from "./types";

export type WorkshopBookingStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "PROPOSAL_SENT"
  | "ACCEPTED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminWorkshopTier {
  id: string;
  offeringId?: string;
  label: string;
  participantCount: number;
  price: number | string;
  currency: string;
  displayOrder: number;
  active: boolean;
}

export interface AdminWorkshopOffering {
  id: string;
  title: string;
  slug: string;
  workshopType: WorkshopType;
  description: string;
  bookingTerms?: string | null;
  contactEmail?: string | null;
  contactWhatsApp?: string | null;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  participantTiers: AdminWorkshopTier[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminWorkshopBooking {
  id: string;
  publicReference: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  offeringId: string;
  workshopTitleSnapshot: string;
  workshopType: WorkshopType;
  participantCount: number;
  priceSnapshot: number | string | null;
  currency: string;
  eventDate: string;
  venueMode: WorkshopVenueMode;
  venueAddress?: string | null;
  city?: string | null;
  customWorkshopDescription?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  status: WorkshopBookingStatus;
  createdAt: string;
  offering?: { title: string; slug: string };
  participantTier?: { label: string; participantCount: number; price: number | string; currency: string };
}

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const unwrap = <T,>(promise: Promise<{ data: Envelope<T> }>) =>
  promise.then((response) => response.data.data);

export const getAdminWorkshopOfferings = () =>
  unwrap(registrationApi.get<Envelope<AdminWorkshopOffering[]>>("/workshops/admin/offerings"));

export const createAdminWorkshopOffering = (payload: Partial<AdminWorkshopOffering>) =>
  unwrap(registrationApi.post<Envelope<AdminWorkshopOffering>>("/workshops/admin/offerings", payload));

export const updateAdminWorkshopOffering = (id: string, payload: Partial<AdminWorkshopOffering>) =>
  unwrap(registrationApi.patch<Envelope<AdminWorkshopOffering>>(`/workshops/admin/offerings/${encodeURIComponent(id)}`, payload));

export const setAdminWorkshopOfferingActive = (id: string, active: boolean) =>
  unwrap(registrationApi.patch<Envelope<AdminWorkshopOffering>>(`/workshops/admin/offerings/${encodeURIComponent(id)}/status`, { active }));

export const createAdminWorkshopTier = (offeringId: string, payload: {
  label: string; participantCount: number; price: number; currency: string; displayOrder: number;
}) =>
  unwrap(registrationApi.post<Envelope<AdminWorkshopTier>>(`/workshops/admin/offerings/${encodeURIComponent(offeringId)}/tiers`, payload));

export const updateAdminWorkshopTier = (tierId: string, payload: Partial<Pick<AdminWorkshopTier, "label" | "participantCount" | "price" | "currency" | "displayOrder">>) =>
  unwrap(registrationApi.patch<Envelope<AdminWorkshopTier>>(`/workshops/admin/tiers/${encodeURIComponent(tierId)}`, payload));

export const setAdminWorkshopTierActive = (tierId: string, active: boolean) =>
  unwrap(registrationApi.patch<Envelope<AdminWorkshopTier>>(`/workshops/admin/tiers/${encodeURIComponent(tierId)}/status`, { active }));

export const getAdminWorkshopBookings = async (params: { page: number; limit: number; status?: string }) => {
  const response = await registrationApi.get<Envelope<{ items: AdminWorkshopBooking[]; pagination: { page: number; limit: number; total: number } }>>(
    "/workshops/admin/bookings",
    { params },
  );
  return response.data.data;
};

export const updateAdminWorkshopBooking = (id: string, payload: { status?: WorkshopBookingStatus; adminNotes?: string | null }) =>
  unwrap(registrationApi.patch<Envelope<AdminWorkshopBooking>>(`/workshops/admin/bookings/${encodeURIComponent(id)}`, payload));
