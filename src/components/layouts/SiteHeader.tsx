import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Container } from "../ui/Container";

const navigation = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Programmes", to: "/programs" },
  { label: "Creative Workshops", to: "/workshops/book" },
  { label: "Souvenirs", to: "/souvenirs" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "text-sm font-medium transition-colors duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-secondary focus-visible:ring-offset-4",
    isActive ? "text-secondary" : "text-text-muted hover:text-primary",
  ].join(" ");

const ctaClass =
  "inline-flex min-h-11 items-center justify-center rounded-control " +
  "bg-secondary px-5 py-3 text-sm font-semibold text-white " +
  "transition-colors hover:bg-primary " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-secondary focus-visible:ring-offset-2";

export const SiteHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-neutral/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-sm"
            aria-label="KPX Academy home"
          >
            <span className="font-heading text-xl font-bold tracking-tight text-primary sm:text-2xl">
              KPX
            </span>
            <span className="font-heading text-xl font-bold tracking-tight text-secondary sm:text-2xl">
              ACADEMY
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 lg:flex xl:gap-8"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/programs" className={`${ctaClass} hidden lg:inline-flex`}>
            Explore programmes
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-control text-primary transition-colors hover:bg-accent-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border py-5 lg:hidden">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    [
                      "rounded-control px-3 py-3 text-base font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
                      isActive ? "bg-accent-blush text-primary" : "text-text-muted hover:bg-white hover:text-primary",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link to="/programs" className={`${ctaClass} mt-3 w-full`}>
                Explore programmes
              </Link>
            </div>
          </nav>
        )}
      </Container>
    </header>
  );
};
