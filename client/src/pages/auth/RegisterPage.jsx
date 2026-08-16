import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.jsx';
import { API_BASE_URL, IS_BACKEND_URL_DEFAULTED, withApiBase } from '../../config/env.js';
import { registerPushToken } from '../../services/pushNotifications.js';

const doctorSpecializations = ['General Medicine', 'Psychology', 'Nutrition', 'Pediatrics'];

export default function RegisterPage() {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    specializations: [],
    experienceYears: '',
    consultationFee: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isDoctor = role === 'doctor';

  const requiredFieldsMissing = useMemo(() => {
    const missing = [];
    if (!formData.name.trim()) missing.push('name');
    if (!formData.email.trim()) missing.push('email');
    if (!formData.password.trim()) missing.push('password');
    if (!isDoctor && !String(formData.age).trim()) missing.push('age');
    if (isDoctor) {
      if (formData.specializations.length === 0) missing.push('specializations');
      if (!String(formData.experienceYears).trim()) missing.push('experienceYears');
      if (!String(formData.consultationFee).trim()) missing.push('consultationFee');
    }
    return missing;
  }, [formData, isDoctor]);

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleSpecialization = (value) => {
    setFormData((current) => ({
      ...current,
      specializations: current.specializations.includes(value)
        ? current.specializations.filter((item) => item !== value)
        : [...current.specializations, value],
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (IS_BACKEND_URL_DEFAULTED && !window.location.hostname.includes('localhost')) {
      setError(`Backend URL is not configured. Set VITE_API_URL to your Render backend. Current fallback: ${API_BASE_URL}`);
      setLoading(false);
      return;
    }

    if (requiredFieldsMissing.length > 0) {
      setError('Please complete the required fields for the selected role.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
      };

      if (isDoctor) {
        payload.specializations = formData.specializations;
        payload.experienceYears = formData.experienceYears;
        payload.consultationFee = formData.consultationFee;
      } else {
        payload.age = formData.age;
      }

      const { data } = await axios.post(withApiBase('/api/auth/register'), payload);
      const storageKey = data.role === 'doctor' ? 'doctorInfo' : 'userInfo';
      localStorage.setItem(storageKey, JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async (credential) => {
    setLoading(true);
    setError('');

    if (IS_BACKEND_URL_DEFAULTED && !window.location.hostname.includes('localhost')) {
      setError(`Backend URL is not configured. Set VITE_API_URL to your Render backend. Current fallback: ${API_BASE_URL}`);
      setLoading(false);
      return;
    }

    if (isDoctor && formData.specializations.length === 0) {
      setError('Please select at least one specialization.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(withApiBase('/api/auth/google'), {
        idToken: credential,
        role,
        mode: 'register',
        specializations: isDoctor ? formData.specializations : [],
        experienceYears: isDoctor ? formData.experienceYears : 0,
        consultationFee: isDoctor ? formData.consultationFee : 500,
        age: !isDoctor ? formData.age : undefined,
      });

      const storageKey = data.role === 'doctor' ? 'doctorInfo' : 'userInfo';
      localStorage.setItem(storageKey, JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Account</h1>
          <p className="text-neutral-500">Choose your role first, then share the details for that role.</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            data-testid="signup-role-patient"
            type="button"
            onClick={() => setRole('patient')}
            className={`rounded-xl border p-4 text-left transition ${role === 'patient' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'}`}
          >
            <div className="font-semibold text-neutral-900">Patient</div>
            <div className="text-sm text-neutral-600">Book appointments and manage your care.</div>
          </button>
          <button
            data-testid="signup-role-doctor"
            type="button"
            onClick={() => setRole('doctor')}
            className={`rounded-xl border p-4 text-left transition ${role === 'doctor' ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'}`}
          >
            <div className="font-semibold text-neutral-900">Doctor</div>
            <div className="text-sm text-neutral-600">Set up your professional profile.</div>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <input data-testid="signup-name" type="text" value={formData.name} onChange={(e) => setField('name', e.target.value)} className="w-full p-3 border border-neutral-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input data-testid="signup-email" type="email" value={formData.email} onChange={(e) => setField('email', e.target.value)} className="w-full p-3 border border-neutral-300 rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input data-testid="signup-password" type="password" value={formData.password} onChange={(e) => setField('password', e.target.value)} className="w-full p-3 border border-neutral-300 rounded-lg" required minLength="6" />
          </div>

          {!isDoctor ? (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Age</label>
              <input data-testid="signup-age" type="number" min="0" value={formData.age} onChange={(e) => setField('age', e.target.value)} className="w-full p-3 border border-neutral-300 rounded-lg" required />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Specializations</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctorSpecializations.map((specialization) => (
                      <button
                        data-testid={`signup-specialization-${specialization.toLowerCase().replace(/\s+/g, '-')}`}
                        key={specialization}
                      type="button"
                      onClick={() => toggleSpecialization(specialization)}
                      className={`rounded-xl border p-3 text-left ${formData.specializations.includes(specialization) ? 'border-primary-600 bg-primary-50' : 'border-neutral-200'}`}
                    >
                      {specialization}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Experience Years</label>
                  <input data-testid="signup-experience-years" type="number" min="0" value={formData.experienceYears} onChange={(e) => setField('experienceYears', e.target.value)} className="w-full p-3 border border-neutral-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Consultation Fee</label>
                  <input data-testid="signup-consultation-fee" type="number" min="0" value={formData.consultationFee} onChange={(e) => setField('consultationFee', e.target.value)} className="w-full p-3 border border-neutral-300 rounded-lg" required />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg disabled:opacity-70">
            {loading ? 'Creating account...' : `Create ${isDoctor ? 'Doctor' : 'Patient'} Account`}
          </button>
        </form>

        <div className="mt-6">
          <GoogleSignInButton onCredential={handleGoogleRegister} prompt="Sign up with Google" />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
