import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PlayButton from "@/components/PlayButton";
import FloatingTitle from "@/components/FloatingTitle";
import Stars from "@/components/Stars";
import heroBackground from "@/assets/hero-background.png";

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
        style={{ backgroundImage: `url(${heroBackground})`}}
      />
      
      {/* Stars */}
      <Stars />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Content */}
      <div id="home" className="relative min-h-screen flex items-center justify-center">
        <div className="text-center relative">
          {/* Floating Title */}
          <div className="relative -mt-52 mb-4">
            <FloatingTitle />
          </div>
          
          {/* Play Button */}
          <Link to="/dashboard">
            <button 
              className="group relative mx-auto flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer -mt-12"
              style={{
                animation: 'bounce-gentle 3s ease-in-out infinite'
              }}
            >
              <PlayButton 
                className="text-foreground group-hover:scale-110 transition-transform drop-shadow-2xl" 
                width={114}
                height={114}
              />
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
