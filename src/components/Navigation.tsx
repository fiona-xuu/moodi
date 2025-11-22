import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-foreground text-lg font-medium hover:opacity-80 transition-opacity">
          icon
        </Link>
        
        <div className="flex gap-8 items-center">
          <Link to="/" className="text-foreground hover:opacity-80 transition-opacity">
            home
          </Link>
          <Link to="/about" className="text-foreground hover:opacity-80 transition-opacity">
            about us
          </Link>
        </div>
        
        <Link to="/login">
          <Button 
            variant="ghost" 
            className="glass-button hover:bg-primary/20 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            login
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
