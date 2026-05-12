# Profile Page Mode Systems

Build 4 fully differentiated profile experiences on `ProfilePage`. Each mode swaps layout, motion, typography, density, and card shapes — not just colors.

## Scope (this pass)

Ship the 4 mode shells as composable layouts that wrap existing profile data (avatar, bio, links, products, socials). Mode is selected from `profile.creator_mode` (already used by onboarding) with fallback to `default`.

## Architecture

```
src/components/profile/modes/
  ProfileModeRouter.tsx      # picks layout by creator_mode
  InstagramMode.tsx          # aesthetic / influencer
  YouTubeMode.tsx            # cinematic / dark
  CoachMode.tsx              # luxury minimal / authority
  MusicianMode.tsx           # immersive / audio-reactive
  shared/
    ModeShell.tsx            # common motion + bg primitives
    StoryHighlights.tsx      # IG circles
    VideoHeroCard.tsx        # YT latest video hero
    BookingCard.tsx          # coach calendar CTA
    WaveformBg.tsx           # musician bg
```

`ProfilePage.tsx` wraps its current content tree in `<ProfileModeRouter mode={profile.creator_mode}>` — existing data (links, products, socials, tip jar, store) is passed through as children/props so business logic is untouched.

## Mode-specific details

**Instagram** — vertical rhythm, story-highlight circles row (uses social links + featured links), reel-style 9:16 cards in a 3-col grid for media links, glass cards with animated gradient borders (conic-gradient + spin), pink/lavender/peach palette via CSS vars scoped to the mode wrapper, floating gradient orbs, parallax tilt on avatar.

**YouTube** — dark graphite base regardless of theme (scoped), cinematic hero featuring most-recent video link (auto-detected YouTube URL), playlist-style horizontal shelves for other video links, neon-red glow accents, subscriber/view stat strip, hover zoom on thumbs, subtle light-streak SVG sweep.

**Coach** — white/navy/gold scoped palette, generous spacing (`py-24`, large type), service cards in 2-col grid, testimonial slider (uses community feed if present, otherwise hidden), booking CTA prominent (links to first link tagged as booking or WhatsApp), client logo strip, serif display font (Playfair via Google fonts) for headings only in this mode.

**Musician** — full-bleed dark, animated SVG waveform background, glowing album-style cards for links containing spotify/apple/soundcloud URLs, neon purple/cyan accents, tour-date list from links tagged `event`, embedded first Spotify track if URL detected.

## Motion language per mode

- IG: soft lift `y:-4`, shimmer border keyframe
- YT: scale `1.03` + glow on hover, fade-in stagger 60ms
- Coach: long elegant fade-up `0.8s` ease-out, no bounce
- Musician: pulse glow tied to a global beat clock (CSS animation)

## Out of scope (later passes per user)

Template showcase polish, dashboard shell, AI bio tools, analytics viz.

## Files touched

- create 5–7 files under `src/components/profile/modes/`
- edit `src/pages/ProfilePage.tsx` to wire the router (minimal — wrap the main content block)
- no DB changes; `creator_mode` already exists on profile