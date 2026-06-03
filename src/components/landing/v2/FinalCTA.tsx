import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl border border-border bg-card overflow-hidden p-10 md:p-16 text-center">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--primary)/0.12),transparent_70%)]" />
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight max-w-2xl mx-auto">
            Your page. Live in 60 seconds.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Join 50,000+ creators using Brioo to grow their audience and income.
          </p>
          <Link to="/signup" className="inline-block mt-8">
            <Button size="lg" className="h-12 px-7 bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] shadow-brand">
              Start Free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
