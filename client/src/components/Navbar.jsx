import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, FileText, History, Compass, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: isActive ? '#faf7f2' : '#4d1f27',
    textDecoration: 'none',
    padding: '0.45rem 0.9rem',
    borderRadius: '20px',
    backgroundColor: isActive ? '#4d1f27' : 'transparent',
    transition: 'all 0.18s ease',
  });

  return (
    <header
      style={{
        backgroundColor: 'rgba(250, 247, 242, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid #e8e0d5',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.9rem',
          paddingBottom: '0.9rem',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: '#4d1f27',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#4d1f27',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#faf7f2',
              boxShadow: '0 4px 12px rgba(77, 31, 39, 0.25)',
            }}
          >
            <Compass size={18} aria-hidden="true" />
          </div>
          <span
            style={{
              fontFamily: "'Taberna', 'Taberna Serif', 'Playfair Display', serif",
              fontSize: '1.35rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: '#4d1f27',
            }}
          >
            CareerLens
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated ? (
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1rem',
            }}
            className="desktop-nav"
          >
            <NavLink to="/" style={navLinkStyle} end>
              <Compass size={16} aria-hidden="true" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/analyze" style={navLinkStyle}>
              <FileText size={16} aria-hidden="true" />
              <span>New Analysis</span>
            </NavLink>
            <NavLink to="/history" style={navLinkStyle}>
              <History size={16} aria-hidden="true" />
              <span>History</span>
            </NavLink>
            <NavLink to="/profile" style={navLinkStyle}>
              <User size={16} aria-hidden="true" />
              <span>Profile</span>
            </NavLink>

            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--border-subtle)',
                margin: '0 0.25rem',
              }}
            />

            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                maxWidth: '140px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={user?.email}
            >
              {user?.name || user?.email}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem', minHeight: 'auto' }}
              aria-label="Log out of CareerLens"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </nav>
        ) : (
          <div style={{ display: 'none', gap: '0.75rem' }} className="desktop-nav">
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
              Create account
            </Link>
          </div>
        )}

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-nav-toggle"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          style={{
            display: 'inline-flex',
            padding: '0.4rem',
            color: 'var(--text-secondary)',
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {isAuthenticated ? (
            <>
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Signed in as</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.name || user?.email}
                </span>
              </div>
              <NavLink to="/" style={navLinkStyle} end onClick={() => setMobileMenuOpen(false)}>
                <Compass size={16} aria-hidden="true" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/analyze" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}>
                <FileText size={16} aria-hidden="true" />
                <span>New Analysis</span>
              </NavLink>
              <NavLink to="/history" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}>
                <History size={16} aria-hidden="true" />
                <span>History</span>
              </NavLink>
              <NavLink to="/profile" style={navLinkStyle} onClick={() => setMobileMenuOpen(false)}>
                <User size={16} aria-hidden="true" />
                <span>Profile</span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
