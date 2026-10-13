import { Link } from "react-router-dom";
import { Container } from "../ui/Container";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "About KPX Academy", to: "/about" },
  { label: "Training Programmes", to: "/courses" },
  { label: "Gallery", to: "/gallery" },
  { label: "Resources", to: "/resources" },
  { label: "Contact", to: "/contact" },
];

const supportLinks = [
  { label: "FAQs", to: "/faqs" },
  { label: "Certificate Information", to: "/certificates" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

const footerLinkClass =
  "text-sm leading-6 text-white/90 transition-colors hover:text-[#D4A85A] " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#D4A85A] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-primary";

export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer bg-primary text-white">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link
              to="/"
              aria-label="KPX Academy home"
              className="inline-flex items-center gap-1 rounded-sm"
            >
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                KPX
              </span>
              <span className="font-heading text-2xl font-bold tracking-tight text-[#62B6B0]">
                ACADEMY
              </span>
            </Link>

            <p className="mt-3 font-heading text-sm font-semibold text-[#E4BE79]">
              Practical Skills. More Possibilities.
            </p>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/90">
              We provide practical training, detailed knowledge, and guidance to
              help people develop useful skills and explore new possibilities.
            </p>

            <p className="mt-4 text-xs font-semibold uppercase leading-6 tracking-[0.12em] text-white/80">
              Practical Knowledge. Detailed Training. Real Value.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">
              Explore
            </h2>

            <ul className="space-y-3">
              {exploreLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">
              Support & Information
            </h2>

            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/25 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/85">
            &copy; {currentYear} KPX Academy. All rights reserved.
          </p>

          <p className="font-medium text-white/85">Learn It. Build With It.</p>
        </div>
      </Container>
    </footer>
  );
};
