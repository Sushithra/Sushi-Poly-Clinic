import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.jsx';
import { registerPushToken } from '../../services/pushNotifications.js';

export default function DoctorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (data.role !== 'doctor') {
        setError('This portal is only for registered healthcare professionals.');
        return;
      }
      if (data.isApproved === false || data.accountStatus === 'pending') {
        setError('Your professional account is still pending approval.');
        return;
      }
      localStorage.setItem('doctorInfo', JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/google', {
        idToken: credential,
        role: 'doctor',
        mode: 'login',
      });

      if (data.role !== 'doctor') {
        setError('This Google account is not set up for the doctor portal.');
        return;
      }

      if (data.isApproved === false || data.accountStatus === 'pending') {
        setError('Your professional account is still pending approval.');
        return;
      }

      localStorage.setItem('doctorInfo', JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate('/doctor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-blue-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Doctor Portal</h1>
          <p className="text-neutral-500">Sign in to manage your appointments</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="dr.smith@hospital.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Sign In as Doctor'}
          </button>
        </form>

        <div className="mt-6">
          <GoogleSignInButton onCredential={handleGoogleLogin} prompt="Continue with Google" />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Not registered as a doctor yet? <Link to="/doctor/register" className="text-blue-600 font-semibold hover:underline">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
