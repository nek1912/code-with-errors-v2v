import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Eye } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-hairline-soft">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-on-primary" />
          </div>
          <span className="font-display text-lg text-ink tracking-tight">SafeSphere</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost btn-sm">
            Log in
          </button>
          <button onClick={() => navigate('/signup')} className="btn-primary btn-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero — 6/6 editorial split */}
      <main className="flex-1 flex items-center">
        <div className="container-editorial w-full py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — headline + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="badge-coral mb-6">AI-Powered Safety</div>

              <h1 className="font-display text-display-xl text-ink mb-5" style={{ letterSpacing: '-0.03em' }}>
                Your safety,<br />reimagined.
              </h1>

              <p className="text-body text-muted max-w-md mb-8 leading-relaxed">
                Intelligent companionship for every journey. Real-time protection, AI-guided responses, and a guardian network that never sleeps.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/user/home')}
                  className="btn-primary btn-lg group"
                >
                  I am Travelling
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={() => navigate('/guardian/dashboard')}
                  className="btn-secondary btn-lg group"
                >
                  <Eye className="w-4 h-4 text-muted" />
                  I am Watching
                </button>
              </div>
            </motion.div>

            {/* Right — dark product mockup card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="card-dark rounded-xl overflow-hidden">
                {/* Mockup header bar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="ml-3 text-on-dark-soft text-caption font-mono">SafeSphere Dashboard</div>
                </div>
                {/* Mockup content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-on-dark text-title-md font-body font-medium">Live Journey Tracker</p>
                      <p className="text-on-dark-soft text-body-sm mt-0.5">ID: a3f8c2e1</p>
                    </div>
                    <div className="badge-coral">ACTIVE</div>
                  </div>
                  <div className="h-40 bg-surface-dark-elevated rounded-lg flex items-center justify-center border border-white/5">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-on-dark-soft text-caption">Map View</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Safety Score', value: '98', color: 'text-success' },
                      { label: 'ETA', value: '12m', color: 'text-accent-teal' },
                      { label: 'Events', value: '3', color: 'text-accent-amber' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-surface-dark-soft rounded-lg p-3 text-center border border-white/5">
                        <p className={`text-title-md font-body font-medium ${stat.color}`}>{stat.value}</p>
                        <p className="text-on-dark-soft text-caption mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline-soft px-6 md:px-10 py-5">
        <div className="container-editorial flex items-center justify-between">
          <p className="text-caption text-muted-soft">Built for safety hackathons</p>
          <span className="flex items-center gap-1.5 text-caption text-muted-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            System Online
          </span>
        </div>
      </footer>
    </div>
  );
}
