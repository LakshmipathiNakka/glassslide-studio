import { Layers, Type, Image, BarChart3, Palette, Download, Sparkles, Zap, Shield } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animations";

export const Features = () => {
  const { isVisible, elementRef } = useScrollAnimation();
  
  const features = [
    {
      icon: Layers,
      title: "Intuitive Slide Builder",
      description: "Drag, drop, and arrange elements with pixel-perfect precision. Smart guides and snapping make alignment effortless.",
      color: "from-slate-100 to-slate-200"
    },
    {
      icon: Type,
      title: "Rich Text Editing",
      description: "Professional typography with full formatting control. Bold, italic, colors, and alignment at your fingertips.",
      color: "from-slate-200 to-slate-300"
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Create stunning charts and graphs. Import data, customize styles, and watch your numbers come to life.",
      color: "from-slate-300 to-slate-400"
    },
    {
      icon: Download,
      title: "Export Professionally",
      description: "Download as PowerPoint (.pptx) with perfect fidelity. Share online or present from anywhere.",
      color: "from-slate-400 to-slate-500"
    },
    {
      icon: Sparkles,
      title: "Presentation Mode",
      description: "Fullscreen presentations with keyboard navigation. Auto-play, slide transitions, and professional controls.",
      color: "from-slate-600 to-slate-700"
    }
  ];

  return (
    <section 
      id="features" 
      ref={elementRef}
      className="py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
    >
      {/* Enhanced Parallax background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-slate-200/20 to-slate-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-slate-300/15 to-slate-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/10 to-slate-500/5 rounded-full blur-2xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className={`text-center mb-20 fade-in-up ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Design slides faster than you think
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Professional slides, zero friction. Everything you need to create presentations that stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`glass-card rounded-2xl p-8 hover-glow transition-all duration-500 hover:-translate-y-3 scale-in group border border-slate-200/30 ${
                isVisible ? 'visible' : ''
              }`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Enhanced Quote callout */}
        <div className={`mt-24 text-center fade-in-up ${isVisible ? 'visible' : ''}`}>
          <div className="glass-card rounded-3xl p-16 max-w-4xl mx-auto border border-slate-200/30 shadow-2xl">
            <blockquote className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              "From idea to keynote — in minutes."
            </blockquote>
            <p className="text-lg text-slate-600 font-light">
              Join thousands of professionals creating stunning presentations every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
