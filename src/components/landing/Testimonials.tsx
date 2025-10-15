import { Star, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animations";

export const Testimonials = () => {
  const { isVisible, elementRef } = useScrollAnimation();

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      content: "GlassSlide has revolutionized how we create presentations. The interface is intuitive and the results are always professional.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "Marketing Director at StartupXYZ",
      content: "I've tried every presentation tool out there. GlassSlide is by far the most elegant and powerful solution I've used.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Consultant at McKinsey",
      content: "The glassmorphism design and smooth animations make our client presentations stand out. Highly recommended!",
      rating: 5,
      avatar: "EW"
    },
    {
      name: "David Kim",
      role: "CEO at InnovateLab",
      content: "From concept to presentation in minutes. GlassSlide has saved us countless hours while improving our output quality.",
      rating: 5,
      avatar: "DK"
    },
    {
      name: "Lisa Thompson",
      role: "Design Lead at CreativeStudio",
      content: "The attention to detail in the UI is incredible. Every interaction feels smooth and purposeful. A joy to use.",
      rating: 5,
      avatar: "LT"
    },
    {
      name: "James Wilson",
      role: "Sales Director at EnterpriseCo",
      content: "Our sales team loves how easy it is to create compelling presentations. The interface is intuitive and highly customizable.",
      rating: 5,
      avatar: "JW"
    }
  ];

  return (
    <section 
      ref={elementRef}
      className="py-32 bg-gradient-to-b from-slate-100 to-slate-50 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-slate-200/20 to-slate-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-slate-300/15 to-slate-400/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className={`text-center mb-20 fade-in-up ${isVisible ? 'visible' : ''}`}>
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            What our users say
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Join thousands of professionals who trust GlassSlide for their most important presentations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`glass-card rounded-2xl p-8 hover-glow transition-all duration-500 hover:-translate-y-2 scale-in group border border-slate-200/30 ${
                isVisible ? 'visible' : ''
              }`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-slate-300 mb-4" />
              
              <p className="text-slate-700 leading-relaxed mb-6 font-light">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-700 font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600 font-light">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className={`mt-24 text-center fade-in-up ${isVisible ? 'visible' : ''}`}>
          <div className="glass-card rounded-3xl p-16 max-w-4xl mx-auto border border-slate-200/30 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="text-5xl font-bold text-slate-900 mb-2">50K+</div>
                <div className="text-slate-600 font-medium">Happy Users</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-slate-900 mb-2">1M+</div>
                <div className="text-slate-600 font-medium">Presentations Created</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-slate-900 mb-2">4.9★</div>
                <div className="text-slate-600 font-medium">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
