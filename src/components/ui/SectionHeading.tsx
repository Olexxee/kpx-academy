interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) => {
  const isCentered = align === "center";

  return (
    <div
      className={[
        "mb-10 sm:mb-12",
        isCentered ? "mx-auto text-center" : "text-left",
        isCentered ? "max-w-3xl" : "max-w-2xl",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-secondary sm:text-sm">
          {eyebrow}
        </span>
      )}

      <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
};
