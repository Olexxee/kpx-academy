import { registrationApi } from "../lib/registrationApi";

export interface TrainingProgram {
  imageUrl: any;
  image: any;
  id: string;
  title: string;
  slug: string;

  shortDescription?: string | null;
  description?: string | null;

  price: number;
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

  media?: TrainingMedia[];

  createdAt: string;
  updatedAt: string;
}

export interface TrainingMedia {
  id: string;
  trainingProgramId: string;

  url: string;
  publicId: string;

  type?: "IMAGE" | "VIDEO";

  mimeType?: string | null;
  format?: string | null;
  bytes?: number | null;

  width?: number | null;
  height?: number | null;
  duration?: number | null;

  isPrimary: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt?: string;
}

export interface CreateTrainingData {
  title: string;
  slug?: string | null;

  shortDescription?: string | null;
  description?: string | null;

  price: number;
  currency?: string;

  duration?: string | null;

  deliveryMode?: "PHYSICAL" | "ONLINE" | "HYBRID";
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

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ============================================================
// PUBLIC TRAINING
// ============================================================

export const getTrainingPrograms = async (): Promise<TrainingProgram[]> => {
  const response =
    await registrationApi.get<Envelope<TrainingProgram[]>>("/training");

  return response.data.data;
};

export const getTrainingProgramBySlug = async (
  slug: string,
): Promise<TrainingProgram> => {
  const response = await registrationApi.get<Envelope<TrainingProgram>>(
    `/training/slug/${slug}`,
  );

  return response.data.data;
};

// ============================================================
// ADMIN TRAINING
// ============================================================

export const getAdminTrainingPrograms = async (): Promise<
  TrainingProgram[]
> => {
  const response = await registrationApi.get<Envelope<TrainingProgram[]>>(
    "/training/admin/all",
  );

  return response.data.data;
};

export const createTrainingProgram = async (
  data: CreateTrainingData,
): Promise<TrainingProgram> => {
  const response = await registrationApi.post<Envelope<TrainingProgram>>(
    "/training/admin",
    data,
  );

  return response.data.data;
};

export const updateTrainingProgram = async (
  id: string,
  data: Partial<CreateTrainingData>,
): Promise<TrainingProgram> => {
  const response = await registrationApi.patch<Envelope<TrainingProgram>>(
    `/training/admin/${id}`,
    data,
  );

  return response.data.data;
};

export const deleteTrainingProgram = async (id: string) => {
  const response = await registrationApi.delete(`/training/admin/${id}`);

  return response.data;
};

export const toggleTrainingStatus = async (
  id: string,
  active: boolean,
): Promise<TrainingProgram> => {
  const response = await registrationApi.patch<Envelope<TrainingProgram>>(
    `/training/admin/${id}/status`,
    {
      active,
    },
  );

  return response.data.data;
};

export const toggleTrainingFeatured = async (
  id: string,
  featured: boolean,
): Promise<TrainingProgram> => {
  const response = await registrationApi.patch<Envelope<TrainingProgram>>(
    `/training/admin/${id}/featured`,
    {
      featured,
    },
  );

  return response.data.data;
};

// ============================================================
// TRAINING MEDIA
// ============================================================

export const getTrainingMedia = async (
  trainingProgramId: string,
): Promise<TrainingMedia[]> => {
  const response = await registrationApi.get<Envelope<TrainingMedia[]>>(
    `/training/${trainingProgramId}/media`,
  );

  return response.data.data;
};

export const uploadTrainingMedia = async (
  trainingProgramId: string,
  file: File,
): Promise<TrainingMedia> => {
  const formData = new FormData();

  formData.append("media", file);

  const response = await registrationApi.post<Envelope<TrainingMedia>>(
    `/training/${trainingProgramId}/media`,
    formData,
  );

  return response.data.data;
};

export const deleteTrainingMedia = async (
  trainingProgramId: string,
  mediaId: string,
) => {
  const response = await registrationApi.delete(
    `/training/${trainingProgramId}/media/${mediaId}`,
  );

  return response.data;
};

export const setPrimaryTrainingMedia = async (
  trainingProgramId: string,
  mediaId: string,
): Promise<TrainingMedia> => {
  const response = await registrationApi.patch<Envelope<TrainingMedia>>(
    `/training/${trainingProgramId}/media/${mediaId}/primary`,
  );

  return response.data.data;
};
