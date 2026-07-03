/**
 * Form Input Components Collection
 * 
 * Responsive, accessible form components for medical consultation platform
 * Features:
 *  - Mobile-optimized input sizing (touch-friendly)
 *  - Responsive error/success states
 *  - Accessibility with labels and ARIA
 *  - Healthcare-specific validation hints
 *  - Responsive layout
 * 
 * Usage:
 * <InputField
 *   label="Email Address"
 *   type="email"
 *   placeholder="doctor@hospital.com"
 *   value={email}
 *   onChange={handleChange}
 *   error="Invalid email"
 * />
 */

import React, { useState } from 'react';

// Standard Text Input Field
export function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  hint,
  disabled = false,
  required = false,
  icon,
  fullWidth = true,
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base touch-target',
    lg: 'px-4 py-4 text-lg touch-target',
  };

  return (
    <div className={`w-full ${fullWidth ? '' : 'inline-block'}`}>
      {label && (
        <label className="block text-sm md:text-base font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full rounded-lg border-2 transition-all duration-200 text-neutral-900 bg-white
            ${icon ? 'pl-12 pr-4' : 'px-4'}
            ${sizeClasses[size]}
            ${
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                : success
                ? 'border-success-500 focus:border-success-500 focus:ring-success-500/20'
                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
            }
            disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500
            focus:outline-none focus:ring-2
            ${className}
          `}
          {...props}
        />

        {error && (
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}

        {success && (
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      {!error && hint && <p className="mt-2 text-xs md:text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}

// Password Input with Show/Hide Toggle
export function PasswordField({
  label,
  placeholder = 'Enter password',
  value,
  onChange,
  error,
  hint,
  required = false,
  size = 'md',
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base touch-target',
    lg: 'px-4 py-4 text-lg touch-target',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm md:text-base font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full pr-12 rounded-lg border-2 transition-all duration-200
            ${
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20'
            }
            ${sizeClasses[size]}
            focus:outline-none focus:ring-2
            ${className}
          `}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.158 13.026A3 3 0 106 13M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7C7.523 19 3.732 16.057 2.458 12z" />
            </svg>
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      {!error && hint && <p className="mt-2 text-xs md:text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}

// Textarea Field
export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  fullWidth = true,
  className = '',
  ...props
}) {
  const [charCount, setCharCount] = useState(value?.length || 0);

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    onChange(e);
  };

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label className="block text-sm md:text-base font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
          ${
            error
              ? 'border-danger-500 focus:border-danger-500'
              : 'border-neutral-300 focus:border-primary-500'
          }
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-primary-500/20
          resize-none
          ${className}
        `}
        {...props}
      />

      <div className="flex justify-between mt-2">
        {error && <p className="text-sm text-danger-600">{error}</p>}
        {!error && hint && <p className="text-xs md:text-sm text-neutral-500">{hint}</p>}
        {maxLength && (
          <p className="text-xs md:text-sm text-neutral-400">
            {charCount} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

// Dropdown/Select Field
export function SelectField({
  label,
  options = [],
  value,
  onChange,
  error,
  hint,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  fullWidth = true,
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base touch-target',
    lg: 'px-4 py-4 text-lg touch-target',
  };

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label className="block text-sm md:text-base font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full pr-10 rounded-lg border-2 appearance-none transition-all duration-200
            ${
              error
                ? 'border-danger-500 focus:border-danger-500'
                : 'border-neutral-300 focus:border-primary-500'
            }
            disabled:bg-neutral-100 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            ${sizeClasses[size]}
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      {!error && hint && <p className="mt-2 text-xs md:text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}

// Search Input Field
export function SearchField({
  placeholder = 'Search...',
  value,
  onChange,
  onSubmit,
  disabled = false,
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative w-full"
    >
      <svg
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full pl-12 pr-4 rounded-lg border-2 border-neutral-300
          transition-all duration-200 touch-target
          focus:border-primary-500 focus:outline-none focus:ring-2
          focus:ring-primary-500/20
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      />
    </form>
  );
}

// Checkbox Field
export function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
  required = false,
  hint,
  className = '',
  ...props
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-5 h-5 mt-1 text-primary-600 rounded focus-visible-ring cursor-pointer"
        {...props}
      />
      <div className="flex-1 pt-0.5">
        {label && (
          <label className="text-sm md:text-base font-medium text-neutral-700 cursor-pointer">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        {hint && <p className="text-xs md:text-sm text-neutral-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}

// Radio Group
export function RadioGroup({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm md:text-base font-medium text-neutral-700 mb-3">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-3">
            <input
              type="radio"
              id={`radio-${option.value}`}
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-4 h-4 text-primary-600 cursor-pointer focus-visible-ring"
              {...props}
            />
            <label htmlFor={`radio-${option.value}`} className="text-sm md:text-base text-neutral-700 cursor-pointer">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
