import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/landing/Logo";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Top bar matching editor style */}
      <header className="glass-toolbar border-b sticky top-0 z-40">
        <div className="container-fluid py-2 sm:py-3">
          <div className="flex-modern justify-between items-center">
            <div className="flex-modern min-w-0 flex-1 justify-between">
              <Logo />
            </div>
          </div>
        </div>
      </header>

      <Hero />
      <Features id="features" />
      <Testimonials />
      <Pricing id="pricing" />
      <CTA id="cta" />
      <Footer />
    </main>
  );
};

export default Index;
