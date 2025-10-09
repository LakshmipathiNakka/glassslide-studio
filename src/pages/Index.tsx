import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />
      <CTA />
      
      {/* Footer */}
      <footer className="py-12 border-t border-border bg-bg-soft">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-foreground font-bold text-xl">SlideForge</div>
            
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Features</a>
              <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 SlideForge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
