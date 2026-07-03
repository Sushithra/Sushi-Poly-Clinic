import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const doctorCategories = [
  { label: 'General', value: 'General' },
  { label: 'Psychology', value: 'Psychology' },
  { label: 'Dietician', value: 'Dietician' },
];

const getAuthState = () => {
  const pendingRaw = localStorage.getItem('pendingGoogleAuth');
  if (pendingRaw) {
    try {
      return JSON.parse(pendingRaw);
    } catch {
      return null;
    }
  }
  return null;
};

export default function GoogleOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState(() => getAuthState() || location.state?.authState || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profilePicture: '',
    specializations: [],
    experienceYears: '',
    consultationFee: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!authState && location.state?.authState) {
      setAuthState(location.state.authState);
    }
  }, [authState, location.state]);

  useEffect(() => {
    if (!authState) {
      const fallback = getAuthState();
      if (fallback) {
        setAuthState(fallback);
      }
    }
  }, [authState]);

  useEffect(() => {
    if (!authState) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: authState.name || '',
      phone: authState.phone || '',
      profilePicture: authState.profilePicture || '',
      specializations: Array.isArray(authState.specializations) ? authState.specializations : [],
      experienceYears: authState.experienceYears || '',
      consultationFee: authState.consultationFee || '',
    }));
  }, [authState]);

  const role = authState?.role || location.state?.role;
  const isDoctor = role === 'doctor';

  const toggleSpecialization = (value) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(value)
        ? prev.specializations.filter((item) => item !== value)
        : [...prev.specializations, value],
    }));
  };

  const profileMissing = useMemo(() => {
    if (!authState) return [];
    const missing = [];
    if (!formData.name.trim()) missing.push('name');
    if (!formData.phone.trim()) missing.push('phone');
    if (isDoctor) {
      if (formData.specializations.length === 0) missing.push('specializations');
      if (!String(formData.experienceYears).trim()) missing.push('experienceYears');
      if (!String(formData.consultationFee).trim()) missing.push('consultationFee');
    }
    return missing;
  }, [authState, formData, isDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!authState?.token) {
      setError('Missing login session. Please sign in again.');
      setLoading(false);
      return;
    }

    if (profileMissing.length > 0) {
      setError('Please complete all required fields.');
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${authState.token}` } };
      const { data } = await axios.put(
        'http://localhost:5000/api/auth/profile',
        {
          name: formData.name,
          phone: formData.phone,
          profilePicture: formData.profilePicture,
          specializations: isDoctor ? formData.specializations : undefined,
          experienceYears: isDoctor ? formData.experienceYears : undefined,
          consultationFee: isDoctor ? formData.consultationFee : undefined,
          newPassword: formData.newPassword || undefined,
        },
        config,
      );

      localStorage.removeItem('pendingGoogleAuth');

      const storageKey = data.role === 'doctor' ? 'doctorInfo' : 'userInfo';
      localStorage.setItem(storageKey, JSON.stringify(data));

      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save onboarding details');
    } finally {
      setLoading(false);
    }
  };

  if (!authState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Complete your setup</h1>
          <p className="text-neutral-600 mb-6">Please sign in with Google again so we can finish setting up your account.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-3 rounded-xl bg-primary-600 text-white font-semibold"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-neutral-200 p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">Google onboarding</p>
          <h1 className="text-3xl font-bold text-neutral-900 mt-2">
            {isDoctor ? 'Doctor setup' : 'Patient setup'}
          </h1>
          <p className="text-neutral-600 mt-2">
            {isDoctor
              ? 'Please tell us your medical category and professional details before entering the doctor portal.'
              : 'Please confirm your contact details before entering the patient portal.'}
          </p>
        </div>

        {error && <div className="mb-6 bg-red-50 text-red-600 border border-red-100 rounded-xl p-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Profile Picture URL</label>
            <input
              type="url"
              value={formData.profilePicture}
              onChange={(e) => setFormData((prev) => ({ ...prev, profilePicture: e.target.value }))}
              className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="https://..."
            />
          </div>

          {isDoctor && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">Specialization Category *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {doctorCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => toggleSpecialization(category.value)}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        formData.specializations.includes(category.value)
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 bg-white text-neutral-700'
                      }`}
                    >
                      <div className="font-semibold">{category.label}</div>
                      <div className="text-xs mt-1 opacity-80">Select one or more</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Experience Years *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Consultation Fee *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, consultationFee: e.target.value }))}
                    className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              {authState.googleId ? 'Set a password (optional)' : 'New Password'}
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Create a password for email login"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Finish setup'}
            </button>
            <button
              type="button"
              onClick={() => navigate(role === 'doctor' ? '/doctor/login' : '/login')}
              className="px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
