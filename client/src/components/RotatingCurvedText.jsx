import React from 'react';

/**
 * RotatingCurvedText - Luxury Editorial Circular Rotating Stamp Badge
 * Renders SVG curved text along a circular path in rich velvet burgundy (#4d1f27).
 */
export default function RotatingCurvedText({
  text = '✦ CAREER LENS PLATFORM • MASTER YOUR TRAJECTORY • EST. 2026 ',
  size = 140,
  textColor = '#4d1f27',
  centerColor = '#4d1f27',
  speedSeconds = 20,
  style = {},
  className = '',
}) {
  const pathId = React.useId().replace(/:/g, '_') + '_circle_path';

  return (
    <div
      className={`rotating-curved-text-badge ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        pointerEvents: 'auto',
        ...style,
      }}
      title="CareerLens Platform • Master Your Trajectory"
    >
      {/* Outer Rotating SVG Track */}
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{
          animation: `spinCurvedText ${speedSeconds}s linear infinite`,
          transformOrigin: 'center center',
          display: 'block',
        }}
      >
        <defs>
          <path
            id={pathId}
            d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
            fill="none"
          />
        </defs>

        <text
          fill={textColor}
          fontSize="11.5"
          fontWeight="800"
          letterSpacing="3.2px"
          style={{
            fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
            textTransform: 'uppercase',
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>

      {/* Central Iconic Luxury Emblem */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg
          width={size * 0.3}
          height={size * 0.3}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 8-pointed star glyph */}
          <path
            d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z"
            fill={centerColor}
          />
          <circle cx="12" cy="12" r="2.5" fill="#faf7f2" />
        </svg>
      </div>

      <style>{`
        @keyframes spinCurvedText {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
