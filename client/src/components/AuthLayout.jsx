import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import AuthGeometricArt from './AuthGeometricArt';

export default function AuthLayout({
  title = 'Welcome\nto the website!',
  children,
  footerPrompt = "Don't have an account?",
  footerLinkText = 'Sign up',
  footerLinkTo = '/register',
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#e4dfd7', // Signature architectural stone framing matching Hero and Studio
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Floating Centered Card Modal */}
      <div
        className="auth-modal-card"
        style={{
          width: '100%',
          maxWidth: '960px',
          minHeight: '580px',
          backgroundColor: '#fbfbe8',
          borderRadius: '26px',
          boxShadow: '0 25px 60px -12px rgba(77, 31, 39, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.7)',
          display: 'grid',
          gridTemplateColumns: 'minmax(380px, 1.08fr) 1fr',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left Form Column - Light Cream / Ivory matching Reference Image */}
        <div
          style={{
            backgroundColor: '#fbfbe8',
            padding: '2.5rem 2.75rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Top Section: Logo & Welcome Heading */}
          <div>
            {/* Top Brand Logo */}
            <div style={{ marginBottom: '1.75rem' }}>
              <Link
                to="/"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 4px)', gap: '3px' }}>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#fbfbe8', borderRadius: '1px' }} />
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#fbfbe8', borderRadius: '1px' }} />
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#fbfbe8', borderRadius: '1px' }} />
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#fbfbe8', borderRadius: '1px' }} />
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#1d4ed8',
                    textTransform: 'uppercase',
                    fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
                  }}
                >

                </span>
              </Link>
            </div>

            {/* Prominent Welcome Headline */}
            <h1
              style={{
                fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#1d4ed8',
                lineHeight: 1.15,
                margin: '0 0 1.5rem',
                whiteSpace: 'pre-line',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>

            {/* Form Slot */}
            <div style={{ maxWidth: '360px' }}>{children}</div>
          </div>

          {/* Bottom Footer: Social Icons & Prompt */}
          <div
            style={{
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Social Icons matching reference image */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.15rem',
              }}
            >
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                style={{ color: '#1d4ed8', transition: 'transform 0.15s ease', display: 'flex' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                style={{ color: '#1d4ed8', transition: 'transform 0.15s ease', display: 'flex' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                style={{ color: '#1d4ed8', transition: 'transform 0.15s ease', display: 'flex' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                style={{ color: '#1d4ed8', transition: 'transform 0.15s ease', display: 'flex' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
              </a>
            </div>

            {/* Switch Link */}
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              <span>{footerPrompt} </span>
              <Link
                to={footerLinkTo}
                style={{
                  color: '#1d4ed8',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {footerLinkText}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Geometric Shards Artwork Column */}
        <div
          className="auth-art-column"
          style={{
            position: 'relative',
            height: '100%',
            minHeight: '520px',
            overflow: 'hidden',
          }}
        >
          {/* Geometric artwork pane */}

          <AuthGeometricArt />
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .auth-modal-card {
            grid-template-columns: 1fr !important;
            max-width: 460px !important;
          }
          .auth-art-column {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
