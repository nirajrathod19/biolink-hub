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
    expect(video?.hasAttribute("autoplay")).toBe(true);
    expect(video?.hasAttribute("loop")).toBe(true);
    expect(video?.hasAttribute("muted")).toBe(true);
  });

  it("returns null for unsupported URLs", () => {
    const { container } = render(<VideoBackground url="https://example.com/page.html" />);
    expect(container.firstChild).toBeNull();
  });

  it("clamps overlay opacity within 0..1", () => {
    const { container } = render(
      <VideoBackground url="https://cdn.example.com/clip.mp4" overlayOpacity={150} />
    );
    const overlay = container.querySelectorAll("div")[1] as HTMLElement;
    expect(overlay.style.background).toContain("rgba(0,0,0,1)");
  });
});
