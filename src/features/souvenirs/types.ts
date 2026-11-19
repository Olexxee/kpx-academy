export interface SouvenirPaletteColor {
  name: string;
  colorHex: string;
}

export const SOUVENIR_COLOR_PALETTE: SouvenirPaletteColor[] = [
  { name: "Black", colorHex: "#000000" },
  { name: "White", colorHex: "#FFFFFF" },
  { name: "Charcoal", colorHex: "#36454F" },
  { name: "Grey", colorHex: "#808080" },
  { name: "Ash Grey", colorHex: "#B2BEB5" },
  { name: "Silver", colorHex: "#C0C0C0" },
  { name: "Ivory", colorHex: "#FFFFF0" },
  { name: "Cream", colorHex: "#FFFDD0" },
  { name: "Beige", colorHex: "#F5F5DC" },
  { name: "Champagne", colorHex: "#F7E7CE" },
  { name: "Navy", colorHex: "#17324D" },
  { name: "Navy Blue", colorHex: "#000080" },
  { name: "Blue", colorHex: "#1565C0" },
  { name: "Sky Blue", colorHex: "#4FC3F7" },
  { name: "Royal Blue", colorHex: "#4169E1" },
  { name: "Cobalt Blue", colorHex: "#0047AB" },
  { name: "Turquoise", colorHex: "#40E0D0" },
  { name: "Teal", colorHex: "#2A7F7F" },
  { name: "Mint Green", colorHex: "#98FF98" },
  { name: "Emerald", colorHex: "#008F6B" },
  { name: "Green", colorHex: "#2E7D32" },
  { name: "Lime", colorHex: "#A4C639" },
  { name: "Yellow", colorHex: "#FDD835" },
  { name: "Gold", colorHex: "#D4A85A" },
  { name: "Orange", colorHex: "#F57C00" },
  { name: "Burnt Orange", colorHex: "#CC5500" },
  { name: "Peach", colorHex: "#FFE5B4" },
  { name: "Coral", colorHex: "#FF7F50" },
  { name: "Red", colorHex: "#E53935" },
  { name: "Cherry Red", colorHex: "#D2042D" },
  { name: "Maroon", colorHex: "#800000" },
  { name: "Burgundy", colorHex: "#800020" },
  { name: "Wine", colorHex: "#722F37" },
  { name: "Pink", colorHex: "#F4A6C1" },
  { name: "Baby Pink", colorHex: "#F4C2C2" },
  { name: "Rose Pink", colorHex: "#F7CAC9" },
  { name: "Hot Pink", colorHex: "#FF69B4" },
  { name: "Magenta", colorHex: "#C2185B" },
  { name: "Fuchsia", colorHex: "#FF00FF" },
  { name: "Purple", colorHex: "#6A1B9A" },
  { name: "Lilac", colorHex: "#C8A2C8" },
  { name: "Brown", colorHex: "#795548" },
  { name: "Coffee Brown", colorHex: "#6F4E37" },
];

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
  active?: boolean;
}

export interface SouvenirPriceTier {
  id: string;
  label: string;
  minQuantity: number;
  maxQuantity?: number | null;
  unitPrice: number | string | null;
  /** Legacy field retained by the backend for old catalogue records. */
  totalPrice: number | string;
  currency: string;
  displayOrder: number;
  active?: boolean;
}

export interface SouvenirPricingBand {
  id: string;
  version: number;
  minQuantity: number;
  maxQuantity: number | null;
  label: string;
  unitPrice: string | number;
  currency: string;
}

export interface SouvenirPricingSchedule {
  productId: string;
  productName: string;
  version: number;
  isValid: boolean;
  isPublished: boolean;
  bands: SouvenirPricingBand[];
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
  archivedAt?: string | null;
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
    unitPrice?: number | string | null;
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
  unitPrice?: number | string | null;
  totalPrice: number | string;
  currency: string;
  status: string;
  colors: Array<{ nameSnapshot: string; colorHexSnapshot: string }>;
  customerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}
