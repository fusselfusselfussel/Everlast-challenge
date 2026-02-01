import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold rounded transition-all duration-200 hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-primary text-black hover:bg-primary/80 hover:shadow-lg hover:shadow-yellow-400/50',
    secondary: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/20 hover:shadow-md hover:shadow-yellow-400/30',
    ghost: 'bg-transparent text-primary hover:bg-primary/15 hover:shadow-sm hover:shadow-yellow-400/20',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
