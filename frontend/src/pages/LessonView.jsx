import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Award, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const userId = useAppStore(state => state.userId) || '550e8400-e29b-41d4-a716-446655440000';

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    fetchLesson();
    fetchQuiz();
  }, [lessonId]);

  // Scroll listener for progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      
      // Post progress if it passes certain thresholds (debouncing in real app)
      if (progress > 10 && progress % 20 === 0) {
        axios.post('http://localhost:3000/api/learning/progress', {
          userId,
          lessonId,
          progress
        }).catch(err => console.error(err));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/learning/lesson/${lessonId}`);
      setLesson(res.data.lesson);
    } catch (err) {
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/learning/quiz/${lessonId}`);
      if (res.data.quiz) {
        setQuiz(res.data.quiz);
      }
    } catch (err) {
      // 404 means no quiz, which is fine
      if (err.response?.status !== 404) {
        console.error('Error fetching quiz:', err);
      }
    }
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      selectedOption: answers[qId]
    }));

    if (formattedAnswers.length !== quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:3000/api/learning/quiz/submit', {
        userId,
        lessonId,
        quizId: quiz.id,
        answers: formattedAnswers
      });

      setQuizResult(res.data);
      
      // Auto complete lesson if passed
      if (res.data.passed) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }

    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !lesson) {
    return <div className="p-8 text-center text-navy-600">Loading lesson...</div>;
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto min-h-screen bg-navy-900">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center">
        <button 
          onClick={() => navigate('/user/learn')}
          className="p-2 bg-navy-800 rounded-full hover:bg-navy-700 transition-colors"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="ml-4 flex-1">
          <span className="text-xs text-royal-500 font-bold uppercase tracking-wider">{lesson.learning_categories?.title}</span>
          <h1 className="text-lg font-bold text-white truncate">{lesson.title}</h1>
        </div>
      </div>

      <div className="p-6 space-y-8" ref={contentRef}>
        
        {/* Header Banner */}
        <div className="bg-navy-800 rounded-3xl p-8 border border-navy-700 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-blue-500 to-purple-600"></div>
          <div className="text-5xl mb-4 relative z-10">{lesson.learning_categories?.icon || '📖'}</div>
          <h1 className="text-3xl font-bold text-white mb-2 relative z-10">{lesson.title}</h1>
          <p className="text-navy-600 relative z-10">{lesson.description}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-blue max-w-none">
          {/* Mock Markdown Rendering - in real app use react-markdown */}
          <div dangerouslySetInnerHTML={{ __html: lesson.content || '<p>Loading content...</p>' }} className="text-gray-300 leading-relaxed text-lg" />
        </div>

        {/* Quiz Section */}
        {quiz && !quizResult && (
          <div className="bg-navy-800 border border-navy-700 rounded-3xl p-6 mt-12 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="text-yellow-500" size={28} />
              <h2 className="text-2xl font-bold text-white">Knowledge Check</h2>
            </div>
            
            <div className="space-y-8">
              {quiz.questions.map((q, index) => (
                <div key={q.id} className="space-y-3">
                  <h3 className="text-lg font-medium text-white">{index + 1}. {q.question}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map(optLetter => {
                      const optText = q[`option_${optLetter.toLowerCase()}`];
                      const isSelected = answers[q.id] === optLetter;
                      return (
                        <button
                          key={optLetter}
                          onClick={() => handleOptionSelect(q.id, optLetter)}
                          className={`p-4 rounded-xl text-left transition-all border ${
                            isSelected 
                              ? 'bg-royal-500/20 border-royal-500 text-white ring-2 ring-blue-500/30' 
                              : 'bg-navy-900 border-navy-700 text-gray-300 hover:bg-gray-750'
                          }`}
                        >
                          <span className="font-bold mr-2 text-gray-500">{optLetter}.</span> {optText}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="w-full mt-8 bg-royal-500 hover:bg-royal-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Answers'}
            </button>
          </div>
        )}

        {/* Quiz Result */}
        {quizResult && (
          <div className={`rounded-3xl p-8 border text-center animate-in zoom-in duration-300 ${
            quizResult.passed 
              ? 'bg-green-900/20 border-green-500/50' 
              : 'bg-red-900/20 border-gold-500/50'
          }`}>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              quizResult.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {quizResult.passed ? <CheckCircle2 size={40} /> : <div className="text-4xl">!</div>}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {quizResult.passed ? 'Congratulations!' : 'Keep trying!'}
            </h2>
            <p className="text-gray-300 mb-6">
              You scored <span className="font-bold text-white text-xl">{quizResult.score}%</span>. 
              {quizResult.passed ? ' You passed the knowledge check.' : ` You need ${quiz.passing_marks}% to pass.`}
            </p>

            {quizResult.passed && quizResult.certificateUrl && (
              <a 
                href={quizResult.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-yellow-500/20"
              >
                <Download size={20} />
                <span>Download Certificate</span>
              </a>
            )}

            {!quizResult.passed && (
              <button
                onClick={() => {
                  setQuizResult(null);
                  setAnswers({});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-navy-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                Retry Quiz
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
