import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/auth';
import { useAppStore } from '../store/useAppStore';

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [guardians, setGuardians] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('Mother');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = authService.getToken();
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch profile
      const { data: profileData } = await axios.get('http://localhost:3000/api/profile/me', config);
      setProfile(profileData.user);
      setFormData(prev => ({ ...prev, name: profileData.user.name, email: profileData.user.email }));

      // Fetch guardians
      const { data: guardiansData } = await axios.get('http://localhost:3000/api/profile/guardians', config);
      setGuardians(guardiansData.guardians);

      // Fetch journeys
      const { data: journeysData } = await axios.get('http://localhost:3000/api/profile/journeys', config);
      setJourneys(journeysData.journeys);

      // Fetch learning stats
      const { data: learningData } = await axios.get(`http://localhost:3000/api/learning/dashboard?userId=${profileData.user.id}`, config);
      setLearningStats(learningData);

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      await axios.put('http://localhost:3000/api/profile/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      fetchProfileData();
    } catch (error) {
      alert(error.response?.data?.error || 'Update failed');
    }
  };

  const handleInviteGuardian = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      await axios.post('http://localhost:3000/api/guardian/generate-invite', {
        userId: user.id,
        guardianEmail: inviteEmail,
        relationship: inviteRelationship
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Invite sent!');
      setInviteEmail('');
      fetchProfileData();
    } catch (error) {
      alert(error.response?.data?.error || 'Invite failed');
    }
  };

  const handleRemoveGuardian = async (guardianId) => {
    if (!window.confirm('Remove this guardian?')) return;
    try {
      const token = authService.getToken();
      await axios.delete(`http://localhost:3000/api/profile/guardians/${guardianId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProfileData();
    } catch (error) {
      alert('Failed to remove guardian');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-navy-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'guardians', label: 'Guardians', icon: '🛡️' },
    { id: 'journeys', label: 'Journey History', icon: '📍' },
    { id: 'learning', label: 'Learning', icon: '🎓' }
  ];

  return (
    <div className="w-full h-full bg-navy-900 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile Dashboard</h1>
          <p className="text-navy-200">Manage your account and safety settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
            <div className="text-gold-500 text-3xl mb-2">🛡️</div>
            <div className="text-3xl font-bold text-white">{profile?.stats?.guardians || 0}</div>
            <div className="text-navy-200">Active Guardians</div>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
            <div className="text-gold-500 text-3xl mb-2">🗺️</div>
            <div className="text-3xl font-bold text-white">{profile?.stats?.journeys || 0}</div>
            <div className="text-navy-200">Total Journeys</div>
          </div>
          <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
            <div className="text-gold-500 text-3xl mb-2">🎓</div>
            <div className="text-3xl font-bold text-white">{learningStats?.certificates || 0}</div>
            <div className="text-navy-200">Certificates Earned</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap shadow-sm ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-navy-900 shadow-gold-500/20'
                  : 'bg-navy-800 text-navy-200 hover:bg-navy-700 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-navy-200 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-200 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                  <div className="pt-4 border-t border-navy-700">
                    <label className="block text-sm font-medium text-navy-200 mb-2">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="••••••••"
                    />
                  </div>
                  {formData.newPassword && (
                    <div>
                      <label className="block text-sm font-medium text-navy-200 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        required
                        className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded-xl transition-all shadow-lg shadow-gold-500/20"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}

            {/* Guardians Tab */}
            {activeTab === 'guardians' && (
              <div className="space-y-6">
                {/* Invite Form */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6">Invite Guardian</h2>
                  <form onSubmit={handleInviteGuardian} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-navy-200 mb-2">Guardian Email</label>
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                          placeholder="guardian@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy-200 mb-2">Relationship</label>
                        <select
                          value={inviteRelationship}
                          onChange={(e) => setInviteRelationship(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                        >
                          <option>Mother</option>
                          <option>Father</option>
                          <option>Sister</option>
                          <option>Brother</option>
                          <option>Friend</option>
                          <option>Partner</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold rounded-xl transition-all shadow-lg shadow-gold-500/20"
                    >
                      Send Invite
                    </button>
                  </form>
                </div>

                {/* Guardians List */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-6">Active Guardians</h2>
                  {guardians.length === 0 ? (
                    <p className="text-navy-200 bg-navy-900 p-4 rounded-xl">No guardians added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guardians.map(guardian => (
                        <div key={guardian.id} className="flex items-center justify-between bg-navy-900 border border-navy-700 rounded-xl p-4 hover:border-blue-500/50 transition-colors">
                          <div>
                            <div className="text-white font-semibold flex items-center">
                              {guardian.guardian_email}
                              {guardian.status === 'PENDING' && (
                                <span className="ml-2 text-[10px] uppercase tracking-wider bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Pending</span>
                              )}
                            </div>
                            <div className="text-navy-400 text-sm mt-1">{guardian.relationship}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveGuardian(guardian.id)}
                            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all text-sm font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Journey History Tab */}
            {activeTab === 'journeys' && (
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Journey History</h2>
                {journeys.length === 0 ? (
                  <p className="text-navy-200 bg-navy-900 p-4 rounded-xl">No journeys recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {journeys.map(journey => (
                      <div key={journey.id} className="flex flex-col md:flex-row md:items-center justify-between bg-navy-900 border border-navy-700 rounded-xl p-4 hover:border-blue-500/30 transition-colors">
                        <div className="mb-2 md:mb-0">
                          <div className="text-white font-semibold text-lg">{journey.destination_name}</div>
                          <div className="text-navy-400 text-sm mt-1 flex items-center gap-4">
                            <span>Started: {new Date(journey.created_at).toLocaleString()}</span>
                            {journey.ended_at && <span>Ended: {new Date(journey.ended_at).toLocaleTimeString()}</span>}
                          </div>
                        </div>
                        <div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                            journey.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                            journey.status === 'EMERGENCY' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {journey.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Learning Tab */}
            {activeTab === 'learning' && (
              <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">Learning Progress</h2>
                {learningStats ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-navy-900 rounded-xl p-4 text-center border border-navy-700">
                        <div className="text-3xl font-bold text-white">{learningStats.completedLessons || 0}</div>
                        <div className="text-navy-300 text-sm mt-1">Lessons Completed</div>
                      </div>
                      <div className="bg-navy-900 rounded-xl p-4 text-center border border-navy-700">
                        <div className="text-3xl font-bold text-white">{learningStats.averageScore || 0}%</div>
                        <div className="text-navy-300 text-sm mt-1">Avg Score</div>
                      </div>
                      <div className="bg-navy-900 rounded-xl p-4 text-center border border-navy-700">
                        <div className="text-3xl font-bold text-white">{learningStats.certificates || 0}</div>
                        <div className="text-navy-300 text-sm mt-1">Certificates</div>
                      </div>
                      <div className="bg-navy-900 rounded-xl p-4 text-center border border-navy-700">
                        <div className="text-3xl font-bold text-white">{learningStats.badges?.length || 0}</div>
                        <div className="text-navy-300 text-sm mt-1">Badges</div>
                      </div>
                    </div>
                    
                    {learningStats.badges && learningStats.badges.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Earned Badges</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {learningStats.badges.map(badge => (
                            <div key={badge.id} className="bg-navy-900 border border-navy-700 rounded-xl p-4 text-center flex flex-col items-center justify-center">
                              <div className="text-4xl mb-3">{badge.icon}</div>
                              <div className="text-white font-semibold text-sm">{badge.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-navy-200 bg-navy-900 p-4 rounded-xl">No learning data available.</p>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Logout Button */}
        <div className="mt-8 mb-16">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold tracking-wide rounded-xl transition-all"
          >
            LOG OUT
          </button>
        </div>

      </div>
    </div>
  );
}
