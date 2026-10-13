import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article";
}

export const Container = ({
  children,
  className = "",
  as: Component = "div",
}: ContainerProps) => {
  return (
    <Component
      className={[
        "mx-auto w-full max-w-container px-4",
        "sm:px-6 lg:px-8",
        className,
      ].join(" ")}
    >
      {children}
    </Component>
  );
};
