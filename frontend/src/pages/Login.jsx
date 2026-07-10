import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  Fingerprint, 
  Globe, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  EyeOff, 
  Eye, 
  Loader2,
  Cpu,
  Wifi,
  Navigation
} from 'lucide-react';
import { authService } from '../services/auth';
import { useAppStore } from '../store/useAppStore';

// Import the background image you saved in the frontend folder
import bgImage from '../../background.png';

const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Background Image - Using the exact file you uploaded */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000"
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          transform: 'scale(1.05)' 
        }} 
      />
      
      {/* Dark Overlay & Radial Glow */}
      <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_100%)]" />

      {/* Floating Particles / Map Pins */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: Math.random() * 800, x: Math.random() * 1200, opacity: 0 }}
          animate={{ 
            y: [null, Math.random() * 800], 
            opacity: [0, 0.5, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: 'linear' }}
          className="absolute"
        >
          <MapPin className="text-blue-500/30 w-6 h-6 blur-[1px]" />
        </motion.div>
      ))}

      {/* AI Pulses */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full bg-blue-500/20 blur-xl"
          style={{
            width: Math.random() * 200 + 100,
            height: Math.random() * 200 + 100,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

const FloatingBadge = ({ icon: Icon, text, delay, style }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl absolute"
    style={style}
  >
    <div className="bg-blue-500/20 p-2 rounded-full">
      <Icon className="w-4 h-4 text-blue-400" />
    </div>
    <span className="text-sm font-medium text-white/90">{text}</span>
  </motion.div>
);

const FloatingCard = ({ title, value, status, icon: Icon, delay, style }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.8, ease: 'easeOut' }}
    className="hidden lg:flex flex-col gap-2 p-5 rounded-[24px] bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl absolute min-w-[200px]"
    style={style}
  >
    <div className="flex justify-between items-center mb-1">
      <Icon className="w-5 h-5 text-purple-400" />
      <span className="text-[10px] uppercase tracking-widest font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
        {status}
      </span>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
    <div className="text-xs text-white/50 uppercase tracking-wider">{title}</div>
  </motion.div>
);

const GlassInput = ({ icon: Icon, label, type, value, onChange, placeholder, isValid }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <motion.div 
      className="relative group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Floating Label */}
      <motion.label 
        className={`absolute left-[52px] pointer-events-none transition-all duration-300 z-10 ${
          isFocused || value ? '-top-2.5 text-xs text-blue-400 bg-[#0F172A] px-2 rounded-full' : 'top-5 text-sm text-white/40'
        }`}
      >
        {label}
      </motion.label>

      {/* Input Container */}
      <div className={`
        relative h-[60px] flex items-center rounded-[18px] bg-[rgba(255,255,255,0.03)] 
        border transition-all duration-500 backdrop-blur-sm overflow-hidden
        ${isFocused ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-[rgba(255,255,255,0.06)]' : 'border-white/10 hover:border-white/20'}
      `}>
        {/* Animated Background Glow on Focus */}
        <AnimatePresence>
          {isFocused && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 z-0"
            />
          )}
        </AnimatePresence>

        {/* Left Icon */}
        <div className="pl-4 pr-3 relative z-10">
          <Icon className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-blue-400' : 'text-white/40'}`} />
        </div>

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          required
          className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium relative z-10 placeholder-white/20 h-full py-2"
          style={{ fontFamily: "'Plus Jakarta Sans', 'General Sans', sans-serif" }}
        />

        {/* Right Icons */}
        <div className="pr-4 pl-2 flex items-center gap-2 relative z-10">
          {type === 'password' && (
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {isValid && value.length > 0 && type !== 'password' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

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
      
      if (user.role === 'guardian') {
        navigate('/guardian/dashboard');
      } else {
        navigate('/user/home');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent" style={{ fontFamily: "'Plus Jakarta Sans', 'General Sans', sans-serif" }}>
      <BackgroundEffects />

      {/* Floating Badges (Left) */}
      <FloatingBadge icon={ShieldCheck} text="AI Protection Enabled" delay={0.2} style={{ top: '20%', left: '5%' }} />
      <FloatingBadge icon={Lock} text="End-to-End Encryption" delay={0.4} style={{ top: '40%', left: '8%' }} />
      <FloatingBadge icon={Activity} text="Real-Time Alerts" delay={0.6} style={{ bottom: '25%', left: '6%' }} />

      {/* Floating Cards (Right) */}
      <FloatingCard title="Safety Score" value="98" status="OPTIMAL" icon={Cpu} delay={0.3} style={{ top: '15%', right: '5%' }} />
      <FloatingCard title="AI Monitoring" value="Active" status="ENABLED" icon={Wifi} delay={0.5} style={{ top: '45%', right: '7%' }} />
      <FloatingCard title="Guardian Network" value="Connected" status="LIVE" icon={Navigation} delay={0.7} style={{ bottom: '20%', right: '5%' }} />

      {/* Main Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="relative z-10 w-full max-w-[520px] mx-4 rounded-[32px] overflow-hidden"
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-[rgba(255,255,255,0.08)] backdrop-blur-[25px] border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] rounded-[32px]" />
        
        {/* Soft Inner Highlight */}
        <div className="absolute inset-0 rounded-[32px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 p-10 md:p-12 flex flex-col h-full">
          
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center mb-10"
          >
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-150 group-hover:bg-purple-500/30 transition-colors duration-1000" />
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">SafeSphere</h1>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-blue-300/80">AI Powered Women's Safety</p>
          </motion.div>

          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mb-10 text-center md:text-left"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/50 text-sm">Protecting every journey with AI-powered safety.</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-[16px] flex items-center gap-3">
                  <div className="w-1 h-8 bg-red-500 rounded-full" />
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex-1 flex flex-col">
            <div className="space-y-4 mb-8">
              <GlassInput 
                icon={Mail} 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
                isValid={email.includes('@') && email.includes('.')}
              />
              <GlassInput 
                icon={Lock} 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
              <div className="flex justify-between items-center px-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-white/20 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 rounded-sm bg-transparent group-hover:bg-blue-400 transition-colors" />
                  </div>
                  <span className="text-xs text-white/50 font-medium transition-colors group-hover:text-white/80">Remember me</span>
                </label>
                <button type="button" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-[56px] rounded-[18px] bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-bold text-lg shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center relative overflow-hidden group mb-6 disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Login'}
            </motion.button>

            {/* Footer */}
            <div className="text-center mt-2">
              <p className="text-sm text-white/50">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
}

