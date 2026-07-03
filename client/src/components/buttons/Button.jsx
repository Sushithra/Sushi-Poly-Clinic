/**
 * Button Components Collection
 * 
 * Responsive, touch-friendly button components for mobile-first design
 * All buttons are:
 *  - Accessible with proper ARIA labels
 *  - Touch-friendly (min 44px height on mobile)
 *  - Responsive sizing
 *  - Healthcare-themed colors
 *  - Support loading states
 * 
 * Usage:
 * <PrimaryButton onClick={handleClick}>Book Appointment</PrimaryButton>
 * <SecondaryButton size="lg">Read More</SecondaryButton>
 * <IconButton icon={<SearchIcon />} />
 */

import React from 'react';

// Primary Action Button
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 md:px-4 py-2 md:py-2 text-sm md:text-sm',
    md: 'px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base touch-target',
    lg: 'px-6 md:px-8 py-3 md:py-4 text-base md:text-lg touch-target',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        font-semibold rounded-lg transition-all duration-200
        bg-primary-500 text-white hover:bg-primary-600
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible-ring
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'loading-state' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Secondary Action Button
export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 md:px-4 py-2 md:py-2 text-sm md:text-sm',
    md: 'px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base touch-target',
    lg: 'px-6 md:px-8 py-3 md:py-4 text-base md:text-lg touch-target',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        font-semibold rounded-lg transition-all duration-200
        bg-neutral-100 text-neutral-900 hover:bg-neutral-200
        border border-neutral-300
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible-ring
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'loading-state' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Text/Link Button
export function TextButton({
  children,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-medium text-primary-600 hover:text-primary-700
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible-ring
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Danger/Destructive Button
export function DangerButton({
  children,
  onClick,
  disabled = false,
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 md:px-4 py-2 md:py-2 text-sm md:text-sm',
    md: 'px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base touch-target',
    lg: 'px-6 md:px-8 py-3 md:py-4 text-base md:text-lg touch-target',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-semibold rounded-lg transition-all duration-200
        bg-danger-500 text-white hover:bg-danger-600
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible-ring
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Icon Button - Touch friendly
export function IconButton({
  icon,
  onClick,
  disabled = false,
  size = 'md',
  variant = 'primary',
  label = '',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-12 h-12 md:w-14 md:h-14',
  };

  const variantClasses = {
    primary: 'text-primary-600 hover:bg-primary-50',
    secondary: 'text-neutral-600 hover:bg-neutral-100',
    danger: 'text-danger-600 hover:bg-danger-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        flex items-center justify-center rounded-lg transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible-ring
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

// Floating Action Button - Fixed position
export function FloatingActionButton({
  icon,
  onClick,
  label = '',
  position = 'bottom-right',
  className = '',
  ...props
}) {
  const positionClasses = {
    'bottom-right': 'bottom-6 md:bottom-8 right-6 md:right-8 safe-bottom safe-right',
    'bottom-left': 'bottom-6 md:bottom-8 left-6 md:left-8 safe-bottom safe-left',
    'bottom-center': 'bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 safe-bottom',
  };

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        fixed z-40 w-14 h-14 md:w-16 md:h-16 rounded-full
        bg-primary-500 text-white shadow-lg hover:shadow-xl
        flex items-center justify-center transition-all duration-200
        hover:bg-primary-600 focus-visible-ring
        ${positionClasses[position]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

// Button Group - Responsive
export function ButtonGroup({
  buttons = [],
  vertical = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        flex ${vertical ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 md:gap-3
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {buttons.map((button, index) => (
        <div
          key={index}
          className={fullWidth && !vertical ? 'flex-1' : ''}
        >
          {button}
        </div>
      ))}
    </div>
  );
}
