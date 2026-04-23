import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor, screen } from "@testing-library/react";
import { renderWithProviders, mockTheme } from "@/test/utils";

// Mock supabase client used inside the component / hook
vi.mock("@/integrations/supabase/client", () => {
  const insert = vi.fn().mockReturnValue({
    select: () => ({
      single: () => Promise.resolve({ data: { id: "lead-1" }, error: null }),
    }),
  });
  return {
    supabase: {
      from: vi.fn(() => ({ insert })),
    },
  };
});

import { EmailCaptureBlock } from "./EmailCaptureBlock";
import { supabase } from "@/integrations/supabase/client";

describe("EmailCaptureBlock (lead delivery flow)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits a lead and shows success state", async () => {
    renderWithProviders(<EmailCaptureBlock creatorId="creator-1" creatorName="Jane" theme={mockTheme} />);
    fireEvent.change(screen.getByPlaceholderText(/your@email\.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() => expect(supabase.from).toHaveBeenCalledWith("creator_subscribers"));
    expect(await screen.findByText(/you're subscribed/i)).toBeInTheDocument();
  });

  it("captures the lowercased & trimmed email", async () => {
    renderWithProviders(<EmailCaptureBlock creatorId="creator-1" theme={mockTheme} />);
    fireEvent.change(screen.getByPlaceholderText(/your@email\.com/i), {
      target: { value: "  Test@Example.COM  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() => expect(supabase.from).toHaveBeenCalledWith("creator_subscribers"));
    // The mock 'from' returns an object with 'insert'. Inspect call arg.
    const fromMock = supabase.from as unknown as ReturnType<typeof vi.fn>;
    const fromReturn = fromMock.mock.results[0].value as { insert: ReturnType<typeof vi.fn> };
    expect(fromReturn.insert).toHaveBeenCalledWith(
      expect.objectContaining({ subscriber_email: "test@example.com" })
    );
  });
});
