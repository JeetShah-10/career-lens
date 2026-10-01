import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Target, 
  BarChart3,
  Compass,
  Bot,
  MessageSquare,
  Send,
  UserCheck
} from 'lucide-react';
import { DEFAULT_CANDIDATES } from '../data/demoData';
import './FeatureShowcase.css';

const SHOWCASE_TABS = [
  {
    id: 1,
    counter: '01 / RESUME EVALUATION',
    title: 'Grounded AI Resume Audit with',
    highlight: 'Precision Scoring',
    description:
      'Submit your credentials via paste text, uploaded PDF, or saved structured profile. Google Gemini parses every bullet point, strictly measuring against production benchmarks with zero generic advice or hallucinated experience.',
    actionLabel: 'Evaluate This Resume',
    badge: '94 / 100 OVERALL',
  },
  {
    id: 2,
    counter: '02 / AI ASSISTANT & COACH',
    title: 'Contextual AI Career Coach &',
    highlight: 'Strategic Guidance',
    description:
      'Receive instant, personalized guidance tailored to your exact career history. Our AI assistant analyzes your resume, compares it against real hiring standards, and delivers concrete, actionable advice to help you land your target role.',
    actionLabel: 'Consult AI Assistant',
    badge: 'REAL-TIME REASONING',
  },
  {
    id: 3,
    counter: '03 / SKILL GAP ANALYSIS',
    title: 'Automated Target Role & Skill',
    highlight: 'Gap Detection',
    description:
      'Never guess what hiring committees look for. Our model compares your actual experience against real expectations for your target role, generating prioritized High, Medium, and Low skill roadmaps with transparent technical justifications.',
    actionLabel: 'View Skill Recommendations',
    badge: 'PRIORITIZED ROADMAP',
  },
  {
    id: 4,
    counter: '04 / HISTORICAL VAULT',
    title: 'Private Evaluation Vault & Longitudinal',
    highlight: 'Career Analytics',
    description:
      'Every analysis is indexed in your private, secure database. Search by role, filter by score brackets and dates, track your career growth over time, and benchmark your readiness against specific job descriptions.',
    actionLabel: 'Explore History & Vault',
    badge: 'LONGITUDINAL TRACKING',
  },
];

