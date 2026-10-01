import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import CareerWheelSection from '../components/CareerWheelSection';
import FeatureShowcaseSection from '../components/FeatureShowcaseSection';
import Footer from '../components/Footer';
import RotatingCurvedText from '../components/RotatingCurvedText';
import {
  LuxuryStar,
  DiamondSparkle,
  CrosshairMark,
  CornerBracket,
  OrbitalRings,
  ModernAsterisk,
} from '../components/DecorativeSvgs';

export default function Hero() {
  const { isAuthenticated } = useAuth();

  const handleScrollToGuide = (e) => {
    e.preventDefault();
    const target = document.getElementById('career-wheel-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#e4dfd7', // Signature architectural stone framing
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* First Fold: Hero Section Card */}
      <div
        style={{
          height: '100vh',
          maxHeight: '100vh',
          padding: '1.25rem',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <div
          className="hero-inner-card"
          style={{
            flex: 1,
            backgroundColor: '#faf7f2', // Warm luminous ivory/bone canvas
            borderRadius: '24px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem 2.75rem',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Decorative Corner Architectural Brackets */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', pointerEvents: 'none', zIndex: 5 }}>
            <CornerBracket orientation="top-left" size={22} color="rgba(77, 31, 39, 0.25)" />
          </div>
          <div style={{ position: 'absolute', top: '16px', right: '16px', pointerEvents: 'none', zIndex: 5 }}>
            <CornerBracket orientation="top-right" size={22} color="rgba(77, 31, 39, 0.25)" />
          </div>
          <div style={{ position: 'absolute', bottom: '16px', left: '16px', pointerEvents: 'none', zIndex: 5 }}>
            <CornerBracket orientation="bottom-left" size={22} color="rgba(77, 31, 39, 0.25)" />
          </div>
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', pointerEvents: 'none', zIndex: 5 }}>
            <CornerBracket orientation="bottom-right" size={22} color="rgba(77, 31, 39, 0.25)" />
          </div>

          {/* Floating Subtle Ambient Decorative Starbursts */}
          <div style={{ position: 'absolute', top: '18%', left: '46%', pointerEvents: 'none', zIndex: 2, opacity: 0.7 }}>
            <LuxuryStar size={24} color="#c2410c" />
          </div>
          <div style={{ position: 'absolute', bottom: '28%', left: '42%', pointerEvents: 'none', zIndex: 2, opacity: 0.5 }}>
            <DiamondSparkle size={18} color="#4d1f27" />
          </div>
          <div style={{ position: 'absolute', top: '12%', right: '28%', pointerEvents: 'none', zIndex: 2, opacity: 0.6 }}>
            <DiamondSparkle size={16} color="#c2410c" />
          </div>
          <div style={{ position: 'absolute', top: '48%', left: '3%', pointerEvents: 'none', zIndex: 2, opacity: 0.4 }}>
            <CrosshairMark size={20} color="rgba(77, 31, 39, 0.3)" />
          </div>

          {/* Top Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
            {/* Top Left Geometric Logo Mark */}
            <Link
              to="/"
              aria-label="CareerLens Home"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ece6dd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4d1f27',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: '0 2px 6px rgba(77, 31, 39, 0.05)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 6.5px)', gap: '4px' }}>
                <div style={{ width: '6.5px', height: '6.5px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
                <div style={{ width: '6.5px', height: '6.5px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
                <div style={{ width: '6.5px', height: '6.5px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
                <div style={{ width: '6.5px', height: '6.5px', borderRadius: '1.5px', backgroundColor: '#4d1f27' }} />
              </div>
            </Link>

            {/* Top Right Subtle Brand Mark */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: '#4d1f27',
                textTransform: 'uppercase',
              }}
            >
              <LuxuryStar size={11} color="#c2410c" />
              <span>CAREER LENS PLATFORM</span>
            </div>
          </div>

          {/* Middle Main Content Stage: Left Typography + Right Centered 3D Particle Bag */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              minHeight: 0,
            }}
          >
            {/* Left Corner / Column: Monumental Written Typography & Editorial Controls */}
            <div
              className="hero-left-column"
              style={{
                position: 'relative',
                zIndex: 25,
                maxWidth: '560px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pointerEvents: 'auto',
                paddingRight: '1rem',
              }}
            >
              {/* Editorial Kicker Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(77, 31, 39, 0.06)',
                  border: '1px solid rgba(77, 31, 39, 0.14)',
                  color: '#4d1f27',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1.35rem',
                  width: 'fit-content',
                  boxShadow: '0 1px 3px rgba(77, 31, 39, 0.04)',
                }}
              >
                <LuxuryStar size={11} color="#c2410c" />
                <span>AI Resume Appraisal Atelier</span>
                <span style={{ color: '#c2410c', fontWeight: 900 }}>✦</span>
              </div>

              {/* Monumental Stacked Written Typography in Left Corner */}
              <h1
                style={{
                  fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2.75rem, 5.5vw, 5.25rem)',
                  fontWeight: 900,
                  color: '#4d1f27',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.94,
                  margin: '0 0 1.25rem',
                  textTransform: 'uppercase',
                }}
              >
                CAREER<br />
                LENS<br />
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: '#c2410c',
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  MASTER
                </span>
              </h1>

              {/* Description & Mission */}
              <p
                style={{
                  margin: '0 0 1.75rem',
                  fontSize: 'clamp(0.88rem, 1.1vw, 1.05rem)',
                  color: '#574f4b',
                  lineHeight: 1.6,
                  fontWeight: 500,
                  maxWidth: '480px',
                }}
              >
                The only platform you will need to Master Your Career. Calibrate your trajectory with grounded Gemini neural audits, dimensional scorecards, and precision upskilling roadmaps.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  to="/analyze"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    backgroundColor: '#4d1f27',
                    color: '#faf7f2',
                    padding: '0.85rem 1.75rem',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(77, 31, 39, 0.28)',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#38141b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4d1f27';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>Launch AI Appraisal</span>
                  <ArrowRight size={17} />
                </Link>

                <button
                  type="button"
                  onClick={handleScrollToGuide}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                    color: '#4d1f27',
                    border: '1.5px solid #dcd3c5',
                    padding: '0.82rem 1.45rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4d1f27';
                    e.currentTarget.style.backgroundColor = '#faf7f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#dcd3c5';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span>Explore 24+ Roles</span>
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Technical Precision Coordinate Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '1.75rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#8c827a',
                  textTransform: 'uppercase',
                }}
              >
                <span>▪ ▫ 01 // 24 SPEC</span>
                <span>•</span>
                <span>ATS BENCHMARK 100%</span>
                <span>•</span>
                <CrosshairMark size={14} color="#8c827a" />
              </div>
            </div>

            {/* Right Corner Center: 3D Stippled Particle Work Bag Canvas */}
            <div
              className="hero-right-particle-stage"
              style={{
                position: 'absolute',
                top: '50%',
                right: '-2%',
                transform: 'translateY(-50%)',
                width: '60%',
                height: '92%',
                zIndex: 15,
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Background Concentric Orbital Ring SVG behind the 3D Bag */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                  opacity: 0.85,
                }}
              >
                <OrbitalRings size={520} color="rgba(77, 31, 39, 0.08)" />
              </div>

              {/* 3D Particle Bag Iframe */}
              <iframe
                src="/leather_bag.html"
                title="3D Leather Bag Particles"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  display: 'block',
                  position: 'relative',
                  zIndex: 2,
                }}
                allowtransparency="true"
              />
            </div>
          </div>

          {/* Bottom Area: Controls, Drag Hint, and Rotating Curved Text in Burgundy */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '0.35rem',
              zIndex: 20,
              width: '100%',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Bottom Left: Interactive Hint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#8c827a', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <ModernAsterisk size={16} color="#c2410c" />
              <span>DRAG OR MOVE CURSOR TO ROTATE 3D WORK BAG PARTICLES</span>
            </div>

            {/* Bottom Right: Rotating Curved Text in Burgundy Badge + Scroll Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Rotating Curved Text in Burgundy */}
              <RotatingCurvedText
                size={110}
                textColor="#4d1f27"
                centerColor="#c2410c"
                speedSeconds={22}
              />

              {/* Scroll down button */}
              <button
                type="button"
                onClick={handleScrollToGuide}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: '#4d1f27',
                  padding: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  THE CAREER LENS ULTIMATE GUIDE
                </span>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: '1.5px solid #4d1f27',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4d1f27',
                    backgroundColor: '#faf7f2',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ChevronDown size={18} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section: 3D Career Wheel Circular Scroll Carousel */}
      <CareerWheelSection />

      {/* Third Section: Sticky Capabilities Showcase */}
      <FeatureShowcaseSection />

      {/* Fourth Section: Luxury Platform Footer with Rotating Curved Text */}
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .hero-inner-card {
            padding: 1.75rem 1.25rem !important;
          }
          .hero-left-column {
            max-width: 100% !important;
            z-index: 30 !important;
          }
          .hero-right-particle-stage {
            opacity: 0.3 !important;
            width: 90% !important;
            right: -10% !important;
          }
        }
      `}</style>
    </div>
  );
}
