import { Link2, BarChart3, Sparkles, Mail, ShoppingBag, Palette } from "lucide-react";

const features = [
  { icon: Link2, title: "Link Pages", desc: "Beautiful, fast pages for every link you share." },
  { icon: BarChart3, title: "Smart Analytics", desc: "Real-time clicks, visitors, and conversion insights." },
  { icon: Sparkles, title: "AI Studio", desc: "Generate bios, themes, and SEO in seconds." },
  { icon: Mail, title: "Lead Capture", desc: "Grow your list with forms and gated links." },
  { icon: ShoppingBag, title: "Digital Products", desc: "Sell ebooks, courses, and downloads instantly." },
  { icon: Palette, title: "Custom Themes", desc: "Premium templates that match your brand." },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Features
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Everything you need.<br className="hidden md:block" /> Nothing you don't.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A focused toolkit built for creators who want to ship — not configure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-elevated transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
