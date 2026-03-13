export interface VisitorContext {
  source: string;
  device: string;
  timeOfDay: string;
  utmSource: string | null;
  referer: string;
}

const SOURCE_PATTERNS: Record<string, RegExp> = {
  instagram: /instagram\.com|l\.instagram\.com/i,
  linkedin: /linkedin\.com|lnkd\.in/i,
  twitter: /twitter\.com|t\.co|x\.com/i,
  facebook: /facebook\.com|fb\.me|l\.facebook\.com/i,
  youtube: /youtube\.com|youtu\.be/i,
  tiktok: /tiktok\.com/i,
  reddit: /reddit\.com/i,
  pinterest: /pinterest\.com/i,
  whatsapp: /whatsapp\.com|wa\.me/i,
  telegram: /telegram\.org|t\.me/i,
  google: /google\.(com|co\.\w+)/i,
};

function detectSource(referer: string, utmSource: string | null): string {
  if (utmSource) {
    const normalized = utmSource.toLowerCase().trim();
    for (const [name] of Object.entries(SOURCE_PATTERNS)) {
      if (normalized === name) return name;
    }
    return normalized;
  }

  if (referer) {
    for (const [name, pattern] of Object.entries(SOURCE_PATTERNS)) {
      if (pattern.test(referer)) return name;
    }
    if (referer.length > 0) return "referral";
  }

  return "direct";
}

function detectDevice(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    return /ipad|tablet/i.test(ua) ? "tablet" : "mobile";
  }
  return "desktop";
}

function detectTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getVisitorContext(): VisitorContext {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const referer = document.referrer || "";

  return {
    source: detectSource(referer, utmSource),
    device: detectDevice(),
    timeOfDay: detectTimeOfDay(),
    utmSource,
    referer,
  };
}

export interface DisplayRule {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  priority: number;
  condition_type: string; // 'source' | 'device' | 'time' | 'location'
  condition_value: string;
  action: string; // 'show' | 'hide'
  link_ids: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Apply display rules to filter links.
 * Rules are evaluated in priority order (lower number = higher priority).
 * Returns the set of link IDs that should be visible.
 */
export function applyDisplayRules(
  allLinkIds: string[],
  rules: DisplayRule[],
  context: VisitorContext
): Set<string> {
  const visibleLinks = new Set(allLinkIds);

  // Sort by priority ascending (lower = higher priority)
  const sortedRules = [...rules]
    .filter((r) => r.is_active)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    const matches = doesRuleMatch(rule, context);
    if (!matches) continue;

    if (rule.action === "hide") {
      for (const linkId of rule.link_ids) {
        visibleLinks.delete(linkId);
      }
    } else if (rule.action === "show") {
      // "show" means ONLY show these links, hide everything else not in any show rule
      const showSet = new Set(rule.link_ids);
      for (const id of allLinkIds) {
        if (!showSet.has(id)) {
          visibleLinks.delete(id);
        }
      }
    }
  }

  return visibleLinks;
}

function doesRuleMatch(rule: DisplayRule, context: VisitorContext): boolean {
  const value = rule.condition_value.toLowerCase().trim();

  switch (rule.condition_type) {
    case "source":
      return context.source.toLowerCase() === value;
    case "device":
      return context.device.toLowerCase() === value;
    case "time":
      return context.timeOfDay.toLowerCase() === value;
    default:
      return false;
  }
}