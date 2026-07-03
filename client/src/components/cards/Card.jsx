/**
 * Card Components Collection
 * 
 * Responsive card components for displaying healthcare information
 * Features:
 *  - Mobile-first responsive design
 *  - Stacked layout on mobile, grid on desktop
 *  - Touch-friendly interactions
 *  - Healthcare-specific content types
 * 
 * Card Types:
 *  - DoctorCard: Display doctor profile with rating
 *  - AppointmentCard: Show appointment details with status
 *  - PrescriptionCard: Display prescription information
 *  - ProductCard: Show pharmacy products
 *  - AnalyticsCard: Display metrics and statistics
 */

import React from 'react';

// Base Card Component
export function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200 p-4 md:p-6
        ${hoverable ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Doctor Profile Card
export function DoctorCard({
  doctorName,
  specialization,
  rating = 4.8,
  reviewCount = 128,
  profileImage,
  availability = 'Available',
  consultationFee = 500,
  onBook,
  className = '',
}) {
  return (
    <Card hoverable onClick={() => {}}>
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
        {/* Doctor Image */}
        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200">
          {profileImage ? (
            <img src={profileImage} alt={doctorName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {doctorName?.charAt(0) || 'D'}
              </span>
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-neutral-900 truncate">
            {doctorName}
          </h3>
          <p className="text-sm md:text-base text-neutral-600 mb-2">
            {specialization}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-warning-400' : 'text-neutral-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-neutral-600">
              {rating} ({reviewCount} reviews)
            </span>
          </div>

          {/* Availability & Fee */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-success-500 rounded-full" />
              <span className="text-xs md:text-sm text-neutral-600">{availability}</span>
            </div>
            <p className="text-sm md:text-base font-semibold text-primary-600">
              ₹{consultationFee} / consultation
            </p>
          </div>
        </div>

        {/* Book Button */}
        <div className="w-full md:w-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook?.();
            }}
            className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm md:text-base font-medium"
          >
            Book Now
          </button>
        </div>
      </div>
    </Card>
  );
}

// Appointment Card
export function AppointmentCard({
  patientOrDoctorName,
  date,
  time,
  specialization,
  status = 'scheduled', // scheduled, completed, cancelled
  consultationType = 'video',
  onViewDetails,
  className = '',
}) {
  const statusColors = {
    scheduled: { bg: 'bg-info-50', text: 'text-info-700', badge: 'bg-info-200' },
    completed: { bg: 'bg-success-50', text: 'text-success-700', badge: 'bg-success-200' },
    cancelled: { bg: 'bg-danger-50', text: 'text-danger-700', badge: 'bg-danger-200' },
  };

  const colors = statusColors[status] || statusColors.scheduled;

  return (
    <Card className={`${colors.bg} cursor-pointer`} onClick={onViewDetails} hoverable>
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-neutral-900">
            {patientOrDoctorName}
          </h3>
          <p className="text-sm text-neutral-600">{specialization}</p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} ${colors.text}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2 text-sm md:text-base">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{time}</span>
        </div>

        <div className="flex items-center gap-2 text-sm md:text-base">
          <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="capitalize">{consultationType}</span>
        </div>
      </div>
    </Card>
  );
}

// Prescription Card
export function PrescriptionCard({
  medicineNames,
  prescribedDate,
  doctorName,
  status = 'active', // active, expired, completed
  onViewDetails,
  className = '',
}) {
  const statusColors = {
    active: { color: 'text-success-600', bg: 'bg-success-50' },
    expired: { color: 'text-danger-600', bg: 'bg-danger-50' },
    completed: { color: 'text-neutral-600', bg: 'bg-neutral-50' },
  };

  const colors = statusColors[status] || statusColors.active;

  return (
    <Card className={`${colors.bg} cursor-pointer`} onClick={onViewDetails} hoverable>
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-base md:text-lg font-semibold text-neutral-900">Prescription</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.color}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <p className="text-xs md:text-sm text-neutral-600 mb-3">
        <strong>Medicines:</strong> {medicineNames.slice(0, 2).join(', ')}
        {medicineNames.length > 2 && ` +${medicineNames.length - 2} more`}
      </p>

      <div className="space-y-1 text-xs md:text-sm text-neutral-600 border-t border-neutral-200 pt-3">
        <p><strong>Prescribed by:</strong> {doctorName}</p>
        <p><strong>Date:</strong> {prescribedDate}</p>
      </div>
    </Card>
  );
}

// Product Card (Pharmacy)
export function ProductCard({
  productName,
  category,
  price,
  originalPrice,
  rating = 4.5,
  reviewCount = 45,
  inStock = true,
  image,
  onAddToCart,
  className = '',
}) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Card className={`flex flex-col h-full ${className}`} hoverable>
      {/* Product Image */}
      <div className="relative mb-4 -mx-4 -mt-4 md:-mx-6 md:-mt-6 bg-neutral-100 aspect-square rounded-t-lg md:rounded-t-xl overflow-hidden">
        {image ? (
          <img src={image} alt={productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m0 0L4 7m16 0v10l-8 4m0 0v10l-8-4v-10" />
            </svg>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-danger-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <p className="text-xs text-neutral-500 mb-1">{category}</p>
        <h3 className="text-sm md:text-base font-semibold text-neutral-900 mb-2 line-clamp-2">
          {productName}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-warning-400' : 'text-neutral-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-neutral-600">({reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold text-primary-600">₹{price}</span>
            {originalPrice && (
              <span className="text-sm text-neutral-500 line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          <p className={`text-xs md:text-sm font-medium ${inStock ? 'text-success-600' : 'text-danger-600'}`}>
            {inStock ? '✓ In Stock' : 'Out of Stock'}
          </p>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={!inStock}
          className="w-full px-3 py-2 md:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium mt-auto"
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Card>
  );
}

// Analytics/Stats Card
export function AnalyticsCard({
  title,
  value,
  unit = '',
  trend,
  trendPercentage,
  icon,
  backgroundColor = 'bg-primary-50',
  iconColor = 'text-primary-600',
  className = '',
}) {
  return (
    <Card className={`${backgroundColor} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-neutral-600 font-medium mb-2">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-neutral-900">
            {value}
            <span className="text-sm md:text-base text-neutral-500 ml-1">{unit}</span>
          </p>

          {trend && (
            <p className={`text-xs md:text-sm mt-2 font-medium ${trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendPercentage}% vs last month
            </p>
          )}
        </div>

        {icon && (
          <div className={`p-3 rounded-lg bg-white/50 ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
