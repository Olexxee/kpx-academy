import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type ExpandableDescriptionProps = {
  text: string;
  className?: string;
};

export const ExpandableDescription = ({
  text,
  className = "",
}: ExpandableDescriptionProps) => {
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || expanded) return;

    const measure = () => {
      setCanExpand(element.scrollHeight > element.clientHeight + 1);
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded]);

  if (!text.trim()) return null;

  return (
    <div>
      <p
        ref={contentRef}
        id={contentId}
        className={`whitespace-pre-line text-sm leading-7 text-text-muted sm:text-base ${!expanded ? "line-clamp-3" : ""} ${className}`.trim()}
      >
        {text}
      </p>

      {canExpand && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          {expanded ? "Show less" : "Read more"}
          {expanded ? (
            <ChevronUp aria-hidden="true" size={16} />
          ) : (
            <ChevronDown aria-hidden="true" size={16} />
          )}
        </button>
      )}
    </div>
  );
};
