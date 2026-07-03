/**
 * MainLayout Component
 * 
 * Primary responsive layout for authenticated users
 * Supports: mobile, tablet, desktop
 * Features:
 *  - Responsive top navbar
 *  - Collapsible sidebar (desktop only)
 *  - Mobile bottom navigation
 *  - Responsive content area
 *  - Touch-friendly controls
 * 
 * Mobile: Stacked layout with bottom nav
 * Tablet: Collapsible sidebar + content
 * Desktop: Full sidebar + content
 */

import React, { useState } from 'react';

export default function MainLayout({ children, showSidebar = false, sidebarContent = null, showTopNav = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-neutral-50">
      {/* ============================================
          RESPONSIVE SIDEBAR (Desktop/Tablet)
          ============================================ */}
      {showSidebar && (
        <>
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Container */}
          <aside
            className={`
              fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-6 border-b border-neutral-200">
              <h2 className="text-2xl font-bold text-green-700">Sushi Poly Clinic</h2>
              <button
                className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto py-4 md:py-6 safe-bottom">
              {sidebarContent || (
                <div className="px-4 md:px-6 space-y-2">
                  {/* Placeholder Navigation Items */}
                  <a href="/dashboard" className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 rounded-lg transition-colors">
                    Dashboard
                  </a>
                  <a href="/profile" className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 rounded-lg transition-colors">
                    Profile
                  </a>
                  <a href="/settings" className="block px-4 py-3 text-neutral-700 hover:bg-primary-50 rounded-lg transition-colors">
                    Settings
                  </a>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        {showTopNav && (
        <nav className="sticky top-0 z-30 bg-white border-b border-neutral-200 safe-top">
          <div className="h-16 md:h-20 px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            {showSidebar && (
              <button
                className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Left Side - Navigation Links */}
            <div className="flex-1 hidden md:flex items-center gap-6 ml-6">
              <a href="/" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">Home</a>
              <a href="/doctors" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">Find Doctors</a>
              <a href="/pharmacy" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">Pharmacy</a>
              <a href="/login" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors">Patient Portal</a>
            </div>
            
            {/* Mobile Title (visible only on small screens) */}
            <div className="flex-1 md:hidden">
              <h1 className="text-xl font-semibold text-green-700">
                Sushi Poly Clinic
              </h1>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications - Hidden on small mobile */}
              <button className="hidden sm:inline-flex p-2 hover:bg-neutral-100 rounded-lg transition-colors relative touch-target">
                <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
              </button>

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg transition-colors touch-target"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full" />
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-50">
                    <a href="/profile" className="block px-4 py-3 hover:bg-neutral-50 transition-colors text-sm">
                      Profile
                    </a>
                    <a href="/settings" className="block px-4 py-3 hover:bg-neutral-50 transition-colors text-sm">
                      Settings
                    </a>
                    <button className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors text-sm text-danger-600">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-lg mx-auto py-6 md:py-8 lg:py-10 px-4 md:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 safe-bottom">
          <div className="flex justify-around items-center h-16">
            <a href="/dashboard" className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-neutral-600 hover:text-primary-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
              </svg>
              <span>Home</span>
            </a>
            <a href="/appointments" className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-neutral-600 hover:text-primary-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Appointments</span>
            </a>
            <a href="/messages" className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-neutral-600 hover:text-primary-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Messages</span>
            </a>
            <a href="/profile" className="flex-1 flex flex-col items-center justify-center gap-1 text-xs text-neutral-600 hover:text-primary-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
