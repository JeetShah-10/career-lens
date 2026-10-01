import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import { FileText, User, ArrowRight, Calendar, Target, Award, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.analyses.list({ limit: 4, sort: 'newest' });
      setRecentAnalyses(res?.items || []);
      setTotalCount(res?.total || 0);
    } catch (err) {
      // If analyses endpoint is not yet configured or returned an error, capture it cleanly
      setError(err.message || 'Failed to load recent activity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  return (
    <div className="app-container">
      {/* Top Banner / Welcome */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Job Seeker'}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '600px' }}>
              Evaluate your resume alignment with specific target roles, identify concrete technical skill gaps, and track your growth over time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/analyze" className="btn btn-primary">
              <PlusCircle size={16} aria-hidden="true" />
              <span>Analyze resume</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <Award size={18} color="var(--accent)" aria-hidden="true" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Evaluations</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {totalCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Saved in your private history
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <Target size={18} color="var(--accent)" aria-hidden="true" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Latest Evaluation Score</span>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {recentAnalyses.length > 0 ? `${recentAnalyses[0].overallScore}%` : '—'}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {recentAnalyses.length > 0 ? `Target: ${recentAnalyses[0].targetRole}` : 'No resume analyzed yet'}
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            <User size={18} color="var(--accent)" aria-hidden="true" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Profile Sync</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
            Career Profile Active
          </p>
          <Link to="/profile" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
            Update skills & experience →
          </Link>
        </div>
      </div>

      {/* Recent Evaluations Section */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Evaluations
          </h2>
          {recentAnalyses.length > 0 && (
            <Link to="/history" style={{ fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              View all history <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>

        {error && (
          <Alert
            type="warning"
            message={error}
            details={[{ field: 'Note', message: 'Backend analysis history service is initializing or in development.' }]}
          />
        )}

        {loading ? (
          <LoadingSpinner message="Loading recent analyses..." />
        ) : recentAnalyses.length === 0 ? (
          <EmptyState
            title="No resume evaluations yet"
            description="Run your first resume analysis against a target job title to receive grounded feedback and skill gap analysis."
            actionText="Start first analysis"
            actionLink="/analyze"
            icon={FileText}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAnalyses.map((item) => (
              <div
                key={item._id || item.id}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.targetRole}
                    </span>
                    <span className="badge badge-score">
                      Score: {item.overallScore}/100
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} aria-hidden="true" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span>Source: {item.resumeSource || 'paste'}</span>
                  </div>
                </div>

                <Link
                  to={`/analyses/${item._id || item.id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                >
                  <span>View feedback</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
