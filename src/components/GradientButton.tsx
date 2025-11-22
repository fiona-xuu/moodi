import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface GradientButtonProps {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const GradientButton = ({ 
  children, 
  to, 
  onClick, 
  className = "",
  type = "button"
}: GradientButtonProps) => {
  const baseStyles = "rounded-xl border border-[#39396F] bg-gradient-to-b from-[#855C86] to-[#44447E] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] text-foreground font-medium transition-all duration-300 hover:scale-105 cursor-pointer text-xl py-2 px-7";

  if (to) {
    return (
      <Link to={to} className={`${baseStyles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default GradientButton;

