import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationProfile, getSiteBranding } from "../../api/siteContent.api";

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "About KPX Academy", to: "/about" },
  { label: "Training programmes", to: "/programs" },
  { label: "Creative workshops", to: "/workshops/book" },
  { label: "Souvenir catalogue", to: "/souvenirs" },
  { label: "Certificates", to: "/certificates" },
  { label: "Registration", to: "/register" },
];

const footerLinkClass =
  "text-sm leading-6 text-white/80 transition-colors hover:text-[#F4DCD6] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4DCD6]";

const socialLinks = [
  ["Instagram", "instagramUrl"],
  ["Facebook", "facebookUrl"],
  ["LinkedIn", "linkedinUrl"],
  ["TikTok", "tiktokUrl"],
  ["YouTube", "youtubeUrl"],
] as const;

export const SiteFooter = () => {
  const currentYear = new Date().getFullYear();
  const branding = useQuery({ queryKey: ["site-content", "branding"], queryFn: getSiteBranding, staleTime: 5 * 60 * 1000 });
  const organization = useQuery({ queryKey: ["site-content", "organization"], queryFn: getOrganizationProfile, staleTime: 5 * 60 * 1000 });
  const profile = organization.data;
  const whatsappNumber = profile?.whatsapp?.replace(/[^0-9]/g, "");

  return (
    <footer className="site-footer bg-primary text-white">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_0.9fr] lg:gap-10">
          <div>
            <Link to="/" aria-label="KPX Academy home" className="inline-flex items-center gap-2 rounded-sm">
              {branding.data?.logoUrl ? <img src={branding.data.logoUrl} alt={branding.data.logoAltText || profile?.organizationName || "KPX Academy"} className="h-14 w-14 rounded-full border border-white/20 bg-white p-1 object-contain" /> : <span className="font-heading text-2xl font-bold tracking-tight text-white">{profile?.organizationName || "KPX Academy"}</span>}
            </Link>
            <p className="mt-4 max-w-md font-heading text-lg font-semibold text-white">
              {profile?.tagline || "Practical Skills. More Possibilities."}
            </p>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/75">
              {profile?.description || "Practical training and detailed knowledge to help learners develop useful skills and put what they learn into practice."}
            </p>
            {socialLinks.some(([_, key]) => profile?.[key]) && (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {socialLinks.map(([label, key]) => profile?.[key] ? <a key={key} href={profile[key] ?? undefined} target="_blank" rel="noreferrer noopener" className={footerLinkClass}>{label}</a> : null)}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">Explore</h2>
            <ul className="space-y-3">
              {exploreLinks.map((item) => (
                <li key={item.to}><Link to={item.to} className={footerLinkClass}>{item.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">Contact</h2>
            <ul className="space-y-3 text-sm leading-6 text-white/80">
              {profile?.contactEmail && <li><a className={footerLinkClass} href={`mailto:${profile.contactEmail}`}>{profile.contactEmail}</a></li>}
              {profile?.phone && <li><a className={footerLinkClass} href={`tel:${profile.phone.replace(/[^+0-9]/g, "")}`}>{profile.phone}</a></li>}
              {profile?.whatsapp && whatsappNumber && <li><a className={footerLinkClass} href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer noopener">Chat on WhatsApp</a></li>}
              {profile?.address && <li className="max-w-xs whitespace-pre-line">{profile.address}</li>}
              {profile?.operatingHours && <li className="max-w-xs whitespace-pre-line"><span className="font-semibold text-white">Hours:</span> {profile.operatingHours}</li>}
              {!profile?.contactEmail && !profile?.phone && !profile?.whatsapp && !profile?.address && !profile?.operatingHours && <li>Contact details will be published here.</li>}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-heading text-sm font-semibold text-white">Our approach</h2>
            <p className="max-w-xs text-sm leading-7 text-white/75">Learn with purpose. Build through practice. Discover what your skills can make possible.</p>
            <Link to="/about" className={`${footerLinkClass} mt-4 inline-flex`}>Learn more about {profile?.organizationName || "KPX"}</Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/20 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-white/75">{profile?.copyrightText || `© ${currentYear} ${profile?.organizationName || "KPX Academy"}. All rights reserved.`}</p>
          <p className="font-medium text-white/75">Learn It. Build With It.</p>
        </div>
      </Container>
    </footer>
  );
};
