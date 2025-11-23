interface PhysicalIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const PhysicalIcon = ({ className = "", width = 23, height = 22 }: PhysicalIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 23 22"
      fill="none"
      className={className}
    >
      <path
        d="M9.8074 17C10.5324 14.375 13.0674 12.5 15.9874 12.81C18.7674 13.105 20.9774 15.45 21.1174 18.24C21.1524 18.975 21.0524 19.68 20.8374 20.335C20.7074 20.735 20.3174 21 19.8924 21H5.0014C2.4774 21 0.584399 18.6905 1.0794 16.2155L4.1224 1H10.1224L12.1224 4.5L7.8374 7.565L6.6224 6M7.8424 7.565L10.1224 16"
        stroke="hsl(var(--primary-accent))"
        strokeWidth="2"
        strokeMiterlimit="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PhysicalIcon;

