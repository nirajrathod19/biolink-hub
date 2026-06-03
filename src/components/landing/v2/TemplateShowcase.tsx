const templates = [
  { name: "Creator", tag: "@maya.creates", accent: "from-primary to-accent" },
  { name: "Coach", tag: "@coach.alex", accent: "from-accent to-primary" },
  { name: "Freelancer", tag: "@design.nico", accent: "from-primary to-primary" },
  { name: "Agency", tag: "@studio.norm", accent: "from-foreground to-foreground" },
  { name: "Startup", tag: "@buildinpublic", accent: "from-accent to-accent" },
  { name: "Developer", tag: "@dev.juno", accent: "from-primary to-foreground" },
];

export const TemplateShowcase = () => {
  return (
    <section id="templates" className="py-20 md:py-28 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Templates
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Start with a template made for you.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hand-crafted layouts for every kind of creator.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.name} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elevated hover:-translate-y-0.5 transition-all">
              <div className={`aspect-[4/5] bg-gradient-to-br ${t.accent} relative`}>
                <div className="absolute inset-0 bg-background/10" />
                <div className="absolute inset-x-4 bottom-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-background/90" />
                  <div className="h-2.5 w-20 rounded-full bg-background/80" />
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-7 rounded-lg bg-background/90" />
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="font-display font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
