import { GlassButton } from "@/components/ui/button-variants";
import { Sparkles, Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-bg-soft to-background opacity-60" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-toolbar">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Professional Presentation Builder</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight text-balance">
              Design slides faster than you think
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Professional slides, zero friction. From idea to keynote — in minutes. 
              Powerful tools, intuitive interface, flawless export.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <GlassButton variant="hero" onClick={() => window.location.href = '/editor'}>
                Try Free
              </GlassButton>
              <GlassButton variant="outline-glass">
                <Play className="w-4 h-4 mr-2" />
                View Demo
              </GlassButton>
            </div>

            <div className="flex items-center gap-8 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Export to PowerPoint</span>
              </div>
            </div>
          </div>

          {/* Right: Animated mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full max-w-2xl">
              {/* Main editor mockup */}
              <div className="glass-toolbar rounded-2xl p-8 shadow-2xl border-2">
                {/* Toolbar */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded bg-secondary/50" />
                    ))}
                  </div>
                </div>

                {/* Canvas area */}
                <div className="bg-background rounded-lg p-8 min-h-[320px] flex items-center justify-center relative overflow-hidden">
                  {/* Slide content animation */}
                  <div className="space-y-6 w-full animate-slide-up">
                    <div className="h-12 bg-foreground/90 rounded w-3/4" />
                    <div className="h-6 bg-muted-foreground/40 rounded w-full" />
                    <div className="h-6 bg-muted-foreground/40 rounded w-5/6" />
                    
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="h-32 bg-accent/20 rounded-lg" />
                      <div className="h-32 bg-secondary rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Slide thumbnails */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-border/50">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-16 h-12 rounded bg-secondary/80",
                        i === 0 && "ring-2 ring-accent"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 glass-panel rounded-lg p-4 animate-fade-in shadow-lg" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-foreground">Auto-saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};
