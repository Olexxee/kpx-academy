import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layouts/Layout";
import { HomePage } from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import AboutPage from "./pages/AboutPage";
import { ProgramDetailsPage } from "./features/training/pages/ProgramDetailsPage";
import { TrainingProgramsPage } from "./features/training/pages/TrainingProgramsPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { PaymentFailedPage } from "./pages/PaymentFailedPage";
import { SouvenirCataloguePage } from "./features/souvenirs/pages/SouvenirCataloguePage";
import { SouvenirProductPage } from "./features/souvenirs/pages/SouvenirProductPage";
import { SouvenirEnquiryPage } from "./features/souvenirs/pages/SouvenirEnquiryPage";
import { SouvenirGuestAccessPage } from "./features/souvenirs/pages/SouvenirGuestAccessPage";

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
      { path: "/payment/success", element: <PaymentSuccessPage /> },
      { path: "/payment/failed", element: <PaymentFailedPage /> },
      { path: "/souvenirs", element: <SouvenirCataloguePage /> },
      { path: "/souvenirs/enquire", element: <SouvenirEnquiryPage /> },
      { path: "/souvenirs/:resource/access/:token", element: <SouvenirGuestAccessPage /> },
      { path: "/souvenirs/:slug", element: <SouvenirProductPage /> },
    ],
  },
]);
