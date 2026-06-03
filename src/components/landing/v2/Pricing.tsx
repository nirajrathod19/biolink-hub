import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Everything you need to launch.",
    features: ["Unlimited links", "Basic analytics", "Mobile-optimized", "AI Studio (limited)"],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Starter Pro",
    price: "₹249",
    period: "/month",
    desc: "Grow with monetization.",
    features: ["Everything in Free", "50% ad share", "Digital products", "Lead capture", "Premium themes"],
    cta: "Upgrade",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Full Pro",
    price: "₹419",
    period: "/month",
    desc: "For pro creators & businesses.",
    features: ["Everything in Starter", "100% ad share", "Custom domain", "Priority support", "Verified badge"],
    cta: "Go Pro",
    href: "/signup",
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Pricing
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                p.highlight
                  ? "border-primary bg-card shadow-brand"
                  : "border-border bg-card"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  Most popular
                </span>
              )}
              <h3 className="font-display font-bold text-xl">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display font-bold text-4xl">{p.price}</span>
                <span className="text-muted-foreground text-sm">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={p.href} className="mt-6 block">
                <Button
                  className={`w-full ${
                    p.highlight
                      ? "bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                      : ""
                  }`}
                  variant={p.highlight ? "default" : "outline"}
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
