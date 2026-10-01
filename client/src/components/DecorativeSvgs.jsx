import React from 'react';

/**
 * 8-Point Editorial Luxury Starburst
 */
export function LuxuryStar({ size = 24, color = '#4d1f27', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <path
        d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * 4-Point Diamond Sparkle
 */
export function DiamondSparkle({ size = 20, color = '#c2410c', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <path
        d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Precision Crosshair Alignment Mark
 */
export function CrosshairMark({ size = 16, color = 'rgba(77, 31, 39, 0.35)', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <line x1="8" y1="0" x2="8" y2="16" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="0" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}

/**
 * Architectural Corner L-Bracket
 */
export function CornerBracket({ size = 20, color = 'rgba(77, 31, 39, 0.4)', orientation = 'top-left', style = {} }) {
  let transform = 'none';
  if (orientation === 'top-right') transform = 'rotate(90deg)';
  if (orientation === 'bottom-right') transform = 'rotate(180deg)';
  if (orientation === 'bottom-left') transform = 'rotate(270deg)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', transform, flexShrink: 0, ...style }}
    >
      <path
        d="M2 22V2H22"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Orbital Concentric Ring Guide
 */
export function OrbitalRings({ size = 320, color = 'rgba(77, 31, 39, 0.08)', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', pointerEvents: 'none', ...style }}
    >
      <circle cx="160" cy="160" r="150" stroke={color} strokeWidth="1" strokeDasharray="3 6" />
      <circle cx="160" cy="160" r="110" stroke={color} strokeWidth="1" />
      <circle cx="160" cy="160" r="70" stroke={color} strokeWidth="1" strokeDasharray="2 4" />
      <circle cx="160" cy="160" r="4" fill={color} />
      <line x1="160" y1="0" x2="160" y2="320" stroke={color} strokeWidth="0.8" strokeDasharray="4 8" />
      <line x1="0" y1="160" x2="320" y2="160" stroke={color} strokeWidth="0.8" strokeDasharray="4 8" />
    </svg>
  );
}

/**
 * Modernist Asterisk Emblem
 */
export function ModernAsterisk({ size = 28, color = '#4d1f27', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
    >
      <g transform="translate(16, 16)">
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={angle}
            x1="-12"
            y1="0"
            x2="12"
            y2="0"
            stroke={color}
            strokeWidth="3.2"
            strokeLinecap="round"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </svg>
  );
}
