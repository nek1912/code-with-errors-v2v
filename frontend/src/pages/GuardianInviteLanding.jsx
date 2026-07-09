import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GuardianInviteLanding() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      alert("Invalid invite link.");
      navigate('/');
    }
  }, [token, navigate]);

  const acceptInvite = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/guardian/accept-invite', {
        token,
        guardianUserId: 'demo-guardian-456' // Mock auth context
      });
      alert('Invite accepted successfully!');
      navigate('/guardian/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error accepting invite. It may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-6 text-center">
      <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(79,70,229,0.5)] animate-bounce">
        <span className="text-4xl">🛡️</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">Jane Doe</h1>
      <p className="text-gray-400 mb-2 text-lg">wants you to be their Safety Guardian.</p>
      <p className="text-indigo-400 font-bold uppercase tracking-widest mb-10 bg-indigo-900/30 px-4 py-1 rounded-full border border-indigo-500/30 inline-block">
        Relationship: Guardian
      </p>
      
      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button 
          onClick={acceptInvite}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          {loading ? 'Accepting...' : 'Accept & Track'}
        </button>
        <button 
          onClick={() => alert('Redirecting to signup...')}
          disabled={loading}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Sign Up & Accept
        </button>
      </div>
    </div>
  );
}
