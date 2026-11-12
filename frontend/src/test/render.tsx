import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { MockEnvironmentProvider } from "@/features/auth/mock-environment";
import { SessionProvider } from "@/features/auth/session";

export function renderWithProviders(ui: ReactNode, route = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MockEnvironmentProvider>
        <SessionProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </SessionProvider>
      </MockEnvironmentProvider>
    </QueryClientProvider>,
  );
}
