// src/features/training/types.ts

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type DeliveryMode = "PHYSICAL" | "ONLINE" | "HYBRID";
export type MediaType = "IMAGE" | "VIDEO";

export interface ProgramMedia {
  id: string;
  trainingProgramId: string;

  url: string;
  publicId: string;

  /** Optional on old rows; new uploads always set it. Infer from mimeType when missing. */
  type?: MediaType;

  mimeType?: string | null;
  format?: string | null;
  bytes?: number | null;

  width?: number | null;
  height?: number | null;
  /** Video duration in seconds. */
  duration?: number | null;

  isPrimary: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt?: string;
}

export interface TrainingProgram {
  id: string;
  title: string;
  slug: string;

  shortDescription?: string | null;
  description?: string | null;

  /** Prisma Decimal serializes as string; accept both. Coerce via Number(). */
  price: number | string;
  currency: string;

  duration?: string | null;

  deliveryMode: DeliveryMode;
  location?: string | null;

  startDate?: string | null;
  endDate?: string | null;
  registrationDeadline?: string | null;

  capacity?: number | null;

  featured: boolean;
  active: boolean;
  displayOrder: number;

  highlights?: string[] | null;
  curriculum?: string[] | null;
  requirements?: string[] | null;
  benefits?: string[] | null;

  media?: ProgramMedia[];

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WRITE PAYLOADS
// ============================================================================

export interface CreateTrainingData {
  title: string;
  slug?: string | null;

  shortDescription?: string | null;
  description?: string | null;

  price: number;
  currency?: string;

  duration?: string | null;

  deliveryMode?: DeliveryMode;
  location?: string | null;

  startDate?: string | null;
  endDate?: string | null;
  registrationDeadline?: string | null;

  capacity?: number | null;

  featured?: boolean;
  active?: boolean;
  displayOrder?: number;

  highlights?: string[];
  curriculum?: string[];
  requirements?: string[];
  benefits?: string[];
}

// ============================================================================
// ADMIN FORM VALUES (string-buffered)
// ============================================================================

export interface TrainingProgramFormValues {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;

  price: number;
  currency: string;

  duration: string;

  deliveryMode: DeliveryMode;
  location: string;

  startDate: string;
  endDate: string;
  registrationDeadline: string;

  capacity: number | null;

  active: boolean;
  featured: boolean;
  displayOrder: number;

  highlights: string[];
  curriculum: string[];
  requirements: string[];
  benefits: string[];
}
