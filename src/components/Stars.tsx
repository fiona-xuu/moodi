import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const Stars = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const numberOfStars = 65;
      const topHalfStars = Math.floor(numberOfStars * (2 / 3)); // 2/3 for top half
      const bottomHalfStars = numberOfStars - topHalfStars; // 1/3 for bottom half
      const newStars: Star[] = [];
      const duration = 1.5;

      // Generate stars for top half (0-50% of screen height)
      for (let i = 0; i < topHalfStars; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 50, // Top half: 0-50%
          size: Math.random() * 2 + 1,
          delay: Math.random() * 3,
          duration: duration,
        });
      }

      // Generate stars for bottom half (50-100% of screen height)
      for (let i = topHalfStars; i < numberOfStars; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: 50 + Math.random() * 50, // Bottom half: 50-100%
          size: Math.random() * 2 + 1,
          delay: Math.random() * 3,
          duration: duration,
        });
      }

      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default Stars;

