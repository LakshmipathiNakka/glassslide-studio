import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, FileText } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animations";

export const CTA = () => {
  const { isVisible, elementRef } = useScrollAnimation();
  
  return (
    <section 
      ref={elementRef}
      className="py-40 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden"
    >
      {/* Enhanced Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-slate-200/10 to-slate-300/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-slate-300/15 to-slate-400/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-slate-400/10 to-slate-500/5 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className={`max-w-5xl mx-auto text-center space-y-12 fade-in-up ${isVisible ? 'visible' : ''}`}>
          <div className="space-y-6">
            <h2 className="text-7xl lg:text-8xl font-bold text-slate-900 leading-[0.9] tracking-tight">
              Ready to create something amazing?
            </h2>
            
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Join thousands of professionals who design faster, present better, and deliver impact.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 justify-center pt-8">
        <Button 
          size="lg" 
          onClick={() => window.location.href = '/simple-enhanced'}
          className="bg-black text-white hover:bg-gray-800 transition-all duration-300 px-12 py-8 text-xl font-semibold rounded-2xl group btn-ripple btn-click btn-magnetic btn-particle"
        >
          Get Started Free
          <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
        </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 px-12 py-8 text-xl font-semibold rounded-2xl glass-card group btn-click btn-shimmer"
            >
              <FileText className="mr-3 w-6 h-6" />
              View Examples
            </Button>
          </div>

          <div className={`flex items-center justify-center gap-16 pt-16 fade-in-up ${isVisible ? 'visible' : ''}`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                <Users className="w-8 h-8" />
                50K+
              </div>
              <div className="text-slate-600 font-medium">Active users</div>
            </div>
            <div className="w-px h-16 bg-slate-300" />
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                <FileText className="w-8 h-8" />
                1M+
              </div>
              <div className="text-slate-600 font-medium">Presentations created</div>
            </div>
            <div className="w-px h-16 bg-slate-300" />
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-yellow-500" />
                4.9
              </div>
              <div className="text-slate-600 font-medium">User rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
