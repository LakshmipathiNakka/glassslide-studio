export const Logo = () => {
  return (
    <div className="flex items-center gap-3 group">
      <div className="relative w-8 h-8">
        {/* Geometric logo shape */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground to-muted-foreground rounded-lg transform transition-transform duration-300 group-hover:rotate-12" 
          style={{ 
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' 
          }}
        />
      </div>
      <span className="text-xl font-bold text-foreground tracking-tight">
        GlassSlide
      </span>
    </div>
  );
};
