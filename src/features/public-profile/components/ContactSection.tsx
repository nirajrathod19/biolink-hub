import { motion } from "framer-motion";
import { Mail, MessageCircle, Globe, Calendar } from "lucide-react";
import { ContactMeForm } from "@/components/profile/ContactMeForm";

interface Theme {
  accent: string;
  accentText: string;
  textColor: string;
  bioTextColor: string;
  cardBg: string;
  socialBg: string;
  socialText: string;
  background: string;
}

interface ContactCTA {
  label: string;
  href: string;
  kind?: "book" | "hire" | "website" | "contact";
}

interface ContactMethod {
  type: "email" | "whatsapp" | "website";
  value: string;
}

interface ContactSectionProps {
  creatorId: string;
  creatorName?: string;
  email?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  ctas?: ContactCTA[];
  theme: Theme;
}

const METHOD_ICON = { email: Mail, whatsapp: MessageCircle, website: Globe };
const METHOD_LABEL = { email: "Email", whatsapp: "WhatsApp", website: "Website" };

const buildHref = (m: ContactMethod) => {
  if (m.type === "email") return `mailto:${m.value}`;
  if (m.type === "whatsapp") return `https://wa.me/${m.value.replace(/\D/g, "")}`;
  return m.value.startsWith("http") ? m.value : `https://${m.value}`;
};

/**
 * Premium contact experience: configurable CTA row, contact methods, and the
 * existing ContactMeForm. Renders only when at least one method is configured.
 */
export const ContactSection = ({
  creatorId,
  creatorName,
  email,
  whatsapp,
  website,
  ctas = [],
  theme,
}: ContactSectionProps) => {
  const methods: ContactMethod[] = [
    email ? { type: "email" as const, value: email } : null,
    whatsapp ? { type: "whatsapp" as const, value: whatsapp } : null,
    website ? { type: "website" as const, value: website } : null,
  ].filter(Boolean) as ContactMethod[];

  const showAnything = methods.length > 0 || ctas.length > 0;
  if (!showAnything) {
    // Still render the form alone — it's a primary conversion surface.
    return (
      <section aria-label="Get in touch" id="contact" className="mt-6">
        <ContactMeForm creatorId={creatorId} creatorName={creatorName} theme={theme as any} />
      </section>
    );
  }

  return (
    <motion.section
      aria-label="Get in touch"
      id="contact"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
      className="mt-8"
    >
      <div className="text-center mb-4">
        <h2
          className="text-xl font-display font-bold tracking-[-0.02em]"
          style={{ color: theme.textColor }}
        >
          Let’s work together
        </h2>
        <p className="text-sm mt-1" style={{ color: theme.bioTextColor }}>
          Reply within 24 hours
        </p>
      </div>

      {ctas.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {ctas.map((c, i) => {
            const Icon = c.kind === "book" ? Calendar : c.kind === "website" ? Globe : Mail;
            return (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith("#") ? undefined : "_blank"}
                rel={c.href.startsWith("#") ? undefined : "noopener noreferrer"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold min-h-[44px] transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: i === 0 ? theme.accent : theme.cardBg,
                  color: i === 0 ? theme.accentText : theme.textColor,
                  border: i === 0 ? "none" : `1px solid ${theme.accent}25`,
                  boxShadow: i === 0 ? `0 8px 24px -8px ${theme.accent}` : undefined,
                }}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {c.label}
              </a>
            );
          })}
        </div>
      )}

      {methods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {methods.map((m) => {
            const Icon = METHOD_ICON[m.type];
            return (
              <a
                key={m.type}
                href={buildHref(m)}
                target={m.type === "website" ? "_blank" : undefined}
                rel={m.type === "website" ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:translate-y-[-1px] active:translate-y-0 min-h-[56px]"
                style={{
                  background: theme.cardBg,
                  color: theme.textColor,
                  border: `1px solid ${theme.accent}18`,
                }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${theme.accent}18`, color: theme.accent }}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-wider opacity-60">
                    {METHOD_LABEL[m.type]}
                  </span>
                  <span className="block text-sm font-medium truncate">{m.value}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}

      <ContactMeForm creatorId={creatorId} creatorName={creatorName} theme={theme as any} />
    </motion.section>
  );
};
