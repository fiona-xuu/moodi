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
        <div className="text-center">
          {/* Moodi Logo with Bounce Animation */}
          <h1 className="font-display text-[120px] md:text-[180px] font-bold text-foreground mb-8 animate-bounce-gentle drop-shadow-2xl">
            moodi
          </h1>
          
          {/* Play Button */}
          <Link to="/signup">
            <button className="group relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-foreground/90 hover:bg-foreground transition-all duration-300 hover:scale-110 cursor-pointer shadow-2xl">
              <Play className="w-10 h-10 text-background fill-background ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
