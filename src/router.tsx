import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layouts/Layout";
import { HomePage } from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import AboutPage from "./pages/AboutPage";
import { ProgramDetailsPage } from "./features/training/pages/ProgramDetailsPage";
import { TrainingProgramsPage } from "./features/training/pages/TrainingProgramsPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { PaymentFailedPage } from "./pages/PaymentFailedPage";

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
    ],
  },
]);
