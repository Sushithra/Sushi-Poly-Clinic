/**
 * AdminLayout Component
 * 
 * Responsive layout specifically designed for admin users
 * Supports: mobile, tablet, desktop
 * Features:
 *  - Admin-focused navigation (analytics, management, verification)
 *  - Responsive sidebar with collapsible admin sections
 *  - System statistics overview
 *  - Management dashboards
 *  - Verification panels
 *  - Analytics and reporting tools
 * 
 * Responsive behavior:
 *  - Mobile: Stacked analytics cards + collapsible menu
 *  - Tablet: Sidebar + responsive data tables
 *  - Desktop: Full sidebar + expandable analytics workspace
 */

import React, { useState } from 'react';
import MainLayout from './MainLayout';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminSidebarContent = (
    <div className="px-4 md:px-6 space-y-1">
      {/* Dashboard Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Dashboard
        </p>
        <nav className="space-y-1">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-4m0 0l4 4m-4-4V5" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a
            href="/admin/overview"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Platform Analytics</span>
          </a>
        </nav>
      </div>

      {/* User Management Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          User Management
        </p>
        <nav className="space-y-1">
          <a
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 6a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
            </svg>
            <span>Users</span>
          </a>
          <a
            href="/admin/doctors"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Doctors</span>
          </a>
          <a
            href="/admin/patients"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Patients</span>
          </a>
        </nav>
      </div>

      {/* Verification Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Verification
        </p>
        <nav className="space-y-1">
          <a
            href="/admin/doctor-verification"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Doctor Verification</span>
            <span className="absolute right-4 bg-warning-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              5
            </span>
          </a>
          <a
            href="/admin/pharmacy-verification"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors relative"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m0 0L4 7m16 0v10l-8 4m0 0v10l-8-4v-10" />
            </svg>
            <span>Pharmacy Verification</span>
            <span className="absolute right-4 bg-warning-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              3
            </span>
          </a>
        </nav>
      </div>

      {/* Content Management Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Content Management
        </p>
        <nav className="space-y-1">
          <a
            href="/admin/categories"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>Categories</span>
          </a>
          <a
            href="/admin/specializations"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Specializations</span>
          </a>
        </nav>
      </div>

      {/* Monitoring Section */}
      <div className="mb-6">
        <p className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Monitoring
        </p>
        <nav className="space-y-1">
          <a
            href="/admin/transactions"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Transactions</span>
          </a>
          <a
            href="/admin/audit-logs"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Audit Logs</span>
          </a>
          <a
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span>Settings</span>
          </a>
        </nav>
      </div>
    </div>
  );

  return (
    <MainLayout showSidebar={true} sidebarContent={adminSidebarContent}>
      {children}
    </MainLayout>
  );
}
