// src/features/training/utils/media.ts
import type { ProgramMedia } from "../types";

export const isImage = (m: ProgramMedia): boolean =>
  m.type === "IMAGE" || (m.mimeType?.startsWith("image/") ?? false);

export const isVideo = (m: ProgramMedia): boolean =>
  m.type === "VIDEO" || (m.mimeType?.startsWith("video/") ?? false);

/**
 * Pick the image to represent a program.
 * Priority: primary image → first image by sortOrder → null.
 * Only ever returns an image (never a video) — a video as a card
 * thumbnail is fine, but callers looking for a static hero should get
 * one.
 */
export const getPrimaryImage = (
  media: ProgramMedia[] | null | undefined,
): ProgramMedia | null => {
  if (!media?.length) return null;
  const images = media.filter(isImage);
  if (!images.length) return null;

  const primary = images.find((m) => m.isPrimary);
  if (primary) return primary;

  return [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
};

/**
 * Any primary media (image or video). Use for hero slots that accept video.
 */
export const getPrimaryMedia = (
  media: ProgramMedia[] | null | undefined,
): ProgramMedia | null => {
  if (!media?.length) return null;
  const primary = media.find((m) => m.isPrimary);
  if (primary) return primary;
  return [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
};

/**
 * Full gallery, sorted by sortOrder. Excludes entries without a URL.
 */
export const getGallery = (
  media: ProgramMedia[] | null | undefined,
): ProgramMedia[] => {
  if (!media?.length) return [];
  return media
    .filter((m) => Boolean(m.url))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};
