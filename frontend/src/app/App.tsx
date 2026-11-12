import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { MockEnvironmentProvider } from "@/features/auth/mock-environment";
import { SessionProvider } from "@/features/auth/session";
import { queryClient } from "./query-client";
import { AppRoutes } from "./routes";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MockEnvironmentProvider>
        <SessionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SessionProvider>
      </MockEnvironmentProvider>
    </QueryClientProvider>
  );
}
