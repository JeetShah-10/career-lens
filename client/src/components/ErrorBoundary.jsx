import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2.5rem',
              maxWidth: '520px',
              border: '1px solid #e8decb',
              boxShadow: '0 8px 30px rgba(77, 31, 39, 0.08)',
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>✦</span>
            <h2
              style={{
                fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', serif",
                fontSize: '1.8rem',
                color: '#4d1f27',
                margin: '0 0 0.5rem',
              }}
            >
              Dossier View Synchronized
            </h2>
            <p style={{ color: '#574f4b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your profile was loaded or refreshed. Click below to return to the studio home.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #d4c8b8',
                  color: '#4d1f27',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
              <Link
                to="/"
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#4d1f27',
                  color: '#faf7f2',
                  textDecoration: 'none',
                  fontWeight: 800,
                }}
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
