import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Logo } from "./Logo";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation, useParallax } from "@/hooks/use-scroll-animations";

export const Hero = () => {
  const navigate = useNavigate();
  const { scrollY, isVisible, elementRef } = useScrollAnimation();
  const parallaxSlow = useParallax(0.3);
  const parallaxMedium = useParallax(0.5);
  const parallaxFast = useParallax(0.7);

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-toolbar border-b transition-all duration-300" role="navigation" aria-label="Main navigation">
        <div className="container-responsive py-3 sm:py-4">
          <div className="flex-modern justify-between">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-fluid-md">
              <a 
                href="#features" 
                className="text-fluid-sm text-gray-600 hover:text-black transition-colors duration-300 relative group touch-target"
                aria-label="Navigate to Features section"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#pricing" 
                className="text-fluid-sm text-gray-600 hover:text-black transition-colors duration-300 relative group touch-target"
                aria-label="Navigate to Pricing section"
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </a>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                className="touch-button bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300"
                aria-label="Open mobile menu"
                aria-expanded="false"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-fluid-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                className="touch-button bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300"
                aria-label="Login to your account"
              >
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/editor')}
                className="touch-button bg-black text-white hover:bg-gray-800 transition-all duration-300"
                aria-label="Try the demo editor"
              >
                Try Demo
              </Button>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="lg:hidden flex items-center space-fluid-xs">
              <Button 
                variant="ghost" 
                size="sm" 
                className="touch-button bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300"
                aria-label="Login to your account"
              >
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/editor')}
                className="touch-button bg-black text-white hover:bg-gray-800 transition-all duration-300"
                aria-label="Try the demo editor"
              >
                Try
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section 
        ref={elementRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-16 sm:pt-20"
      >
        {/* Enhanced Parallax background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-4 sm:left-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-slate-200/30 to-slate-300/20 blur-3xl"
            style={{ transform: `translateY(${parallaxSlow}px)` }}
          />
          <div 
            className="absolute bottom-20 right-4 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-slate-300/20 to-slate-400/10 blur-3xl" 
            style={{ transform: `translateY(${parallaxMedium}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/3 w-36 h-36 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-slate-200/25 to-slate-300/15 blur-3xl"
            style={{ transform: `translateY(${parallaxFast}px)` }}
          />
          <div 
            className="absolute top-1/4 right-1/4 w-24 h-24 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-slate-400/15 to-slate-500/10 blur-2xl"
            style={{ transform: `translateY(${parallaxSlow * 1.5}px)` }}
          />
        </div>

        <div className="container-responsive relative z-10">
          <div className="grid-modern lg:grid-cols-2 items-center">
            {/* Left Content */}
            <div className={`space-fluid-lg fade-in-left ${isVisible ? 'visible' : ''}`}>
              <div className="inline-block card-glass rounded-full text-fluid-sm text-slate-600 mb-4 sm:mb-6 border border-slate-200/50">
                <div className="flex items-center space-fluid-xs">
                  <Sparkles className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span>Professional presentations made simple</span>
                </div>
              </div>
              
              <h1 className="text-fluid-6xl font-bold text-slate-900 leading-[0.9] tracking-tight">
                Design your<br />
                <span className="text-slate-500">vision.</span>
              </h1>
              
              <p className="text-fluid-lg text-slate-600 max-w-xl leading-relaxed font-light">
                Create, animate, and share presentations that look flawless everywhere. 
                Professional tools with zero friction.
              </p>

              <div className="flex-responsive pt-4">
        <Button 
          size="lg" 
          onClick={() => navigate('/editor')}
          className="touch-button bg-black text-white hover:bg-gray-800 transition-all duration-300 group btn-ripple btn-click btn-magnetic w-full sm:w-auto"
          aria-label="Start creating your presentation"
        >
          Start Creating
          <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="touch-button bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 card-glass group btn-click btn-shimmer w-full sm:w-auto"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  aria-label="Watch a demo of the presentation editor"
                >
                  <Play className="mr-3 w-5 h-5" aria-hidden="true" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex-responsive items-start sm:items-center text-fluid-sm text-slate-500 pt-4 sm:pt-6">
                <div className="flex items-center space-fluid-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-fluid-xs">
                  <div className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
                  <span className="font-medium">Free forever</span>
                </div>
              </div>
            </div>

            {/* Right Content - Enhanced Device Mockup */}
            <div className={`relative fade-in-right ${isVisible ? 'visible' : ''} order-first lg:order-last`}>
              <div className="card-glass rounded-2xl sm:rounded-3xl shadow-2xl hover-glow transition-all duration-500 hover:scale-105 border border-slate-200/30">
                <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl overflow-hidden relative border border-slate-200/50">
                  {/* Simulated Editor Interface */}
                  <div className="absolute inset-0 p-3 sm:p-4 lg:p-6">
                    {/* Enhanced Toolbar */}
                    <div className="card-glass h-8 sm:h-10 lg:h-12 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center px-2 sm:px-3 lg:px-4 space-fluid-xs border border-slate-200/30">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-slate-200 rounded-md sm:rounded-lg" aria-hidden="true" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-slate-200 rounded-md sm:rounded-lg" aria-hidden="true" />
                      <div className="w-px h-4 sm:h-6 lg:h-8 bg-slate-300 mx-1 sm:mx-2" aria-hidden="true" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-slate-200 rounded-md sm:rounded-lg" aria-hidden="true" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-slate-200 rounded-md sm:rounded-lg" aria-hidden="true" />
                      <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-slate-200 rounded-md sm:rounded-lg" aria-hidden="true" />
                    </div>
                    
                    {/* Enhanced Canvas */}
                    <div className="bg-white h-24 sm:h-32 lg:h-40 rounded-lg sm:rounded-xl shadow-inner flex items-center justify-center relative overflow-hidden border border-slate-200/50">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent" />
                      <div className="text-fluid-xs text-slate-500 z-10 font-medium">Slide Canvas</div>
                      
                      {/* Animated elements */}
                      <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 w-12 sm:w-16 lg:w-20 h-2 sm:h-3 lg:h-4 bg-slate-200 rounded animate-pulse" aria-hidden="true" />
                      <div className="absolute top-8 sm:top-10 lg:top-14 left-3 sm:left-4 lg:left-6 w-20 sm:w-24 lg:w-32 h-2 sm:h-2 lg:h-3 bg-slate-100 rounded animate-pulse" style={{ animationDelay: '0.3s' }} aria-hidden="true" />
                      <div className="absolute top-12 sm:top-16 lg:top-20 left-3 sm:left-4 lg:left-6 w-16 sm:w-20 lg:w-24 h-2 sm:h-2 lg:h-3 bg-slate-100 rounded animate-pulse" style={{ animationDelay: '0.6s' }} aria-hidden="true" />
                      
                      {/* Floating elements */}
                      <div className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 w-6 sm:w-8 lg:w-12 h-6 sm:h-8 lg:h-12 bg-slate-200 rounded-full animate-pulse" style={{ animationDelay: '0.9s' }} aria-hidden="true" />
                      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 w-8 sm:w-12 lg:w-16 h-4 sm:h-6 lg:h-8 bg-slate-200 rounded-lg animate-pulse" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating stats */}
              <div className="absolute -top-3 sm:-top-4 lg:-top-6 -right-3 sm:-right-4 lg:-right-6 card-glass rounded-xl sm:rounded-2xl text-fluid-xs shadow-xl border border-slate-200/30">
                <div className="text-slate-900 font-bold text-fluid-lg">10K+</div>
                <div className="text-slate-500 text-fluid-xs font-medium">Active Users</div>
              </div>
              
              {/* Additional floating element */}
              <div className="absolute -bottom-2 sm:-bottom-3 lg:-bottom-4 -left-2 sm:-left-3 lg:-left-4 card-glass rounded-lg sm:rounded-xl text-fluid-xs shadow-lg border border-slate-200/30">
                <div className="text-slate-700 font-semibold">99.9%</div>
                <div className="text-slate-500">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

