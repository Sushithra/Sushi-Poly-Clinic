import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const loadSession = (pathname) => {
  const doctorInfo = localStorage.getItem('doctorInfo');
  const userInfo = localStorage.getItem('userInfo');

  if (pathname.startsWith('/patient/')) {
    if (userInfo) {
      return { storageKey: 'userInfo', ...JSON.parse(userInfo) };
    }
    return null;
  }

  if (pathname.startsWith('/doctor/')) {
    if (doctorInfo) {
      return { storageKey: 'doctorInfo', ...JSON.parse(doctorInfo) };
    }
    return null;
  }

  if (doctorInfo) {
    return { storageKey: 'doctorInfo', ...JSON.parse(doctorInfo) };
  }

  if (userInfo) {
    return { storageKey: 'userInfo', ...JSON.parse(userInfo) };
  }

  return null;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(() => loadSession(location.pathname));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    specializations: [],
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!session) {
      navigate(location.pathname.startsWith('/doctor/') ? '/doctor/login' : '/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${session.token}` },
        });

        setProfile(data);
        setFormData({
          name: data.name || '',
          age: data.age ?? '',
          phone: data.phone || '',
          specializations: Array.isArray(data.specializations) ? data.specializations : [],
          currentPassword: '',
          newPassword: '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [location.pathname, navigate, session]);

  const isDoctor = useMemo(() => profile?.role === 'doctor' || session?.role === 'doctor', [profile, session]);
  const isGoogleUser = Boolean(profile?.googleId || session?.googleId);

  const toggleSpecialization = (value) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(value)
        ? prev.specializations.filter((item) => item !== value)
        : [...prev.specializations, value],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name,
        specializations: isDoctor ? formData.specializations : undefined,
        age: !isDoctor ? formData.age : undefined,
        phone: !isDoctor ? formData.phone : undefined,
        newPassword: formData.newPassword || undefined,
        currentPassword: !isGoogleUser ? formData.currentPassword || undefined : undefined,
      };

      const { data } = await axios.put('http://localhost:5000/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${session.token}` },
      });

      const storageKey = data.role === 'doctor' ? 'doctorInfo' : 'userInfo';
      localStorage.setItem(storageKey, JSON.stringify(data));
      if (storageKey !== session.storageKey) {
        localStorage.removeItem(session.storageKey);
      }

      setSession({ storageKey, ...data });
      setProfile(data);
      setSuccess('Profile updated successfully');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this account permanently? This cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      await axios.delete('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${session.token}` },
      });

      const nextLoginPath = session?.storageKey === 'doctorInfo' || session?.role === 'doctor'
        ? '/doctor/login'
        : '/login';

      localStorage.removeItem('userInfo');
      localStorage.removeItem('doctorInfo');
      localStorage.removeItem('pendingGoogleAuth');
      navigate(nextLoginPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-blue-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              {isDoctor ? 'Doctor Profile' : 'Patient Profile'}
            </h1>
            <p className="text-neutral-600 mt-1">View and manage your account information.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Back
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 border border-red-100 rounded-xl p-4">{error}</div>}
        {success && <div className="mb-4 bg-green-50 text-green-700 border border-green-100 rounded-xl p-4">{success}</div>}

        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-neutral-500">Account Summary</p>
              <h2 className="text-2xl font-bold text-neutral-900 mt-1">{profile?.name || session?.name}</h2>
              <p className="text-neutral-600">{profile?.email || session?.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-neutral-50">
              <p className="text-neutral-500">Name</p>
              <p className="font-semibold text-neutral-900 mt-1">{profile?.name || session?.name}</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50">
              <p className="text-neutral-500">Email</p>
              <p className="font-semibold text-neutral-900 mt-1">{profile?.email || session?.email}</p>
            </div>
            {isDoctor ? (
              <div className="p-4 rounded-2xl bg-neutral-50">
                <p className="text-neutral-500">Specialisation</p>
                <p className="font-semibold text-neutral-900 mt-1">
                  {profile?.specializations?.length ? profile.specializations.join(', ') : 'Not added'}
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-neutral-50">
                  <p className="text-neutral-500">Age</p>
                  <p className="font-semibold text-neutral-900 mt-1">{profile?.age ?? 'Not added'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50">
                  <p className="text-neutral-500">Phone Number</p>
                  <p className="font-semibold text-neutral-900 mt-1">{profile?.phone || 'Not added'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            {isDoctor ? (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Specialisation</label>
                <div className="text-sm text-neutral-600 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  Use the specialization buttons below to update this field.
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            )}
            {!isDoctor && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Age</label>
                <input
                  type="number"
                  min="0"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            )}
          </div>

          {isDoctor && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">Specializations</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['General', 'Psychology', 'Dietician'].map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => toggleSpecialization(category)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      formData.specializations.includes(category)
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 bg-white text-neutral-700'
                    }`}
                  >
                    <div className="font-semibold">{category}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {isGoogleUser ? 'Set Password' : 'Current Password'}
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={isGoogleUser ? 'Optional' : 'Current password'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
