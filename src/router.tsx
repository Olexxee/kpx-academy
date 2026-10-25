import { createBrowserRouter } from "react-router-dom";
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
import { AdminRoute } from "./components/auth/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminTrainingPage from "./pages/admin/AdminTrainingPage";
import AdminRegistrationsPage from "./pages/admin/AdminRegistrationsPage";
import AdminTestimonialsPage from "./features/testimonials/pages/AdminTestimonialsPage";
import AdminCertificatesPage from "./pages/admin/AdminCertificatesPage";
import AdminSiteContentPage from "./pages/admin/AdminSiteContentPage";
import AdminSouvenirsPage from "./pages/admin/AdminSouvenirsPage";
import AdminFounderPage from "./pages/admin/AdminFounderPage";
import ResourcesPage from "./pages/ResourcesPage";
import ResourceReaderPage from "./pages/ResourceReaderPage";
import GalleryPage from "./pages/GalleryPage";

export const router = createBrowserRouter([
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
      { path: "/payment/success", element: <PaymentSuccessPage /> },
      { path: "/payment/failed", element: <PaymentFailedPage /> },
      { path: "/workshops/book", element: <WorkshopBookingPage /> },
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
          { path: "/admin/gallery", element: <AdminSiteContentPage mode="gallery" /> },
          { path: "/admin/resources", element: <AdminSiteContentPage mode="resources" /> },
          { path: "/admin/souvenirs", element: <AdminSouvenirsPage /> },
          { path: "/admin/founder", element: <AdminFounderPage /> },
        ],
      },
    ],
  },
]);
