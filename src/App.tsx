import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./router";
import { AuthBootstrap } from "./components/auth/AuthBootstrap";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {clientReady ? (
        <AuthBootstrap>
          <AppRoutes />
        </AuthBootstrap>
      ) : (
        <AppRoutes />
      )}
    </QueryClientProvider>
  );
}

export default App;
