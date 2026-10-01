import React from 'react';

/**
 * High-fidelity geometric shard artwork matching the user's reference image:
 * Overlapping faceted origami planes with electric cobalt blue, violet,
 * deep royal blue, and luminous cream/white illuminated surfaces.
 */
export default function AuthGeometricArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1e3a8a',
      }}
    >
      <svg
        viewBox="0 0 1000 850"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'block',
        }}
      >
        <defs>
          {/* Main Top Deep Cobalt to Royal Gradient */}
          <linearGradient id="facet-top-blue" x1="0%" y1="0%" x2="70%" y2="90%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Central Luminous Shard - Brilliant White to Soft Cream/Cyan */}
          <linearGradient id="facet-luminous-shard" x1="20%" y1="90%" x2="80%" y2="10%">
            <stop offset="0%" stopColor="#fdfde8" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#f8fafc" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#dbeafe" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.4" />
          </linearGradient>

          {/* Deep Navy/Indigo Shadow Shard */}
          <linearGradient id="facet-deep-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Center Electric Blue Sharp Triangle */}
          <linearGradient id="facet-electric-blue" x1="30%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="60%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0040c1" />
          </linearGradient>

          {/* Right Pale Folded Plane */}
          <linearGradient id="facet-right-pale" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.7" />
          </linearGradient>

          {/* Atmospheric Glow */}
          <radialGradient id="facet-glow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#1e40af" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Background Fill */}
        <rect width="1000" height="850" fill="#1e3a8a" />

        {/* 1. Upper Left Violet-Blue Shard */}
        <polygon
          points="0,0 480,0 260,850 0,850"
          fill="url(#facet-top-blue)"
        />

        {/* 2. Top Center Sharp Triangular Shard */}
        <polygon
          points="220,0 720,0 420,500"
          fill="url(#facet-top-blue)"
          opacity="0.92"
        />

        {/* 3. Deep Blue Central Rhombus Shard */}
        <polygon
          points="540,400 940,580 720,850 320,850"
          fill="url(#facet-electric-blue)"
        />

        {/* 4. Large Dramatic Luminous White/Cream Diagonal Shard (The Signature Center Feature) */}
        <polygon
          points="0,850 440,380 980,60 1000,850 680,850"
          fill="url(#facet-luminous-shard)"
        />

        {/* 5. Lower Left Bright White Highlight Shard */}
        <polygon
          points="280,850 480,560 620,850"
          fill="#fdfde8"
          opacity="0.92"
        />

        {/* 6. Sharp Floating Deep Blue Diamond */}
        <polygon
          points="520,440 920,580 840,820 440,680"
          fill="url(#facet-deep-shadow)"
        />

        {/* 7. Right Corner Pale Folded Facet */}
        <polygon
          points="700,0 1000,0 1000,580 840,240"
          fill="url(#facet-right-pale)"
        />

        {/* 8. Far Right Bottom Shard */}
        <polygon
          points="840,240 1000,580 1000,850 780,850"
          fill="url(#facet-luminous-shard)"
          opacity="0.88"
        />

        {/* Ambient Subtle Shimmer Overlay */}
        <circle cx="500" cy="400" r="450" fill="url(#facet-glow)" pointerEvents="none" />
      </svg>

      {/* Subtle Noise / Paper Texture Grain Overlay for tactile luxury feel */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 75% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
