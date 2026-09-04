import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.jsx';
import { API_BASE_URL, IS_BACKEND_URL_DEFAULTED, withApiBase } from '../../config/env.js';
import { registerPushToken } from '../../services/pushNotifications.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (IS_BACKEND_URL_DEFAULTED && !window.location.hostname.includes('localhost')) {
      setError(`Backend URL is not configured. Set VITE_API_URL to your Render backend. Current fallback: ${API_BASE_URL}`);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(withApiBase('/api/auth/login'), { email, password });
      const storageKey = data.role === 'doctor' ? 'doctorInfo' : 'userInfo';
      localStorage.setItem(storageKey, JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    setLoading(true);
    setError('');

    if (IS_BACKEND_URL_DEFAULTED && !window.location.hostname.includes('localhost')) {
      setError(`Backend URL is not configured. Set VITE_API_URL to your Render backend. Current fallback: ${API_BASE_URL}`);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(withApiBase('/api/auth/google'), {
        idToken: credential,
        mode: 'login',
      });
      const storageKey = data.role === 'doctor' ? 'doctorInfo' : 'userInfo';
      localStorage.setItem(storageKey, JSON.stringify(data));
      registerPushToken(data).catch(() => {});
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
          <p className="text-neutral-500">Sign in to your Sushi Polyclinic account</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input 
              data-testid="login-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input 
              data-testid="login-password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <GoogleSignInButton onCredential={handleGoogleLogin} prompt="Continue with Google" />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
