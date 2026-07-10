import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

export default function GuardianInviteLanding() {
  const { token } = useParams();
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const [mode, setMode] = useState('register'); // register | login
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        const { data } = await api.post('/api/auth/register', {
          name, email, password, role: 'guardian', inviteToken: token,
        });
        setUser(data.user);
      } else {
        const { data } = await api.post('/api/auth/login', { email, password });
        setUser(data.user);
      }
      navigate('/guardian/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-display text-xl text-ink tracking-tight">SafeSphere</span>
        </div>

        <div className="card-cream rounded-xl p-6">
          {/* Invite badge */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-display-sm text-ink" style={{ letterSpacing: '-0.02em' }}>
              You've been invited
            </h1>
            <p className="text-body-sm text-muted mt-1">Join as a guardian to protect someone you care about</p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-surface-soft border border-hairline rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-button font-medium transition-all ${
                mode === 'register' ? 'bg-canvas text-ink shadow-hairline border border-hairline' : 'text-muted'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-button font-medium transition-all ${
                mode === 'login' ? 'bg-canvas text-ink shadow-hairline border border-hairline' : 'text-muted'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/5 border border-error/20 rounded-lg text-error text-body-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-caption text-muted mb-1.5 font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-field" style={{ paddingLeft: '2.5rem' }}
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field" style={{ paddingLeft: '2.5rem' }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input-field" style={{ paddingLeft: '2.5rem' }}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {mode === 'register' ? 'Become a Guardian' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
