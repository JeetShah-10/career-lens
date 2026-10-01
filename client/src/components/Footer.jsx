import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Briefcase, 
  FileText, 
  Compass, 
  History as HistoryIcon,
  User,
  Heart
} from 'lucide-react';
import { CAREER_CATEGORIES } from '../data/careersData';
import RotatingCurvedText from './RotatingCurvedText';
import { LuxuryStar, DiamondSparkle, CrosshairMark, ModernAsterisk } from './DecorativeSvgs';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();

  const handleOpenExplorer = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-career-explorer'));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="platform-footer">
      <div className="footer-inner-card" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Decorative Background SVGs */}
        <div style={{ position: 'absolute', top: '24px', right: '32px', pointerEvents: 'none', opacity: 0.5 }}>
          <LuxuryStar size={28} color="#c2410c" />
        </div>
        <div style={{ position: 'absolute', bottom: '36px', left: '28px', pointerEvents: 'none', opacity: 0.35 }}>
          <DiamondSparkle size={20} color="#4d1f27" />
        </div>

        {/* Top Callout / Hero Row */}
        <div className="footer-top-row">
          <div className="footer-brand-column">
            <div className="footer-logo-badge">
              <div className="footer-logo-squares">
                <span /><span /><span /><span />
              </div>
              <span className="footer-brand-title">CAREER LENS</span>
              <LuxuryStar size={13} color="#c2410c" />
            </div>
            <h3 className="footer-tagline">
              Master Your Trajectory with Precision AI Diagnostics.
            </h3>
            <p className="footer-description">
              A private, grounded evaluation engine built on Google Gemini. Analyze resumes, 
              detect target skill gaps, and explore 25+ high-growth engineering, science, and design disciplines.
            </p>
          </div>

          {/* Right Action Box + Rotating Curved Text in Burgundy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="footer-action-box">
              <span className="footer-action-badge">
                <Sparkles size={13} />
                <span>READY TO EVALUATE?</span>
              </span>
              <h4 className="footer-action-heading">Upload or paste your resume for immediate audit</h4>
              <div className="footer-action-buttons">
                <button 
                  type="button" 
                  onClick={() => navigate('/analyze')}
                  className="footer-btn-primary"
                >
                  <span>Launch AI Analyzer</span>
                  <ArrowUpRight size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={handleOpenExplorer}
                  className="footer-btn-secondary"
                >
                  <span>Explore 25+ Roles</span>
                </button>
              </div>
            </div>

            {/* Rotating Curved Text in Burgundy Stamp at the end */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotatingCurvedText
                size={130}
                textColor="#4d1f27"
                centerColor="#c2410c"
                speedSeconds={20}
              />
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        {/* Link Columns Grid */}
        <div className="footer-links-grid">
          {/* Column 1: Core Navigation */}
          <div className="footer-column">
            <h5 className="footer-col-title">Platform</h5>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={scrollToTop} className="footer-link-btn">
                  Studio Home
                </button>
              </li>
              <li>
                <Link to="/analyze" className="footer-link">
                  AI Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/history" className="footer-link">
                  Analysis History & Vault
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  Executive Dossier & Blueprint
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Career Domains */}
          <div className="footer-column">
            <h5 className="footer-col-title">Career Domains</h5>
            <ul className="footer-links-list">
              {CAREER_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <a href="#career-explorer" onClick={handleOpenExplorer} className="footer-link">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Specializations */}
          <div className="footer-column">
            <h5 className="footer-col-title">Specializations</h5>
            <ul className="footer-links-list">
              {CAREER_CATEGORIES.slice(6, 12).map((cat) => (
                <li key={cat}>
                  <a href="#career-explorer" onClick={handleOpenExplorer} className="footer-link">
                    {cat}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Platform Architecture */}
          <div className="footer-column">
            <h5 className="footer-col-title">Architecture Specs</h5>
            <p className="footer-demo-text">
              Precision enterprise standards enforced across all evaluations:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.65rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#4d1f27', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LuxuryStar size={11} color="#c2410c" />
                <span>Google Gemini Neural Engine</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: '#4d1f27', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LuxuryStar size={11} color="#c2410c" />
                <span>Multi-Dimensional ATS Scoring</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: '#4d1f27', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LuxuryStar size={11} color="#c2410c" />
                <span>Zero Data Leakage / Ephemeral Ingestion</span>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        {/* Bottom Bar */}
        <div className="footer-bottom-row">
          <div className="footer-security-note">
            <ShieldCheck size={16} color="#4d1f27" />
            <span>Strict privacy: Resume text processed purely for coaching. MongoDB scoped per user.</span>
          </div>

          <div className="footer-copyright" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>© {new Date().getFullYear()} CareerLens Platform. Master Your Career.</span>
            <CrosshairMark size={14} color="#8c827a" />
          </div>
        </div>
      </div>
    </footer>
  );
}
