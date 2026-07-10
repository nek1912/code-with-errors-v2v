import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { authService } from '../services/auth';
import { useAppStore } from '../store/useAppStore';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await authService.register(name, email, password, userType);
      setUser(user);
      navigate(user.role === 'guardian' ? '/guardian/dashboard' : '/user/home');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left panel — dark visual brand */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-surface-dark relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-amber/5 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-on-primary" />
            </div>
            <span className="font-display text-xl text-on-dark tracking-tight">SafeSphere</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-display-lg text-on-dark mb-4" style={{ letterSpacing: '-0.03em' }}>
            Join the<br />safety network.
          </h1>
          <p className="text-on-dark-soft text-body-md leading-relaxed max-w-sm">
            Create your account and start your first protected journey in under a minute.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { label: 'Choose your role: User or Guardian', icon: '◆' },
            { label: 'Invite guardians via QR or link', icon: '◆' },
            { label: 'Access AI-powered learning hub', icon: '◆' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-primary text-xs">{item.icon}</span>
              <span className="text-on-dark-soft text-body-sm">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <p className="text-on-dark-soft text-body-sm">Built for safety hackathons</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-on-primary" />
            </div>
            <span className="font-display text-xl text-ink tracking-tight">SafeSphere</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-display-sm text-ink mb-2" style={{ letterSpacing: '-0.02em' }}>
              Create your account
            </h2>
            <p className="text-muted text-body-sm">
              Get started with SafeSphere in seconds
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-error/5 border border-error/20 rounded-lg text-error text-body-sm text-center">
              {error}
            </div>
          )}

          {/* Role toggle — shadcn tabs style */}
          <div className="flex bg-surface-soft border border-hairline rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`flex-1 py-2 rounded-md text-button font-medium transition-all ${
                userType === 'user'
                  ? 'bg-canvas text-ink shadow-hairline border border-hairline'
                  : 'text-muted hover:text-body'
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setUserType('guardian')}
              className={`flex-1 py-2 rounded-md text-button font-medium transition-all ${
                userType === 'guardian'
                  ? 'bg-canvas text-ink shadow-hairline border border-hairline'
                  : 'text-muted hover:text-body'
              }`}
            >
              Guardian
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
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
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:text-primary-active transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
