import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, waitFor, screen, act } from "@testing-library/react";
import { renderWithProviders, mockTheme } from "@/test/utils";
import { CartProvider, useCart } from "@/components/profile/CartContext";
import { CartUpsell } from "./CartUpsell";

// Mock supabase to return upsell suggestions
vi.mock("@/integrations/supabase/client", () => {
  const buildChain = (rows: any[]) => {
    const chain: any = {};
    const passthrough = ["select", "in", "eq", "not", "order", "limit"];
    passthrough.forEach((f) => (chain[f] = vi.fn(() => chain)));
    chain.then = (cb: any) => Promise.resolve({ data: rows, error: null }).then(cb);
    return chain;
  };

  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table !== "digital_products") return buildChain([]);
        // First call returns the cart product with upsell ids,
        // second call returns the upsell products themselves.
        let callCount = 0;
        const original = buildChain([]);
        original.select = vi.fn((cols: string) => {
          callCount++;
          if (cols.includes("upsell_product_ids")) {
            return buildChain([{ upsell_product_ids: ["up-1"] }]);
          }
          return buildChain([
            {
              id: "up-1",
              title: "Bundle Add-on",
              price: 25,
              currency: "USD",
              preview_image: null,
              file_url: "https://files.test/x.pdf",
            },
          ]);
        });
        return original;
      }),
    },
  };
});

const ProbeAdd = ({ id }: { id: string }) => {
  const { addItem, items } = useCart();
  return (
    <div>
      <button
        onClick={() =>
          addItem({
            id,
            title: "Item " + id,
            price: 10,
            currency: "USD",
            image_url: null,
            allow_cod: false,
            creator_id: "creator-1",
          })
        }
      >
        add-{id}
      </button>
      <span data-testid="count">{items.length}</span>
    </div>
  );
};

describe("CartUpsell + Cart add-to-cart flow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("adds an item to cart and bumps total count", () => {
    renderWithProviders(
      <CartProvider>
        <ProbeAdd id="p1" />
      </CartProvider>
    );

    expect(screen.getByTestId("count").textContent).toBe("0");
    act(() => {
      fireEvent.click(screen.getByText("add-p1"));
    });
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("renders upsell suggestions for products in cart", async () => {
    renderWithProviders(
      <CartProvider>
        <CartUpsell theme={mockTheme} cartProductIds={["p1"]} creatorId="creator-1" />
      </CartProvider>
    );
    await waitFor(() => expect(screen.getByText(/Frequently bought together/i)).toBeInTheDocument());
    expect(await screen.findByText(/Bundle Add-on/i)).toBeInTheDocument();
  });
});
