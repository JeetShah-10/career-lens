import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';

export default function StudioLayout() {
  return (
    <div
      style={{
        backgroundColor: '#e4dfd7', // Signature architectural stone framing matching Hero
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Inner Luxury Ivory Canvas Card matching Hero inner fold */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#faf7f2', // Warm luminous ivory/bone canvas
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(77, 31, 39, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 2.5rem)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Subtle Ambient Decorative Luxury Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(194, 65, 12, 0.05) 0%, rgba(77, 31, 39, 0.03) 50%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Top Header Row - Strictly matching Hero fold: NO top navigation bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2rem 2.75rem 1rem',
            zIndex: 10,
          }}
        >
          {/* Top Left Geometric Logo Mark */}
          <Link
            to="/"
            aria-label="CareerLens Home"
            title="Return to CareerLens Home"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ece6dd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4d1f27',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 6px)', gap: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
            </div>
          </Link>

          {/* Top Right Subtle Brand Mark */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#4d1f27',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4d1f27' }} />
            <span>CAREER LENS PLATFORM</span>
          </div>
        </div>

        {/* Studio Content Viewport with generous dock clearance */}
        <main
          style={{
            flex: 1,
            padding: '1.5rem 2.75rem 12rem', // 12rem ensures content is NEVER blocked by Mac Dock
            position: 'relative',
            zIndex: 1,
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Matching Studio Footer */}
        <Footer />
      </div>
    </div>
  );
}