export default function FeatureShowcaseSection() {
  const runwayRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCandIdx, setSelectedCandIdx] = useState(0);
  const navigate = useNavigate();

  const currentCandidate = DEFAULT_CANDIDATES[selectedCandIdx];

  // Scroll listener that switches tabs smoothly based on scroll progress
  useEffect(() => {
    let rafId;

    const handleScroll = () => {
      if (!runwayRef.current) return;
      const rect = runwayRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      const current = Math.max(0, Math.min(scrollable, -rect.top));
      const fraction = current / scrollable;

      // Map fraction [0, 1] across 4 tabs (0, 1, 2, 3)
      if (fraction < 0.25) {
        setActiveTab(0);
      } else if (fraction < 0.50) {
        setActiveTab(1);
      } else if (fraction < 0.75) {
        setActiveTab(2);
      } else {
        setActiveTab(3);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleAction = () => {
    if (activeTab === 0 || activeTab === 1 || activeTab === 2) {
      navigate(`/analyze?demo=${currentCandidate.id}`);
    } else {
      navigate('/history');
    }
  };

  return (
    <section className="feature-showcase-wrapper" id="feature-showcase-section">
      {/* Intro Header */}
      <div className="feature-showcase-intro">
        <div className="feature-showcase-tag">
          <Sparkles size={13} />
          <span>CAREER LENS PLATFORM CAPABILITIES</span>
        </div>
        <h2 className="feature-showcase-heading">
          Everything You Need to Master Your Career
        </h2>
        <p className="feature-showcase-subtext">
          Engineered from the ground up to evaluate your resume, uncover critical skill gaps, 
          and track your progression across 25+ modern engineering, data, and design disciplines.
        </p>

        {/* Interactive Example Persona Selector: "This is how it works" */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4d1f27', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ✨ Select an Example Candidate to Inspect Live Diagnostics:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {DEFAULT_CANDIDATES.map((cand, idx) => {
              const isSelected = selectedCandIdx === idx;
              return (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => setSelectedCandIdx(idx)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: isSelected ? '1.5px solid #4d1f27' : '1px solid #dcd5cc',
                    backgroundColor: isSelected ? '#4d1f27' : '#ffffff',
                    color: isSelected ? '#faf7f2' : '#2b2725',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(77, 31, 39, 0.2)' : 'none',
                  }}
                >
                  <span>{cand.name}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '1px 6px', 
                    borderRadius: '10px', 
                    background: isSelected ? '#fbd38d' : '#ece6dd',
                    color: isSelected ? '#211a1c' : '#4d1f27',
                    fontWeight: 800
                  }}>
                    {cand.overallScore}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Tabs Runway (codepen p0waqqatsi/pen/wvbzQxj structure) */}
      <div className="feature-showcase-runway" ref={runwayRef}>
        <div className="feature-showcase-sticky-frame">
          <div className="feature-showcase-container">
            {/* Left Column: Cross-fading Tabs & Animated Action Button */}
            <div className="feature-showcase-left">
              <div className="feature-showcase-tabs-stack">
                {SHOWCASE_TABS.map((tab, idx) => (
                  <div
                    key={tab.id}
                    className={`feature-tab-item ${activeTab === idx ? 'active' : ''}`}
                  >
                    <span className="feature-tab-counter">{tab.counter}</span>
                    <h3 className="feature-tab-title">
                      {tab.title}{' '}
                      <span className="feature-tab-highlight">{tab.highlight}</span>
                    </h3>
                    <div className="feature-tab-divider" />
                    <p className="feature-tab-desc">{tab.description}</p>
                  </div>
                ))}
              </div>

              {/* Codepen-style CTA button with circular morphing icon */}
              <button
                type="button"
                className="feature-showcase-btn"
                onClick={handleAction}
              >
                <span>{SHOWCASE_TABS[activeTab].actionLabel}</span>
                <div className="feature-showcase-btn-icon-wrapper">
                  <ArrowUpRight size={16} />
                </div>
              </button>
            </div>

            {/* Right Column: Visual Preview Panels */}
            <div className="feature-showcase-right">
              {/* Panel 1: Precision Score & Breakdown */}
              <div className={`feature-visual-panel ${activeTab === 0 ? 'active' : ''}`}>
                <div className="mockup-card-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbd38d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        AI EVALUATION REPORT • {currentCandidate.name}
                      </span>
                      <h4 style={{ margin: '0.35rem 0 0', color: '#ffffff', fontSize: '1.25rem', fontFamily: 'inherit' }}>
                        Target: {currentCandidate.targetRole}
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{currentCandidate.overallScore}</span>
                      <span style={{ fontSize: '0.85rem', color: '#a89d9f' }}> / 100</span>
                    </div>
                  </div>

                  {/* 4 Score Progress Bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#e5ded4', marginBottom: '0.3rem' }}>
                        <span>Skills Match</span>
                        <strong style={{ color: '#fbd38d' }}>{currentCandidate.result.scoreBreakdown.skills}%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${currentCandidate.result.scoreBreakdown.skills}%`, height: '100%', background: '#fbd38d', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#e5ded4', marginBottom: '0.3rem' }}>
                        <span>Experience Depth</span>
                        <strong style={{ color: '#fbd38d' }}>{currentCandidate.result.scoreBreakdown.experience}%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${currentCandidate.result.scoreBreakdown.experience}%`, height: '100%', background: '#fbd38d', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#e5ded4', marginBottom: '0.3rem' }}>
                        <span>Impact & Metrics</span>
                        <strong style={{ color: '#fbd38d' }}>{currentCandidate.result.scoreBreakdown.impact}%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${currentCandidate.result.scoreBreakdown.impact}%`, height: '100%', background: '#fbd38d', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#e5ded4', marginBottom: '0.3rem' }}>
                        <span>Structure & Clarity</span>
                        <strong style={{ color: '#fbd38d' }}>{currentCandidate.result.scoreBreakdown.formatting}%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${currentCandidate.result.scoreBreakdown.formatting}%`, height: '100%', background: '#fbd38d', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={15} />
                      <span>Key Strength Verified</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.45 }}>
                      "{currentCandidate.result.strengths[0]}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel 2: AI Assistant & Contextual Coach */}
              <div className={`feature-visual-panel ${activeTab === 1 ? 'active' : ''}`}>
                <div className="mockup-card-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(251, 211, 141, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbd38d' }}>
                        <Bot size={18} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbd38d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          AI CAREER ADVISOR • {currentCandidate.name}
                        </span>
                        <h4 style={{ margin: '0.1rem 0 0', color: '#ffffff', fontSize: '1.1rem', fontFamily: 'inherit' }}>
                          Live Trajectory Consultation
                        </h4>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4ade80', background: 'rgba(74, 222, 128, 0.12)', padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
                      GEMINI FLASH ACTIVE
                    </span>
                  </div>

                  {/* Dialogue thread */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1.1rem 0' }}>
                    {/* User Question */}
                    <div style={{ alignSelf: 'flex-end', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '14px 14px 2px 14px', padding: '0.75rem 1rem', maxWidth: '85%' }}>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#ffffff', lineHeight: 1.4 }}>
                        "How do I position my experience for a {currentCandidate.targetRole} role?"
                      </p>
                    </div>

                    {/* AI Coach Reply */}
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(77, 31, 39, 0.35)', border: '1px solid rgba(251, 211, 141, 0.25)', borderRadius: '14px 14px 14px 2px', padding: '0.85rem 1rem', maxWidth: '92%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbd38d', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <Sparkles size={12} />
                        <span>CAREER LENS ADVICE</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.45 }}>
                        For <strong>{currentCandidate.name}</strong>: Spotlight your primary asset: "{currentCandidate.result.strengths[0]}". Prioritize masteries in <strong>{currentCandidate.result.recommendedSkills[0]?.skill || 'core requirements'}</strong> to boost your {currentCandidate.targetRole} match to 95%+.
                      </p>
                    </div>
                  </div>

                  {/* Input Mockup */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.45)' }}>
                      Ask for interview strategy, salary negotiations for {currentCandidate.targetRole}...
                    </span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#fbd38d', color: '#211a1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Send size={12} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3: Priority Skill Matrix */}
              <div className={`feature-visual-panel ${activeTab === 2 ? 'active' : ''}`}>
                <div className="mockup-card-container">
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbd38d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      SKILL GAP DETECTOR • {currentCandidate.name}
                    </span>
                    <h4 style={{ margin: '0.35rem 0 0', color: '#ffffff', fontSize: '1.25rem', fontFamily: 'inherit' }}>
                      Target Role: {currentCandidate.targetRole}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.25rem 0' }}>
                    {currentCandidate.result.recommendedSkills.slice(0, 3).map((rec, i) => {
                      const color = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#3b82f6';
                      return (
                        <div key={rec.skill || i} style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '12px', padding: '0.85rem 1rem', borderLeft: `3px solid ${color}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>{rec.skill}</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, color, background: `${color}25`, padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase' }}>
                              {rec.priority} PRIORITY
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(255,255,255,0.72)' }}>
                            {rec.why}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={14} color="#fbd38d" />
                    <span>Every recommendation is tailored to the exact role and market demands.</span>
                  </div>
                </div>
              </div>

              {/* Panel 4: Historical Vault & Longitudinal Benchmarks */}
              <div className={`feature-visual-panel ${activeTab === 3 ? 'active' : ''}`}>
                <div className="mockup-card-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbd38d', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        LONGITUDINAL VAULT
                      </span>
                      <h4 style={{ margin: '0.35rem 0 0', color: '#ffffff', fontSize: '1.25rem', fontFamily: 'inherit' }}>
                        Career Progression History
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '3px 10px', borderRadius: '12px' }}>
                      6 Evaluations Indexed
                    </span>
                  </div>

                  {/* History timeline list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '1.25rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>Staff Frontend Architect</div>
                        <div style={{ color: '#888', fontSize: '0.7rem' }}>Evaluated Oct 2026 • PDF Upload</div>
                      </div>
                      <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '1.1rem' }}>92%</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>Lead ML Engineer</div>
                        <div style={{ color: '#888', fontSize: '0.7rem' }}>Evaluated Sep 2026 • Paste Source</div>
                      </div>
                      <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>84%</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>Full Stack Engineer</div>
                        <div style={{ color: '#888', fontSize: '0.7rem' }}>Evaluated Aug 2026 • Profile Source</div>
                      </div>
                      <span style={{ color: '#f87171', fontWeight: 800, fontSize: '1.1rem' }}>68%</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(251, 211, 141, 0.08)', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid rgba(251, 211, 141, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#fbd38d', fontWeight: 700 }}>
                      Growth Velocity: +24% score improvement across the last 3 resume revisions.
                    </span>
                  </div>
                </div>
              </div>

              {/* Stepper dots at bottom right */}
              <div className="feature-showcase-nav-dots">
                {SHOWCASE_TABS.map((_, i) => (
                  <div
                    key={i}
                    className={`feature-nav-dot ${activeTab === i ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
