import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Hero = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-toolbar border-b transition-all duration-300">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group">
                Templates
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group">
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-sm">
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/editor')}
                className="bg-foreground text-background hover:bg-foreground/90 hover-glow"
              >
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
        {/* Parallax background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-10 w-64 h-64 rounded-full bg-muted opacity-20 blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-muted opacity-20 blur-3xl" 
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-accent/10 opacity-30 blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block px-4 py-2 glass-toolbar rounded-full text-sm text-muted-foreground mb-4">
                ✨ Professional presentations made simple
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                Design your vision.<br />
                <span className="text-muted-foreground">Slide your story.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Create, animate, and share presentations that look flawless everywhere. 
                Professional tools with zero friction.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/editor')}
                  className="group bg-foreground text-background hover:bg-foreground/90 hover-glow px-8 py-6 text-base"
                >
                  Start Creating
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group border-2 hover:border-accent hover-glow px-8 py-6 text-base"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Features
                  <ArrowRight className="ml-2 w-5 h-5 opacity-50" />
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>

            {/* Right Content - Device Mockup with Animation */}
            <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="glass-panel rounded-2xl p-6 shadow-2xl hover-glow transition-all duration-300 hover:scale-105">
                <div className="aspect-video bg-bg-soft rounded-lg overflow-hidden relative">
                  {/* Simulated Editor Interface */}
                  <div className="absolute inset-0 p-4">
                    {/* Toolbar */}
                    <div className="glass-toolbar h-10 rounded-lg mb-3 flex items-center px-3 gap-2">
                      <div className="w-6 h-6 bg-muted rounded" />
                      <div className="w-6 h-6 bg-muted rounded" />
                      <div className="w-px h-6 bg-border mx-1" />
                      <div className="w-6 h-6 bg-muted rounded" />
                      <div className="w-6 h-6 bg-muted rounded" />
                    </div>
                    
                    {/* Canvas */}
                    <div className="bg-card h-32 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
                      <div className="text-xs text-muted-foreground z-10">Slide Canvas</div>
                      
                      {/* Animated elements */}
                      <div className="absolute top-4 left-4 w-16 h-3 bg-foreground/10 rounded animate-pulse" />
                      <div className="absolute top-10 left-4 w-24 h-2 bg-foreground/5 rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 glass-toolbar rounded-xl px-4 py-2 text-sm shadow-lg">
                <div className="text-foreground font-semibold">10K+</div>
                <div className="text-muted-foreground text-xs">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
