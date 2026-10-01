import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import ScoreBreakdown from '../components/ScoreBreakdown';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Tag,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

import { getCandidateById } from '../data/demoData';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResult() {
      setLoading(true);
      setError(null);

      // Check if this is a default candidate preset first
      if (id && id.startsWith('cand-')) {
        const demoCand = getCandidateById(id);
        if (demoCand) {
          setAnalysis({
            _id: demoCand.id,
            targetRole: demoCand.targetRole,
            overallScore: demoCand.overallScore,
            resumeSource: 'paste',
            resumeText: demoCand.resumeText,
            jobDescription: demoCand.jobDescription,
            result: demoCand.result,
            createdAt: demoCand.createdAt,
          });
          setLoading(false);
          return;
        }
      }

      try {
        const res = await api.analyses.getById(id);
        setAnalysis(res?.analysis || null);
      } catch (err) {
        // Fallback to demo candidate if found
        const fallback = getCandidateById(id);
        if (fallback) {
          setAnalysis({
            _id: fallback.id,
            targetRole: fallback.targetRole,
            overallScore: fallback.overallScore,
            resumeSource: 'paste',
            resumeText: fallback.resumeText,
            jobDescription: fallback.jobDescription,
            result: fallback.result,
            createdAt: fallback.createdAt,
          });
        } else {
          setError(err.message || 'Unable to retrieve evaluation results.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchResult();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="app-container" style={{ maxWidth: '900px' }}>
        <LoadingSpinner message="Fetching resume evaluation feedback..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="app-container" style={{ maxWidth: '700px' }}>
        <Alert type="danger" message={error || 'Evaluation record not found.'} />
        <Link to="/history" className="btn btn-secondary">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Analysis History</span>
        </Link>
      </div>
    );
  }

  const { result, targetRole, createdAt, resumeSource, jobDescription } = analysis;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Status */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          to="/history"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #d5cbbe',
            color: '#4d1f27',
            fontSize: '0.8rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to History</span>
        </Link>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#8c827a' }}>
          <Calendar size={13} aria-hidden="true" />
          <span>Analyzed on {new Date(createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span style={{ color: '#c2410c', fontWeight: 800 }}>✦ Verified AI Audit</span>
        </div>
      </div>

      {/* Main Assessment Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e8e0d5',
          padding: '2.75rem 3rem',
          boxShadow: '0 12px 40px rgba(77, 31, 39, 0.05)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: '#faf5ee',
              border: '1px solid #e8decb',
              color: '#c2410c',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={12} color="#c2410c" />
            <span>Target Benchmark Role</span>
          </div>

          <h1
            style={{
              fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
              fontSize: '2.35rem',
              fontWeight: 600,
              color: '#4d1f27',
              letterSpacing: '-0.02em',
              margin: '0 0 0.45rem',
              lineHeight: 1.2,
            }}
          >
            {targetRole}
          </h1>

          {resumeSource && (
            <span style={{ fontSize: '0.78rem', color: '#8c827a', textTransform: 'capitalize' }}>
              Input method: <strong>{resumeSource}</strong> • AI Provider: <strong>Google Gemini Flash</strong>
            </span>
          )}
        </div>

        {/* Executive Summary */}
        {result?.summary && (
          <div
            style={{
              backgroundColor: '#faf7f2',
              border: '1px solid #e8decb',
              borderLeft: '4px solid #4d1f27',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
            }}
          >
            <h2 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4d1f27', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
              ✦ Executive Coaching Synthesis
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#574f4b', lineHeight: 1.65, margin: 0 }}>
              {result.summary}
            </p>
          </div>
        )}

        {/* Score & Dimensions Breakdown */}
        <ScoreBreakdown
          breakdown={result?.scoreBreakdown}
          overallScore={analysis.overallScore ?? result?.overallScore}
        />
      </div>

      {/* Optional Job Match Card (ATS Keyword Matching) */}
      {result?.jobMatch && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e8e0d5',
            padding: '2rem 2.5rem',
            boxShadow: '0 12px 40px rgba(77, 31, 39, 0.05)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600, color: '#4d1f27', margin: 0 }}>
                Job Description Match & ATS Keywords
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#574f4b', margin: '0.25rem 0 0' }}>
                Algorithmic alignment against the job description listing provided.
              </p>
            </div>

            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                backgroundColor: result.jobMatch.matchPercent >= 75 ? '#ecfdf5' : '#fff7ed',
                color: result.jobMatch.matchPercent >= 75 ? '#065f46' : '#c2410c',
                border: `1.5px solid ${result.jobMatch.matchPercent >= 75 ? '#a7f3d0' : '#fed7aa'}`,
              }}
            >
              {result.jobMatch.matchPercent}% Keyword Match
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#faf7f2', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e8decb' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ✓ Matched Keywords ({result.jobMatch.matchedKeywords?.length || 0})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {result.jobMatch.matchedKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#faf7f2', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e8decb' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#991b1b', display: 'block', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ✕ Missing Keywords ({result.jobMatch.missingKeywords?.length || 0})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {result.jobMatch.missingKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      backgroundColor: '#fef2f2',
                      color: '#991b1b',
                      border: '1px solid #fecaca',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    ✕ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strengths & Areas for Improvement Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Strengths */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e8e0d5',
            padding: '2rem 2.25rem',
            boxShadow: '0 8px 30px rgba(77, 31, 39, 0.04)',
          }}
        >
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f0eae1' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.35rem', fontFamily: 'var(--font-serif)' }}>
              <CheckCircle2 size={20} color="#065f46" aria-hidden="true" />
              <span>Demonstrated Strengths</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#574f4b', margin: 0 }}>
              Grounded qualifications and proven accomplishments in your resume.
            </p>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {result?.strengths?.map((str, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '0.88rem',
                  color: '#2b2725',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  lineHeight: 1.55,
                }}
              >
                <span style={{ color: '#065f46', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>✦</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas (Weaknesses) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e8e0d5',
            padding: '2rem 2.25rem',
            boxShadow: '0 8px 30px rgba(77, 31, 39, 0.04)',
          }}
        >
          <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #f0eae1' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.35rem', fontFamily: 'var(--font-serif)' }}>
              <AlertCircle size={20} color="#c2410c" aria-hidden="true" />
              <span>Areas for Targeted Growth</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#574f4b', margin: 0 }}>
              Critical competencies or metrics needed to maximize role alignment.
            </p>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {result?.weaknesses?.map((weak, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '0.88rem',
                  color: '#2b2725',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  lineHeight: 1.55,
                }}
              >
                <span style={{ color: '#c2410c', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>✦</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Skill Recommendations */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e8e0d5',
          padding: '2rem 2.25rem',
          boxShadow: '0 8px 30px rgba(77, 31, 39, 0.04)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f0eae1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#f5ede4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tag size={18} color="#4d1f27" aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#4d1f27', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Curated Skill Acquisition Strategy
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#574f4b', margin: 0 }}>
            Precision competency additions recommended by AI to eliminate gaps against {analysis.targetRole}.
          </p>
        </div>

        {/* Missing Skills Pills */}
        {result?.missingSkills && result.missingSkills.length > 0 && (
          <div
            style={{
              backgroundColor: '#faf7f2',
              borderRadius: '16px',
              border: '1px solid #ece4d8',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c2410c' }}>
                Observed Missing Competencies ({result.missingSkills.length})
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.missingSkills.map((ms, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#4d1f27',
                    border: '1px solid #e0d5c5',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  ✕ {ms}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Skills Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {result?.recommendedSkills?.map((item, idx) => {
            const isHigh = item.priority === 'high';
            const isMed = item.priority === 'medium';
            const badgeBg = isHigh ? '#fdf2f4' : isMed ? '#fffbeb' : '#f8fafc';
            const badgeColor = isHigh ? '#991b1b' : isMed ? '#b45309' : '#475569';
            const badgeBorder = isHigh ? '#fecaca' : isMed ? '#fde68a' : '#e2e8f0';

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #ece4d8',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1817' }}>
                    {item.skill}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      border: `1px solid ${badgeBorder}`,
                    }}
                  >
                    {item.priority} Priority
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#574f4b', margin: 0, lineHeight: 1.6 }}>
                  {item.why}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alternative Career Suggestions */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e8e0d5',
          padding: '2rem 2.25rem',
          boxShadow: '0 8px 30px rgba(77, 31, 39, 0.04)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f0eae1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#f5ede4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={18} color="#4d1f27" aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#4d1f27', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Adjacent Career Horizons
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#574f4b', margin: 0 }}>
            Complementary industry trajectories that strongly align with your verified experience footprint.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {result?.careerSuggestions?.map((cs, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#faf7f2',
                border: '1px solid #ece4d8',
                borderRadius: '18px',
                padding: '1.4rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#4d1f27', margin: 0, fontFamily: 'var(--font-serif)' }}>
                    {cs.role}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      backgroundColor: cs.matchPercent >= 75 ? '#ecfdf5' : '#fff7ed',
                      color: cs.matchPercent >= 75 ? '#065f46' : '#c2410c',
                      border: `1px solid ${cs.matchPercent >= 75 ? '#a7f3d0' : '#fed7aa'}`,
                    }}
                  >
                    {cs.matchPercent}% Trajectory Fit
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#574f4b', margin: 0, lineHeight: 1.6 }}>
                  {cs.reason}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/analyze', { state: { prefillRole: cs.role } })}
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#4d1f27',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4c8b8',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4d1f27';
                  e.currentTarget.style.color = '#faf7f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#4d1f27';
                }}
              >
                <span>Evaluate for this role</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Step-by-Step Roadmap (P1) */}
      {result?.roadmap && result.roadmap.length > 0 && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e8e0d5',
            padding: '2rem 2.25rem',
            boxShadow: '0 8px 30px rgba(77, 31, 39, 0.04)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f0eae1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f5ede4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={18} color="#4d1f27" aria-hidden="true" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#4d1f27', margin: 0, fontFamily: 'var(--font-serif)' }}>
                Targeted Upskilling Roadmap
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#574f4b', margin: 0 }}>
              Chronological milestones structured to maximize interview readiness and closing competency gaps.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {result.roadmap.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  backgroundColor: '#faf7f2',
                  border: '1px solid #ece4d8',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#4d1f27',
                    color: '#faf7f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(77,31,39,0.2)',
                  }}
                >
                  {step.step || idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1817' }}>
                      {step.skill}
                    </span>
                    {step.timeframe && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#c2410c',
                          backgroundColor: '#fff7ed',
                          border: '1px solid #fed7aa',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        ⏱ Est: {step.timeframe}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#574f4b', margin: 0, lineHeight: 1.6 }}>
                    {step.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.5rem 0',
          borderTop: '1px solid #e8e0d5',
        }}
      >
        <Link
          to="/history"
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4d1f27',
            backgroundColor: '#ffffff',
            border: '1px solid #d4c8b8',
            padding: '10px 20px',
            borderRadius: '12px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#faf7f2';
            e.currentTarget.style.borderColor = '#4d1f27';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#d4c8b8';
          }}
        >
          <span>← Return to All Appraisals</span>
        </Link>

        <Link
          to="/analyze"
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#faf7f2',
            backgroundColor: '#4d1f27',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '12px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 4px 14px rgba(77, 31, 39, 0.25)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#38141b';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4d1f27';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>Launch New Appraisal →</span>
        </Link>
      </div>
    </div>
  );
}
