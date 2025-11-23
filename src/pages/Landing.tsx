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
      <Stars duration={1.5} />
      
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
    </div>
  );
};

export default Landing;
