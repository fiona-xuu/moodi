import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-twilight-from))] via-[hsl(var(--gradient-twilight-via))] to-[hsl(var(--gradient-twilight-to))]">
      <Navigation />
      
      <div className="container mx-auto px-6 pt-32 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-6xl font-bold text-foreground mb-8">
            About Us
          </h1>
          
          <div className="glass-button rounded-2xl p-8 space-y-6">
            <p className="text-lg text-foreground/90 leading-relaxed">
              Welcome to moodi, your companion for mindful moments and emotional well-being.
            </p>
            
            <p className="text-foreground/80 leading-relaxed">
              We believe in the power of taking a moment to pause, breathe, and connect with yourself. 
              Our platform is designed to help you navigate your emotions and find peace in the everyday chaos.
            </p>
            
            <p className="text-foreground/80 leading-relaxed">
              Whether you're seeking calm, clarity, or just a moment of tranquility, moodi is here to 
              guide you on your journey to better mental wellness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
