import React from 'react';

const Loader = ({ message = "Creating Your Perfume", title = "Please wait...", isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      {/* Floating perfume bottles animation */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-8 h-12 bg-white rounded-t-lg rounded-b-3xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-gray-300 rounded mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Large perfume bottle icon */}
        <div className="relative mx-auto w-24 h-32 mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-300 to-purple-600 rounded-t-2xl rounded-b-full animate-pulse shadow-2xl"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-yellow-400 rounded-t"></div>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-purple-800 rounded animate-pulse"></div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-spin">✨</div>
          <div className="absolute -bottom-2 -left-2 w-3 h-3 text-pink-300 animate-pulse">✨</div>
        </div>

        {/* Loading text */}
        <h1 className="text-white text-3xl font-bold mb-2 animate-pulse drop-shadow-lg">{message}</h1>
        <p className="text-pink-200 text-lg mb-6 drop-shadow">{title}</p>

        {/* Progress indicator */}
        <div className="w-80 mx-auto mb-6">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Animated elements */}
        <div className="flex justify-center space-x-3">
          <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
