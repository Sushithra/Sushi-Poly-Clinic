/**
 * DoctorLayout Component
 * 
 * Responsive layout specifically designed for doctor users
 * Supports: mobile, tablet, desktop
 * Features:
 *  - Doctor-focused navigation (consultations, patients, availability)
 *  - Responsive sidebar with consultation controls
 *  - Mobile bottom navigation with quick actions
 *  - Consultation status indicator
 *  - Patient queue dashboard
 *  - Analytics and earnings overview
 * 
 * Responsive behavior:
 *  - Mobile: Bottom navigation + stacked consultations
 *  - Tablet: Sidebar + split-screen consultation
 *  - Desktop: Full sidebar + expandable consultation workspace
 */

import React, { useState } from 'react';
import MainLayout from './MainLayout';

export default function DoctorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const doctorSidebarContent = (
    <div className="px-4 md:px-6 space-y-1">
      {/* Dashboard Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Dashboard
        </p>
        <nav className="space-y-1">
          <a
            href="/doctor/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a
            href="/doctor/today"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Today's Schedule</span>
          </a>
        </nav>
      </div>

      {/* Consultations Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Consultations
        </p>
        <nav className="space-y-1">
          <a
            href="/doctor/consultations"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Active Consultations</span>
            <span className="absolute right-4 bg-danger-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              2
            </span>
          </a>
          <a
            href="/doctor/queue"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 6a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
            </svg>
            <span>Patient Queue</span>
          </a>
        </nav>
      </div>

      {/* Patients Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Patients
        </p>
        <nav className="space-y-1">
          <a
            href="/doctor/patients"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 6a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
            </svg>
            <span>My Patients</span>
          </a>
          <a
            href="/doctor/patient-history"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Patient History</span>
          </a>
        </nav>
      </div>

      {/* Availability Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Availability
        </p>
        <nav className="space-y-1">
          <a
            href="/doctor/availability"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Manage Availability</span>
          </a>
        </nav>
      </div>

      {/* Analytics Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Business
        </p>
        <nav className="space-y-1">
          <a
            href="/doctor/earnings"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Earnings</span>
          </a>
          <a
            href="/doctor/analytics"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Analytics</span>
          </a>
          <a
            href="/doctor/profile"
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
    <MainLayout showSidebar={true} sidebarContent={doctorSidebarContent}>
      {children}
    </MainLayout>
  );
}
