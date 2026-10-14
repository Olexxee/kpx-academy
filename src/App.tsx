import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router";
import { AuthBootstrap } from "./components/auth/AuthBootstrap";

// Create a client instance outside the component
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap><RouterProvider router={router} /></AuthBootstrap>
    </QueryClientProvider>
  );
}

export default App;
