
import React, { useState } from 'react';
import { speak } from '../services/geminiService';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AudioButton: React.FC<AudioButtonProps> = ({ text, className = "", size = 'md' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await speak(text);
    // Simple timeout for visual feedback since we don't have exact 'ended' callback from service easy
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-4'
  };

  return (
    <button 
      onClick={handlePlay}
      disabled={isPlaying}
      className={`rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center ${sizeClasses[size]} ${className} ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    </button>
  );
};

export default AudioButton;
