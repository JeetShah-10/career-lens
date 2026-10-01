import React from 'react';

export default function ScoreBreakdown({ breakdown, overallScore }) {
  if (!breakdown) return null;

  const dimensions = [
    {
      key: 'skills',
      label: 'Skills Match',
      value: breakdown.skills,
      color: '#065f46',
      bgTrack: '#d1fae5',
      description: 'Alignment between technical competencies and target role requirements.',
    },
    {
      key: 'experience',
      label: 'Experience Depth',
      value: breakdown.experience,
      color: '#1e40af',
      bgTrack: '#dbeafe',
      description: 'Relevance, duration, and seniority reflected in your career history.',
    },
    {
      key: 'impact',
      label: 'Impact & Metrics',
      value: breakdown.impact,
      color: '#4d1f27',
      bgTrack: '#f3e8eb',
      description: 'Demonstrated outcomes, quantified results, and business contributions.',
    },
    {
      key: 'formatting',
      label: 'Structure & Clarity',
      value: breakdown.formatting,
      color: '#c2410c',
      bgTrack: '#ffedd5',
      description: 'Readability, logical hierarchy, and concise technical communication.',
    },
  ];

  const getScoreVerdict = (val) => {
    if (val >= 80) return 'Exceptional Alignment';
    if (val >= 65) return 'Strong Contender';
    if (val >= 50) return 'Developing Match';
    return 'Substantial Growth Needed';
  };

  const verdictColor = overallScore >= 80 ? '#065f46' : overallScore >= 65 ? '#c2410c' : '#991b1b';
  const verdictBg = overallScore >= 80 ? '#ecfdf5' : overallScore >= 65 ? '#fff7ed' : '#fef2f2';
  const verdictBorder = overallScore >= 80 ? '#a7f3d0' : overallScore >= 65 ? '#fed7aa' : '#fecaca';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overall Score Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          padding: '1.5rem',
          backgroundColor: '#faf7f2',
          borderRadius: '18px',
          border: '1px solid #e8e0d5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#4d1f27',
              color: '#faf7f2',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(77, 31, 39, 0.25)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.45rem', fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-serif)' }}>
              {overallScore}
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.85 }}>/ 100</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8c827a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI Coaching Score Estimate
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: verdictBg,
                  color: verdictColor,
                  border: `1px solid ${verdictBorder}`,
                }}
              >
                {getScoreVerdict(overallScore)}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#574f4b', margin: 0, maxWidth: '460px', lineHeight: 1.45 }}>
              AI coaching estimate generated from submitted resume signals. Designed for personal skill development, not a definitive hiring judgment.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Dimensional Metric Tracks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        {dimensions.map((dim) => {
          const val = dim.value ?? 0;
          return (
            <div
              key={dim.key}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e0d5',
                borderRadius: '16px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(77, 31, 39, 0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4d1f27' }}>
                    {dim.label}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: dim.color }}>
                    {val}%
                  </span>
                </div>

                {/* Progress Track */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: dim.bgTrack,
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    margin: '0.5rem 0 0.75rem',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, val))}%`,
                      backgroundColor: dim.color,
                      borderRadius: '9999px',
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#776e6a', margin: 0, lineHeight: 1.45 }}>
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
