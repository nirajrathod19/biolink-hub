import { describe, it, expect, vi, beforeEach } from "vitest";
import { waitFor, screen } from "@testing-library/react";
import { renderWithProviders, mockTheme } from "@/test/utils";

const mockData = {
  digital_products: [
    {
      id: "p1",
      title: "Course A",
      price: 49,
      currency: "USD",
      copies_sold: 12,
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
  qa_questions: [
    {
      id: "q1",
      asker_name: "Alice",
      tip_amount: 5,
      created_at: "2026-01-02T00:00:00Z",
    },
  ],
};

vi.mock("@/integrations/supabase/client", () => {
  const buildChain = (rows: unknown[]) => {
    const chain: any = {};
    const fns = ["select", "eq", "gt", "order", "limit"];
    fns.forEach((f) => (chain[f] = vi.fn(() => chain)));
    chain.then = (cb: any) => Promise.resolve({ data: rows, error: null }).then(cb);
    return chain;
  };
  return {
    supabase: {
      from: vi.fn((table: string) => {
        const rows = (mockData as any)[table] || [];
        return buildChain(rows);
      }),
    },
  };
});

import { RecentSalesTicker } from "./RecentSalesTicker";
import { supabase } from "@/integrations/supabase/client";

describe("RecentSalesTicker (sales query)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("queries digital_products and qa_questions for the creator", async () => {
    renderWithProviders(<RecentSalesTicker userId="creator-1" theme={mockTheme} />);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("digital_products");
      expect(supabase.from).toHaveBeenCalledWith("qa_questions");
    });
  });

  it("renders a sale entry once data resolves", async () => {
    renderWithProviders(<RecentSalesTicker userId="creator-1" theme={mockTheme} />);
    // Most recent (Alice tip on 2026-01-02) should appear first
    expect(await screen.findByText(/Alice sent a tip/i)).toBeInTheDocument();
  });
});
