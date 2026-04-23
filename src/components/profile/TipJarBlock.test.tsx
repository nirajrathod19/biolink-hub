import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor, screen } from "@testing-library/react";
import { renderWithProviders, mockTheme } from "@/test/utils";

const invokeMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => {
  // Minimal chain so usePublicTipJar resolves with razorpay_enabled = true
  const buildChain = (row: any) => {
    const chain: any = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.maybeSingle = vi.fn(() => Promise.resolve({ data: row, error: null }));
    chain.single = vi.fn(() => Promise.resolve({ data: row, error: null }));
    return chain;
  };
  return {
    supabase: {
      from: vi.fn(() =>
        buildChain({
          razorpay_enabled: true,
          message: "Buy me a coffee",
          is_enabled: true,
          minimum_amount: 1,
          suggested_amounts: [100, 500, 1000],
        })
      ),
      functions: { invoke: invokeMock },
    },
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { TipJarBlock } from "./TipJarBlock";

describe("TipJarBlock (Razorpay tip flow)", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    // Stub Razorpay so handler doesn't open a real modal
    (window as any).Razorpay = vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      open: vi.fn(),
    }));
  });

  it("renders preset amounts and calls create-tip-order on submit", async () => {
    invokeMock.mockResolvedValueOnce({
      data: { order_id: "order_test", tip_id: "tip_test", key_id: "rzp_test", amount: 10000, currency: "INR" },
      error: null,
    });

    renderWithProviders(<TipJarBlock userId="creator-1" creatorName="Jane" theme={mockTheme} />);

    expect(await screen.findByText(/Send a tip/i)).toBeInTheDocument();
    expect(screen.getByText("₹100")).toBeInTheDocument();
    expect(screen.getByText("₹500")).toBeInTheDocument();
    expect(screen.getByText("₹1000")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Tip ₹100/i }));

    await waitFor(() => expect(invokeMock).toHaveBeenCalled());
    const [fnName, opts] = invokeMock.mock.calls[0];
    expect(fnName).toBe("create-tip-order");
    expect(opts.body.creator_id).toBe("creator-1");
    expect(opts.body.amount).toBe(100);
  });

  it("surfaces an error when create-tip-order fails", async () => {
    const { toast } = await import("sonner");
    invokeMock.mockResolvedValueOnce({ data: null, error: { message: "boom" } });

    renderWithProviders(<TipJarBlock userId="creator-1" theme={mockTheme} />);
    fireEvent.click(await screen.findByRole("button", { name: /Tip ₹100/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});
