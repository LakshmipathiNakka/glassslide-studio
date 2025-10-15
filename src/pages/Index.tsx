import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      
      {/* Enhanced Footer */}
      <footer className="py-12 sm:py-16 lg:py-20 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container-responsive">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-slate-900 font-bold text-xl sm:text-2xl">GlassSlide</div>
              <p className="text-slate-600 font-light leading-relaxed text-sm sm:text-base">
                Professional presentation software that makes creating stunning slides effortless.
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-slate-900 font-semibold text-base sm:text-lg">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Features</a>
                <a href="/powerpoint" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">🚀 Enhanced PowerPoint Editor</a>
                <a href="/simple-professional" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Try Simple Professional</a>
                <a href="/professional" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Full Professional Editor</a>
                <a href="/simple-enhanced" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Simple Editor</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Pricing</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Examples</a>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-slate-900 font-semibold text-base sm:text-lg">Company</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">About</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Blog</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Careers</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Contact</a>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-slate-900 font-semibold text-base sm:text-lg">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Help Center</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Documentation</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Community</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors duration-300 font-light text-sm sm:text-base">Status</a>
              </div>
            </div>
          </div>
          
          <div className="pt-6 sm:pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
              <div className="text-xs sm:text-sm text-slate-500 font-light text-center sm:text-left">
                © 2025 GlassSlide. All rights reserved.
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-500">
                <a href="#" className="hover:text-black transition-colors duration-300 font-light">Privacy Policy</a>
                <a href="#" className="hover:text-black transition-colors duration-300 font-light">Terms of Service</a>
                <a href="#" className="hover:text-black transition-colors duration-300 font-light">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
