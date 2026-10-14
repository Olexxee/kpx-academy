export type WorkshopType = "RESIN_ART" | "LIP_CARE_FORMULATION" | "CUSTOM_GROUP";
export type WorkshopVenueMode = "CLIENT_VENUE" | "KPX_VENUE" | "UNDECIDED";

export interface WorkshopParticipantTier {
  id: string;
  label: string;
  participantCount: number;
  price: number | string;
  currency: string;
  displayOrder: number;
}

export interface WorkshopOffering {
  id: string;
  title: string;
  slug: string;
  workshopType: WorkshopType;
  description: string;
  bookingTerms?: string | null;
  contactEmail?: string | null;
  contactWhatsApp?: string | null;
  featured: boolean;
  participantTiers: WorkshopParticipantTier[];
}

export interface WorkshopBookingResult {
  publicReference: string;
  status: string;
  workshopTitle: string;
  participantCount: number;
  price: number | string | null;
  currency: string;
  eventDate: string;
  contactEmail?: string | null;
  contactWhatsApp?: string | null;
}

export interface CreateWorkshopBookingPayload {
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  offeringId: string;
  participantTierId: string;
  eventDate: string;
  venueMode: WorkshopVenueMode;
  venueAddress?: string;
  city?: string;
  customWorkshopDescription?: string;
  customerNotes?: string;
}
