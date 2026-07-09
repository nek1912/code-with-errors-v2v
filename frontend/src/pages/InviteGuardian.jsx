import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';

export default function InviteGuardian() {
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInvite = async () => {
    setLoading(true);
    try {
      console.log('Generating invite...');
      const res = await axios.post('http://localhost:3000/api/guardian/generate-invite', {
        userId: '550e8400-e29b-41d4-a716-446655440000', // Must be a valid UUID format
        relationship: 'Guardian',
        guardianEmail: ''
      });
      console.log('✅ Invite generated:', res.data);
      setInviteData(res.data);
    } catch (err) {
      console.error('❌ Error generating invite:', err);
      console.error('Error response:', err.response?.data);
      alert(`Error: ${err.response?.data?.message || err.response?.data?.error || 'Failed to generate invite'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteData) {
      navigator.clipboard.writeText(inviteData.inviteLink);
      alert('Link copied to clipboard!');
    }
  };

  const shareWhatsApp = () => {
    if (inviteData) {
      const text = encodeURIComponent(`Hey! I'm using SafeSphere. Please accept my request to be my safety guardian: ${inviteData.inviteLink}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center p-6 h-full bg-gray-900 text-white overflow-y-auto pb-24">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
        <span className="text-3xl">👥</span>
      </div>
      <h1 className="text-3xl font-extrabold mb-2 text-center">Invite a Guardian</h1>
      <p className="text-gray-400 mb-8 text-center max-w-sm">
        Guardians can track your live location and receive instant alerts if you trigger an SOS.
      </p>

      {!inviteData ? (
        <button
          onClick={generateInvite}
          disabled={loading}
          className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Invite Link'}
        </button>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-2xl">
          <h3 className="text-lg font-bold mb-4 text-blue-400">Scan to Accept</h3>
          
          <div className="bg-white p-4 rounded-xl mb-6 shadow-inner flex justify-center">
            <QRCode value={inviteData.inviteLink} size={200} />
          </div>

          <p className="text-xs text-red-400 mb-6 font-bold uppercase tracking-widest bg-red-900/30 px-3 py-1 rounded-full border border-red-500/30">
            Expires in 7 days
          </p>

          <div className="w-full space-y-3">
            <button 
              onClick={copyToClipboard}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold flex items-center justify-center space-x-2 transition"
            >
              <span>📋</span>
              <span>Copy Link</span>
            </button>
            <button 
              onClick={shareWhatsApp}
              className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(22,163,74,0.4)] transition"
            >
              <span>💬</span>
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
