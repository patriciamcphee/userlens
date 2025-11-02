// components/Logo/InsightHubLogo.tsx
// Updated with Concept 6: Minimalist design and horizontal layout
import React from 'react';

interface InsightHubLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  layout?: 'horizontal' | 'vertical';  // NEW: Layout option
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function InsightHubLogo({ 
  variant = 'full',
  layout = 'horizontal',  // NEW: Default to horizontal
  size = 'md',
  className = '' 
}: InsightHubLogoProps) {
  
  const sizeMap = {
    sm: { height: 32, iconSize: 28, fontSize: 16, taglineSize: 9 },
    md: { height: 48, iconSize: 40, fontSize: 24, taglineSize: 11 },
    lg: { height: 64, iconSize: 54, fontSize: 32, taglineSize: 14 },
    xl: { height: 80, iconSize: 70, fontSize: 40, taglineSize: 16 }
  };

  const dimensions = sizeMap[size];

  // Icon component (Concept 6: Minimalist Hexagon)
  const Icon = ({ size }: { size: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 70 70" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      
      {/* Hexagon outline */}
      <path 
        d="M 35 7 L 56 18 L 56 42 L 35 53 L 14 42 L 14 18 Z" 
        fill="none" 
        stroke="url(#blueGradient)" 
        strokeWidth="3.5"
      />
      
      {/* Center node */}
      <circle cx="35" cy="30" r="8" fill="#3B82F6"/>
      
      {/* Corner nodes */}
      <circle cx="27" cy="23" r="3" fill="#60A5FA"/>
      <circle cx="43" cy="23" r="3" fill="#60A5FA"/>
      <circle cx="27" cy="37" r="3" fill="#60A5FA"/>
      <circle cx="43" cy="37" r="3" fill="#60A5FA"/>
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
          className="font-bold text-gray-900"
          style={{ fontSize: `${dimensions.fontSize}px` }}
        >
          InsightHub
        </span>
        <span 
          className="text-gray-600"
          style={{ fontSize: `${dimensions.taglineSize}px` }}
        >
          User Research & Testing Platform
        </span>
      </div>
    );
  }

  // Full logo with both icon and text
  if (layout === 'horizontal') {
    // Horizontal layout: Icon on left, text on right
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Icon size={dimensions.iconSize} />
        <div className="flex flex-col">
          <span 
            className="font-bold text-gray-900 leading-tight"
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            InsightHub
          </span>
          <span 
            className="text-gray-600"
            style={{ fontSize: `${dimensions.taglineSize}px` }}
          >
            User Research & Testing Platform
          </span>
        </div>
      </div>
    );
  } else {
    // Vertical layout: Icon on top, text below
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <Icon size={dimensions.iconSize} />
        <div className="flex flex-col items-center mt-3">
          <span 
            className="font-bold text-gray-900 leading-tight"
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            InsightHub
          </span>
          <span 
            className="text-gray-600"
            style={{ fontSize: `${dimensions.taglineSize}px` }}
          >
            User Research & Testing Platform
          </span>
        </div>
      </div>
    );
  }
}

// Export convenience components
export const LogoIcon = (props: Omit<InsightHubLogoProps, 'variant'>) => (
  <InsightHubLogo {...props} variant="icon" />
);

export const LogoWordmark = (props: Omit<InsightHubLogoProps, 'variant'>) => (
  <InsightHubLogo {...props} variant="wordmark" />
);

export const LogoHorizontal = (props: Omit<InsightHubLogoProps, 'variant' | 'layout'>) => (
  <InsightHubLogo {...props} variant="full" layout="horizontal" />
);

export const LogoVertical = (props: Omit<InsightHubLogoProps, 'variant' | 'layout'>) => (
  <InsightHubLogo {...props} variant="full" layout="vertical" />
);