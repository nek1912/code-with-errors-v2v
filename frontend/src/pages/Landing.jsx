import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-6 text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-pulse">
        <span className="text-4xl">🛡️</span>
      </div>
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">SafeSphere</h1>
      <p className="text-gray-400 mb-12 max-w-md text-lg">The intelligent safety companion for women. Are you travelling today, or keeping an eye on someone?</p>
      
      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button 
          onClick={() => navigate('/user/home')}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg transition-transform transform hover:scale-105"
        >
          I am Travelling
        </button>
        <button 
          onClick={() => navigate('/guardian/dashboard')}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform transform hover:scale-105"
        >
          I am Watching
        </button>
      </div>
    </div>
  );
}
