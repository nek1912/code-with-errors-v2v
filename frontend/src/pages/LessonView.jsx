import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, Clock, BookOpen, ChevronRight, ChevronLeft,
  Shield, Lightbulb, AlertTriangle, Star
} from 'lucide-react';
import api from '../services/api';

const fallbackLesson = {
  id: 1,
  title: 'Street Safety Awareness',
  category: 'safety',
  duration: 5,
  completed: false,
  difficulty: 'Beginner',
  rating: 4.8,
  content: [
    {
      type: 'intro',
      body: 'Being aware of your surroundings is the most important aspect of personal safety. This lesson covers essential tips for staying safe while walking on streets, especially at night.'
    },
    {
      type: 'text',
      title: 'Stay Alert and Aware',
      body: 'Always be aware of your surroundings. Avoid distractions like looking at your phone while walking. Keep your head up, make eye contact with people around you, and trust your instincts. If something feels wrong, it probably is.'
    },
    {
      type: 'tip',
      body: 'Keep your phone charged and accessible at all times. Enable location sharing with your guardians through SafeSphere.'
    },
    {
      type: 'text',
      title: 'Choose Safe Routes',
      body: 'Stick to well-lit, populated areas. Avoid shortcuts through unfamiliar or isolated areas. Use the SafeSphere Live Map to find safe places nearby like police stations, hospitals, and 24/7 stores.'
    },
    {
      type: 'text',
      title: 'Let Someone Know',
      body: 'Always tell someone where you are going and when you expect to arrive. Use the SafeSphere journey tracker to share your real-time location with guardians.'
    },
    {
      type: 'warning',
      body: 'If you feel you are being followed, do not go home. Head to a public place or call emergency services immediately.'
    },
  ],
  quiz: [
    {
      question: 'What should you do if you feel someone is following you?',
      options: [
        'Run home as fast as you can',
        'Head to a public place or call emergency services',
        'Ignore it and keep walking',
        'Confront the person directly'
      ],
      correct: 1
    },
    {
      question: 'Which of these is NOT a recommended safety practice?',
      options: [
        'Walking in well-lit areas',
        'Sharing your location with guardians',
        'Wearing noise-canceling headphones at night',
        'Staying aware of your surroundings'
      ],
      correct: 2
    }
  ]
};

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data } = await api.get(`/api/learning/${lessonId}`);
      setLesson(data.lesson || data);
    } catch {
      setLesson(fallbackLesson);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await api.post(`/api/learning/${lessonId}/complete`);
    } catch {}
    setCompleted(true);
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const submitQuiz = () => {
    let score = 0;
    lesson.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === lesson.quiz.length) {
      handleComplete();
    }
  };

  const content = lesson?.content || [];
  const totalSteps = content.length + (lesson?.quiz ? 1 : 0);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 bg-surface-soft rounded w-48 animate-pulse" />
        <div className="card-cream p-8 animate-pulse">
          <div className="h-6 bg-surface-soft rounded w-3/4 mb-4" />
          <div className="h-4 bg-surface-soft rounded w-full mb-2" />
          <div className="h-4 bg-surface-soft rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/user/learning-hub')}
        className="flex items-center gap-2 text-body-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Learning Hub
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="badge-pill">{lesson.category}</span>
          <span className="badge-pill bg-surface-soft">{lesson.difficulty || 'Beginner'}</span>
          <span className="flex items-center gap-1 text-caption text-muted-soft">
            <Clock className="w-3 h-3" /> {lesson.duration} min
          </span>
          {lesson.rating && (
            <span className="flex items-center gap-1 text-caption text-muted-soft">
              <Star className="w-3 h-3 text-accent-amber" /> {lesson.rating}
            </span>
          )}
        </div>
        <h1 className="font-display text-display-sm text-ink" style={{ letterSpacing: '-0.02em' }}>
          {lesson.title}
        </h1>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-soft rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Content */}
      {!showQuiz ? (
        <div className="space-y-4">
          {content.map((block, i) => {
            if (i !== currentStep) return null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {block.type === 'intro' && (
                  <div className="card-dark rounded-xl p-6">
                    <BookOpen className="w-8 h-8 text-primary mb-3" />
                    <p className="text-body leading-relaxed text-on-dark">{block.body}</p>
                  </div>
                )}
                {block.type === 'text' && (
                  <div className="card-cream p-6">
                    {block.title && (
                      <h3 className="text-title-md text-ink mb-3">{block.title}</h3>
                    )}
                    <p className="text-body leading-relaxed text-ink">{block.body}</p>
                  </div>
                )}
                {block.type === 'tip' && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body-sm font-medium text-ink mb-1">Pro Tip</p>
                        <p className="text-body-sm leading-relaxed text-ink">{block.body}</p>
                      </div>
                    </div>
                  </div>
                )}
                {block.type === 'warning' && (
                  <div className="p-4 bg-accent-amber/5 border border-accent-amber/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                      <div>
                        <p className="text-body-sm font-medium text-ink mb-1">Important</p>
                        <p className="text-body-sm leading-relaxed text-ink">{block.body}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Quiz Section */
        <div className="space-y-4">
          <div className="card-dark rounded-xl p-5">
            <h3 className="text-title-md text-on-dark font-body font-medium">Knowledge Check</h3>
            <p className="text-body-sm text-on-dark-soft mt-1">
              Answer all questions to complete this lesson
            </p>
          </div>

          {lesson.quiz.map((q, qi) => (
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.1 }}
              className="card-cream p-5"
            >
              <p className="text-body font-medium text-ink mb-4">
                <span className="text-primary mr-2">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = quizAnswers[qi] === oi;
                  const isCorrect = q.correct === oi;
                  let borderColor = 'border-hairline';
                  let bgColor = 'bg-canvas';
                  if (quizSubmitted) {
                    if (isCorrect) { borderColor = 'border-success'; bgColor = 'bg-success/5'; }
                    else if (isSelected && !isCorrect) { borderColor = 'border-error'; bgColor = 'bg-error/5'; }
                  } else if (isSelected) {
                    borderColor = 'border-primary';
                    bgColor = 'bg-primary/5';
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleQuizAnswer(qi, oi)}
                      disabled={quizSubmitted}
                      className={`w-full p-3 rounded-lg border-2 ${borderColor} ${bgColor} text-left transition-all ${
                        !quizSubmitted ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary bg-primary' : 'border-hairline'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-body-sm text-ink">{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {quizSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`card-cream p-6 text-center ${
                quizScore === lesson.quiz.length ? 'border-2 border-success' : ''
              }`}
            >
              <p className="text-title-md text-ink mb-2">
                Score: {quizScore}/{lesson.quiz.length}
              </p>
              {quizScore === lesson.quiz.length ? (
                <p className="text-body-sm text-success">Perfect! You passed!</p>
              ) : (
                <p className="text-body-sm text-muted">Review the material and try again</p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => {
            if (showQuiz) { setShowQuiz(false); setCurrentStep(content.length - 1); }
            else if (currentStep > 0) setCurrentStep(currentStep - 1);
          }}
          disabled={!showQuiz && currentStep === 0}
          className="btn-secondary"
        >
          <ChevronLeft className="w-4 h-4 text-muted" />
          Previous
        </button>

        <span className="text-caption text-muted-soft">
          {showQuiz ? 'Quiz' : `${currentStep + 1} of ${content.length}`}
        </span>

        {!showQuiz ? (
          <button
            onClick={() => {
              if (currentStep < content.length - 1) setCurrentStep(currentStep + 1);
              else if (lesson.quiz) setShowQuiz(true);
              else handleComplete();
            }}
            className="btn-primary"
          >
            {currentStep < content.length - 1 ? 'Next' : lesson.quiz ? 'Take Quiz' : 'Complete'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : !quizSubmitted ? (
          <button
            onClick={submitQuiz}
            disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
            className="btn-primary"
          >
            Submit Quiz
          </button>
        ) : (
          <button onClick={() => navigate('/user/learning-hub')} className="btn-primary">
            Finish
          </button>
        )}
      </div>

      {/* Completion */}
      {(completed || lesson.completed) && !showQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-cream p-5 flex items-center gap-4 border-2 border-success"
        >
          <CheckCircle className="w-8 h-8 text-success shrink-0" />
          <div>
            <p className="text-body font-medium text-ink">Lesson Completed!</p>
            <p className="text-body-sm text-muted">Great job completing this lesson</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
