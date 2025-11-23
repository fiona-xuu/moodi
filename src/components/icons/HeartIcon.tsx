interface HeartIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const HeartIcon = ({ className = "", width = 20, height = 20 }: HeartIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M17.3667 3.84172C16.941 3.41589 16.4357 3.0781 15.8795 2.84763C15.3232 2.61716 14.7271 2.49854 14.125 2.49854C13.5229 2.49854 12.9268 2.61716 12.3705 2.84763C11.8143 3.0781 11.309 3.41589 10.8833 3.84172L10 4.72506L9.11666 3.84172C8.25698 2.98204 7.09087 2.49898 5.875 2.49898C4.65913 2.49898 3.49302 2.98204 2.63334 3.84172C1.77366 4.7014 1.2906 5.86751 1.2906 7.08339C1.2906 8.29926 1.77366 9.46537 2.63334 10.3251L3.51666 11.2084L10 17.6917L16.4833 11.2084L17.3667 10.3251C17.7925 9.89937 18.1303 9.39407 18.3608 8.83784C18.5913 8.2816 18.7099 7.68548 18.7099 7.08339C18.7099 6.4813 18.5913 5.88519 18.3608 5.32895C18.1303 4.77272 17.7925 4.26741 17.3667 3.84172Z"
        stroke="hsl(var(--primary-accent))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default HeartIcon;

