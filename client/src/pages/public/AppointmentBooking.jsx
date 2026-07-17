import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AppointmentBooking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [complaint, setComplaint] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const abortControllerRef = useRef(null);

  const preSelectedDoctorId = location.state?.doctorId || '';
  const specialty = location.state?.specialty || '';

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/doctors');
        const list = Array.isArray(data) ? data : [];
        setDoctors(list);

        if (preSelectedDoctorId) {
          setSelectedDoctor(preSelectedDoctorId);
        } else if (list.length > 0) {
          setSelectedDoctor((current) => current || list[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch doctors', err);
        setError(err.response?.data?.message || 'Failed to load doctors');
      } finally {
        setFetchingDoctors(false);
      }
    };

    fetchDoctors();
  }, [navigate, userInfo, preSelectedDoctorId]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const availableSlots = useMemo(() => {
    const slots = [];

    const formatSlot = (date) => {
      const hours24 = date.getHours();
      const minutes = date.getMinutes();
      const period = hours24 >= 12 ? 'PM' : 'AM';
      const hours12 = hours24 % 12 || 12;
      return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    const current = new Date();
    current.setHours(10, 0, 0, 0);

    const end = new Date(current);
    end.setHours(20, 0, 0, 0);

    while (current.getTime() <= end.getTime()) {
      slots.push(formatSlot(current));
      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }, []);

  const selectedDoctorInfo = useMemo(
    () => doctors.find((doctor) => doctor._id === selectedDoctor) || null,
    [doctors, selectedDoctor],
  );

  const displayDoctorName = selectedDoctorInfo?.name || 'Doctor';
  const pricingKey = selectedDoctorInfo?.specializations?.[0] || selectedDoctorInfo?.specialty || 'General';
  const pricing = selectedDoctorInfo?.consultationPricing?.[pricingKey] || selectedDoctorInfo?.consultationPricing?.General || {};
  const displaySpecialty =
    selectedDoctorInfo?.specialtyLabel ||
    selectedDoctorInfo?.specialty ||
    specialty ||
    'General Physician';
  const displayFee = Number(pricing?.[consultationType] ?? selectedDoctorInfo?.consultationFee ?? 500);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !date || !timeSlot || !complaint) {
      setError('Please fill all required fields');
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError('');
    abortControllerRef.current = new AbortController();

    try {
      const token = userInfo?.token;
      if (!token) {
        setError('Authentication failed. Please login again.');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal,
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/appointments',
          {
          doctorId: selectedDoctor,
          doctorName: displayDoctorName,
          doctorSpecialty: pricingKey,
          date,
          timeSlot,
          complaint,
          consultationType,
          specialty: pricingKey,
        },
        config,
      );

      navigate('/patient/dashboard', {
        state: {
          activeTab: 'pending',
        },
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to book appointment. Slot might be taken.');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 min-h-[80vh]">
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="bg-primary-600 p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Book an Appointment</h1>
          <p className="mt-2 text-primary-100">Schedule a consultation with our verified doctors.</p>
        </div>

        <form onSubmit={handleBooking} className="p-6 md:p-8 space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Select Doctor</label>
            {preSelectedDoctorId ? (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold text-neutral-900">{displayDoctorName}</p>
                    <p className="text-sm text-neutral-600">{displaySpecialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">₹{displayFee}</p>
                    <p className="text-xs text-neutral-500">consultation fee</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {fetchingDoctors ? (
                  <div className="h-12 bg-neutral-100 rounded-xl animate-pulse" />
                ) : (
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                    required
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.length === 0 ? (
                      <option value="">No doctors available</option>
                    ) : (
                      doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctor.name} - {doctor.specialtyLabel || doctor.specialty || 'General Physician'} (₹{doctor.consultationFee ?? 500})
                        </option>
                      ))
                    )}
                  </select>
                )}
              </>
            )}
          </div>

          {!preSelectedDoctorId && selectedDoctorInfo && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-700">Consultation Fee:</span>
                <span className="text-2xl font-bold text-primary-600">₹{displayFee}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Complaint *</label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Describe your symptoms or reason for consultation..."
              className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">Consultation Type *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['voice', 'video'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setConsultationType(type)}
                  className={`rounded-xl border p-4 text-left transition ${consultationType === type ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 bg-white'}`}
                >
                  <div className="font-semibold capitalize text-neutral-900">{type}</div>
                  <div className="text-sm text-neutral-600">₹{Number(pricing?.[type] ?? selectedDoctorInfo?.consultationFee ?? 500)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Preferred Date *</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Time Slot * (30-minute intervals)</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
                required
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedDoctorInfo && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-700">Consultation Fee:</span>
                <span className="text-2xl font-bold text-primary-600">₹{displayFee}</span>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-6 py-3 text-neutral-600 font-medium hover:bg-neutral-50 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDoctor || !complaint || !date || !timeSlot}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                'Book Now'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
