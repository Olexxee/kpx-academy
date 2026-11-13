const CLOUDINARY_IMAGE_MARKER = "/image/upload/";

export const isCloudinaryImage = (src: string): boolean =>
  src.includes("res.cloudinary.com/") && src.includes(CLOUDINARY_IMAGE_MARKER);

/**
 * Requests a browser-appropriate format and quality from Cloudinary while
 * bounding the delivered image width to the rendered placement.
 */
export const getCloudinaryImageUrl = (src: string, width: number): string => {
  if (!isCloudinaryImage(src)) return src;

  const markerIndex = src.indexOf(CLOUDINARY_IMAGE_MARKER);
  const insertionIndex = markerIndex + CLOUDINARY_IMAGE_MARKER.length;
  const transformations = `f_auto,q_auto,w_${Math.round(width)},c_limit`;

  return `${src.slice(0, insertionIndex)}${transformations}/${src.slice(insertionIndex)}`;
};

export const getCloudinaryImageSrcSet = (src: string): string | undefined => {
  if (!isCloudinaryImage(src)) return undefined;

  return [480, 768, 1024, 1440, 1920]
    .map((width) => `${getCloudinaryImageUrl(src, width)} ${width}w`)
    .join(", ");
};
