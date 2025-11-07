// components/UI/FormField.tsx
import React, { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  success?: string;
  info?: string;
  className?: string;
  fieldId?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  resize?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  success,
  info,
  required = false,
  placeholder,
  maxLength,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  fieldId
}) => {
  const id = fieldId || `field-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  const inputClasses = [
    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    hasError && 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
    hasSuccess && 'border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500',
    !hasError && !hasSuccess && 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            [
              hint && `${id}-hint`,
              error && `${id}-error`,
              success && `${id}-success`,
              info && `${id}-info`
            ].filter(Boolean).join(' ') || undefined
          }
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={hasError ? 'text-red-400' : hasSuccess ? 'text-green-400' : 'text-gray-400'}>
              {hasError ? <AlertCircle className="w-5 h-5" /> : 
               hasSuccess ? <CheckCircle2 className="w-5 h-5" /> : 
               rightIcon}
            </span>
          </div>
        )}
      </div>

      {/* Character count for maxLength */}
      {maxLength && (
        <div className="flex justify-between items-center mt-1">
          <div />
          <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Help text, errors, success messages */}
      <div className="mt-1 space-y-1">
        {hint && (
          <p id={`${id}-hint`} className="text-sm text-gray-600">
            {hint}
          </p>
        )}
        
        {info && (
          <div id={`${id}-info`} className="flex items-start space-x-2 text-sm text-blue-600">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}
        
        {error && (
          <div id={`${id}-error`} className="flex items-start space-x-2 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div id={`${id}-success`} className="flex items-start space-x-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  error,
  hint,
  success,
  info,
  required = false,
  placeholder,
  rows = 3,
  maxLength,
  disabled = false,
  resize = false,
  className = '',
  fieldId
}) => {
  const id = fieldId || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  const textareaClasses = [
    'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
    !resize && 'resize-none',
    hasError && 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
    hasSuccess && 'border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500',
    !hasError && !hasSuccess && 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={
          [
            hint && `${id}-hint`,
            error && `${id}-error`,
            success && `${id}-success`,
            info && `${id}-info`
          ].filter(Boolean).join(' ') || undefined
        }
      />

      {/* Character count */}
      {maxLength && (
        <div className="flex justify-between items-center mt-1">
          <div />
          <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Help text and messages */}
      <div className="mt-1 space-y-1">
        {hint && (
          <p id={`${id}-hint`} className="text-sm text-gray-600">
            {hint}
          </p>
        )}
        
        {info && (
          <div id={`${id}-info`} className="flex items-start space-x-2 text-sm text-blue-600">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}
        
        {error && (
          <div id={`${id}-error`} className="flex items-start space-x-2 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div id={`${id}-success`} className="flex items-start space-x-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  hint,
  success,
  info,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  fieldId
}) => {
  const id = fieldId || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);

  const selectClasses = [
    'block w-full px-3 py-2 pr-8 border rounded-lg shadow-sm bg-white',
    'focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
    hasError && 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500',
    hasSuccess && 'border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500',
    !hasError && !hasSuccess && 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={selectClasses}
        aria-invalid={hasError}
        aria-describedby={
          [
            hint && `${id}-hint`,
            error && `${id}-error`,
            success && `${id}-success`,
            info && `${id}-info`
          ].filter(Boolean).join(' ') || undefined
        }
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Help text and messages */}
      <div className="mt-1 space-y-1">
        {hint && (
          <p id={`${id}-hint`} className="text-sm text-gray-600">
            {hint}
          </p>
        )}
        
        {info && (
          <div id={`${id}-info`} className="flex items-start space-x-2 text-sm text-blue-600">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{info}</span>
          </div>
        )}
        
        {error && (
          <div id={`${id}-error`} className="flex items-start space-x-2 text-sm text-red-600" role="alert">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div id={`${id}-success`} className="flex items-start space-x-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Validation utilities
export const validators = {
  required: (value: string, message = 'This field is required') => {
    return value.trim() === '' ? message : undefined;
  },

  email: (value: string, message = 'Please enter a valid email address') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : undefined;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    return value.length < min ? (message || `Must be at least ${min} characters`) : undefined;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    return value.length > max ? (message || `Must be no more than ${max} characters`) : undefined;
  },

  url: (value: string, message = 'Please enter a valid URL') => {
    try {
      new URL(value);
      return undefined;
    } catch {
      return value ? message : undefined;
    }
  },

  number: (value: string, message = 'Please enter a valid number') => {
    return value && isNaN(Number(value)) ? message : undefined;
  },

  positiveNumber: (value: string, message = 'Please enter a positive number') => {
    const num = Number(value);
    return value && (isNaN(num) || num <= 0) ? message : undefined;
  }
};

// Form validation hook
export const useFormValidation = <T extends Record<string, string>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ((value: string) => string | undefined)[]>>
) => {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedFields] = React.useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (name: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const setTouched = (name: keyof T) => {
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  const validate = (field?: keyof T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const fieldsToValidate = field ? [field] : Object.keys(validationRules);

    for (const fieldName of fieldsToValidate) {
      const value = values[fieldName as keyof T];
      const rules = validationRules[fieldName as keyof T];
      
      if (rules) {
        for (const rule of rules) {
          const error = rule(value);
          if (error) {
            newErrors[fieldName as keyof T] = error;
            break;
          }
        }
      }
    }

    if (field) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    } else {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouchedFields({});
  };

  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    reset,
    isValid,
    hasErrors
  };
};