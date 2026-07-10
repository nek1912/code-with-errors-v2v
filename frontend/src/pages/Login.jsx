import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, EyeOff, Eye, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/auth';
import { useAppStore } from '../store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      navigate(user.role === 'guardian' ? '/guardian/dashboard' : '/user/home');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Left panel — dark visual brand */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-surface-dark relative overflow-hidden flex-col justify-between p-10">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-teal/5 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-on-primary" />
            </div>
            <span className="font-display text-xl text-on-dark tracking-tight">SafeSphere</span>
          </Link>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="font-display text-display-lg text-on-dark mb-4" style={{ letterSpacing: '-0.03em' }}>
            Your safety,<br />reimagined.
          </h1>
          <p className="text-on-dark-soft text-body-md leading-relaxed max-w-sm">
            Intelligent companionship for every journey. Real-time protection powered by AI.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {[
            { label: 'AI-powered emergency response', icon: '◆' },
            { label: 'Real-time guardian tracking', icon: '◆' },
            { label: 'End-to-end encrypted evidence vault', icon: '◆' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-primary text-xs">{item.icon}</span>
              <span className="text-on-dark-soft text-body-sm">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-on-primary" />
            </div>
            <span className="font-display text-xl text-ink tracking-tight">SafeSphere</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-display-sm text-ink mb-2" style={{ letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p className="text-muted text-body-sm">
              Sign in to access your safety dashboard
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div className="p-3 bg-error/5 border border-error/20 rounded-lg flex items-center gap-3">
                  <div className="w-1 h-6 bg-error rounded-full shrink-0" />
                  <p className="text-error text-body-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-caption text-muted mb-1.5 font-medium">Email</label>
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-soft hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-hairline text-primary accent-primary" />
                <span className="text-body-sm text-muted group-hover:text-body transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-body-sm text-primary hover:text-primary-active transition-colors font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-body-sm text-muted">
              No account yet?{' '}
              <Link to="/signup" className="text-primary font-medium hover:text-primary-active transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
