import { ReactNode } from "react";

interface TextBubbleProps {
  children?: ReactNode;
  className?: string;
}

const TextBubble = ({ children, className = "" }: TextBubbleProps) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="226"
        height="157"
        viewBox="0 0 226 157"
        fill="none"
        className="w-full h-full"
      >
        <g filter="url(#filter0_d_105_20)">
          <circle cx="20.5" cy="109.5" r="7.5" fill="white" />
        </g>
        <g filter="url(#filter1_d_105_20)">
          <circle cx="41.5" cy="79.5" r="11.5" fill="white" />
        </g>
        <g filter="url(#filter2_d_105_20)">
          <circle cx="13" cy="140" r="4" fill="white" />
        </g>
        <g filter="url(#filter3_d_105_20)">
          <rect x="63" y="5" width="154" height="81" rx="39" fill="white" />
        </g>
        <defs>
          <filter
            id="filter0_d_105_20"
            x="4"
            y="97"
            width="33"
            height="33"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_105_20"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_105_20"
              result="shape"
            />
          </filter>
          <filter
            id="filter1_d_105_20"
            x="21"
            y="63"
            width="41"
            height="41"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_105_20"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_105_20"
              result="shape"
            />
          </filter>
          <filter
            id="filter2_d_105_20"
            x="0"
            y="131"
            width="26"
            height="26"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_105_20"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_105_20"
              result="shape"
            />
          </filter>
          <filter
            id="filter3_d_105_20"
            x="54"
            y="0"
            width="172"
            height="99"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="4.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_105_20"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_105_20"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
      {children && (
        <div className="absolute -top-8 left-24 bottom-8 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default TextBubble;

