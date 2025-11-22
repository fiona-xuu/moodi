interface ArrowProps {
  className?: string;
  rectangleColor?: string;
  username?: string;
}

const Arrow = ({ className = "", rectangleColor = "currentColor", username }: ArrowProps) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Rectangle */}
      <div 
        className="h-[107px] w-[910.175px]"
        style={{ backgroundColor: rectangleColor }}
      />
      
      {/* Arrow SVG */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="89" 
        height="107" 
        viewBox="0 0 89 107" 
        fill="none"
        className="flex-shrink-0 -ml-2"
      >
        <path 
          d="M83.5897 45.2416C89.7356 49.175 89.7356 58.1536 83.5897 62.087L15.3906 105.735C8.73451 109.995 0 105.215 0 97.3123L0 10.0163C0 2.11373 8.73451 -2.66635 15.3906 1.5936L83.5897 45.2416Z" 
          fill="currentColor"
        />
      </svg>
      
      {/* Username on left, vertically centered */}
      {username && (
        <h1 className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground whitespace-nowrap z-10 pl-14">
          {username}
        </h1>
      )}
    </div>
  );
};

export default Arrow;

