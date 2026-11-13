import { lazy, Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { Layout } from "./components/layouts/Layout";
import { HomePage } from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import AboutPage from "./pages/AboutPage";
import CertificatesPage from "./pages/CertificatesPage";
import { ProgramDetailsPage } from "./features/training/pages/ProgramDetailsPage";
import { TrainingProgramsPage } from "./features/training/pages/TrainingProgramsPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { PaymentFailedPage } from "./pages/PaymentFailedPage";
import { SouvenirCataloguePage } from "./features/souvenirs/pages/SouvenirCataloguePage";
import { SouvenirProductPage } from "./features/souvenirs/pages/SouvenirProductPage";
import { SouvenirEnquiryPage } from "./features/souvenirs/pages/SouvenirEnquiryPage";
import { SouvenirGuestAccessPage } from "./features/souvenirs/pages/SouvenirGuestAccessPage";
import { WorkshopBookingPage } from "./features/workshops/pages/WorkshopBookingPage";
import { WorkshopBookingTrackerPage } from "./features/workshops/pages/WorkshopBookingTrackerPage";
import { WorkshopGuestAccessPage } from "./features/workshops/pages/WorkshopGuestAccessPage";
import { AdminRoute } from "./components/auth/AdminRoute";
import ResourcesPage from "./pages/ResourcesPage";
import ResourceReaderPage from "./pages/ResourceReaderPage";
import GalleryPage from "./pages/GalleryPage";
import FaqPage from "./pages/FaqPage";

// Keep administrator-only code out of the public route's initial JavaScript.
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
          Loading workspace…
        </div>
      }
    >
      {routes}
    </Suspense>
  );
}
