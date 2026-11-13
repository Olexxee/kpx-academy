import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type PublicPageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  image?: string;
  imageAlt?: string;
  variant?: "solid" | "image";
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  image,
  imageAlt = "",
  variant = image ? "image" : "solid",
  children,
  actions,
  className = "",
}: PublicPageHeroProps) {
  const titleId = useId();
  const hasImage = variant === "image" && Boolean(image);

  return (
    <header
      aria-labelledby={titleId}
      className={`public-page-hero relative isolate overflow-hidden text-white ${hasImage ? "bg-[#07152F]" : "bg-[#17324D]"} ${className}`}
    >
      {hasImage && image && (
        <>
          <img
            src={image}
            alt={imageAlt}
            aria-hidden={imageAlt ? undefined : true}
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#07152F]/95 via-[#07152F]/85 to-[#07152F]/65" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07152F]/35 to-transparent" />
        </>
      )}
      <div className="mx-auto w-full max-w-container px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="public-page-hero__content max-w-4xl">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#F4DCD6] sm:text-sm">
            {Icon && <Icon aria-hidden="true" size={16} strokeWidth={2.2} />}
            {eyebrow}
          </p>
          <h1 id={titleId} className="mt-4 max-w-4xl font-heading text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              {description}
            </p>
          )}
          {children}
          {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
