import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Medal, Lock, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LearningHub() {
  const navigate = useNavigate();
  const userId = useAppStore(state => state.userId) || '550e8400-e29b-41d4-a716-446655440000';
  
  const [stats, setStats] = useState({ progress: 0, completedLessons: 0, certificates: 0 });
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();
    fetchCategories();
    fetchLessons(null);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/learning/dashboard?userId=${userId}`);
      setStats(res.data.stats);
      setAllBadges(res.data.allBadges);
      setEarnedBadges(res.data.earnedBadges);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/learning/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchLessons = async (categoryId) => {
    try {
      const url = categoryId 
        ? `http://localhost:3000/api/learning/lessons?categoryId=${categoryId}` 
        : `http://localhost:3000/api/learning/lessons`;
      const res = await axios.get(url);
      setLessons(res.data.lessons);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      fetchLessons(null);
    } else {
      setActiveCategory(categoryId);
      fetchLessons(categoryId);
    }
  };

  const isBadgeEarned = (badgeId) => {
    return earnedBadges.some(b => b.id === badgeId);
  };

  const getBadgeGradient = (name) => {
    if (name.includes('Bronze')) return 'from-yellow-700 to-yellow-900';
    if (name.includes('Silver')) return 'from-gray-300 to-gray-500 text-gray-900';
    if (name.includes('Gold')) return 'from-yellow-300 to-yellow-500 text-gray-900';
    return 'from-purple-500 to-indigo-600';
  };

  if (loading) {
    return <div className="p-8 text-center text-navy-600">Loading Learning Hub...</div>;
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in">
        
        {/* Header */}
        <div className="bg-navy-800 rounded-3xl p-6 border border-navy-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 right-32 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          
          <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Learning Hub</h1>
          <p className="text-navy-600 relative z-10">Empower yourself with safety knowledge and earn certificates.</p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-8 relative z-10">
            <div className="bg-navy-900/50 rounded-2xl p-4 border border-navy-700/50 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-royal-500 mb-2">
                <BookOpen size={20} />
                <span className="font-semibold text-sm">Progress</span>
              </div>
              <span className="text-3xl font-bold text-white">{stats.progress}%</span>
            </div>
            <div className="bg-navy-900/50 rounded-2xl p-4 border border-navy-700/50 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-purple-400 mb-2">
                <Award size={20} />
                <span className="font-semibold text-sm">Certificates</span>
              </div>
              <span className="text-3xl font-bold text-white">{stats.certificates}</span>
            </div>
            <div className="bg-navy-900/50 rounded-2xl p-4 border border-navy-700/50 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <Medal size={20} />
                <span className="font-semibold text-sm">Badges</span>
              </div>
              <span className="text-3xl font-bold text-white">{earnedBadges.length}/{allBadges.length}</span>
            </div>
          </div>
        </div>

        {/* Badges Showcase */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Badges</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
            {allBadges.map((badge) => {
              const earned = isBadgeEarned(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`snap-center shrink-0 w-24 h-24 rounded-full flex flex-col items-center justify-center relative shadow-lg
                    ${earned ? `bg-gradient-to-br ${getBadgeGradient(badge.name)}` : 'bg-navy-800 border-2 border-navy-700'}`}
                >
                  {!earned && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <Lock size={24} className="text-gray-500" />
                    </div>
                  )}
                  {earned && <Medal size={32} className={badge.name.includes('Silver') || badge.name.includes('Gold') ? 'text-gray-900' : 'text-white'} />}
                  {!earned && <span className="text-[10px] text-gray-500 mt-6 text-center leading-tight px-2">{badge.name}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Grid */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border
                  ${activeCategory === cat.id 
                    ? 'bg-royal-500/20 border-royal-500 ring-2 ring-blue-500/50' 
                    : 'bg-navy-800 border-navy-700 hover:bg-gray-750 hover:border-gray-600'}`}
              >
                <div className="text-2xl mb-2">{cat.icon || '📚'}</div>
                <h3 className="font-semibold text-white">{cat.title}</h3>
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Available Lessons</h2>
          <div className="space-y-4">
            {lessons.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No lessons found.</div>
            ) : (
              lessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  onClick={() => navigate(`/user/learn/${lesson.id}`)}
                  className="bg-navy-800 border border-navy-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-navy-700 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {lesson.learning_categories?.icon || '📖'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-royal-500 transition-colors">{lesson.title}</h3>
                      <div className="flex items-center space-x-3 text-xs text-navy-600 mt-1">
                        <span className="bg-navy-700 px-2 py-1 rounded-md">{lesson.difficulty}</span>
                        <span>{lesson.duration} mins</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-navy-600 group-hover:bg-royal-500 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
