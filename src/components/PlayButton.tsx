interface PlayButtonProps {
  className?: string;
  width?: number;
  height?: number;
}

const PlayButton = ({ className = "", width = 135, height = 135 }: PlayButtonProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 135 135" 
      fill="none"
      className={className}
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M67.5 130.781C32.5519 130.781 4.21875 102.448 4.21875 67.5C4.21875 32.5519 32.5519 4.21875 67.5 4.21875C102.448 4.21875 130.781 32.5519 130.781 67.5C130.781 102.448 102.448 130.781 67.5 130.781ZM57.6844 39.9966C50.8331 37.2684 44.3981 41.3916 43.4081 48.6984C42.5814 54.9313 42.1736 61.2126 42.1875 67.5C42.1875 75.0094 42.7359 81.3516 43.4081 86.3016C44.3981 93.6084 50.8331 97.7316 57.6844 95.0034C61.9988 93.285 67.6603 90.7059 74.9447 86.8359C81.8241 83.1797 87.2578 79.9116 91.4766 77.1441C98.9381 72.2503 98.9381 62.7497 91.4766 57.8559C87.2578 55.0884 81.8241 51.8175 74.9447 48.1641C67.6603 44.2941 61.9988 41.715 57.6844 39.9966Z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default PlayButton;

