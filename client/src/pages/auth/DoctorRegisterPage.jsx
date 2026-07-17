import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.jsx';
import { API_BASE_URL, IS_BACKEND_URL_DEFAULTED } from '../../config/env.js';
import { registerPushToken } from '../../services/pushNotifications.js';

export default function DoctorRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specializations: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const specializationOptions = ['General', 'Psychology', 'Dietician'];

  const handleSpecializationChange = (spec) => {
    setFormData((prev) => {
      const updatedSpecs = prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec];
      return { ...prev, specializations: updatedSpecs };
    });
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

    if (formData.specializations.length === 0) {
      setError('Please select at least one specialization');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', { 
        ...formData, 
        role: 'doctor' 
      });
      // Automatically log in and redirect to doctor dashboard
      localStorage.setItem('doctorInfo', JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (credential) => {
    try {
      setLoading(true);
      setError('');

      if (IS_BACKEND_URL_DEFAULTED && !window.location.hostname.includes('localhost')) {
        setError(`Backend URL is not configured. Set VITE_API_URL to your Render backend. Current fallback: ${API_BASE_URL}`);
        setLoading(false);
        return;
      }

      if (formData.specializations.length === 0) {
        setError('Please select at least one specialization');
        return;
      }

      const { data: response } = await axios.post('http://localhost:5000/api/auth/google', {
        idToken: credential,
        role: 'doctor',
        mode: 'register',
        specializations: formData.specializations,
      });

      localStorage.setItem('doctorInfo', JSON.stringify(response));
      registerPushToken(response).catch(() => {});
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-blue-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Join as a Doctor</h1>
          <p className="text-neutral-500">Provide your professional details to get verified</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Dr. Jane Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="doctor@hospital.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">Specializations (Select at least one)</label>
            <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              {specializationOptions.map((spec) => (
                <label key={spec} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specializations.includes(spec)}
                    onChange={() => handleSpecializationChange(spec)}
                    className="w-4 h-4 text-blue-600 bg-white border border-neutral-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-neutral-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-70"
            >
              {loading ? 'Submitting Application...' : 'Apply as Doctor'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <GoogleSignInButton onCredential={handleGoogleAuth} prompt="Continue with Google" />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already verified? <Link to="/doctor/login" className="text-blue-600 font-semibold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
