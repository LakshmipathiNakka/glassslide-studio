import { Zap, Image, BarChart3, Table, FileDown, Cloud } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Drag, resize, and edit with zero lag. Every interaction is instant and responsive.",
  },
  {
    icon: Image,
    title: "Rich Media",
    description: "Insert images, videos, and custom graphics. Upload or choose from our library.",
  },
  {
    icon: BarChart3,
    title: "Live Charts",
    description: "Create beautiful data visualizations. Bar, line, pie, and area charts built-in.",
  },
  {
    icon: Table,
    title: "Smart Tables",
    description: "Add formatted tables with style. Sort, filter, and customize on the fly.",
  },
  {
    icon: FileDown,
    title: "Export to PPTX",
    description: "Download as PowerPoint with preserved layouts. Compatible with all major tools.",
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Your presentations everywhere. Auto-save, version history, and team sharing.",
  },
];

export const Features = () => {
  return (
    <section className="py-32 bg-bg-soft relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Everything you need, nothing you don't
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional tools designed for speed and precision. Build presentations that stand out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
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
      </div>
    </section>
  );
};
