import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Shield, MapPin, Phone, BookOpen, Lightbulb, Copy, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';

const quickActions = [
  { label: 'Safety tips for walking alone', icon: Shield, prompt: 'Give me safety tips for walking alone at night' },
  { label: 'What to do in emergency', icon: Phone, prompt: 'What should I do in an emergency situation?' },
  { label: 'Safe places near me', icon: MapPin, prompt: 'How can I find safe places near me?' },
  { label: 'Self-defense basics', icon: Shield, prompt: 'Teach me basic self-defense moves' },
];

const examplePrompts = [
  'How do I set up my emergency contacts?',
  'What are the safest routes to take at night?',
  'How can I protect myself while traveling alone?',
  'What should I do if I feel followed?',
];

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm SafeSphere AI, your personal safety assistant. I can help you with:\n\n• Safety tips and emergency procedures\n• Self-defense guidance\n• Route safety advice\n• App features and how to use them\n\nHow can I help you stay safe today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const user = useAppStore(state => state.user);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/ai/chat', {
        message: messageText,
        userId: user?.id,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again or check your internet connection.",
        timestamp: new Date(),
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-display text-display-sm text-ink" style={{ letterSpacing: '-0.02em' }}>
          AI Safety Assistant
        </h1>
        <p className="text-body-sm text-muted mt-1">Ask anything about personal safety</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-primary/10'
                  : 'bg-surface-soft border border-hairline'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-primary" />
                  : <User className="w-4 h-4 text-ink" />
                }
              </div>
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === 'assistant'
                  ? 'bg-canvas border border-hairline-soft'
                  : 'bg-surface-dark text-on-dark'
              }`}>
                <p className="text-body-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-hairline-soft/50">
                  <span className="text-caption text-muted-soft">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg.content, i)}
                      className="text-muted-soft hover:text-muted transition-colors"
                    >
                      {copiedIndex === i ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-canvas border border-hairline-soft rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-body-sm text-muted-soft">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (show when few messages) */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-caption text-muted-soft mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(action.prompt)}
                  className="card-cream px-3 py-2 flex items-center gap-2 hover:shadow-md transition-all text-body-sm text-muted hover:text-ink"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-hairline-soft pt-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-soft" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about safety tips, emergency procedures..."
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-caption text-muted-soft mt-2 text-center">
          AI responses are for informational purposes only. In emergencies, always call emergency services.
        </p>
      </div>
    </div>
  );
}
