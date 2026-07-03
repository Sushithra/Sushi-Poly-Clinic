/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Color palette for healthcare platform
      colors: {
        // Primary - Medical Blue
        primary: {
          50: '#f0f7ff',
          100: '#e0f0ff',
          200: '#c1deff',
          300: '#a2cdff',
          400: '#83bcff',
          500: '#006FE5', // Primary medical blue
          600: '#005acc',
          700: '#0047b3',
          800: '#00349a',
          900: '#002181',
        },
        // Secondary - Teal/Cyan
        secondary: {
          50: '#f0fffe',
          100: '#d4f9f7',
          200: '#a8f3f0',
          300: '#7cede8',
          400: '#50e7e0',
          500: '#24e1d8', // Secondary accent
          600: '#1dc4bf',
          700: '#16a8a6',
          800: '#0f8c8d',
          900: '#087074',
        },
        // Neutral grays
        neutral: {
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Status colors for healthcare
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },

      // Spacing scale (8px base)
      spacing: {
        0: '0px',
        1: '0.25rem', // 4px
        2: '0.5rem', // 8px
        3: '0.75rem', // 12px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        7: '1.75rem', // 28px
        8: '2rem', // 32px
        9: '2.25rem', // 36px
        10: '2.5rem', // 40px
        12: '3rem', // 48px
        14: '3.5rem', // 56px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        32: '8rem', // 128px
      },

      // Typography system
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        base: ['1rem', { lineHeight: '1.5rem' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
        '5xl': ['3rem', { lineHeight: '3.5rem' }], // 48px
      },

      // Font weights
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // Shadows for healthcare aesthetic
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'soft-md': '0 4px 12px rgba(0, 111, 229, 0.08)',
        'soft-lg': '0 10px 24px rgba(0, 111, 229, 0.12)',
      },

      // Border radius for cards and buttons
      borderRadius: {
        none: '0px',
        sm: '0.25rem',
        base: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        full: '9999px',
      },

      // Z-index scale
      zIndex: {
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        60: '60',
        70: '70',
        auto: 'auto',
      },

      // Breakpoints for responsive design
      screens: {
        xs: '320px', // Extra small - phones
        sm: '480px', // Small - larger phones
        md: '768px', // Medium - tablets
        lg: '1024px', // Large - small laptops
        xl: '1280px', // Extra large - laptops
        '2xl': '1536px', // 2xl - desktops
      },

      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },

      // Transition durations
      transitionDuration: {
        0: '0ms',
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },

      // Line height
      lineHeight: {
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
      },

      // Letter spacing
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },

      // Opacity
      opacity: {
        0: '0',
        5: '0.05',
        10: '0.1',
        20: '0.2',
        25: '0.25',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        75: '0.75',
        80: '0.8',
        90: '0.9',
        95: '0.95',
        100: '1',
      },
    },
  },
  plugins: [
    // Custom plugin for responsive containers
    function ({ addComponents, theme }) {
      addComponents({
        // Container classes
        '.container-mobile': {
          '@apply px-4 mx-auto': {},
        },
        '.container-tablet': {
          '@apply px-6 mx-auto': {},
        },
        '.container-desktop': {
          '@apply px-8 mx-auto max-w-7xl': {},
        },

        // Responsive text classes
        '.text-mobile-h1': {
          '@apply text-3xl md:text-4xl lg:text-5xl font-bold': {},
        },
        '.text-mobile-h2': {
          '@apply text-2xl md:text-3xl lg:text-4xl font-bold': {},
        },
        '.text-mobile-h3': {
          '@apply text-xl md:text-2xl lg:text-3xl font-semibold': {},
        },
        '.text-mobile-body': {
          '@apply text-sm md:text-base lg:text-base font-normal': {},
        },

        // Responsive grid classes
        '.grid-responsive': {
          '@apply grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4': {},
        },
        '.grid-cards-mobile': {
          '@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6': {},
        },

        // Touch-friendly button height
        '.btn-touch': {
          '@apply min-h-12 min-w-12': {},
        },

        // Responsive padding for mobile
        '.p-mobile': {
          '@apply p-4 sm:p-6 md:p-8': {},
        },
        '.px-mobile': {
          '@apply px-4 sm:px-6 md:px-8': {},
        },
        '.py-mobile': {
          '@apply py-4 sm:py-6 md:py-8': {},
        },

        // Safe area for notch devices
        '.safe-top': {
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
        },
        '.safe-bottom': {
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        },
        '.safe-left': {
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        },
        '.safe-right': {
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        },

        // Responsive card styles
        '.card-base': {
          '@apply bg-white rounded-lg shadow-md p-4 md:p-6': {},
        },
        '.card-hover': {
          '@apply card-base transition-all duration-200 hover:shadow-lg cursor-pointer': {},
        },

        // Responsive flex utilities
        '.flex-responsive': {
          '@apply flex flex-col md:flex-row': {},
        },
      });
    },
  ],
};
