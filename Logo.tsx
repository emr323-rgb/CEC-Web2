import React from 'react';
import logoImg from '@assets/CEC logo.png';

interface LogoProps {
  className?: string;
  width?: string;
  height?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({
  className = '', 
  width = 'auto', 
  height = '48px',
  showText = false,
  textClassName = ''
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center rounded-full bg-white p-2 shadow-lg overflow-hidden" 
        style={{ 
          boxShadow: '0 3px 20px rgba(90, 158, 151, 0.2)'
        }}>
        <img 
          src={logoImg}
          alt="Complete Eating Care Logo" 
          className="object-contain w-full h-full" 
          style={{ 
            maxHeight: height,
            maxWidth: width === 'auto' ? 'none' : width 
          }}
        />
      </div>
      {showText && (
        <span className={`font-montserrat text-2xl text-white font-semibold tracking-wide ${textClassName}`}
          style={{ letterSpacing: '1px' }}>
          Complete Eating Care
        </span>
      )}
    </div>
  );
}