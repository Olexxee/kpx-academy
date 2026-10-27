export interface SouvenirMedia {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface SouvenirColorOption {
  id: string;
  name: string;
  colorHex: string;
  swatchImageUrl?: string | null;
  displayOrder: number;
}

export interface SouvenirPriceTier {
  id: string;
  label: string;
  minQuantity: number;
  maxQuantity?: number | null;
  totalPrice: number | string;
  currency: string;
  displayOrder: number;
  active?: boolean;
}

export interface SouvenirProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  bookingTerms?: string | null;
  productionLeadTimeDays?: number | null;
  featured: boolean;
  active: boolean;
  displayOrder: number;
  media: SouvenirMedia[];
  colorOptions: SouvenirColorOption[];
  priceTiers: SouvenirPriceTier[];
}

export interface SouvenirOrderResult {
  payment: {
    paymentId: string;
    reference: string;
    authorizationUrl: string;
    accessCode?: string | null;
    amount: number | string;
    currency: string;
  } | null;
  paymentError?: string | null;
  order: {
    publicReference: string;
    productName: string;
    quantity: number;
    totalPrice: number | string;
    currency: string;
    status: string;
    colorSelections: Array<{ nameSnapshot: string; colorHexSnapshot: string }>;
  };
  accessToken: string;
  accessUrlPath: string;
}

export interface SouvenirEnquiryResult {
  enquiry: {
    publicReference: string;
    status: string;
    mediaCount: number;
    createdAt: string;
  };
  accessToken: string;
  accessUrlPath: string;
}

export interface SouvenirQuoteItem {
  id: string;
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
}

export interface SouvenirQuote {
  id: string;
  version: number;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "SUPERSEDED";
  currency: string;
  totalAmount: number | string;
  terms?: string | null;
  message?: string | null;
  expiresAt?: string | null;
  sentAt?: string | null;
  respondedAt?: string | null;
  items: SouvenirQuoteItem[];
  media: Array<{ url: string; mimeType?: string | null; originalName?: string | null }>;
}

export interface SouvenirGuestEnquiry {
  publicReference: string;
  customerName: string;
  product?: { id: string; name: string; slug: string } | null;
  requestedQuantity?: number | null;
  designDescription: string;
  status: string;
  responseMessage?: string | null;
  media: Array<{ url: string; mimeType?: string | null; originalName?: string | null }>;
  latestQuote: SouvenirQuote | null;
  createdAt: string;
  updatedAt: string;
}

export interface SouvenirGuestOrder {
  publicReference: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalPrice: number | string;
  currency: string;
  status: string;
  colors: Array<{ nameSnapshot: string; colorHexSnapshot: string }>;
  customerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}
