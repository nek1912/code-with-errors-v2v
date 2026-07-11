import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Copy, Check, QrCode, Link, Mail, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

export default function InviteGuardian() {
  const user = useAppStore(state => state.user);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateLink = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/api/guardian/invite', { userId: user?.id });
      setInviteLink(data.inviteLink || `${window.location.origin}/guardian/invite/${data.token || 'demo-token'}`);
    } catch {
      setInviteLink(`${window.location.origin}/guardian/invite/demo-token-abc123`);
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-display-md text-ink" style={{ letterSpacing: '-0.02em' }}>
          Invite Guardian
        </h1>
        <p className="text-body text-muted mt-1">Share your safety link with trusted people</p>
      </div>

      {/* Generate link */}
      {!inviteLink ? (
        <div className="card-cream p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-title-md text-ink mb-2">Generate Invite Link</h3>
          <p className="text-body-sm text-muted mb-6 max-w-sm mx-auto">
            Create a unique link to invite guardians who will monitor your safety
          </p>
          <button onClick={generateLink} disabled={generating} className="btn-primary">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <Link className="w-4 h-4" />
                Generate Link
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Link display */}
          <div className="card-cream p-5">
            <label className="block text-caption text-muted mb-2 font-medium">Your Invite Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="input-field flex-1 bg-surface-soft font-mono text-body-sm"
              />
              <button onClick={handleCopy} className="btn-secondary">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted" />}
              </button>
            </div>
          </div>

          {/* Share options */}
          <div>
            <h3 className="text-title-md text-ink mb-3">Share via</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: QrCode, label: 'QR Code', desc: 'Scan to connect' },
                { icon: Mail, label: 'Email', desc: 'Send via email' },
                { icon: Link, label: 'Copy Link', desc: 'Share anywhere', action: handleCopy },
              ].map((method, i) => {
                const Icon = method.icon;
                return (
                  <button
                    key={i}
                    onClick={method.action}
                    className="card-cream p-4 text-center hover:shadow-md transition-all"
                  >
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-body-sm font-medium text-ink">{method.label}</p>
                    <p className="text-caption text-muted-soft">{method.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* How it works */}
          <div className="card-cream p-5">
            <h3 className="text-body font-medium text-ink mb-3">How it works</h3>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Share this link with someone you trust' },
                { step: '2', text: 'They create a guardian account' },
                { step: '3', text: 'They can monitor your safety in real-time' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-caption font-medium text-primary">{item.step}</span>
                  </div>
                  <p className="text-body-sm text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
