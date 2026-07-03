/**
 * Feedback Components Collection
 * 
 * Components for displaying UI states and feedback messages
 * Features:
 *  - Responsive sizing
 *  - Animated transitions
 *  - Accessibility support
 *  - Healthcare-appropriate messaging
 * 
 * Component Types:
 *  - Loader: Loading states with animations
 *  - EmptyState: No data/results available
 *  - ErrorState: Error situations
 *  - SuccessBanner: Success messages
 *  - WarningBanner: Warning/caution messages
 *  - AlertBanner: General alerts
 */

import React from 'react';

// Loader Component
export function Loader({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="w-full h-full border-3 border-primary-200 rounded-full animate-spin border-t-primary-500"></div>
      </div>
      {message && <p className="text-neutral-600 text-sm md:text-base">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Empty State Component
export function EmptyState({
  icon,
  title = 'No data',
  message = 'There is no data to display',
  action,
  actionLabel = 'Get Started',
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-8 ${className}`}>
      {icon ? (
        <div className="mb-6">{icon}</div>
      ) : (
        <div className="w-16 h-16 md:w-20 md:h-20 mb-6 bg-neutral-200 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}

      <h3 className="text-lg md:text-2xl font-semibold text-neutral-900 text-center mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-neutral-600 text-center mb-6 max-w-md">
        {message}
      </p>

      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm md:text-base"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Error State Component
export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while processing your request',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-8 ${className}`}>
      <div className="w-16 h-16 md:w-20 md:h-20 mb-6 bg-danger-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0a9 9 0 100 0zm0 0a9 9 0 110 0zm0 0a9 9 0 110 0z" />
        </svg>
      </div>

      <h3 className="text-lg md:text-2xl font-semibold text-neutral-900 text-center mb-2">
        {title}
      </h3>
      <p className="text-sm md:text-base text-neutral-600 text-center mb-6 max-w-md">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm md:text-base"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Banner Components Base
function Banner({
  type = 'info',
  title,
  message,
  onClose,
  action,
  actionLabel = 'Action',
  dismissible = true,
  className = '',
}) {
  const typeConfig = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      icon: 'text-success-600',
      title: 'text-success-900',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      icon: 'text-warning-600',
      title: 'text-warning-900',
    },
    danger: {
      bg: 'bg-danger-50',
      border: 'border-danger-200',
      icon: 'text-danger-600',
      title: 'text-danger-900',
    },
    info: {
      bg: 'bg-info-50',
      border: 'border-info-200',
      icon: 'text-info-600',
      title: 'text-info-900',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 md:p-6 mb-4 animate-slide-down ${className}`}
    >
      <div className="flex gap-3 md:gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 mt-0.5 ${config.icon}`}>
          {type === 'success' && (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'warning' && (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0a9 9 0 100 0zm0 0a9 9 0 110 0zm0 0a9 9 0 110 0z" />
            </svg>
          )}
          {type === 'danger' && (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'info' && (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm md:text-base font-semibold ${config.title} mb-1`}>
              {title}
            </h3>
          )}
          {message && <p className="text-xs md:text-sm text-neutral-700">{message}</p>}

          {action && (
            <button
              onClick={action}
              className="mt-3 text-xs md:text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>

        {/* Close Button */}
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/50 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Success Banner
export function SuccessBanner(props) {
  return <Banner type="success" {...props} />;
}

// Warning Banner
export function WarningBanner(props) {
  return <Banner type="warning" {...props} />;
}

// Danger/Error Banner
export function DangerBanner(props) {
  return <Banner type="danger" {...props} />;
}

// Info Banner
export function InfoBanner(props) {
  return <Banner type="info" {...props} />;
}

// Progress Bar
export function ProgressBar({
  progress = 0,
  showLabel = true,
  size = 'md',
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="bg-primary-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-2 text-sm text-neutral-600 text-right">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
}

// Skeleton Loader (Placeholder)
export function SkeletonLoader({
  count = 3,
  type = 'card', // 'card', 'text', 'circle'
  className = '',
}) {
  const skeletons = Array(count).fill(null);

  if (type === 'circle') {
    return (
      <div className={`flex gap-4 ${className}`}>
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 bg-neutral-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="h-4 bg-neutral-200 rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    );
  }

  // card type (default)
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${className}`}>
      {skeletons.map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="h-4 bg-neutral-200 rounded mb-4 w-3/4 animate-pulse" />
          <div className="h-3 bg-neutral-200 rounded mb-3 animate-pulse" />
          <div className="h-3 bg-neutral-200 rounded w-5/6 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Tooltip Component
export function Tooltip({
  text,
  children,
  position = 'top',
  className = '',
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 bg-neutral-900 text-white text-xs rounded
            whitespace-nowrap pointer-events-none animate-fade-in
            ${positionClasses[position]}
          `}
        >
          {text}
          <div className={`
            absolute w-2 h-2 bg-neutral-900
            ${position === 'top' && 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45'}
            ${position === 'bottom' && 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45'}
            ${position === 'left' && 'right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 rotate-45'}
            ${position === 'right' && 'left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45'}
          `} />
        </div>
      )}
    </div>
  );
}
