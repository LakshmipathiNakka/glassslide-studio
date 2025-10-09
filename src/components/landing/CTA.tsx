import { GlassButton } from "@/components/ui/button-variants";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-6xl font-bold text-foreground leading-tight">
            Ready to create something amazing?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who design faster, present better, and deliver impact.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <GlassButton variant="hero" onClick={() => window.location.href = '/editor'}>
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlassButton>
          </div>

          <div className="flex items-center justify-center gap-12 pt-12 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">50K+</div>
              <div>Active users</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">1M+</div>
              <div>Presentations created</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">4.9★</div>
              <div>User rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
