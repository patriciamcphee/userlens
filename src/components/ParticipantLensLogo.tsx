import React from 'react';

interface ParticipantLensLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export function ParticipantLensLogo({ 
  variant = 'full',
  layout = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true
}: ParticipantLensLogoProps) {
  
  const sizeMap = {
    sm: { height: 32, iconSize: 28, fontSize: 16, taglineSize: 9 },
    md: { height: 48, iconSize: 40, fontSize: 24, taglineSize: 11 },
    lg: { height: 64, iconSize: 54, fontSize: 32, taglineSize: 14 },
    xl: { height: 80, iconSize: 70, fontSize: 40, taglineSize: 16 }
  };

  const dimensions = sizeMap[size];

  // Icon component - Using exact SVG from logo-concept.svg
  const Icon = ({ size }: { size: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 480 397.65" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={`clippath-${size}`}>
          <path 
            clipRule="evenodd" 
            fill="none" 
            d="M95.83,198.82H0c0,109.81,89.02,198.82,198.82,198.82,53.49,0,103.36-21.01,141.13-58.77l140.05-140.05L339.42,58.23C303.44,22.26,253.73,0,198.82,0v95.83c-56.88,0-102.99,46.11-102.99,102.99M40.39,108.15c18.71,18.71,49.05,18.71,67.76,0,18.71-18.71,18.71-49.06,0-67.77-18.72-18.71-49.06-18.71-67.77,0-18.71,18.71-18.71,49.06,0,67.77ZM271.65,271.65c-18.64,18.63-44.39,30.16-72.83,30.16-56.88,0-102.99-46.11-102.99-102.99h102.99v-102.99c28.44,0,54.19,11.53,72.83,30.16l72.82,72.83-72.82,72.83Z"
          />
        </clipPath>
        <linearGradient 
          id={`linear-gradient-${size}`} 
          x1="240" 
          y1="429.3" 
          x2="240" 
          y2="0" 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2924fc"/>
          <stop offset="1" stopColor="#785ff9"/>
        </linearGradient>
      </defs>
      <g clipPath={`url(#clippath-${size})`}>
        <rect fill={`url(#linear-gradient-${size})`} width="480" height="397.65"/>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={className}>
        <Icon size={dimensions.iconSize} />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span 
          className="font-bold text-gray-600"
          style={{ fontSize: `${dimensions.fontSize}px` }}
        >
          User-Lens.io
        </span>
        {showTagline && (
          <span 
            className="text-gray-600"
            style={{ fontSize: `${dimensions.taglineSize}px` }}
          >
            Looking through the user's perspective
          </span>
        )}
      </div>
    );
  }

  // Full logo with both icon and text
  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Icon size={dimensions.iconSize} />
        <div className="flex flex-col">
          <span 
            className="font-bold text-gray-600 leading-tight"
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            User-Lens.io
          </span>
          {showTagline && (
            <span 
              className="text-gray-600 leading-tight"
              style={{ fontSize: `${dimensions.taglineSize}px` }}
            >
              Looking through the user's perspective
            </span>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <Icon size={dimensions.iconSize} />
        <div className="flex flex-col items-center mt-3">
          <span 
            className="font-bold text-gray-600 leading-tight"
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            User-Lens.io
          </span>
          {showTagline && (
            <span 
              className="text-gray-600 text-center leading-tight"
              style={{ fontSize: `${dimensions.taglineSize}px` }}
            >
              Looking through the user's perspective
            </span>
          )}
        </div>
      </div>
    );
  }
}

// Export convenience components
export const LogoIcon = (props: Omit<ParticipantLensLogoProps, 'variant'>) => (
  <ParticipantLensLogo {...props} variant="icon" />
);

export const LogoWordmark = (props: Omit<ParticipantLensLogoProps, 'variant'>) => (
  <ParticipantLensLogo {...props} variant="wordmark" />
);

export const LogoHorizontal = (props: Omit<ParticipantLensLogoProps, 'variant' | 'layout'>) => (
  <ParticipantLensLogo {...props} variant="full" layout="horizontal" />
);

export const LogoVertical = (props: Omit<ParticipantLensLogoProps, 'variant' | 'layout'>) => (
  <ParticipantLensLogo {...props} variant="full" layout="vertical" />
);
