import { TrendingUp, Users, MousePointerClick, DollarSign } from "lucide-react";

const kpis = [
  { icon: Users, label: "Visitors", value: "24,891", delta: "+12.4%" },
  { icon: MousePointerClick, label: "Clicks", value: "8,142", delta: "+18.9%" },
  { icon: TrendingUp, label: "Conversion", value: "32.7%", delta: "+4.1%" },
  { icon: DollarSign, label: "Earnings", value: "$1,284", delta: "+22.0%" },
];

export const AnalyticsPreview = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
              Analytics
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
              Understand every click.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-md">
              Real-time dashboards built for clarity. See exactly which links convert,
              where visitors come from, and what's driving growth.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-elevated p-6">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <k.icon className="w-3.5 h-3.5" /> {k.label}
                  </div>
                  <div className="mt-2 font-display font-bold text-2xl">{k.value}</div>
                  <div className="text-xs text-accent font-medium mt-0.5">{k.delta}</div>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div className="h-32 rounded-xl border border-border p-3 relative overflow-hidden">
              <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="ap" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 C40,70 60,40 100,45 S180,15 220,25 S280,10 300,20 L300,100 L0,100 Z" fill="url(#ap)" />
                <path d="M0,80 C40,70 60,40 100,45 S180,15 220,25 S280,10 300,20" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
