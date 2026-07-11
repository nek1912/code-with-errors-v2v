import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, CheckCircle, Lock, ArrowRight, Search, Star,
  Shield, Phone, Map, Eye, AlertTriangle, Users
} from 'lucide-react';
import api from '../services/api';

const categories = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'safety', label: 'Safety Tips', icon: Shield },
  { id: 'legal', label: 'Legal Rights', icon: Users },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
  { id: 'self-defence', label: 'Self-Defence', icon: Eye },
];

const categoryIcons = {
  safety: Shield,
  legal: Users,
  emergency: AlertTriangle,
  'self-defence': Eye,
};

const fallbackLessons = [
  { id: 1, title: 'Street Safety Awareness', category: 'safety', duration: 5, completed: false, locked: false, difficulty: 'Beginner', rating: 4.8 },
  { id: 2, title: 'Know Your Legal Rights', category: 'legal', duration: 8, completed: true, locked: false, difficulty: 'Intermediate', rating: 4.6 },
  { id: 3, title: 'Emergency Contacts Setup', category: 'emergency', duration: 3, completed: false, locked: false, difficulty: 'Beginner', rating: 4.9 },
  { id: 4, title: 'Basic Self-Defence Moves', category: 'self-defence', duration: 10, completed: false, locked: false, difficulty: 'Intermediate', rating: 4.7 },
  { id: 5, title: 'Public Transport Safety', category: 'safety', duration: 6, completed: false, locked: false, difficulty: 'Beginner', rating: 4.5 },
  { id: 6, title: 'Digital Safety & Privacy', category: 'safety', duration: 7, completed: false, locked: true, difficulty: 'Advanced', rating: 4.4 },
  { id: 7, title: 'Night Travel Precautions', category: 'safety', duration: 5, completed: false, locked: false, difficulty: 'Beginner', rating: 4.8 },
  { id: 8, title: 'First Aid Basics', category: 'emergency', duration: 12, completed: false, locked: true, difficulty: 'Intermediate', rating: 4.9 },
];

export default function LearningHub() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data } = await api.get('/api/learning');
      setLessons(data.lessons || data);
    } catch {
      setLessons(fallbackLessons);
    } finally {
      setLoading(false);
    }
  };

  const filtered = lessons.filter(l => {
    const matchCategory = selectedCategory === 'all' || l.category === selectedCategory;
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const completedCount = lessons.filter(l => l.completed).length;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-md text-ink" style={{ letterSpacing: '-0.02em' }}>
          Learning Hub
        </h1>
        <p className="text-body text-muted mt-1">Build your knowledge, protect yourself</p>
      </div>

      {/* Progress Card */}
      <div className="card-dark rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-on-dark text-title-md font-body font-medium">Your Progress</p>
            <p className="text-on-dark-soft text-body-sm mt-0.5">
              {completedCount} of {lessons.length} lessons completed
            </p>
          </div>
          <div className="w-14 h-14 rounded-full border-3 border-primary flex items-center justify-center" style={{ borderWidth: '3px' }}>
            <span className="text-title-md font-body font-medium text-primary">{progressPercent}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-surface-dark-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
        {/* Achievements */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
          {[
            { label: 'Streak', value: '3 days', icon: '🔥' },
            { label: 'Points', value: '250', icon: '⭐' },
            { label: 'Rank', value: '#42', icon: '🏆' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="text-caption text-on-dark-soft">{item.label}</p>
                <p className="text-body-sm font-medium text-on-dark">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lessons..."
          className="input-field"
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex bg-surface-soft border border-hairline rounded-lg p-1 overflow-x-auto gap-1">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-button font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-canvas text-ink shadow-hairline border border-hairline'
                  : 'text-muted hover:text-body'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Lessons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="card-cream p-5 animate-pulse">
              <div className="h-4 bg-surface-soft rounded w-1/3 mb-3" />
              <div className="h-5 bg-surface-soft rounded w-3/4 mb-2" />
              <div className="h-4 bg-surface-soft rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-cream p-12 text-center">
          <BookOpen className="w-10 h-10 text-muted-soft mx-auto mb-3" />
          <p className="text-body text-muted">No lessons found</p>
          <p className="text-body-sm text-muted-soft mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((lesson, i) => {
            const CatIcon = categoryIcons[lesson.category] || BookOpen;
            return (
              <motion.button
                key={lesson.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !lesson.locked && navigate(`/user/learning/${lesson.id}`)}
                disabled={lesson.locked}
                className={`card-cream p-5 text-left transition-all ${
                  lesson.locked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-md cursor-pointer group'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CatIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="badge-pill text-caption">{lesson.difficulty || lesson.category}</span>
                  </div>
                  {lesson.completed ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : lesson.locked ? (
                    <Lock className="w-5 h-5 text-muted-soft" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-soft group-hover:text-primary transition-colors" />
                  )}
                </div>
                <h3 className="text-body font-medium text-ink mb-2">{lesson.title}</h3>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-caption text-muted-soft">
                    <Clock className="w-3 h-3" /> {lesson.duration} min
                  </span>
                  {lesson.rating && (
                    <span className="flex items-center gap-1 text-caption text-muted-soft">
                      <Star className="w-3 h-3 text-accent-amber" /> {lesson.rating}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
