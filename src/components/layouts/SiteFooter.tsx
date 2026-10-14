import { Link } from "react-router-dom";
import { Container } from "../ui/Container";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "About KPX Academy", to: "/about" },
  { label: "Training programmes", to: "/programs" },
  { label: "Registration", to: "/register" },
];

const footerLinkClass =
  "text-sm leading-6 text-white/85 transition-colors hover:text-[#F4DCD6] " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#F4DCD6] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[#1D4ED8]";

export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer bg-primary text-white">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:gap-12">
          <div>
            <Link to="/" aria-label="KPX Academy home" className="inline-flex items-center gap-1 rounded-sm">
              <span className="font-heading text-2xl font-bold tracking-tight text-white">KPX</span>
              <span className="font-heading text-2xl font-bold tracking-tight text-[#F4DCD6]">ACADEMY</span>
            </Link>

            <p className="mt-4 max-w-md font-heading text-lg font-semibold text-white">
              Practical Skills. More Possibilities.
            </p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
              Practical training and detailed knowledge to help learners develop useful skills and put what they learn into practice.
            </p>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">Explore</h2>
            <ul className="space-y-3">
              {exploreLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLinkClass}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">Our approach</h2>
            <p className="max-w-xs text-sm leading-7 text-white/80">
              Learn with purpose. Build through practice. Discover what your skills can make possible.
            </p>
            <Link to="/about" className={`${footerLinkClass} mt-4 inline-flex`}>
              Learn more about KPX
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/20 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/80">&copy; {currentYear} KPX Academy. All rights reserved.</p>
          <p className="font-medium text-white/80">Learn It. Build With It.</p>
        </div>
      </Container>
    </footer>
  );
};
