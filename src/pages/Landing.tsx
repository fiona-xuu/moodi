import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import heroBackground from "@/assets/hero-background.png";

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Content */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center relative">
          {/* Moodi Logo with Bounce Animation - Curved around button */}
          <div className="relative mb-8 animate-bounce-gentle">
            <h1 className="font-display text-[120px] md:text-[180px] font-bold text-foreground drop-shadow-2xl">
              mood
            </h1>
            <span className="font-display text-[120px] md:text-[180px] font-bold text-foreground drop-shadow-2xl absolute -bottom-12 right-[35%]">
              i
            </span>
          </div>
          
          {/* Transparent Play Button */}
          <Link to="/dashboard">
            <button className="group relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-transparent border-4 border-foreground/80 hover:border-foreground hover:bg-foreground/10 transition-all duration-300 hover:scale-110 cursor-pointer shadow-2xl backdrop-blur-sm mt-8">
              <Play className="w-10 h-10 text-foreground fill-foreground ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--gradient-twilight-from))] via-[hsl(var(--gradient-twilight-via))] to-[hsl(var(--gradient-twilight-to))] py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-6xl font-bold text-foreground mb-8">
              About Us
            </h2>
            
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
    </div>
  );
};

export default Landing;
