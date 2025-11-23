interface NapIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const NapIcon = ({
  className = "",
  width = 41,
  height = 40,
}: NapIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 41 40"
      fill="none"
      className={className}
    >
      <path
        d="M12.7715 1.00003C12.1483 2.93584 11.8318 4.95722 11.8333 6.99086C11.8333 17.7603 20.5639 26.4909 31.3333 26.4909C33.9914 26.4953 36.622 25.9533 39.0618 24.8984C36.5344 32.7384 29.1797 38.4075 20.5 38.4075C9.73058 38.4075 1 29.6769 1 18.9075C1 10.8833 5.84575 3.9922 12.7715 1.00003Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M28.7983 3.74088H38.9166L28.0833 12.4075H38.9166"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default NapIcon;

