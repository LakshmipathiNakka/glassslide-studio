import { Layers, Type, Image, BarChart3, Palette, Download } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Layers,
      title: "Intuitive Slide Builder",
      description: "Drag, drop, and arrange elements with pixel-perfect precision. Smart guides and snapping make alignment effortless."
    },
    {
      icon: Type,
      title: "Insert Anything",
      description: "Text, images, charts, tables, shapes — everything you need in one place. Professional tools, zero learning curve."
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Create stunning charts and graphs. Import data, customize styles, and watch your numbers come to life."
    },
    {
      icon: Download,
      title: "Export Professionally",
      description: "Download as PowerPoint (.pptx) with perfect fidelity. Share online or present from anywhere."
    },
    {
      icon: Palette,
      title: "Beautiful Themes",
      description: "Pre-designed templates and color schemes. Customize everything or start from a professional baseline."
    },
    {
      icon: Image,
      title: "Collaborate in Real Time",
      description: "Work together seamlessly. See changes as they happen, comment, and build presentations as a team."
    }
  ];

  return (
    <section id="features" className="py-24 bg-bg-soft relative overflow-hidden">
      {/* Parallax background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Design slides faster than you think
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional slides, zero friction. Everything you need to create presentations that stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-panel rounded-xl p-8 hover-glow transition-all duration-300 hover:-translate-y-2 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Quote callout */}
        <div className="mt-20 text-center">
          <div className="glass-panel rounded-2xl p-12 max-w-3xl mx-auto">
            <blockquote className="text-2xl lg:text-3xl font-medium text-foreground mb-4">
              "From idea to keynote — in minutes."
            </blockquote>
            <p className="text-muted-foreground">
              Join thousands of professionals creating stunning presentations every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
