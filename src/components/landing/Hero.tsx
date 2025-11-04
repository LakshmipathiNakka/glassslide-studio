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
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#testimonials" 
                className="text-fluid-sm text-gray-600 hover:text-black transition-colors duration-300 relative group touch-target"
                aria-label="Read customer reviews"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('testimonials');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Reviews
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#pricing" 
                className="text-fluid-sm text-gray-600 hover:text-black transition-colors duration-300 relative group touch-target"
                aria-label="Navigate to Pricing section"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('pricing');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#cta" 
                className="text-fluid-sm text-gray-600 hover:text-black transition-colors duration-300 relative group touch-target"
                aria-label="Explore GlassSlide features"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('cta');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Explore
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
        {/* Keyframe animations */}
        <style jsx="true" global="true">{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-delay-100 { animation-delay: 0.1s; }
          .animate-delay-200 { animation-delay: 0.2s; }
          .animate-delay-300 { animation-delay: 0.3s; }
          .animate-delay-400 { animation-delay: 0.4s; }
          .animate-duration-700 { animation-duration: 0.7s; }
          .animate-duration-1000 { animation-duration: 1s; }
          .animate-fill-both { animation-fill-mode: both; }
        `}</style>
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
            <div className={`space-fluid-lg ${isVisible ? 'visible' : ''}`}>
              {/* Animated tagline */}
              <div 
                className={`inline-block card-glass rounded-full text-fluid-sm text-slate-600 mb-4 sm:mb-6 border border-slate-200/50 
                  transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  animation: isVisible ? 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' : 'none'
                }}
              >
              
                <div className="flex items-center space-fluid-xs">
                  <Sparkles className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span>Professional presentations made simple</span>
                </div>
              </div>
              
              <h1 className="text-fluid-6xl font-bold text-slate-900 leading-[0.9] tracking-tight">
                <span 
                  className="inline-block transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}"
                  style={{
                    animation: isVisible ? 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both' : 'none'
                  }}
                >
                  Design your
                </span>
                <br />
                <span 
                  className="inline-block text-slate-500 transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}"
                  style={{
                    animation: isVisible ? 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both' : 'none'
                  }}
                >
                  vision.
                </span>
              </h1>
              
              <p 
                className="text-fluid-lg text-slate-600 max-w-xl leading-relaxed font-light 
                  transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}"
                style={{
                  animation: isVisible ? 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both' : 'none'
                }}
              >
                Create, animate, and share presentations that look flawless everywhere. 
                Professional tools with zero friction.
              </p>

              <div 
                className={`flex-responsive pt-4 transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  animation: isVisible ? 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both' : 'none'
                }}
              >
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
              
              <div 
                className={`flex-responsive items-start sm:items-center text-fluid-sm text-slate-500 pt-4 sm:pt-6 
                  transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{
                  animation: isVisible ? 'fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both' : 'none'
                }}
              >
                <div 
                  className="flex items-center space-fluid-xs transform transition-all duration-700 ease-out"
                  style={{
                    animation: isVisible ? 'fadeInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both' : 'none'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div 
                  className="flex items-center space-fluid-xs transform transition-all duration-700 ease-out"
                  style={{
                    animation: isVisible ? 'fadeInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both' : 'none'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" aria-hidden="true" />
                  <span className="font-medium">Free forever</span>
                </div>
              </div>
            </div>

            {/* Right Content - Enhanced Device Mockup with Apple-like Animations */}
            <div 
              className={`relative order-first lg:order-last transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{
                transform: `translateY(${parallaxMedium * 10}px)`,
                transition: 'opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1), transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div 
                className="relative group"
              >
                {/* Main Card with Enhanced Contrast */}
                <div 
                  className="card-glass rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
                    hover:scale-[1.02] hover:shadow-2xl border border-slate-200/80 overflow-hidden relative
                    bg-white/95 backdrop-blur-sm
                    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-white/10 before:opacity-0 
                    before:transition-opacity before:duration-700 before:ease-[cubic-bezier(0.16,1,0.3,1)]
                    hover:before:opacity-100
                    ring-1 ring-slate-200/50"
                  style={{
                    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateY = (x - centerX) / 40;
                    const rotateX = (centerY - y) / 40;
                    
                    e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                    e.currentTarget.style.boxShadow = `${-rotateY * 5}px ${rotateX * 5}px 30px rgba(0, 0, 0, 0.1)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl overflow-hidden relative 
                              border border-slate-200/80 shadow-sm">
                    {/* Simulated Editor Interface */}
                    <div className="absolute inset-0 p-3 sm:p-4 lg:p-6">
                      {/* Enhanced Toolbar with better contrast */}
                      <div className="card-glass h-8 sm:h-10 lg:h-12 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center px-2 sm:px-3 lg:px-4 space-fluid-xs 
                          border border-slate-200/60 bg-white/80 backdrop-blur-sm
                          transition-all duration-300 ease-out hover:shadow-sm">
                        {/* Layout Templates */}
                        <button className="p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-blue-50 hover:scale-110 transition-all duration-200" aria-label="Layouts">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        </button>
                        
                        {/* Text Tool */}
                        <button className="p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-blue-50 hover:scale-110 transition-all duration-200" aria-label="Text">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Shapes */}
                        <button className="p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-blue-50 hover:scale-110 transition-all duration-200" aria-label="Shapes">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </button>
                        
                        {/* Media */}
                        <button className="p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-blue-50 hover:scale-110 transition-all duration-200" aria-label="Media">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        {/* Charts */}
                        <button className="p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-blue-50 hover:scale-110 transition-all duration-200" aria-label="Charts">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        
                        {/* More Options */}
                        <button className="p-1 sm:p-1.5 lg:p-2 rounded-md hover:bg-blue-50 hover:scale-110 transition-all duration-200" aria-label="More options">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Enhanced Canvas with better contrast */}
                      <div className="bg-white h-24 sm:h-32 lg:h-40 rounded-lg sm:rounded-xl shadow-inner flex items-center justify-center relative overflow-hidden 
                                  border border-slate-200/80 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/70 to-white/30" />
                        <div className="text-fluid-xs text-slate-500 z-10 font-medium transition-all duration-300 group-hover:opacity-80">
                          Slide Canvas
                        </div>
                        
                        {/* Animated elements with staggered delays */}
                        <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 w-12 sm:w-16 lg:w-20 h-2 sm:h-3 lg:h-4 bg-slate-200 rounded-full 
                                    transition-all duration-700 ease-out group-hover:bg-blue-100 group-hover:w-16 sm:group-hover:w-20 lg:group-hover:w-24"
                             style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} 
                             aria-hidden="true" 
                        />
                        
                        <div className="absolute top-8 sm:top-10 lg:top-14 left-3 sm:left-4 lg:left-6 w-20 sm:w-24 lg:w-32 h-2 sm:h-2 lg:h-3 bg-slate-100 rounded-full 
                                    transition-all duration-700 ease-out group-hover:bg-blue-50 group-hover:w-24 sm:group-hover:w-28 lg:group-hover:w-36"
                             style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s' }} 
                             aria-hidden="true" 
                        />
                        
                        <div className="absolute top-12 sm:top-16 lg:top-20 left-3 sm:left-4 lg:left-6 w-16 sm:w-20 lg:w-24 h-2 sm:h-2 lg:h-3 bg-slate-100 rounded-full 
                                    transition-all duration-700 ease-out group-hover:bg-blue-50 group-hover:w-20 sm:group-hover:w-24 lg:group-hover:w-28"
                             style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.6s' }} 
                             aria-hidden="true" 
                        />
                        
                        {/* Floating elements with subtle hover effects */}
                        <div 
                  className="absolute top-4 sm:top-6 lg:top-8 right-4 sm:right-6 lg:right-8 w-6 sm:w-8 lg:w-12 h-6 sm:h-8 lg:h-12 
                             bg-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) rounded-full 
                             flex items-center justify-center
                             transition-all duration-700 ease-out group-hover:scale-110 group-hover:shadow-md"
                  style={{
                    animation: 'float 6s ease-in-out infinite',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                  aria-hidden="true"
                >
                  <svg 
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-blue-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" 
                    />
                  </svg>
                </div>
                        
                        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 w-8 sm:w-12 lg:w-16 h-4 sm:h-6 lg:h-8 
                                    bg-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) rounded-lg 
                                    transition-all duration-700 ease-out group-hover:scale-105 group-hover:shadow-sm"
                             style={{ 
                               animation: 'float 8s ease-in-out infinite 1s',
                               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                             }} 
                             aria-hidden="true" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating stats with better contrast */}
                <div 
                  className="absolute -top-3 sm:-top-4 lg:-top-6 -right-3 sm:-right-4 lg:-right-6 card-glass rounded-xl sm:rounded-2xl text-fluid-xs 
                             shadow-xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-2 sm:p-3 transition-all duration-700 ease-out 
                             hover:scale-105 hover:shadow-2xl ring-1 ring-slate-200/50"
                  style={{
                    transform: `translateY(${parallaxFast * 5}px)`,
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div className="text-slate-900 font-bold text-fluid-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-slate-500 text-fluid-xs font-medium">Active Users</div>
                </div>
                
                {/* Additional floating element with better contrast */}
                <div 
                  className="absolute -bottom-2 sm:-bottom-3 lg:-bottom-4 -left-2 sm:-left-3 lg:-left-4 card-glass rounded-lg sm:rounded-xl 
                             text-fluid-xs shadow-lg border border-slate-200/60 bg-white/90 backdrop-blur-sm p-2 transition-all duration-700 ease-out 
                             hover:scale-105 ring-1 ring-slate-200/50"
                  style={{
                    transform: `translateY(${parallaxFast * -5}px)`,
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
                  }}
                >
                  <div className="text-slate-700 font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    99.9%
                  </div>
                  <div className="text-slate-500">Uptime</div>
                </div>
                
                {/* Enhanced glow effect on hover */}
                <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-blue-100/30 to-cyan-100/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-1000 ease-out" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

