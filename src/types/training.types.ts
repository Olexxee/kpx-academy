export interface TrainingProgram {
  id: string;
  title: string;
  slug: string;

  shortDescription?: string | null;
  description?: string | null;

  price: number | string;
  currency: string;

  duration?: string | null;

  deliveryMode: "PHYSICAL" | "ONLINE" | "HYBRID";
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

export interface TrainingProgramFormValues {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;

  price: number;
  currency: string;

  duration: string;

  deliveryMode: "PHYSICAL" | "ONLINE" | "HYBRID";
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

export type ProgramMedia = {
  id?: string;
  trainingProgramId?: string;

  url?: string;
  publicId?: string;

  type?: "IMAGE" | "VIDEO";

  mimeType?: string | null;
  format?: string | null;
  bytes?: number | null;

  width?: number | null;
  height?: number | null;
  duration?: number | null;

  isPrimary?: boolean;
  sortOrder?: number;

  createdAt?: string;
  updatedAt?: string;
};

export type Program = TrainingProgram;
