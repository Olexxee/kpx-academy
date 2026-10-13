import { registrationApi } from "../../lib/registrationApi";
import type {
  CreateTrainingData,
  ProgramMedia,
  TrainingProgram,
} from "./types";

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ============================================================================
// PUBLIC — PROGRAMS
// ============================================================================

export const getTrainingPrograms = async (): Promise<TrainingProgram[]> => {
  const res =
    await registrationApi.get<Envelope<TrainingProgram[]>>("/training");
  return res.data.data;
};

export const getTrainingProgramBySlug = async (
  slug: string,
): Promise<TrainingProgram> => {
  const res = await registrationApi.get<Envelope<TrainingProgram>>(
    `/training/slug/${slug}`,
  );
  return res.data.data;
};

// ============================================================================
// PUBLIC — MEDIA
// ============================================================================

export const getTrainingProgramMedia = async (
  programId: string,
): Promise<ProgramMedia[]> => {
  const res = await registrationApi.get<Envelope<ProgramMedia[]>>(
    `/training/${programId}/media`,
  );
  return res.data.data;
};

// ============================================================================
// ADMIN — PROGRAMS
// ============================================================================

export const getAdminTrainingPrograms = async (): Promise<
  TrainingProgram[]
> => {
  const res = await registrationApi.get<Envelope<TrainingProgram[]>>(
    "/training/admin/all",
  );
  return res.data.data;
};

export const createTrainingProgram = async (
  data: CreateTrainingData,
): Promise<TrainingProgram> => {
  const res = await registrationApi.post<Envelope<TrainingProgram>>(
    "/training/admin",
    data,
  );
  return res.data.data;
};

export const updateTrainingProgram = async (
  id: string,
  data: Partial<CreateTrainingData>,
): Promise<TrainingProgram> => {
  const res = await registrationApi.patch<Envelope<TrainingProgram>>(
    `/training/admin/${id}`,
    data,
  );
  return res.data.data;
};

export const deleteTrainingProgram = async (id: string): Promise<void> => {
  await registrationApi.delete(`/training/admin/${id}`);
};

export const toggleTrainingStatus = async (
  id: string,
  active: boolean,
): Promise<TrainingProgram> => {
  const res = await registrationApi.patch<Envelope<TrainingProgram>>(
    `/training/admin/${id}/status`,
    { active },
  );
  return res.data.data;
};

export const toggleTrainingFeatured = async (
  id: string,
  featured: boolean,
): Promise<TrainingProgram> => {
  const res = await registrationApi.patch<Envelope<TrainingProgram>>(
    `/training/admin/${id}/featured`,
    { featured },
  );
  return res.data.data;
};

// ============================================================================
// ADMIN — MEDIA
// ============================================================================

export const uploadTrainingMedia = async (
  programId: string,
  file: File,
): Promise<ProgramMedia> => {
  const fd = new FormData();
  fd.append("media", file);

  const res = await registrationApi.post<Envelope<ProgramMedia>>(
    `/training/${programId}/media`,
    fd,
  );
  return res.data.data;
};

export const deleteTrainingMedia = async (
  programId: string,
  mediaId: string,
): Promise<void> => {
  await registrationApi.delete(`/training/${programId}/media/${mediaId}`);
};

export const setPrimaryTrainingMedia = async (
  programId: string,
  mediaId: string,
): Promise<ProgramMedia> => {
  const res = await registrationApi.patch<Envelope<ProgramMedia>>(
    `/training/${programId}/media/${mediaId}/primary`,
  );
  return res.data.data;
};
