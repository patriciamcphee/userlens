import React from 'react';

interface UserLensLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export function UserLensLogo({ 
  variant = 'full',
  layout = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true
}: UserLensLogoProps) {
  
  const sizeMap = {
    sm: { height: 32, iconSize: 28, fontSize: 16, taglineSize: 9 },
    md: { height: 48, iconSize: 40, fontSize: 24, taglineSize: 11 },
    lg: { height: 64, iconSize: 54, fontSize: 32, taglineSize: 14 },
    xl: { height: 80, iconSize: 70, fontSize: 40, taglineSize: 16 }
  };

  const dimensions = sizeMap[size];

  // Icon component - Focus Target (Concept 2)
  const Icon = ({ size }: { size: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main gradient - cyan to indigo for technical/research feel */}
        <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        
        {/* User gradient matching the lens */}
        <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      
      {/* Concentric circles - targeting reticle effect */}
      <circle 
        cx="40" 
        cy="40" 
        r="34" 
        fill="none" 
        stroke="url(#lensGradient)" 
        strokeWidth="2"
        opacity="0.3"
      />
      
      <circle 
        cx="40" 
        cy="40" 
        r="28" 
        fill="none" 
        stroke="url(#lensGradient)" 
        strokeWidth="2.5"
        opacity="0.5"
      />
      
      <circle 
        cx="40" 
        cy="40" 
        r="22" 
        fill="none" 
        stroke="url(#lensGradient)" 
        strokeWidth="3"
      />
      
      {/* Crosshair lines extending from center */}
      <line 
        x1="40" 
        y1="12" 
        x2="40" 
        y2="22" 
        stroke="url(#lensGradient)" 
        strokeWidth="2.5"
      />
      
      <line 
        x1="40" 
        y1="58" 
        x2="40" 
        y2="68" 
        stroke="url(#lensGradient)" 
        strokeWidth="2.5"
      />
      
      <line 
        x1="12" 
        y1="40" 
        x2="22" 
        y2="40" 
        stroke="url(#lensGradient)" 
        strokeWidth="2.5"
      />
      
      <line 
        x1="58" 
        y1="40" 
        x2="68" 
        y2="40" 
        stroke="url(#lensGradient)" 
        strokeWidth="2.5"
      />
      
      {/* User silhouette in the center - Head */}
      <circle 
        cx="40" 
        cy="37" 
        r="6" 
        fill="url(#userGradient)"
      />
      
      {/* User silhouette - Body */}
      <path 
        d="M 30 50 Q 30 45 40 45 Q 50 45 50 50 L 50 52 Q 50 54 48 54 L 32 54 Q 30 54 30 52 Z" 
        fill="url(#userGradient)"
      />
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
          UserLens
        </span>
        {showTagline && (
          <span 
            className="text-gray-600"
            style={{ fontSize: `${dimensions.taglineSize}px` }}
          >
            User Research & Testing Platform
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
            className="font-bold text-gray-900 leading-tight"
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            UserLens
          </span>
          {showTagline && (
            <span 
              className="text-gray-600 leading-tight"
              style={{ fontSize: `${dimensions.taglineSize}px` }}
            >
              User Research & Testing Platform
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
            className="font-bold text-gray-900 leading-tight"
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            UserLens
          </span>
          {showTagline && (
            <span 
              className="text-gray-600 text-center leading-tight"
              style={{ fontSize: `${dimensions.taglineSize}px` }}
            >
              User Research & Testing Platform
            </span>
          )}
        </div>
      </div>
    );
  }
}

// Export convenience components
export const LogoIcon = (props: Omit<UserLensLogoProps, 'variant'>) => (
  <UserLensLogo {...props} variant="icon" />
);

export const LogoWordmark = (props: Omit<UserLensLogoProps, 'variant'>) => (
  <UserLensLogo {...props} variant="wordmark" />
);

export const LogoHorizontal = (props: Omit<UserLensLogoProps, 'variant' | 'layout'>) => (
  <UserLensLogo {...props} variant="full" layout="horizontal" />
);

export const LogoVertical = (props: Omit<UserLensLogoProps, 'variant' | 'layout'>) => (
  <UserLensLogo {...props} variant="full" layout="vertical" />
);