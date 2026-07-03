/**
 * PatientLayout Component
 * 
 * Responsive layout specifically designed for patient users
 * Supports: mobile, tablet, desktop
 * Features:
 *  - Patient-focused navigation (appointments, prescriptions, medical history)
 *  - Responsive sidebar with collapsible sections
 *  - Mobile bottom navigation with patient actions
 *  - Health status indicator
 *  - Quick appointment booking
 *  - Prescriptions quick access
 * 
 * Responsive behavior:
 *  - Mobile: Bottom navigation + collapsed sidebar
 *  - Tablet: Collapsible sidebar + content
 *  - Desktop: Full sidebar + expandable content
 */

import React, { useState } from 'react';
import MainLayout from './MainLayout';

export default function PatientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const patientSidebarContent = (
    <div className="px-4 md:px-6 space-y-1">
      {/* Dashboard Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Dashboard
        </p>
        <nav className="space-y-1">
          <a
            href="/patient/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a
            href="/patient/health-overview"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Health Overview</span>
          </a>
        </nav>
      </div>

      {/* Appointments Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Appointments
        </p>
        <nav className="space-y-1">
          <a
            href="/patient/appointments"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>My Appointments</span>
          </a>
          <a
            href="/patient/book-appointment"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Book Appointment</span>
          </a>
        </nav>
      </div>

      {/* Health Records Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Health Records
        </p>
        <nav className="space-y-1">
          <a
            href="/patient/medical-history"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Medical History</span>
          </a>
          <a
            href="/patient/prescriptions"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.452a6 6 0 00-3.462.553.75.75 0 01-.817-.056.75.75 0 01-.917.822c.021.009.042.018.063.027A8.973 8.973 0 0013.5 4.5c-1.065 0-2.089.201-3.065.557a.75.75 0 00-.504.928.75.75 0 00.896.456c.913-.343 1.9-.531 2.922-.531.822 0 1.605.18 2.31.522a30.97 30.97 0 018.802 6.06.75.75 0 001.25-.784A32.471 32.471 0 0019.428 15.428z" />
            </svg>
            <span>Prescriptions</span>
          </a>
          <a
            href="/patient/medical-reports"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Medical Reports</span>
          </a>
        </nav>
      </div>

      {/* Other Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          More
        </p>
        <nav className="space-y-1">
          <a
            href="/patient/pharmacy"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m0 0L4 7m16 0v10l-8 4m0 0v10l-8-4v-10" />
            </svg>
            <span>Pharmacy</span>
          </a>
          <a
            href="/patient/profile"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </a>
        </nav>
      </div>
    </div>
  );

  return (
    <MainLayout showSidebar={true} sidebarContent={patientSidebarContent}>
      {children}
    </MainLayout>
  );
}
