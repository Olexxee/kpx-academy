import type { ImgHTMLAttributes } from "react";

type SiteImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
};

/**
 * Shared rendering defaults for branded site imagery.
 * Layout, cropping, overlays and shadows remain controlled by each placement.
 */
export const SiteImage = ({
  src,
  alt,
  className,
  loading = "lazy",
  decoding = "async",
  ...imageProps
}: SiteImageProps) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading={loading}
    decoding={decoding}
    {...imageProps}
  />
);
