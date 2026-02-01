import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glowing = false }) => {
  const baseClasses = 'bg-black border-2 border-primary rounded-lg';
  const glowClass = glowing ? 'glow-yellow' : '';
  
  return (
    <div className={`${baseClasses} ${glowClass} ${className}`}>
      {children}
    </div>
  );
};
