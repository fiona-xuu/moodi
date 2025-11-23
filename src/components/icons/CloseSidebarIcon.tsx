interface CloseSidebarIconProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

const CloseSidebarIcon = ({
  className = "",
  width = 27,
  height = 27,
}: CloseSidebarIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 27 27"
      fill="none"
      className={className}
    >
      <path
        d="M25.75 1V25.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 13.375H19.5625"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.625 23L20.25 13.375L10.625 3.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CloseSidebarIcon;

