import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      
      // Redirect based on role
      if (user.role === 'guardian') {
        navigate('/guardian/dashboard');
      } else {
        navigate('/user/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy-900">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-navy-900 via-royal-600/20 to-navy-900" />
      
      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SafeSphere</h1>
            <p className="text-navy-200">Welcome back. Please login to your account.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-900 font-bold rounded-xl shadow-lg shadow-gold-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-navy-200">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gold-400 hover:text-gold-300 font-semibold underline">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
