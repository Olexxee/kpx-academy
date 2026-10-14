import { useQuery } from "@tanstack/react-query";
import {
  getAdminTrainingPrograms,
  getTrainingMedia,
} from "../../../api/training.api";

export const trainingAdminKeys = {
  all: ["admin", "training"] as const,

  list: () => [...trainingAdminKeys.all, "list"] as const,

  media: (trainingId: string) =>
    [...trainingAdminKeys.all, "media", trainingId] as const,
};

export const useAdminTrainingPrograms = () => {
  return useQuery({
    queryKey: trainingAdminKeys.list(),
    queryFn: getAdminTrainingPrograms,
  });
};

export const useTrainingMedia = (trainingProgramId: string) => {
  return useQuery({
    queryKey: trainingAdminKeys.media(trainingProgramId),
    queryFn: () => getTrainingMedia(trainingProgramId),
    enabled: Boolean(trainingProgramId),
  });
};
