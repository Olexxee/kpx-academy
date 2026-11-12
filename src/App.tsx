import { useEffect, useState } from "react";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { AppRoutes } from "./router";
import { AuthBootstrap } from "./components/auth/AuthBootstrap";

function App({ dehydratedState }: { dehydratedState?: DehydratedState }) {
  const [queryClient] = useState(() => new QueryClient());
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {clientReady ? (
          <AuthBootstrap><AppRoutes /></AuthBootstrap>
        ) : (
          <AppRoutes />
        )}
      </HydrationBoundary>
    </QueryClientProvider>
  );
}

export default App;
