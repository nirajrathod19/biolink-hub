const testimonials = [
  { name: "Maya R.", role: "Content creator", quote: "Brioo replaced 4 tools I was juggling. My link-in-bio finally feels like me." },
  { name: "Alex K.", role: "Coach", quote: "Setup took 60 seconds. Earnings doubled in the first month." },
  { name: "Nico D.", role: "Freelance designer", quote: "The cleanest creator platform I've ever used. It just works." },
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Loved by creators
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Built for the way you work.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
              <blockquote className="text-foreground leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-5 pt-5 border-t border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
