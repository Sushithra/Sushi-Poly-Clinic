import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { withApiBase } from '../../config/env.js';

const BRAND = 'Sushi Polyclinic';
const LOGO_URL = '/icons/icon-192.svg';

const NAV_LINKS = [
  { label: 'Home', to: '/', page: true },
  { label: 'Doctors', to: '/doctors', page: true },
  { label: 'Services', to: 'services', anchor: true },
  { label: 'Pharmacy', to: '/pharmacy', page: true },
  { label: 'Contact', to: 'contact', anchor: true },
];

const SERVICES = [
  {
    title: 'Book Appointment',
    description: 'Schedule a consultation with the right doctor in a few clicks.',
    to: '/appointments/book',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Online Consultation',
    description: 'Meet doctors remotely through secure video consultations.',
    to: '/consultations',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Pharmacy',
    description: 'Browse medicines and have them delivered to your door.',
    to: '/pharmacy',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M3 9h18M9 3h6m-6 6v6m6-6v6M9 3h6M9 21h6" />
      </svg>
    ),
  },
  {
    title: 'Medical Records',
    description: 'Access your appointments and medical records in one place.',
    to: '/patient/dashboard',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const BENEFITS = [
  {
    title: 'Trusted Doctors',
    description: 'Care from experienced, verified specialists across specialisations.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Easy Appointment Booking',
    description: 'Pick a doctor, choose a time slot, and book in seconds.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Online Consultation',
    description: 'Consult from home with secure video appointments.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Secure Patient Records',
    description: 'Your medical history stays private, organised, and protected.',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const initialAvatar = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

export default function HomePage() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpenState] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState('');

  const userInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || 'null');
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    axios
      .get(withApiBase('/api/doctors'))
      .then(({ data }) => {
        if (mounted) setDoctors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) {
          setDoctorsError(err.response?.data?.message || 'Could not load doctors');
        }
      })
      .finally(() => {
        if (mounted) setDoctorsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const closeMenu = () => setMenuOpenState(false);

  const openSection = (id) => {
    setMenuOpenState(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const bookAppointment = (doctor) => {
    setMenuOpenState(false);
    if (doctor?._id) {
      navigate('/appointments/book', {
        state: { doctorId: doctor._id, specialty: doctor.specialty || '' },
      });
      return;
    }
    navigate('/appointments/book');
  };

  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-neutral-800 overflow-x-hidden">
      {/* ============================= TOP INFO BAR ============================= */}
      <div className="bg-teal-900 text-teal-100 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Online &amp; in-person consultations available</span>
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Mon – Sat · 9:00 AM – 9:00 PM</span>
          </p>
        </div>
      </div>

      {/* ============================= NAVBAR ============================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMenu}>
            <img src={LOGO_URL} alt={`${BRAND} logo`} className="w-9 h-9 md:w-11 md:h-11" />
            <span className="text-lg md:text-2xl font-bold text-teal-800 tracking-tight">{BRAND}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) =>
              link.anchor ? (
                <button
                  key={link.label}
                  onClick={() => openSection(link.to)}
                  className="text-sm font-medium text-neutral-700 hover:text-teal-700 transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-neutral-700 hover:text-teal-700 transition-colors"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => bookAppointment()}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-soft-md transition-all hover:shadow-md"
            >
              Book Appointment
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors touch-target"
              onClick={() => setMenuOpenState((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-neutral-100 bg-white animate-slide-down">
            <div className="px-4 sm:px-6 py-3 space-y-1">
              {NAV_LINKS.map((link) =>
                link.anchor ? (
                  <button
                    key={link.label}
                    onClick={() => openSection(link.to)}
                    className="block w-full text-left px-3 py-3 rounded-lg text-neutral-700 hover:bg-teal-50 hover:text-teal-700 font-medium transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={closeMenu}
                    className="block px-3 py-3 rounded-lg text-neutral-700 hover:bg-teal-50 hover:text-teal-700 font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <button
                onClick={() => bookAppointment()}
                className="block w-full text-center mt-2 px-4 py-3 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-semibold transition-colors"
              >
                Book Appointment
              </button>
              {!userInfo && (
                <div className="flex gap-2 pt-1">
                  <Link to="/login" onClick={closeMenu} className="flex-1 text-center px-4 py-3 rounded-full border border-teal-700 text-teal-700 font-semibold transition-colors hover:bg-teal-50">
                    Login
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="flex-1 text-center px-4 py-3 rounded-full border border-neutral-200 text-neutral-700 font-semibold transition-colors hover:bg-neutral-50">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[28rem] h-[28rem] rounded-full bg-emerald-400 opacity-10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-teal-100 text-sm font-semibold uppercase tracking-widest mb-4">
              <span className="w-8 h-0.5 bg-teal-300 inline-block" />
              Compassionate Care, Modern Medicine
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Your health,
              <br />
              our <span className="text-teal-200">priority.</span>
            </h1>
            <p className="text-lg md:text-xl text-teal-50/90 max-w-xl leading-relaxed mb-8">
              Book consultations with trusted doctors, access online care, and order pharmacy delivered to your doorstep — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => bookAppointment()}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-teal-800 font-bold shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all"
              >
                Book Appointment
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Explore Doctors
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:flex lg:justify-center lg:ml-6">
            <div className="relative w-full max-w-md">
              <div className="rounded-3xl bg-white/10 border border-white/20 p-8 backdrop-blur-md shadow-2xl">
                <div className="rounded-2xl bg-white p-6 text-neutral-800 shadow-inner">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold">Dr. Dwarakanath</p>
                      <p className="text-sm text-neutral-500">General Medicine</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.75 1.69-1.53 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.83-.2-1.53-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z" /></svg>
                      {4.7}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'General Medicine', active: true },
                      { label: 'Clinical Psychology', active: true },
                      { label: 'Check-up & Consultation', active: false },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                        <span className="text-sm font-medium text-neutral-600">{row.label}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${row.active ? 'text-success-600' : 'text-neutral-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${row.active ? 'bg-success-500' : 'bg-neutral-300'}`} />
                          {row.active ? 'Available' : 'By request'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => bookAppointment()} className="w-full mt-6 py-3 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800 transition-colors">
                    Book now
                  </button>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Verified Doctors</p>
                  <p className="text-xs text-neutral-500">Experienced specialists</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= SERVICES ============================= */}
      <section id="services" className="py-16 md:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-teal-700 font-semibold uppercase tracking-widest text-sm mb-3">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Everything you need, in one place</h2>
            <p className="text-neutral-600">Four simple ways to take care of yourself and your family with {BRAND}.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <button
                key={service.title}
                onClick={() => navigate(service.to)}
                className="group rounded-2xl border border-neutral-100 bg-neutral-50 p-6 hover:shadow-soft-lg hover:border-teal-100 transition-all duration-200 text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{service.title}</h3>
                <p className="text-neutral-600 text-sm mb-4">{service.description}</p>
                <span className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm">
                  Learn more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= WHY US ============================= */}
      <section id="why-us" className="py-16 md:py-24 bg-neutral-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-teal-700 font-semibold uppercase tracking-widest text-sm mb-3">Why {BRAND}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Care designed around you</h2>
            <p className="text-neutral-600">A modern polyclinic built on trust, convenience, and secure technology.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl bg-white border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= DOCTORS ============================= */}
      <section id="doctors" className="py-16 md:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <p className="text-teal-700 font-semibold uppercase tracking-widest text-sm mb-3">Our Doctors</p>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Meet our specialists</h2>
              <p className="text-neutral-600">A few of the trusted doctors available for your care.</p>
            </div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-full border border-teal-700 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors"
            >
              View all doctors
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {doctorsError && !doctorsLoading && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-600 font-medium mb-3">We're having trouble loading the doctor list right now.</p>
              <Link to="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors">
                Browse doctors
              </Link>
            </div>
          )}

          {doctorsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-neutral-100 p-6 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto mb-4" />
                  <div className="h-4 bg-neutral-100 rounded-full w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-neutral-100 rounded-full w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : featuredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredDoctors.map((doctor) => (
                <div key={doctor._id} className="rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {initialAvatar(doctor.name)}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    {doctor.specialtyLabel || doctor.specialty || 'General Physician'}
                  </p>
                  <div className="flex items-center justify-center gap-3 text-sm text-neutral-500 mb-5">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.75 1.69-1.53 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.83-.2-1.53-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z" /></svg>
                      {doctor.rating ?? 4.8}
                    </span>
                    {doctor.experienceYears > 0 && <span>{doctor.experienceYears} yrs exp</span>}
                  </div>
                  <button
                    onClick={() => bookAppointment(doctor)}
                    className="block w-full py-2.5 rounded-full bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-600 font-medium mb-3">Doctors are being onboarded — check back soon.</p>
              <Link to="/doctors" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors">
                Browse doctors
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 to-teal-900 text-white">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white opacity-10 blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Your Health, Our Priority</h2>
          <p className="text-lg text-teal-50/90 mb-8">
            Take the first step towards better health — book a consultation today.
          </p>
          <button
            onClick={() => bookAppointment()}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-teal-800 font-bold shadow-lg hover:bg-teal-50 hover:shadow-xl transition-all"
          >
            Book Appointment
          </button>
        </div>
      </section>

      {/* ============================= FOOTER ============================= */}
      <footer id="contact" className="bg-teal-950 text-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src={LOGO_URL} alt={`${BRAND} logo`} className="w-10 h-10" />
              <span className="text-xl font-bold text-white">{BRAND}</span>
            </div>
            <p className="text-sm text-teal-200/80 leading-relaxed">
              A modern polyclinic offering consultations, online care, and pharmacy services — all in one trusted place.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" onClick={closeMenu} className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/doctors" onClick={closeMenu} className="hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/pharmacy" onClick={closeMenu} className="hover:text-white transition-colors">Pharmacy</Link></li>
              <li><Link to="/patient/dashboard" onClick={closeMenu} className="hover:text-white transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/appointments/book" onClick={closeMenu} className="hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link to="/consultations" onClick={closeMenu} className="hover:text-white transition-colors">Online Consultation</Link></li>
              <li><Link to="/pharmacy" onClick={closeMenu} className="hover:text-white transition-colors">Pharmacy Delivery</Link></li>
              <li><Link to="/patient/dashboard" onClick={closeMenu} className="hover:text-white transition-colors">Medical Records</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Contact Us</h4>
            <ul className="space-y-3 text-sm text-teal-200/80">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@sushipolyclinic.com" onClick={closeMenu} className="hover:text-white transition-colors break-all">support@sushipolyclinic.com</a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Mon – Sat · 9:00 AM – 9:00 PM
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Online &amp; in-person consultations
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-teal-200/70">
            <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
            <div className="flex gap-6">
              {!userInfo ? (
                <>
                  <Link to="/login" onClick={closeMenu} className="hover:text-white transition-colors">Login</Link>
                  <Link to="/register" onClick={closeMenu} className="hover:text-white transition-colors">Register</Link>
                </>
              ) : (
                <Link to="/patient/dashboard" onClick={closeMenu} className="hover:text-white transition-colors">Patient Portal</Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
