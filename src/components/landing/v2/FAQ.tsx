import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is Brioo really free?", a: "Yes. The Free plan is free forever and includes unlimited links, analytics, and mobile-optimized pages." },
  { q: "How long does setup take?", a: "About 60 seconds. Pick a template, add your name and socials, and your page is live." },
  { q: "Can I use my own domain?", a: "Yes — custom domains are included on Full Pro." },
  { q: "Do I keep what I earn?", a: "Yes. You keep 100% of product sales on Pro. Ad revenue share depends on your plan." },
  { q: "Can I switch plans anytime?", a: "Absolutely. Upgrade, downgrade, or cancel anytime from your dashboard." },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="text-center mb-10">
          <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-3">
            FAQ
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight">
            Common questions.
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-border rounded-xl px-4 bg-card"
            >
              <AccordionTrigger className="hover:no-underline text-left font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
