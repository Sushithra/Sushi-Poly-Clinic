import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const categories = [
  { label: 'General', value: 'general' },
  { label: 'Psychology', value: 'psychology' },
  { label: 'Dietician', value: 'dietician' },
];

const matchesCategory = (doctor, category) => {
  const haystack = [
    doctor.name,
    doctor.specialty,
    doctor.specialtyLabel,
    ...(doctor.specializations || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (category === 'general') {
    return (
      haystack.includes('general') ||
      haystack.includes('medicine') ||
      haystack.includes('physician')
    );
  }

  if (category === 'psychology') {
    return haystack.includes('psychology') || haystack.includes('psychiatry');
  }

  if (category === 'dietician') {
    return (
      haystack.includes('diet') ||
      haystack.includes('nutrition') ||
      haystack.includes('nutritionist')
    );
  }

  return true;
};

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('general');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/doctors');
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const visibleDoctors = useMemo(
    () => doctors.filter((doctor) => matchesCategory(doctor, selectedSpecialty)),
    [doctors, selectedSpecialty],
  );

  const handleCategoryClick = (category) => {
    setSelectedSpecialty(category);
    setShowDoctorModal(true);
  };

  const handleDoctorSelect = (doctor) => {
    setShowDoctorModal(false);
    navigate('/appointments/book', {
      state: {
        doctorId: doctor._id,
        specialty: doctor.specialty || doctor.specialtyLabel || selectedSpecialty,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">Find Doctors</h1>
        <p className="text-neutral-600 text-lg">
          Browse registered doctors and book a consultation with the one you need.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            className="p-6 bg-gradient-to-r from-primary-500 to-secondary-400 hover:from-primary-600 hover:to-secondary-500 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95"
          >
            {category.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 max-w-md w-full text-center">
          {error}
        </div>
      )}

      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Choose a Doctor</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Showing registered doctors for {selectedSpecialty}
                </p>
              </div>
              <button
                onClick={() => setShowDoctorModal(false)}
                className="text-neutral-500 hover:text-neutral-700 text-3xl leading-none"
                aria-label="Close doctor list"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
                  <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
                  <div className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
                </div>
              ) : visibleDoctors.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                  <p className="text-neutral-600 font-medium">No registered doctors found in this category yet.</p>
                  <p className="text-sm text-neutral-500 mt-2">Ask a doctor to register with this specialization and they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleDoctors.map((doctor) => (
                    <button
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="w-full p-4 border-2 border-neutral-200 hover:border-primary-500 rounded-xl transition text-left hover:bg-primary-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-bold text-neutral-900">{doctor.name}</h3>
                          <p className="text-sm text-neutral-600">
                            {doctor.specialtyLabel || doctor.specialty || 'General Physician'}
                            {doctor.experienceYears ? ` • ${doctor.experienceYears} years` : ''}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-neutral-500">
                            <span>★ {doctor.rating ?? 4.8}</span>
                            <span>₹{doctor.consultationFee ?? 500}</span>
                            {doctor.specializations?.length > 0 && (
                              <span className="px-2 py-1 bg-white rounded-full border border-neutral-200">
                                {doctor.specializations.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-primary-600 font-semibold">
                          Book
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDoctorModal(false)}
              className="mt-6 w-full py-3 border border-neutral-300 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
