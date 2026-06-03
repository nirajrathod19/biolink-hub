const stats = [
  { value: "50K+", label: "Creators" },
  { value: "1.2M+", label: "Links created" },
  { value: "84M+", label: "Clicks processed" },
  { value: "4.9★", label: "Average rating" },
];

export const SocialProof = () => {
  return (
    <section className="py-12 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">
          Trusted by creators, freelancers, and founders worldwide
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-bold text-3xl md:text-4xl text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
