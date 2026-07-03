/**
 * PublicLayout Component
 * 
 * Responsive layout for unauthenticated public pages
 * Supports: mobile, tablet, desktop
 * Features:
 *  - Mobile-first responsive navbar
 *  - Responsive hero sections
 *  - Footer with multiple columns on desktop
 *  - Touch-friendly navigation
 */

import React, { useState } from 'react';

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* ============================================
          RESPONSIVE NAVBAR
          ============================================ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 safe-top">
        <div className="container-md mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Responsive sizing */}
            <div className="flex-shrink-0">
              <div className="text-2xl md:text-3xl font-bold text-primary-500">
                eCLINIC
              </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/" className="text-neutral-600 hover:text-primary-500 transition-colors">
                Home
              </a>
              <a href="/services" className="text-neutral-600 hover:text-primary-500 transition-colors">
                Services
              </a>
              <a href="/doctors" className="text-neutral-600 hover:text-primary-500 transition-colors">
                Doctors
              </a>
              <a href="/about" className="text-neutral-600 hover:text-primary-500 transition-colors">
                About
              </a>
            </div>

            {/* CTA Buttons - Responsive */}
            <div className="flex items-center gap-2 md:gap-4">
              <button className="hidden sm:inline-block px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-primary-500 hover:text-primary-600 transition-colors">
                Sign In
              </button>
              <button className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors touch-target">
                Get Started
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-neutral-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Show on mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-200 py-4 animate-slide-down">
              <div className="flex flex-col gap-3 px-4">
                <a href="/" className="px-3 py-2 text-neutral-600 hover:text-primary-500 transition-colors">
                  Home
                </a>
                <a href="/services" className="px-3 py-2 text-neutral-600 hover:text-primary-500 transition-colors">
                  Services
                </a>
                <a href="/doctors" className="px-3 py-2 text-neutral-600 hover:text-primary-500 transition-colors">
                  Doctors
                </a>
                <a href="/about" className="px-3 py-2 text-neutral-600 hover:text-primary-500 transition-colors">
                  About
                </a>
                <button className="w-full mt-2 px-4 py-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <main className="flex-1 section-mobile">
        <div className="container-md mx-auto">
          {children}
        </div>
      </main>

      {/* ============================================
          RESPONSIVE FOOTER
          ============================================ */}
      <footer className="bg-neutral-900 text-neutral-50 mt-12 md:mt-16 lg:mt-20 safe-bottom">
        {/* Footer Content */}
        <div className="container-md mx-auto py-8 md:py-12 lg:py-16">
          <div className="grid grid-1col sm:grid-2col md:grid-4col gap-8 mb-8">
            {/* About Section */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">About eCLINIC</h4>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Healthcare reimagined for the digital age. Connect with doctors online, anytime, anywhere.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-neutral-300 hover:text-primary-400 transition-colors">Home</a></li>
                <li><a href="/services" className="text-neutral-300 hover:text-primary-400 transition-colors">Services</a></li>
                <li><a href="/pricing" className="text-neutral-300 hover:text-primary-400 transition-colors">Pricing</a></li>
                <li><a href="/blog" className="text-neutral-300 hover:text-primary-400 transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-neutral-300 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-neutral-300 hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="/cookies" className="text-neutral-300 hover:text-primary-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-neutral-300">support@eclinic.com</li>
                <li className="text-neutral-300">+1 (800) CLINIC-1</li>
                <li className="text-neutral-300">24/7 Customer Support</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} eCLINIC. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
