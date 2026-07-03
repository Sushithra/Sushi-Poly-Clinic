/**
 * AuthLayout Component
 * 
 * Responsive layout for authentication pages (login, signup, password reset)
 * Supports: mobile, tablet, desktop
 * Features:
 *  - Centered form layout on mobile
 *  - Side-by-side design on desktop (form + image)
 *  - Touch-friendly form inputs
 *  - Brand header
 *  - Responsive spacing
 */

import React from 'react';

export default function AuthLayout({ children, title, description, image }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* ============================================
          HEADER WITH LOGO
          ============================================ */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-8">
        <div className="container-md mx-auto">
          <a href="/" className="text-2xl md:text-3xl font-bold text-primary-500">
            eCLINIC
          </a>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg md:max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            
            {/* Left Side - Form Container on mobile, stays on top */}
            <div className="w-full md:w-1/2 order-2 md:order-1">
              {/* Form Header */}
              {title && (
                <div className="mb-8 md:mb-12">
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2 md:mb-3">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-base md:text-lg text-neutral-500 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Form Content */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-6 md:p-8 lg:p-10">
                {children}
              </div>

              {/* Footer Links */}
              <div className="mt-6 text-center text-sm text-neutral-600">
                {/* Placeholder for additional links */}
              </div>
            </div>

            {/* Right Side - Image/Illustration on desktop */}
            {image && (
              <div className="w-full md:w-1/2 order-1 md:order-2 hidden md:flex items-center justify-center">
                <div className="w-full h-96 md:h-full rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
                  {image}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          FOOTER - Mobile Bottom Navigation
          ============================================ */}
      <div className="fixed bottom-0 left-0 right-0 md:static bg-white border-t border-neutral-200 md:border-t-0 md:mt-12 md:py-8">
        <div className="container-md mx-auto px-4 py-3 md:py-0 text-center text-xs md:text-sm text-neutral-500">
          <p>
            Protected by SSL encryption. Your data is safe and secure.
          </p>
        </div>
      </div>

      {/* Safe area for mobile notches */}
      <div className="safe-bottom md:hidden" />
    </div>
  );
}
