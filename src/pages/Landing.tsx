import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { CreatorModes } from "@/components/landing/CreatorModes";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";
import { FloatingDemoCard } from "@/components/landing/FloatingDemoCard";
import { AmbientBackground } from "@/components/landing/AmbientBackground";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AmbientBackground />
      <Header />
      <main>
        <Hero />
        <CreatorModes />
        <Features />
        <Pricing />
      </main>
      <Footer />
      <FloatingDemoCard />
    </div>
  );
};

export default Landing;