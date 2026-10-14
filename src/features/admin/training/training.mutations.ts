import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
  toggleTrainingStatus,
  toggleTrainingFeatured,
  uploadTrainingMedia,
  deleteTrainingMedia,
  setPrimaryTrainingMedia,
} from "../../../api/training.api";

import { trainingAdminKeys } from "./training.queries";

export const useCreateTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrainingProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.list(),
      });
    },
  });
};

export const useUpdateTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateTrainingProgram>[1];
    }) => updateTrainingProgram(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.list(),
      });
    },
  });
};

export const useDeleteTrainingProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrainingProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.list(),
      });
    },
  });
};

export const useToggleTrainingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleTrainingStatus(id, active),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.list(),
      });
    },
  });
};

export const useToggleTrainingFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleTrainingFeatured(id, featured),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.list(),
      });
    },
  });
};

export const useUploadTrainingMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trainingProgramId,
      file,
    }: {
      trainingProgramId: string;
      file: File;
    }) => uploadTrainingMedia(trainingProgramId, file),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.media(variables.trainingProgramId),
      });
    },
  });
};

export const useDeleteTrainingMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trainingProgramId,
      mediaId,
    }: {
      trainingProgramId: string;
      mediaId: string;
    }) => deleteTrainingMedia(trainingProgramId, mediaId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.media(variables.trainingProgramId),
      });
    },
  });
};

export const useSetPrimaryTrainingMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trainingProgramId,
      mediaId,
    }: {
      trainingProgramId: string;
      mediaId: string;
    }) => setPrimaryTrainingMedia(trainingProgramId, mediaId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: trainingAdminKeys.media(variables.trainingProgramId),
      });
    },
  });
};
