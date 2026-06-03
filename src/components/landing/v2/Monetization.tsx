import { ShoppingBag, CreditCard, Mail } from "lucide-react";

const items = [
  { icon: ShoppingBag, title: "Sell digital products", desc: "Ebooks, courses, presets — delivered automatically." },
  { icon: CreditCard, title: "Accept payments", desc: "Stripe, Razorpay, and wallet built in." },
  { icon: Mail, title: "Capture leads", desc: "Convert visitors into subscribers with smart forms." },
];

export const Monetization = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            Monetization
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Turn attention into income.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent grid place-items-center mb-4">
                <i.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{i.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
