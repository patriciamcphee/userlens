import React from 'react';

interface UserLensLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  showTagline?: boolean;
  animated?: boolean;
}

export function UserLensLogo({ 
  variant = 'full',
  layout = 'horizontal',
  size = 'md',
  theme = 'light',
  className = '',
  showTagline = true,
  animated = false
}: UserLensLogoProps) {
  
  const sizeMap = {
    sm: { height: 32, iconSize: 28, fontSize: 16, taglineSize: 9 },
    md: { height: 48, iconSize: 40, fontSize: 24, taglineSize: 11 },
    lg: { height: 64, iconSize: 54, fontSize: 32, taglineSize: 14 },
    xl: { height: 80, iconSize: 70, fontSize: 40, taglineSize: 16 }
  };

  const dimensions = sizeMap[size];

  // Determine if we should use dark mode
  const isDark = theme === 'dark' || 
    (theme === 'auto' && 
     typeof window !== 'undefined' && 
     window.matchMedia && 
     window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Icon component with light/dark mode support - ACTUAL UserLens logo design
  const Icon = ({ size, animated = false }: { size: number; animated?: boolean }) => {
    const clipId = `clippath-${size}-${isDark ? 'dark' : 'light'}`;
    const gradientId = `linear-gradient-${size}-${isDark ? 'dark' : 'light'}`;
    
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 480 397.65" 
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        className={animated ? 'transition-all duration-300 hover:scale-105' : ''}
      >
        <defs>
          <style>{`
            .cls-1-${size} { clip-rule: evenodd; fill: none; }
            .cls-2-${size} { fill: url(#${gradientId}); }
            .cls-3-${size} { clip-path: url(#${clipId}); }
          `}</style>
          <clipPath id={clipId}>
            <path 
              className={`cls-1-${size}`}
              d="M95.83,198.82H0c0,109.81,89.02,198.82,198.82,198.82,53.49,0,103.36-21.01,141.13-58.77l140.05-140.05L339.42,58.23C303.44,22.26,253.73,0,198.82,0v95.83c-56.88,0-102.99,46.11-102.99,102.99M40.39,108.15c18.71,18.71,49.05,18.71,67.76,0,18.71-18.71,18.71-49.06,0-67.77-18.72-18.71-49.06-18.71-67.77,0-18.71,18.71-18.71,49.06,0,67.77ZM271.65,271.65c-18.64,18.63-44.39,30.16-72.83,30.16-56.88,0-102.99-46.11-102.99-102.99h102.99v-102.99c28.44,0,54.19,11.53,72.83,30.16l72.82,72.83-72.82,72.83Z"
            />
          </clipPath>
          <linearGradient 
            id={gradientId}
            x1="240" 
            y1="429.3" 
            x2="240" 
            y2="0" 
            gradientUnits="userSpaceOnUse"
          >
            {isDark ? (
              <>
                <stop offset="0" stopColor="#e5e7eb"/>
                <stop offset="1" stopColor="#ffffff"/>
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#2924fc"/>
                <stop offset="1" stopColor="#785ff9"/>
              </>
            )}
          </linearGradient>
        </defs>
        <g>
          <g className={`cls-3-${size}`}>
            <rect className={`cls-2-${size}`} width="480" height="397.65"/>
          </g>
        </g>
      </svg>
    );
  };

  // Text color classes based on theme
  const textColorClasses = isDark 
    ? 'text-white' 
    : 'text-gray-900';
  
  const taglineColorClasses = isDark 
    ? 'text-gray-300' 
    : 'text-gray-600';

  if (variant === 'icon') {
    return (
      <div className={className}>
        <Icon size={dimensions.iconSize} animated={animated} />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span 
          className={`font-bold ${textColorClasses} ${animated ? 'transition-colors duration-300' : ''}`}
          style={{ fontSize: `${dimensions.fontSize}px` }}
        >
          UserLens
        </span>
        {showTagline && (
          <span 
            className={`${taglineColorClasses} ${animated ? 'transition-colors duration-300' : ''}`}
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
        <Icon size={dimensions.iconSize} animated={animated} />
        <div className="flex flex-col">
          <span 
            className={`font-bold ${textColorClasses} leading-tight ${animated ? 'transition-colors duration-300' : ''}`}
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            UserLens
          </span>
          {showTagline && (
            <span 
              className={`${taglineColorClasses} leading-tight ${animated ? 'transition-colors duration-300' : ''}`}
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
        <Icon size={dimensions.iconSize} animated={animated} />
        <div className="flex flex-col items-center mt-3">
          <span 
            className={`font-bold ${textColorClasses} leading-tight ${animated ? 'transition-colors duration-300' : ''}`}
            style={{ fontSize: `${dimensions.fontSize}px` }}
          >
            UserLens
          </span>
          {showTagline && (
            <span 
              className={`${taglineColorClasses} text-center leading-tight ${animated ? 'transition-colors duration-300' : ''}`}
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

// Theme-specific convenience components
export const LogoLight = (props: Omit<UserLensLogoProps, 'theme'>) => (
  <UserLensLogo {...props} theme="light" />
);

export const LogoDark = (props: Omit<UserLensLogoProps, 'theme'>) => (
  <UserLensLogo {...props} theme="dark" />
);

// Hook for theme detection
export const useTheme = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return { isDark };
};