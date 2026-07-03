/**
 * Modal Components Collection
 * 
 * Responsive modal/dialog components for alerts, confirmations, and forms
 * Features:
 *  - Responsive sizing (mobile-first)
 *  - Backdrop blur and overlay
 *  - Keyboard accessibility (ESC to close)
 *  - Touch-friendly buttons
 *  - Smooth animations
 * 
 * Modal Types:
 *  - Modal: Base modal container
 *  - ConfirmationModal: Yes/No confirmation
 *  - FormModal: Modal with form content
 *  - AlertModal: Alert/notification modal
 */

import React, { useEffect } from 'react';

// Base Modal Component
export function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  closeOnBackdrop = true,
  className = '',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={() => closeOnBackdrop && onClose?.()}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} bg-white rounded-t-2xl md:rounded-2xl
          shadow-2xl max-h-[90vh] md:max-h-screen overflow-y-auto
          animate-slide-up md:animate-fade-in safe-bottom
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-200">
            <h2 className="text-lg md:text-2xl font-semibold text-neutral-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4 md:p-6">
          {children}
        </div>

        {/* Footer with Actions */}
        {actions && (
          <div className="border-t border-neutral-200 p-4 md:p-6 bg-neutral-50 flex flex-col-reverse sm:flex-row gap-3 md:gap-4">
            {Array.isArray(actions) ? (
              actions.map((action, index) => (
                <div key={index} className="flex-1 sm:flex-none">
                  {action}
                </div>
              ))
            ) : (
              <div className="flex-1 sm:flex-none">{actions}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirmation Modal
export function ConfirmationModal({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
  className = '',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      className={className}
      actions={
        <div className="flex gap-3 justify-end w-full">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 md:px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 sm:flex-none px-4 md:px-6 py-3 text-white rounded-lg transition-colors font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isDangerous ? 'bg-danger-500 hover:bg-danger-600' : 'bg-primary-500 hover:bg-primary-600'}
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      }
    >
      <p className="text-neutral-600 text-sm md:text-base">{message}</p>
    </Modal>
  );
}

// Alert Modal
export function AlertModal({
  isOpen = false,
  type = 'info', // 'info', 'success', 'warning', 'error'
  title = 'Alert',
  message = 'This is an important message',
  onClose,
  actionLabel = 'OK',
  className = '',
}) {
  const typeConfig = {
    success: {
      icon: 'bg-success-100',
      iconColor: 'text-success-600',
      button: 'bg-success-500 hover:bg-success-600',
    },
    error: {
      icon: 'bg-danger-100',
      iconColor: 'text-danger-600',
      button: 'bg-danger-500 hover:bg-danger-600',
    },
    warning: {
      icon: 'bg-warning-100',
      iconColor: 'text-warning-600',
      button: 'bg-warning-500 hover:bg-warning-600',
    },
    info: {
      icon: 'bg-info-100',
      iconColor: 'text-info-600',
      button: 'bg-info-500 hover:bg-info-600',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  const icons = {
    success: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0a9 9 0 100 0zm0 0a9 9 0 110 0zm0 0a9 9 0 110 0z" />
      </svg>
    ),
    info: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className={className}
      actions={
        <button
          onClick={onClose}
          className={`w-full px-4 md:px-6 py-3 ${config.button} text-white rounded-lg transition-colors font-medium`}
        >
          {actionLabel}
        </button>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full ${config.icon} flex items-center justify-center ${config.iconColor}`}>
          {icons[type]}
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        <p className="text-sm md:text-base text-neutral-600">
          {message}
        </p>
      </div>
    </Modal>
  );
}

// Form Modal
export function FormModal({
  isOpen = false,
  title = 'Form',
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onSubmit,
  onCancel,
  isLoading = false,
  size = 'md',
  className = '',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size={size}
      className={className}
      actions={
        <div className="flex gap-3 justify-end w-full">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 md:px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 md:px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {submitLabel}
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  );
}

// Sheet Modal (Bottom drawer style - mobile optimized)
export function SheetModal({
  isOpen = false,
  onClose,
  title,
  children,
  actions,
  height = 'auto', // 'auto', 'half', 'full'
  className = '',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'max-h-[50vh]',
    full: 'max-h-[100vh]',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl
        shadow-2xl overflow-y-auto animate-slide-up
        ${heightClasses[height]}
        ${className}
      `}>
        {/* Handle Bar */}
        <div className="flex justify-center py-3 sticky top-0 bg-white rounded-t-2xl">
          <div className="w-12 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-neutral-200 sticky top-10 bg-white">
            <h2 className="text-lg md:text-xl font-semibold text-neutral-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="border-t border-neutral-200 p-4 md:p-6 bg-neutral-50 sticky bottom-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
