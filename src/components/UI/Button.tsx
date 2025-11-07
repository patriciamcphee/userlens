// components/UI/Button.tsx
import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  tooltip?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      tooltip,
      disabled,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-colors',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ];

    const variantClasses = {
      primary: [
        'bg-blue-600',
        'text-white',
        'border-transparent',
        'hover:bg-blue-700',
        'focus:ring-blue-500',
        'disabled:hover:bg-blue-600'
      ],
      secondary: [
        'bg-gray-100',
        'text-gray-900',
        'border-transparent',
        'hover:bg-gray-200',
        'focus:ring-gray-500',
        'disabled:hover:bg-gray-100'
      ],
      danger: [
        'bg-red-600',
        'text-white',
        'border-transparent',
        'hover:bg-red-700',
        'focus:ring-red-500',
        'disabled:hover:bg-red-600'
      ],
      ghost: [
        'bg-transparent',
        'text-gray-700',
        'border-transparent',
        'hover:bg-gray-100',
        'focus:ring-gray-500'
      ],
      outline: [
        'bg-transparent',
        'text-gray-700',
        'border',
        'border-gray-300',
        'hover:bg-gray-50',
        'focus:ring-blue-500'
      ]
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm', 'rounded'],
      md: ['px-4', 'py-2', 'text-sm', 'rounded-lg'],
      lg: ['px-6', 'py-3', 'text-base', 'rounded-lg']
    };

    const widthClasses = fullWidth ? ['w-full'] : [];

    const allClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      ...widthClasses,
      className
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || isLoading;

    const content = (
      <>
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2" aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2" aria-hidden="true">{rightIcon}</span>
        )}
      </>
    );

    const buttonElement = (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={allClasses}
        aria-busy={isLoading}
        {...props}
      >
        {content}
      </button>
    );

    if (tooltip && !isDisabled) {
      return (
        <div className="group relative">
          {buttonElement}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltip}
          </div>
        </div>
      );
    }

    return buttonElement;
  }
);

Button.displayName = 'Button';

// Specialized button variants for common use cases
export const SaveButton = ({ isLoading, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button 
    variant="primary" 
    isLoading={isLoading}
    {...props}
  >
    {isLoading ? 'Saving...' : 'Save'}
  </Button>
);

export const CancelButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props}>
    Cancel
  </Button>
);

export const DeleteButton = ({ isLoading, ...props }: Omit<ButtonProps, 'variant'>) => (
  <Button 
    variant="danger" 
    isLoading={isLoading}
    {...props}
  >
    {isLoading ? 'Deleting...' : 'Delete'}
  </Button>
);

export const LoadingButton = ({ 
  isLoading, 
  loadingText = 'Loading...',
  children, 
  ...props 
}: ButtonProps & { loadingText?: string }) => (
  <Button isLoading={isLoading} {...props}>
    {isLoading ? loadingText : children}
  </Button>
);