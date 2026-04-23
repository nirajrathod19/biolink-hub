import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { BioTheme } from "@/lib/bioThemes";

export const mockTheme: BioTheme = {
  id: "test",
  name: "Test",
  category: "minimal",
  background: "#fff",
  textColor: "#000",
  bioTextColor: "#444",
  cardBg: "#f5f5f5",
  cardText: "#000",
  cardBorder: "#ddd",
  accent: "#8B5CF6",
  accentText: "#fff",
  hoverBg: "#eee",
  socialBg: "#eee",
  socialText: "#444",
  footerText: "#888",
};

export const renderWithProviders = (ui: ReactNode, options?: RenderOptions) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
    options
  );
};
