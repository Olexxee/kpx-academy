import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/layouts/Layout";
import { HomePage } from "./pages/HomePage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      // Future routes will be added here as children:
      // { path: '/programs', element: <ProgramsPage /> },
      // { path: '/about', element: <AboutPage /> },
    ],
  },
]);
