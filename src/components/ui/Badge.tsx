import type{ ReactNode } from "react";

type BadgeVariant = "brand" | "success" | "warning" | "error" | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-brand-soft text-brand-dark",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  neutral: "bg-gray-100 text-text-muted",
};

export const Badge = ({
  children,
  variant = "brand",
  className = "",
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
