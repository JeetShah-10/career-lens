import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RotateCcw,
  Calendar,
  FileText,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Layers,
  Award,
} from 'lucide-react';

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filter States
  const [role, setRole] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        role: role.trim() || undefined,
        minScore: minScore ? Number(minScore) : undefined,
        maxScore: maxScore ? Number(maxScore) : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        sort,
        page,
        limit: 10,
      };

      const res = await api.analyses.list(params);
      setAnalyses(res?.items || []);
      setTotalPages(res?.pages || 1);
      setTotalCount(res?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  }, [role, minScore, maxScore, fromDate, toDate, sort, page]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleDelete = async (id, roleTitle) => {
    if (!window.confirm(`Are you sure you want to delete the evaluation record for "${roleTitle}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.analyses.delete(id);
      fetchAnalyses();
    } catch (err) {
      alert(err.message || 'Could not delete evaluation record.');
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setRole('');
    setMinScore('');
    setMaxScore('');
    setFromDate('');
    setToDate('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = Boolean(role || minScore || maxScore || fromDate || toDate || sort !== 'newest');

  // Compute performance metrics
  const averageScore = analyses.length
    ? Math.round(analyses.reduce((acc, curr) => acc + (curr.overallScore ?? 0), 0) / analyses.length)
    : 0;
  const highestScore = analyses.length
    ? Math.max(...analyses.map((item) => item.overallScore ?? 0))
    : 0;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2.5rem',
          paddingBottom: '1.75rem',
          borderBottom: '1px solid rgba(77, 31, 39, 0.1)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.95rem',
              borderRadius: '9999px',
              backgroundColor: '#f2ece2',
              border: '1px solid #e0d5c4',
              color: '#c2410c',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem',
            }}
          >
            <Sparkles size={12} color="#c2410c" />
            <span>Historical Intelligence Vault</span>
          </div>

          <h1
            style={{
              fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
              fontSize: '2.45rem',
              fontWeight: 600,
              color: '#4d1f27',
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem',
              lineHeight: 1.15,
            }}
          >
            Career Appraisal History
          </h1>

          <p style={{ fontSize: '0.96rem', color: '#574f4b', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
            Track and compare your resume evaluations, ATS qualification scores, and competency evolutions across all career targets.
          </p>
        </div>

        <Link
          to="/analyze"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            backgroundColor: '#4d1f27',
            color: '#faf7f2',
            borderRadius: '14px',
            padding: '0.75rem 1.4rem',
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(77, 31, 39, 0.25)',
            transition: 'all 0.2s ease',
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
          <span>+ New Appraisal</span>
        </Link>
      </div>

      {/* Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.25rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1px solid rgba(77, 31, 39, 0.08)',
            boxShadow: '0 4px 20px rgba(77, 31, 39, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f5ede4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4d1f27',
              flexShrink: 0,
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c827a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Appraisals Logged
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#4d1f27', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>
                {totalCount}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#574f4b' }}>records</span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1px solid rgba(77, 31, 39, 0.08)',
            boxShadow: '0 4px 20px rgba(77, 31, 39, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#065f46',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c827a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Average Career Alignment
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>
                {analyses.length ? `${averageScore}%` : '—'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#574f4b' }}>
                {analyses.length ? 'benchmarked' : 'pending audits'}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1px solid rgba(77, 31, 39, 0.08)',
            boxShadow: '0 4px 20px rgba(77, 31, 39, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c2410c',
              flexShrink: 0,
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c827a', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
              Peak Match Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#c2410c', fontFamily: 'var(--font-serif)', lineHeight: 1 }}>
                {analyses.length ? `${highestScore}%` : '—'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#574f4b' }}>
                {analyses.length ? 'highest qualification' : 'awaiting submission'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          border: '1px solid rgba(77, 31, 39, 0.08)',
          boxShadow: '0 4px 20px rgba(77, 31, 39, 0.03)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} color="#4d1f27" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4d1f27', letterSpacing: '0.02em' }}>
              Search & Refine Evaluations
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#c2410c',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '4px 8px',
              }}
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Target Role Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4d1f27', marginBottom: '0.4rem' }}>
              Search Target Role
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#8c827a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="e.g. Full Stack, AI Engineer..."
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid #d4c8b8',
                  fontSize: '0.85rem',
                  backgroundColor: '#faf7f2',
                  color: '#1a1817',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Min Score */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4d1f27', marginBottom: '0.4rem' }}>
              Minimum Score (0–100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={minScore}
              onChange={(e) => {
                setMinScore(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #d4c8b8',
                fontSize: '0.85rem',
                backgroundColor: '#faf7f2',
                color: '#1a1817',
                outline: 'none',
              }}
            />
          </div>

          {/* Max Score */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4d1f27', marginBottom: '0.4rem' }}>
              Maximum Score (0–100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="100"
              value={maxScore}
              onChange={(e) => {
                setMaxScore(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #d4c8b8',
                fontSize: '0.85rem',
                backgroundColor: '#faf7f2',
                color: '#1a1817',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4d1f27', marginBottom: '0.4rem' }}>
              Sort Evaluations
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid #d4c8b8',
                fontSize: '0.85rem',
                backgroundColor: '#faf7f2',
                color: '#1a1817',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_desc">Highest Score First</option>
              <option value="score_asc">Lowest Score First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && <Alert type="danger" message={error} />}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <LoadingSpinner message="Querying your career appraisal history..." />
        </div>
      ) : analyses.length === 0 ? (
        /* Extraordinary Luxury Onboarding Showcase when 0 analyses exist */
        <div
          style={{
            background: 'linear-gradient(135deg, #4d1f27 0%, #301117 100%)',
            borderRadius: '26px',
            padding: '3.5rem 3rem',
            color: '#faf7f2',
            boxShadow: '0 16px 40px rgba(77, 31, 39, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Decorative Rings */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(194, 65, 12, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.95rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fbd38d',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={14} />
              <span>Ready for First Evaluation</span>
            </div>

            <h2
              style={{
                fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
                fontSize: '2.3rem',
                fontWeight: 600,
                color: '#ffffff',
                margin: '0 0 1rem',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Your Career Trajectory Vault Awaits
            </h2>

            <p style={{ fontSize: '1rem', color: '#e8ded4', lineHeight: 1.65, margin: '0 0 2.25rem' }}>
              You haven't conducted any resume appraisals yet. Submit your first resume or PDF to unlock deep dimensional scoring, ATS keyword alignment, and a bespoke upskilling roadmap.
            </p>

            {/* 3 Pillar Features */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbd38d', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                  01 • ATS Scoring
                </span>
                <p style={{ fontSize: '0.82rem', color: '#ded3c5', margin: 0, lineHeight: 1.4 }}>
                  Multi-dimensional evaluation across skills, formatting & real impact.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbd38d', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                  02 • Gap Analysis
                </span>
                <p style={{ fontSize: '0.82rem', color: '#ded3c5', margin: 0, lineHeight: 1.4 }}>
                  Pinpoints missing competencies specific to your target job profile.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.1rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbd38d', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                  03 • Upskill Roadmap
                </span>
                <p style={{ fontSize: '0.82rem', color: '#ded3c5', margin: 0, lineHeight: 1.4 }}>
                  Actionable chronological milestones to eliminate qualification gaps.
                </p>
              </div>
            </div>

            <Link
              to="/analyze"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.95rem',
                fontWeight: 800,
                backgroundColor: '#ffffff',
                color: '#4d1f27',
                padding: '0.9rem 1.85rem',
                borderRadius: '14px',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5ede4';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Analyze Your First Resume Now</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      ) : (
        /* List of Luxury Appraisal Dossier Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {analyses.map((item) => {
            const score = item.overallScore ?? 0;
            const scoreBg = score >= 75 ? '#ecfdf5' : score >= 50 ? '#fff7ed' : '#fdf2f4';
            const scoreColor = score >= 75 ? '#065f46' : score >= 50 ? '#c2410c' : '#991b1b';
            const scoreBorder = score >= 75 ? '#a7f3d0' : score >= 50 ? '#fed7aa' : '#fecaca';

            return (
              <div
                key={item.id || item._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid rgba(77, 31, 39, 0.08)',
                  padding: '1.6rem 2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  boxShadow: '0 4px 16px rgba(77, 31, 39, 0.03)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(77, 31, 39, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(77, 31, 39, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(77, 31, 39, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(77, 31, 39, 0.08)';
                }}
              >
                {/* Left: Role and Metadata */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        backgroundColor: '#f2ece2',
                        color: '#4d1f27',
                      }}
                    >
                      {item.resumeSource === 'pdf' ? '📄 PDF Upload' : item.resumeSource === 'profile' ? '👤 Profile Dossier' : '📝 Pasted Text'}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: '#8c827a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', Georgia, serif",
                      fontSize: '1.45rem',
                      fontWeight: 600,
                      color: '#4d1f27',
                      margin: '0 0 0.35rem',
                    }}
                  >
                    {item.targetRole}
                  </h3>

                  <p style={{ fontSize: '0.86rem', color: '#574f4b', margin: 0 }}>
                    AI-powered comprehensive qualification and market readiness assessment.
                  </p>
                </div>

                {/* Center: Radial Score Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      backgroundColor: scoreBg,
                      border: `2px solid ${scoreBorder}`,
                    }}
                  >
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                      {score}
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: scoreColor }}>
                      SCORE
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Link
                      to={`/analyses/${item.id || item._id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        backgroundColor: '#faf7f2',
                        color: '#4d1f27',
                        border: '1px solid #d4c8b8',
                        padding: '9px 16px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4d1f27';
                        e.currentTarget.style.color = '#faf7f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#faf7f2';
                        e.currentTarget.style.color = '#4d1f27';
                      }}
                    >
                      <span>View Dossier</span>
                      <ExternalLink size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id || item._id, item.targetRole)}
                      disabled={deletingId === (item.id || item._id)}
                      title="Delete this evaluation record"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e8decb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#991b1b',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e8decb';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4c8b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: page <= 1 ? '#a8a29e' : '#4d1f27',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>

              <span style={{ fontSize: '0.85rem', color: '#574f4b', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4c8b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: page >= totalPages ? '#a8a29e' : '#4d1f27',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
