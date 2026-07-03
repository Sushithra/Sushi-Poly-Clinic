/**
 * Navigation Components Collection
 * 
 * Responsive navigation components for mobile-first design
 * Features:
 *  - Mobile-optimized sizing
 *  - Responsive transitions
 *  - Touch-friendly interactions
 *  - Accessibility support
 * 
 * Component Types:
 *  - Breadcrumbs: Navigation path
 *  - Tabs: Tabbed navigation
 *  - MobileMenu: Mobile navigation menu
 *  - Pagination: Page navigation
 *  - Stepper: Step indicator (for multi-step forms)
 */

import React, { useState } from 'react';

// Breadcrumbs Component
export function Breadcrumbs({
  items = [],
  onNavigate,
  className = '',
}) {
  return (
    <nav className={`text-sm md:text-base breadcrumb-nav ${className}`}>
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-neutral-400 mx-1 md:mx-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
            <li>
              {item.href ? (
                <a
                  href={item.href}
                  onClick={() => onNavigate?.(item.href)}
                  className={`
                    hover:text-primary-600 transition-colors
                    ${index === items.length - 1 ? 'text-neutral-500 cursor-default' : 'text-primary-600'}
                  `}
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-neutral-500">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

// Tabs Component
export function Tabs({
  tabs = [],
  activeTab = 0,
  onChange,
  variant = 'line', // 'line', 'pills', 'underline'
  responsive = true,
  className = '',
}) {
  const variantClasses = {
    line: 'border-b border-neutral-200',
    pills: 'bg-neutral-100 rounded-lg p-1',
    underline: '',
  };

  const getTabClasses = (isActive) => {
    if (variant === 'pills') {
      return `
        px-4 md:px-6 py-2 md:py-3 rounded-md text-sm md:text-base font-medium
        transition-all duration-200
        ${isActive ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:text-neutral-900'}
      `;
    }

    if (variant === 'underline') {
      return `
        px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium
        border-b-2 transition-colors duration-200
        ${isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-600 hover:text-neutral-900'}
      `;
    }

    // line variant (default)
    return `
      px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium
      border-b-2 transition-colors duration-200
      ${isActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-600 hover:text-neutral-900'}
    `;
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className={responsive ? 'overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0' : ''}>
        <div className="flex gap-1 md:gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => onChange?.(index)}
              className={getTabClasses(activeTab === index)}
              role="tab"
              aria-selected={activeTab === index}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tabs[activeTab]?.content && (
        <div className="mt-4 md:mt-6 animate-fade-in">
          {tabs[activeTab].content}
        </div>
      )}
    </div>
  );
}

// Pagination Component
export function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisible = 5,
  className = '',
}) {
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, currentPage + halfVisible);

    if (start === 1) {
      end = Math.min(totalPages, maxVisible);
    }
    if (end === totalPages) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className={`flex items-center justify-center gap-1 md:gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 md:px-3 py-2 border border-neutral-300 rounded-lg text-sm md:text-base hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange?.(1)}
            className="px-3 md:px-4 py-2 border border-neutral-300 rounded-lg text-sm md:text-base hover:bg-neutral-50 transition-colors"
          >
            1
          </button>
          {pages[0] > 2 && <span className="text-neutral-500">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange?.(page)}
          className={`
            px-3 md:px-4 py-2 rounded-lg text-sm md:text-base transition-colors
            ${
              currentPage === page
                ? 'bg-primary-500 text-white'
                : 'border border-neutral-300 hover:bg-neutral-50'
            }
          `}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-neutral-500">...</span>
          )}
          <button
            onClick={() => onPageChange?.(totalPages)}
            className="px-3 md:px-4 py-2 border border-neutral-300 rounded-lg text-sm md:text-base hover:bg-neutral-50 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 md:px-3 py-2 border border-neutral-300 rounded-lg text-sm md:text-base hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

// Stepper Component (for multi-step forms/wizards)
export function Stepper({
  steps = [],
  currentStep = 0,
  onStepClick,
  completed = false,
  className = '',
}) {
  return (
    <div className={`flex items-center justify-between gap-2 md:gap-4 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div className="flex flex-col items-center flex-1 md:flex-none">
            <button
              onClick={() => onStepClick?.(index)}
              className={`
                w-10 h-10 md:w-12 md:h-12 rounded-full font-semibold text-sm md:text-base
                flex items-center justify-center transition-all duration-200
                ${
                  index < currentStep || (index === currentStep && completed)
                    ? 'bg-success-500 text-white'
                    : index === currentStep
                    ? 'bg-primary-500 text-white ring-4 ring-primary-200'
                    : 'bg-neutral-200 text-neutral-600'
                }
              `}
              aria-current={index === currentStep}
            >
              {index < currentStep || (index === currentStep && completed) ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </button>

            {/* Step Label */}
            <p className="text-xs md:text-sm font-medium text-neutral-700 mt-2 text-center">
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-neutral-500 text-center mt-1 hidden md:block">
                {step.description}
              </p>
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-1 md:mx-2">
              <div
                className={`
                  h-full transition-all duration-200
                  ${index < currentStep ? 'bg-success-500' : 'bg-neutral-200'}
                `}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Dropdown Menu Component
export function DropdownMenu({
  trigger,
  items = [],
  position = 'bottom-right', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    'bottom-right': 'origin-top-right right-0 top-full mt-2',
    'bottom-left': 'origin-top-left left-0 top-full mt-2',
    'top-right': 'origin-bottom-right right-0 bottom-full mb-2',
    'top-left': 'origin-bottom-left left-0 bottom-full mb-2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 min-w-max bg-white rounded-lg shadow-lg border border-neutral-200
            overflow-hidden animate-slide-down
            ${positionClasses[position]}
          `}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 md:px-6 py-2 md:py-3 text-sm md:text-base
                hover:bg-neutral-50 transition-colors
                ${item.divider ? 'border-b border-neutral-200' : ''}
                ${item.isDanger ? 'text-danger-600' : 'text-neutral-700'}
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
