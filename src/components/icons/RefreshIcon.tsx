interface RefreshIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const RefreshIcon = ({
  className = "",
  width = 18,
  height = 16,
}: RefreshIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 16"
      fill="none"
      className={className}
    >
      <path
        d="M5.24449 9.68759V14.4058H0.800049M12.3556 5.91299V1.19474H16.8M11.464 14.8003C12.6977 14.2712 13.7667 13.3853 14.5497 12.2434C15.3327 11.1014 15.7981 9.74914 15.8932 8.34031C15.9883 6.93148 15.7092 5.52258 15.0876 4.27376C14.466 3.02494 13.5269 1.9863 12.3769 1.27589M6.13605 0.800293C4.90267 1.32949 3.83384 2.21536 3.05104 3.35724C2.26824 4.49911 1.80285 5.8512 1.70776 7.25985C1.61267 8.6685 1.89169 10.0772 2.51312 11.3259C3.13455 12.5746 4.07346 13.6133 5.22316 14.3237"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RefreshIcon;

