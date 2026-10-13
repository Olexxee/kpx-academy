// src/features/training/hooks/useTrainingMedia.ts
import { useQuery } from "@tanstack/react-query";
import { getTrainingProgramMedia } from "../api";
import type { ProgramMedia } from "../types";

export const trainingMediaKeys = {
  all: ["training", "media"] as const,
  forProgram: (programId: string) =>
    [...trainingMediaKeys.all, programId] as const,
};

export const useTrainingMedia = (programId: string | undefined) =>
  useQuery<ProgramMedia[]>({
    queryKey: programId
      ? trainingMediaKeys.forProgram(programId)
      : [...trainingMediaKeys.all, "disabled"],
    queryFn: () => {
      if (!programId) throw new Error("programId is required");
      return getTrainingProgramMedia(programId);
    },
    enabled: Boolean(programId),
    staleTime: 1000 * 60 * 5,
  });
