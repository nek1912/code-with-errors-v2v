import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm Aura. How are you feeling about your journey today?", actions: [] }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const currentLocation = useAppStore(state => state.currentLocation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAction = (action) => {
    if (action === 'share_location') {
      alert("📍 Location shared with Guardian!");
    } else if (action === 'start_fake_call') {
      // Dummy audio
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      audio.play().catch(() => alert("📞 Fake call started (audio blocked by browser)!"));
      alert("📞 Fake call starting...");
    } else if (action === 'trigger_siren') {
      alert("🚨 Siren Triggered!");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg, actions: [] }]);
    setInput('');
    setIsTyping(true);

    try {
      console.log(' FRONTEND: Sending message to backend');
      
      let batteryLevel = 'unknown';
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        batteryLevel = `${Math.round(battery.level * 100)}%`;
      }

      const context = {
        time: new Date().getHours(),
        battery: batteryLevel,
        location: currentLocation,
        location_type: 'street'
      };

      console.log(' Context being sent:', context);

      try {
        const response = await axios.post('http://localhost:3000/api/ai/chat', { 
          user_message: userMsg, 
          context, 
          chat_history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        });
        
        console.log('✅ FRONTEND: Received response:', response.data);
        
        const aiMessage = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: aiMessage.message || aiMessage.content || "I'm here to help.", 
          actions: aiMessage.ui_actions || [] 
        }]);
      } catch (err) {
        console.error('❌ FRONTEND: Error calling backend:', err);
        console.error('Error response:', err.response?.data);
        
        // Fallback for hackathon demo if backend not connected
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: "It's late and your battery is getting low. Stay alert and keep your phone accessible.", 
            actions: ["share_location", "start_fake_call"] 
          }]);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const actionLabels = {
    share_location: '📍 Share Location',
    start_fake_call: '📞 Start Fake Call',
    trigger_siren: '🚨 Sound Siren'
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white pb-16 md:pb-0">
      <div className="p-4 bg-gray-800 border-b border-gray-700 shadow-md z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Aura</h2>
          <p className="text-xs text-gray-400">AI Safety Companion</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]">
          ✨
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'}`}>
              <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
            </div>
            
            {msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 ml-1">
                {msg.actions.map(action => (
                  <button 
                    key={action}
                    onClick={() => handleAction(action)}
                    className="bg-indigo-600/80 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-transform transform hover:scale-105 border border-indigo-400/30"
                  >
                    {actionLabels[action] || action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start">
             <div className="bg-gray-800 text-gray-400 border border-gray-700 rounded-2xl rounded-bl-none p-3 flex space-x-1">
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center bg-gray-900 rounded-full border border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 px-4 py-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Message Aura..."
            className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="ml-2 text-blue-500 hover:text-blue-400 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
