import { useQuery } from "@tanstack/react-query";
import { getTrainingProgramBySlug, getTrainingPrograms } from "../api";
import type { TrainingProgram } from "../types";

export const trainingKeys = {
  all: ["training"] as const,
  lists: () => [...trainingKeys.all, "list"] as const,
  list: () => [...trainingKeys.lists()] as const,
  details: () => [...trainingKeys.all, "detail"] as const,
  detail: (slug: string) => [...trainingKeys.details(), slug] as const,
};

export const useTrainingPrograms = () =>
  useQuery<TrainingProgram[]>({
    queryKey: trainingKeys.list(),
    queryFn: getTrainingPrograms,
    staleTime: Infinity,
  });

export const useTrainingProgram = (slug: string) =>
  useQuery<TrainingProgram>({
    queryKey: trainingKeys.detail(slug),
    queryFn: () => getTrainingProgramBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
