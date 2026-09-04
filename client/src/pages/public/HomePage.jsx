import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { withApiBase } from '../../config/env.js';
import { resolveRecordUrl } from '../../utils/recordUrl.js';

const BRAND = 'Sushi Polyclinic';
const LOGO_URL = '/icons/logo.png';

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

const resolveImage = (product) => {
  if (product.imageUrl) return resolveRecordUrl(product.imageUrl);
  return '';
};

export default function HomePage() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpenState] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

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

  useEffect(() => {
    let mounted = true;
    axios
      .get(withApiBase('/api/products'))
      .then(({ data }) => {
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setProductsLoading(false);
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
  const featuredProducts = products.slice(0, 4);

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
            <img src={LOGO_URL} alt={`${BRAND} logo`} className="h-9 md:h-11 w-auto" />
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
        {/* Organic background shapes (very slow drift / subtle parallax) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl hero-drift" />
          <div className="absolute -bottom-28 -left-20 w-[30rem] h-[30rem] rounded-full bg-teal-300/20 blur-3xl hero-drift-2" />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-white/10 blur-2xl hero-drift" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-16 md:pb-24 grid lg:grid-cols-2 gap-14 lg:gap-6 items-center">
          {/* ============ Left: copy ============ */}
          <div className="text-center lg:text-left">
            <p className="hero-rise inline-flex items-center justify-center lg:justify-start gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-teal-50 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-300 hero-pulse-dot" />
              Compassionate Care • Modern Medicine
            </p>
            <h1 className="hero-rise-1 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Your health,
              <br />
              our <span className="text-emerald-300">priority.</span>
            </h1>
            <p className="hero-rise-2 text-base sm:text-lg md:text-xl text-teal-50/90 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-9">
              Trusted doctors, easy online consultations, and pharmacy delivered to your doorstep — all in one caring, modern clinic.
            </p>
            <div className="hero-rise-3 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
              <button
                onClick={() => bookAppointment()}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-teal-800 font-bold shadow-lg hover:shadow-xl hover:bg-teal-50 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Book Appointment
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={() => openSection('services')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/40 text-white font-semibold hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Explore Services
              </button>
            </div>
          </div>

          {/* ============ Right: human-centered healthcare visual ============ */}
          <div className="hero-rise-4 relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Organic illustration of a friendly young adult patient in a modern clinic */}
              <svg className="w-full h-auto hero-float-slow" viewBox="0 0 420 420" role="img" aria-label="A friendly young adult patient in a modern healthcare setting">
                <defs>
                  <radialGradient id="heroBlob" cx="50%" cy="36%" r="78%">
                    <stop offset="0%" stopColor="#f2fbf8" />
                    <stop offset="100%" stopColor="#c7ede3" />
                  </radialGradient>
                  <linearGradient id="tee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2b8c85" />
                    <stop offset="100%" stopColor="#1e7a6d" />
                  </linearGradient>
                </defs>

                {/* Organic blob */}
                <path d="M210 24 C 300 18 398 88 404 190 C 410 292 332 398 218 400 C 104 402 14 332 16 228 C 18 124 120 30 210 24 Z" fill="url(#heroBlob)" stroke="rgba(255,255,255,0.45)" strokeWidth="3" />
                <circle cx="330" cy="88" r="34" fill="#b9e7d8" opacity="0.55" />
                <circle cx="80" cy="326" r="26" fill="#9fe0c9" opacity="0.5" />

                {/* Small clinic cross accent */}
                <g opacity="0.95">
                  <rect x="22" y="118" width="34" height="34" rx="11" fill="#1e7a6d" />
                  <path d="M39 126 v 18 M30 135 h 18" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                </g>
                <circle cx="352" cy="160" r="16" fill="#10b981" opacity="0.18" />

                {/* Ground shadow */}
                <ellipse cx="212" cy="360" rx="110" ry="24" fill="#1e7a6d" opacity="0.1" />

                {/* ==== Friendly young adult patient (bust) ==== */}
                {/* Neck */}
                <rect x="196" y="180" width="24" height="34" rx="10" fill="#f4c7a5" />
                {/* Shoulders / modern teal top */}
                <path d="M146 302 C 144 240 168 210 210 210 C 252 210 276 240 274 302 Z" fill="url(#tee)" />
                {/* White collar accent */}
                <path d="M188 214 l 22 16 22 -16 l -10 -6 -12 9 -12 -9 z" fill="#eaf7f2" />
                {/* Small white cross badge on the top */}
                <g>
                  <rect x="116" y="258" width="22" height="22" rx="7" fill="#fff" opacity="0.92" />
                  <path d="M127 263 v 12 M121 269 h 12" stroke="#1e7a6d" strokeWidth="3" strokeLinecap="round" />
                </g>
                {/* Head */}
                <circle cx="210" cy="138" r="44" fill="#f4c7a5" />
                {/* Hair (modern short crop, warm brown) */}
                <path d="M166 134 C 164 84 256 82 254 134 C 254 118 246 102 210 102 C 174 102 168 118 166 134 Z" fill="#5a3d2b" />
                <path d="M176 96 C 190 66 246 70 250 100 C 224 72 200 76 176 96 Z" fill="#5a3d2b" />
                {/* Brows */}
                <path d="M186 128 q 6 -6 13 -3" stroke="#5a3d2b" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M221 125 q 8 -3 13 3" stroke="#5a3d2b" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Eyes */}
                <circle cx="194" cy="140" r="3.6" fill="#2f2018" />
                <circle cx="227" cy="140" r="3.6" fill="#2f2018" />
                {/* Rosy cheeks */}
                <circle cx="184" cy="154" r="6" fill="#f2b28c" opacity="0.55" />
                <circle cx="236" cy="154" r="6" fill="#f2b28c" opacity="0.55" />
                {/* Warm smile */}
                <path d="M192 156 q 17 16 34 0" stroke="#d97a5a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

                {/* Modern medicine heartbeat line */}
                <path d="M70 300 h 84 l 16 -24 20 44 16 -24 14 4 h 56" stroke="#10b981" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M70 300 h 84 l 16 -22 20 42 16 -22 14 2 h 56" stroke="rgba(255,255,255,0.7)" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>

              {/* Floating decorative medical elements */}
              <div className="absolute top-2 right-6 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-teal-700 hero-float" aria-hidden="true">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 5.2L19 5l-1.8 5L19 15l-4.8-1.2L12 19l-2.2-5.2L5 15l1.8-5L5 5l4.8 2.2z" /></svg>
              </div>
              <div className="absolute top-16 left-0 w-9 h-5 rounded-full bg-white/85 shadow-md border border-teal-100 hero-float-slower" aria-hidden="true">
                <span className="block w-4 h-4 rounded-full bg-teal-500" />
              </div>
              <div className="absolute bottom-10 right-2 text-teal-700 hero-float-slow" aria-hidden="true">
                <svg className="w-7 h-7 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3v18" />
                </svg>
              </div>

              {/* Floating informational pills */}
              <div className="absolute -left-3 sm:left-0 top-8 md:top-10 hero-float hero-rise-1">
                <div className="rounded-full bg-white text-teal-800 shadow-xl px-3.5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 hero-pulse-dot" />
                  24/7 CARE
                </div>
              </div>
              <div className="absolute -right-2 sm:right-0 top-0 hero-float-slower hero-rise-2">
                <div className="rounded-full bg-white text-teal-800 shadow-xl px-3.5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  ONLINE CONSULTATION
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/4 hero-float-slow hero-rise-3">
                <div className="rounded-full bg-white text-teal-800 shadow-xl px-3.5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18M3 9h18M9 3h6m-6 6v6m6-6v6M9 3h6M9 21h6" />
                  </svg>
                  TRUSTED PHARMACY
                </div>
              </div>
              <div className="absolute -right-2 bottom-2 hero-float hero-rise-4">
                <div className="rounded-full bg-white text-teal-800 shadow-xl px-3.5 py-2 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  EASY APPOINTMENTS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= FEATURED PHARMACY ============================= */}
      <section id="pharmacy-preview" className="py-16 md:py-24 bg-gradient-to-b from-teal-50/60 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <p className="text-teal-700 font-semibold uppercase tracking-widest text-sm mb-3">Popular Medicines</p>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Featured pharmacy picks</h2>
              <p className="text-neutral-600">Genuine medicines, delivered to your doorstep. Order quickly from our trusted pharmacy.</p>
            </div>
            <Link
              to="/pharmacy"
              className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-full border border-teal-700 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors"
            >
              Visit pharmacy
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-neutral-100 bg-white p-4 animate-pulse">
                  <div className="h-36 rounded-xl bg-neutral-100 mb-4" />
                  <div className="h-4 bg-neutral-100 rounded-full w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-100 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => {
                const imageUrl = resolveImage(product);
                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition"
                  >
                    <Link to="/pharmacy" className="block h-36 sm:h-44 bg-neutral-100 flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <span className="text-5xl group-hover:scale-110 transition duration-300">{product.image}</span>
                      )}
                    </Link>
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-primary-600 uppercase tracking-wider truncate">{product.category}</span>
                        {product.prescriptionRequired && (
                          <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-medium shrink-0">Rx</span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 line-clamp-1 mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-base sm:text-lg font-bold text-primary-600">₹{product.price}</p>
                        {typeof product.stock === 'number' && product.stock > 0 && (
                          <span className="text-[11px] font-medium text-green-600">{product.stock} in stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
              <p className="text-neutral-600 font-medium">Medicines are being added — check our pharmacy soon.</p>
              <Link to="/pharmacy" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors">
                Browse pharmacy
              </Link>
            </div>
          )}
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
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-3xl md:text-4xl font-bold mx-auto mb-4 overflow-hidden">
                    {initialAvatar(doctor.name)}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    {doctor.specialtyLabel || doctor.specialty || 'General Physician'}
                  </p>
                  {doctor.experienceYears > 0 && (
                    <div className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 mb-5">
                      <svg className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {doctor.experienceYears} yrs experience
                    </div>
                  )}
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
              <img src={LOGO_URL} alt={`${BRAND} logo`} className="h-10 w-auto" />
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
