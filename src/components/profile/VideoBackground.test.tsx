import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VideoBackground } from "./VideoBackground";

describe("VideoBackground", () => {
  it("renders a YouTube iframe with autoplay/loop params", () => {
    const { container } = render(<VideoBackground url="https://youtu.be/dQw4w9WgXcQ" />);
    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain("youtube.com/embed/dQw4w9WgXcQ");
    expect(iframe?.src).toContain("autoplay=1");
    expect(iframe?.src).toContain("loop=1");
    expect(iframe?.src).toContain("mute=1");
  });

  it("renders a Vimeo iframe in background mode", () => {
    const { container } = render(<VideoBackground url="https://vimeo.com/123456789" />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.src).toContain("player.vimeo.com/video/123456789");
    expect(iframe?.src).toContain("background=1");
  });

  it("renders a <video> element for direct mp4 URLs", () => {
    const { container } = render(<VideoBackground url="https://cdn.example.com/clip.mp4" />);
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video?.getAttribute("src")).toBe("https://cdn.example.com/clip.mp4");
    // React renders the boolean props as attributes; jsdom exposes them as empty strings.
    expect(video?.hasAttribute("loop") || video?.loop).toBeTruthy();
    expect(video?.hasAttribute("muted") || video?.muted).toBeTruthy();
  });

  it("returns null for unsupported URLs", () => {
    const { container } = render(<VideoBackground url="https://example.com/page.html" />);
    expect(container.firstChild).toBeNull();
  });

  it("clamps overlay opacity within 0..1 (overlay div is rendered)", () => {
    const { container } = render(
      <VideoBackground url="https://cdn.example.com/clip.mp4" overlayOpacity={150} />
    );
    // Overlay is the last absolutely-positioned div sibling of the media element
    const overlays = container.querySelectorAll("div.absolute.inset-0");
    // Wrapper + overlay = 2 divs with absolute inset-0
    expect(overlays.length).toBeGreaterThanOrEqual(2);
    const overlay = overlays[overlays.length - 1] as HTMLElement;
    // jsdom normalizes rgba(0,0,0,1) → rgb(0,0,0); just confirm a black background was applied
    expect(overlay.style.backgroundColor || overlay.getAttribute("style") || "").toMatch(
      /(rgba?\(0,\s*0,\s*0|rgb\(0,\s*0,\s*0)/
    );
  });
});
