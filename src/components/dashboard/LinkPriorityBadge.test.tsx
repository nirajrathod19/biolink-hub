import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LinkPriorityBadge } from "./LinkPriorityBadge";

describe("LinkPriorityBadge", () => {
  it("renders nothing for 0 clicks", () => {
    const { container } = render(<LinkPriorityBadge clicks={0} maxClicks={100} totalClicks={100} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows Top performer for the absolute max", () => {
    render(<LinkPriorityBadge clicks={50} maxClicks={50} totalClicks={200} />);
    expect(screen.getByText(/Top performer/i)).toBeInTheDocument();
  });

  it("shows Top performer when share >= 40%", () => {
    render(<LinkPriorityBadge clicks={45} maxClicks={50} totalClicks={100} />);
    expect(screen.getByText(/Top performer/i)).toBeInTheDocument();
  });

  it("shows Hot when share is between 20% and 40%", () => {
    render(<LinkPriorityBadge clicks={25} maxClicks={50} totalClicks={100} />);
    expect(screen.getByText(/^Hot$/i)).toBeInTheDocument();
  });

  it("shows Active for low click share", () => {
    render(<LinkPriorityBadge clicks={2} maxClicks={50} totalClicks={100} />);
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
  });
});
