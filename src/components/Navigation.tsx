import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import GradientButton from "@/components/GradientButton";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import mascot from "@/assets/mascot.png";

const Navigation = () => {
  const location = useLocation();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 px-12 py-6 transition-colors duration-300 ${
        hasScrolled ? 'bg-[#3E3464]' : 'bg-transparent'
      }`}
    >
      <div className="relative mx-auto flex items-center text-xl">
        {/* Left section */}
        <div className="flex-1 flex justify-start">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hover:scale-110 transition-all duration-300 cursor-pointer -ml-2">
                  <img src={mascot} alt="moodi mascot" className="h-12 w-auto" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>hi, i'm lumi!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Center section - absolutely positioned */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-8 items-center inder-text">
          {location.pathname === '/' ? (
            <a 
              href="#home" 
              onClick={scrollToHome}
              className="text-foreground hover:opacity-80 transition-opacity cursor-pointer"
            >
              home
            </a>
          ) : (
            <Link to="/" className="text-foreground hover:opacity-80 transition-opacity">
              home
            </Link>
          )}
          {location.pathname === '/' ? (
            <a 
              href="#about" 
              onClick={scrollToAbout}
              className="text-foreground hover:opacity-80 transition-opacity cursor-pointer"
            >
              about us
            </a>
          ) : (
            <Link to="/#about" className="text-foreground hover:opacity-80 transition-opacity">
              about us
            </Link>
          )}
        </div>
        
        {/* Right section */}
        <div className="flex-1 flex justify-end inder-text">
          <GradientButton to="/login">
            log in
          </GradientButton>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
