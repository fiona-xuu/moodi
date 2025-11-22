interface EnergyIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const EnergyIcon = ({ className = "", width = 14, height = 20 }: EnergyIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 20"
      fill="none"
      className={className}
    >
      <path
        d="M0.943692 9.14687L6.94169 1.06187C7.41169 0.429872 8.28969 0.822872 8.28969 1.66487V7.92287C8.28969 8.42787 8.63469 8.83587 9.05969 8.83587H11.9777C12.6407 8.83587 12.9937 9.76287 12.5557 10.3539L6.55769 18.4379C6.08769 19.0699 5.20969 18.6769 5.20969 17.8349V11.5769C5.20969 11.0719 4.86469 10.6639 4.43969 10.6639H1.52069C0.857692 10.6639 0.505692 9.73687 0.943692 9.14687Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EnergyIcon;

