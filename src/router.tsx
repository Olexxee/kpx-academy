import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { Layout } from "./components/layouts/Layout";
import { HomePage } from "./pages/HomePage";
import { AdminRoute } from "./components/auth/AdminRoute";

// Keep the homepage eager: it is the primary landing route and the LCP/SEO entry point.
// Other public pages are loaded only when their route is visited.
const RegistrationPage = lazy(() => import("./pages/RegistrationPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));
const ProgramDetailsPage = lazy(() =>
  import("./features/training/pages/ProgramDetailsPage").then(({ ProgramDetailsPage }) => ({
    default: ProgramDetailsPage,
  })),
);
const TrainingProgramsPage = lazy(() =>
  import("./features/training/pages/TrainingProgramsPage").then(({ TrainingProgramsPage }) => ({
    default: TrainingProgramsPage,
  })),
);
const PaymentSuccessPage = lazy(() =>
  import("./pages/PaymentSuccessPage").then(({ PaymentSuccessPage }) => ({
    default: PaymentSuccessPage,
  })),
);
const PaymentFailedPage = lazy(() =>
  import("./pages/PaymentFailedPage").then(({ PaymentFailedPage }) => ({
    default: PaymentFailedPage,
  })),
);
const SouvenirCataloguePage = lazy(() =>
  import("./features/souvenirs/pages/SouvenirCataloguePage").then(({ SouvenirCataloguePage }) => ({
    default: SouvenirCataloguePage,
  })),
);
const SouvenirProductPage = lazy(() =>
  import("./features/souvenirs/pages/SouvenirProductPage").then(({ SouvenirProductPage }) => ({
    default: SouvenirProductPage,
  })),
);
const SouvenirEnquiryPage = lazy(() =>
  import("./features/souvenirs/pages/SouvenirEnquiryPage").then(({ SouvenirEnquiryPage }) => ({
    default: SouvenirEnquiryPage,
  })),
);
const SouvenirGuestAccessPage = lazy(() =>
  import("./features/souvenirs/pages/SouvenirGuestAccessPage").then(({ SouvenirGuestAccessPage }) => ({
    default: SouvenirGuestAccessPage,
  })),
);
const WorkshopBookingPage = lazy(() =>
  import("./features/workshops/pages/WorkshopBookingPage").then(({ WorkshopBookingPage }) => ({
    default: WorkshopBookingPage,
  })),
);
const WorkshopBookingTrackerPage = lazy(() =>
  import("./features/workshops/pages/WorkshopBookingTrackerPage").then(({ WorkshopBookingTrackerPage }) => ({
    default: WorkshopBookingTrackerPage,
  })),
);
const WorkshopGuestAccessPage = lazy(() =>
  import("./features/workshops/pages/WorkshopGuestAccessPage").then(({ WorkshopGuestAccessPage }) => ({
    default: WorkshopGuestAccessPage,
  })),
);
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ResourceReaderPage = lazy(() => import("./pages/ResourceReaderPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));

// Administrator-only modules remain independently split from public routes.
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminTrainingPage = lazy(() => import("./pages/admin/AdminTrainingPage"));
const AdminRegistrationsPage = lazy(() => import("./pages/admin/AdminRegistrationsPage"));
const AdminTestimonialsPage = lazy(() => import("./features/testimonials/pages/AdminTestimonialsPage"));
const AdminCertificatesPage = lazy(() => import("./pages/admin/AdminCertificatesPage"));
const AdminSiteContentPage = lazy(() => import("./pages/admin/AdminSiteContentPage"));
const AdminCreativeWorkspacePage = lazy(() => import("./pages/admin/AdminCreativeWorkspacePage"));
const AdminSouvenirsPage = lazy(() => import("./pages/admin/AdminSouvenirsPage"));
const AdminFounderPage = lazy(() => import("./pages/admin/AdminFounderPage"));
const AdminLogoPage = lazy(() => import("./pages/admin/AdminLogoPage"));
const AdminOrganizationPage = lazy(() => import("./pages/admin/AdminOrganizationPage"));
const AdminFaqPage = lazy(() => import("./pages/admin/AdminFaqPage"));

const routeDefinitions = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/register", element: <RegistrationPage /> },
      { path: "/programs", element: <TrainingProgramsPage /> },
      { path: "/courses", element: <TrainingProgramsPage /> },
      { path: "/programs/:slug", element: <ProgramDetailsPage /> },
      { path: "/certificates", element: <CertificatesPage /> },
      { path: "/resources", element: <ResourcesPage /> },
      { path: "/resources/:slug", element: <ResourceReaderPage /> },
      { path: "/gallery", element: <GalleryPage /> },
      { path: "/faq", element: <FaqPage /> },
      { path: "/payment/success", element: <PaymentSuccessPage /> },
      { path: "/payment/failed", element: <PaymentFailedPage /> },
      { path: "/workshops/book", element: <WorkshopBookingPage /> },
      { path: "/workshops/track-booking", element: <WorkshopBookingTrackerPage /> },
      { path: "/workshops/access/:reference/:token", element: <WorkshopGuestAccessPage /> },
      { path: "/souvenirs", element: <SouvenirCataloguePage /> },
      { path: "/souvenirs/enquire", element: <SouvenirEnquiryPage /> },
      { path: "/souvenirs/:resource/access/:token", element: <SouvenirGuestAccessPage /> },
      { path: "/souvenirs/:slug", element: <SouvenirProductPage /> },
    ],
  },
  { path: "/admin/login", element: <LoginPage /> },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
          { path: "/admin/training", element: <AdminTrainingPage /> },
          { path: "/admin/registrations", element: <AdminRegistrationsPage /> },
          { path: "/admin/testimonials", element: <AdminTestimonialsPage /> },
          { path: "/admin/certificates", element: <AdminCertificatesPage /> },
          { path: "/admin/creative-workspace", element: <AdminCreativeWorkspacePage /> },
          { path: "/admin/content", element: <AdminSiteContentPage mode="hero" /> },
          { path: "/admin/logo", element: <AdminLogoPage /> },
          { path: "/admin/organization", element: <AdminOrganizationPage /> },
          { path: "/admin/faq", element: <AdminFaqPage /> },
          { path: "/admin/gallery", element: <AdminSiteContentPage mode="gallery" /> },
          { path: "/admin/resources", element: <AdminSiteContentPage mode="resources" /> },
          { path: "/admin/souvenirs", element: <AdminSouvenirsPage /> },
          { path: "/admin/founder", element: <AdminFounderPage /> },
        ],
      },
    ],
  },
];

export function AppRoutes() {
  const routes = useRoutes(routeDefinitions);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-muted" role="status">
          Loading page…
        </div>
      }
    >
      {routes}
    </Suspense>
  );
}
