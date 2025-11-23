interface RectangleProps {
  className?: string;
  rectangleColor?: string;
  username?: string;
}

const Rectangle = ({ className = "", rectangleColor = "currentColor", username }: RectangleProps) => {
  // Get the actual color value - use same color as statistics rounded rectangles (bg-foreground/10)
  const getColorValue = () => {
    if (rectangleColor === "currentColor") {
      return "hsl(var(--foreground) / 0.2)";
    }
    return rectangleColor;
  };

  const colorValue = getColorValue();
  
  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Rectangle with gradient fade - solid until 50%, then fades to transparent */}
      <div 
        className="h-[107px] w-[910.175px]"
        style={{
          background: `linear-gradient(to right, ${colorValue} 0%, ${colorValue} 30%, transparent 100%)`
        }}
      />
      
      {/* Username on left, vertically centered */}
      {username && (
        <h1 className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground whitespace-nowrap z-10 pl-14">
          {username}
        </h1>
      )}
    </div>
  );
};

export default Rectangle;

