import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Calendar, Star, Shield, ArrowRight } from "lucide-react";
import type { ProfileModeContext } from "./ProfileModeRouter";

interface Props {
  ctx: ProfileModeContext;
  children: ReactNode;
}

/**
 * Coach / Freelancer Mode — luxury minimal, authority-first.
 * Adds a serif display heading, trust strip, and elegant booking CTA.
 * Uses generous spacing and slow fade-up reveals.
 */
export const CoachMode = ({ ctx, children }: Props) => {
  const bookingLink =
    ctx.links.find((l) =>
      /\b(book|call|calendar|cal\.com|calendly|consult)\b/i.test(`${l.title || ""} ${l.url}`),
    ) || ctx.links[0];

  return (
    <div
      className="coach-mode relative"
      style={{
        ["--coach-navy" as any]: "#0b1f3a",
        ["--coach-gold" as any]: "#c8a45c",
        ["--coach-cyan" as any]: "#9bd4e4",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, var(--coach-cyan), transparent 65%)" }}
        />
      </div>

      <div className="relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="mb-8 text-center"
        >
          <p
            className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-3 py-1 rounded-full"
            style={{ background: "rgba(200,164,92,0.12)", color: "var(--coach-gold)" }}
          >
            Trusted advisor
          </p>
          <p
            className="font-serif text-xl md:text-2xl leading-snug max-w-md mx-auto opacity-90"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Helping ambitious people move from <em>stuck</em> to <em>scaling</em>.
          </p>

          {bookingLink && (
            <motion.a
              href={bookingLink.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium tracking-wide shadow-lg"
              style={{
                background: "var(--coach-navy)",
                color: "var(--coach-gold)",
                border: "1px solid rgba(200,164,92,0.4)",
              }}
            >
              <Calendar className="w-4 h-4" />
              Book a consultation
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          )}
        </motion.section>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 grid grid-cols-3 gap-3"
        >
          {[
            { Icon: Star, label: "5.0", sub: "Avg rating" },
            { Icon: Shield, label: "100%", sub: "Confidential" },
            { Icon: Calendar, label: "1:1", sub: "Bespoke calls" },
          ].map(({ Icon, label, sub }) => (
            <div
              key={sub}
              className="rounded-xl border px-3 py-3 text-center"
              style={{ borderColor: "rgba(200,164,92,0.2)", background: "rgba(255,255,255,0.02)" }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: "var(--coach-gold)" }} />
              <div className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {label}
              </div>
              <div className="text-[10px] uppercase tracking-wider opacity-60">{sub}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
        .coach-mode a[class*="rounded-2xl"],
        .coach-mode a[class*="rounded-xl"] {
          transition: transform .6s cubic-bezier(.2,.8,.2,1), box-shadow .6s ease;
        }
        .coach-mode a[class*="rounded-2xl"]:hover,
        .coach-mode a[class*="rounded-xl"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 60px -25px rgba(200,164,92,0.45);
        }
      `}</style>
    </div>
  );
};
