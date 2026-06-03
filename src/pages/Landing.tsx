import { Header } from "@/components/landing/v2/Header";
import { Hero } from "@/components/landing/v2/Hero";
import { SocialProof } from "@/components/landing/v2/SocialProof";
import { Features } from "@/components/landing/v2/Features";
import { TemplateShowcase } from "@/components/landing/v2/TemplateShowcase";
import { AnalyticsPreview } from "@/components/landing/v2/AnalyticsPreview";
import { Monetization } from "@/components/landing/v2/Monetization";
import { Testimonials } from "@/components/landing/v2/Testimonials";
import { Pricing } from "@/components/landing/v2/Pricing";
import { FAQ } from "@/components/landing/v2/FAQ";
import { FinalCTA } from "@/components/landing/v2/FinalCTA";
import { Footer } from "@/components/landing/v2/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <TemplateShowcase />
        <AnalyticsPreview />
        <Monetization />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
