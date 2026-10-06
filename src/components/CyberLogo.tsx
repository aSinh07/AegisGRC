import React, { useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface CyberLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

export const CyberLogo: React.FC<CyberLogoProps> = ({
  size = 'md',
  showText = true,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const dimensionClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  }[size];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-3 cursor-pointer select-none group"
    >
      {/* 3D Geometric Cyber Shield with Animated Neon Rings */}
      <div className={`relative ${dimensionClass} flex items-center justify-center`}>
        {/* Pulsing Outer Ambient Glow */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-teal-500/20 to-indigo-500/30 blur-md transition-all duration-500 ${
            isHovered ? 'scale-125 opacity-100' : 'scale-100 opacity-60'
          }`}
        />

        {/* Rotating Geometric Circuit Hexagon (SVG) */}
        <svg
          className={`absolute inset-0 w-full h-full transition-transform duration-700 ${
            isHovered ? 'rotate-90' : 'rotate-0'
          }`}
          viewBox="0 0 100 100"
        >
          <polygon
            points="50,4 93,27 93,73 50,96 7,73 7,27"
            fill="none"
            stroke="rgba(6, 182, 212, 0.45)"
            strokeWidth="2.5"
            strokeDasharray="8 4"
          />
          <circle cx="50" cy="4" r="2.5" fill="#22d3ee" />
          <circle cx="93" cy="27" r="2.5" fill="#14b8a6" />
          <circle cx="93" cy="73" r="2.5" fill="#6366f1" />
          <circle cx="50" cy="96" r="2.5" fill="#22d3ee" />
          <circle cx="7" cy="73" r="2.5" fill="#14b8a6" />
          <circle cx="7" cy="27" r="2.5" fill="#6366f1" />
        </svg>

        {/* Center Metallic Shield Core */}
        <div className="relative z-10 flex items-center justify-center h-4/5 w-4/5 rounded-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-cyan-400/50 shadow-inner group-hover:border-cyan-300 transition-colors">
          <Shield className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-transform duration-300 group-hover:scale-110" />
        </div>

        {/* Quantum Sparkle Indicator */}
        <div className="absolute -top-1 -right-1 z-20">
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>
      </div>

      {/* Brand Wordmark & Dynamic Cyber Subtitle */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-lg group-hover:text-cyan-300 transition-colors">
              Aegis<span className="text-cyan-400">GRC</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 tracking-wider uppercase">
              v2.6
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 tracking-tight flex items-center gap-1">
            <span>Unified Control Plane</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400/80">Zero-Trust</span>
          </span>
        </div>
      )}
    </div>
  );
};
