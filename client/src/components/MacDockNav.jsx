import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Compass, 
  FileText, 
  History as HistoryIcon, 
  User, 
  Briefcase, 
  LogIn, 
  LogOut, 
  Search, 
  Sparkles, 
  ArrowRight,
  X
} from 'lucide-react';
import { CAREERS_CATALOG, CAREER_CATEGORIES } from '../data/careersData';
import './MacDockNav.css';

export default function MacDockNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  React.useEffect(() => {
    const handleOpen = () => setIsExplorerOpen(true);
    window.addEventListener('open-career-explorer', handleOpen);
    return () => window.removeEventListener('open-career-explorer', handleOpen);
  }, []);

  const scrollToHeroTop = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const scrollToCareerWheel = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('career-wheel-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('career-wheel-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  // Dock items definition with authentic macOS icons
  const primaryDockItems = [
    {
      id: 'home',
      name: 'Studio Home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z" fill="rgba(255,255,255,0.2)" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
      gradientClass: 'icon-gradient-home',
      action: scrollToHeroTop,
      isActive: location.pathname === '/',
    },
    {
      id: 'analyze',
      name: 'AI Resume Analyzer',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="rgba(255,255,255,0.2)" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
      ),
      gradientClass: 'icon-gradient-analyze',
      action: () => navigate('/analyze'),
      isActive: location.pathname === '/analyze',
    },
    {
      id: 'history',
      name: 'Analysis History',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 2.6-6.3L3 8" />
          <polyline points="3 3 3 8 8 8" />
          <polyline points="12 8 12 12 15 13.5" />
          <circle cx="12" cy="12" r="2.5" fill="rgba(255,255,255,0.25)" />
        </svg>
      ),
      gradientClass: 'icon-gradient-history',
      action: () => navigate('/history'),
      isActive: location.pathname === '/history',
    },
    {
      id: 'profile',
      name: 'Career Profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7.5" r="4" fill="rgba(255,255,255,0.22)" />
          <path d="M4 20.5a8 8 0 0 1 16 0" fill="rgba(255,255,255,0.2)" />
        </svg>
      ),
      gradientClass: 'icon-gradient-profile',
      action: () => navigate('/profile'),
      isActive: location.pathname === '/profile',
    },
    {
      id: 'explorer',
      name: 'Explore Other Careers (24+ Roles)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="15" rx="3" fill="rgba(255,255,255,0.2)" />
          <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M10 12v2a2 2 0 0 0 4 0v-2" fill="#ffffff" />
        </svg>
      ),
      gradientClass: 'icon-gradient-explorer',
      action: () => setIsExplorerOpen(true),
      isActive: isExplorerOpen,
    },
  ];

  const secondaryDockItems = isAuthenticated
    ? [
        {
          id: 'logout',
          name: `Sign Out (${user?.name?.split(' ')[0] || 'User'})`,
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          ),
          gradientClass: 'icon-gradient-auth',
          action: () => {
            logout();
            navigate('/login');
          },
          isActive: false,
        },
      ]
    : [
        {
          id: 'login',
          name: 'Sign In / Register',
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="3" fill="rgba(255,255,255,0.22)" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16.5" r="1.5" fill="#ffffff" />
            </svg>
          ),
          gradientClass: 'icon-gradient-auth',
          action: () => navigate('/login'),
          isActive: location.pathname === '/login' || location.pathname === '/register',
        },
      ];

  const allItems = [...primaryDockItems, 'divider', ...secondaryDockItems];

  // Dynamic macOS hover magnification calculation
  const getScaleAndTransform = (index) => {
    if (hoveredIndex === null) return { transform: 'scale(1) translateY(0)' };
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return { transform: 'scale(1.36) translateY(-9px)' };
    if (distance === 1) return { transform: 'scale(1.18) translateY(-4px)' };
    if (distance === 2) return { transform: 'scale(1.06) translateY(-1px)' };
    return { transform: 'scale(1) translateY(0)' };
  };

  // Filter states for the macOS Career Explorer
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Top trending skill tags for fast 1-click filtering
  const popularSkills = [
    'Python',
    'React',
    'TypeScript',
    'SQL',
    'Git',
    'Linux',
    'Figma',
    'Node.js',
    'Docker',
    'Machine Learning',
  ];

  // Distinct career domains from catalog with count
  const allDomains = ['All', ...CAREER_CATEGORIES];

  // Compute live count for each domain
  const domainCounts = React.useMemo(() => {
    const counts = { All: CAREERS_CATALOG.length };
    CAREERS_CATALOG.forEach((c) => {
      counts[c.domain] = (counts[c.domain] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter and sort careers
  const filteredCareers = React.useMemo(() => {
    return CAREERS_CATALOG.filter((career) => {
      // Domain filter
      const matchesDomain = selectedDomain === 'All' || career.domain === selectedDomain;

      // Level filter
      const matchesLevel = selectedLevel === 'All' || career.level === selectedLevel;

      // Specific skill chip filter
      const matchesSkill =
        !selectedSkill ||
        career.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase());

      // Text search query
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        career.title.toLowerCase().includes(query) ||
        career.domain.toLowerCase().includes(query) ||
        (career.subtitle && career.subtitle.toLowerCase().includes(query)) ||
        career.skills.some((s) => s.toLowerCase().includes(query));

      return matchesDomain && matchesLevel && matchesSkill && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
      if (sortBy === 'salary_high') {
        const getSal = (s) => parseInt(s.match(/\d+/g)?.[1] || s.match(/\d+/g)?.[0] || '0', 10);
        return getSal(b.salary) - getSal(a.salary);
      }
      return 0;
    });
  }, [searchQuery, selectedDomain, selectedLevel, selectedSkill, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDomain !== 'All' ||
    selectedLevel !== 'All' ||
    selectedSkill !== '' ||
    sortBy !== 'default';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('All');
    setSelectedLevel('All');
    setSelectedSkill('');
    setSortBy('default');
  };

  // Hide dock completely when unauthenticated or on login/signup pages
  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Floating macOS Dock Bar */}
      <nav className="mac-dock-container" aria-label="MacBook Quick Navigation Dock">
        <div 
          className="mac-dock-bar"
          onMouseLeave={() => {
            setHoveredIndex(null);
            setActiveTooltip(null);
          }}
        >
          {allItems.map((item, index) => {
            if (item === 'divider') {
              return <div key="divider" className="mac-dock-divider" />;
            }

            const itemTransform = getScaleAndTransform(index);

            return (
              <button
                key={item.id}
                type="button"
                className="mac-dock-item"
                style={itemTransform}
                onClick={item.action}
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  setActiveTooltip(item.name);
                }}
                aria-label={item.name}
              >
                {/* Floating Capsule Tooltip */}
                {activeTooltip === item.name && (
                  <div className="mac-dock-tooltip">
                    {item.name}
                  </div>
                )}

                {/* Squircle App Tile */}
                <div className={`mac-dock-icon ${item.gradientClass}`}>
                  {item.icon}
                </div>

                {/* Running App Dot Indicator */}
                {item.isActive ? (
                  <div className="mac-dock-dot" />
                ) : (
                  <div className="mac-dock-dot-placeholder" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Enlarged macOS Career Explorer Window Modal with Full Filtering */}
      {isExplorerOpen && (
        <div className="mac-window-overlay" onClick={() => setIsExplorerOpen(false)}>
          <div 
            className="mac-window" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mac-window-title"
          >
            {/* macOS Titlebar */}
            <div className="mac-titlebar">
              <div className="mac-traffic-lights">
                <button 
                  className="mac-traffic-dot mac-dot-close" 
                  onClick={() => setIsExplorerOpen(false)}
                  title="Close"
                  aria-label="Close window"
                >
                  <X size={8} color="#4d1f27" />
                </button>
                <button className="mac-traffic-dot mac-dot-minimize" title="Minimize" aria-label="Minimize window" />
                <button className="mac-traffic-dot mac-dot-maximize" title="Zoom" aria-label="Zoom window" />
              </div>

              <span className="mac-titlebar-title" id="mac-window-title">
                Career Catalog & Benchmarking Explorer — 25 Specialized Roles
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#4d1f27',
                      backgroundColor: 'rgba(77, 31, 39, 0.08)',
                      border: '1px solid rgba(77, 31, 39, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Window Content */}
            <div className="mac-window-body">
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.65rem', color: '#4d1f27', fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
                    Career Catalog & Benchmark Directory
                  </h3>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#666', maxWidth: '640px', lineHeight: 1.5 }}>
                    Explore 25 cross-industry roles. Filter by domain, seniority level, target skills, or compensation to test and evaluate your resume.
                  </p>
                </div>

                {/* Primary Search Input */}
                <div style={{ position: 'relative', minWidth: '280px', flex: '0 1 340px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search roles, skills, or domains..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.2rem 0.65rem 2.4rem',
                      borderRadius: '12px',
                      border: '1.5px solid #d8d0c5',
                      backgroundColor: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#888',
                        padding: 0,
                        display: 'flex',
                      }}
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Comprehensive Filter Controls Toolbar */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.15rem 1.35rem',
                  border: '1px solid #e8e0d5',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}
              >
                {/* Top Row: Category / Domain Pills */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4d1f27', marginBottom: '0.45rem' }}>
                    Industry Domain / Category:
                  </div>
                  <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
                    {allDomains.map((dom) => {
                      const isSelected = selectedDomain === dom;
                      const count = domainCounts[dom] || 0;
                      return (
                        <button
                          key={dom}
                          type="button"
                          onClick={() => setSelectedDomain(dom)}
                          style={{
                            padding: '0.35rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: isSelected ? '#4d1f27' : '#faf7f2',
                            color: isSelected ? '#faf7f2' : '#4d1f27',
                            boxShadow: isSelected ? '0 2px 6px rgba(77, 31, 39, 0.25)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{dom}</span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              opacity: isSelected ? 0.9 : 0.6,
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                              padding: '1px 6px',
                              borderRadius: '8px',
                            }}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row: Seniority Level, Popular Skill Chips, Sort, & Reset */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', borderTop: '1px solid #f2ede4', paddingTop: '0.85rem' }}>
                  {/* Left: Seniority Level Filter & Skill Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Level selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>Level:</span>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #d8d0c5',
                          backgroundColor: '#faf7f2',
                          color: '#4d1f27',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="All">All Seniorities</option>
                        <option value="Associate to Senior">Associate to Senior</option>
                        <option value="Mid-Level">Mid-Level</option>
                        <option value="Senior / Lead">Senior / Lead</option>
                      </select>
                    </div>

                    {/* Popular skill chips */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>Skill:</span>
                      {popularSkills.slice(0, 7).map((skill) => {
                        const isSkillActive = selectedSkill.toLowerCase() === skill.toLowerCase();
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => setSelectedSkill(isSkillActive ? '' : skill)}
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: isSkillActive ? '1px solid #4d1f27' : '1px solid #e2dcd2',
                              backgroundColor: isSkillActive ? '#4d1f27' : '#ffffff',
                              color: isSkillActive ? '#ffffff' : '#555',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {skill} {isSkillActive && '✕'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Sort & Clear Filters */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #d8d0c5',
                          backgroundColor: '#faf7f2',
                          color: '#4d1f27',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="default">Default Order</option>
                        <option value="title_asc">Title (A – Z)</option>
                        <option value="title_desc">Title (Z – A)</option>
                        <option value="salary_high">Highest Compensation</option>
                      </select>
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          backgroundColor: '#faf7f2',
                          border: '1px dashed #c2410c',
                          color: '#c2410c',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <X size={13} />
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Results Summary Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#4d1f27', fontWeight: 700 }}>
                  Showing <strong>{filteredCareers.length}</strong> of <strong>{CAREERS_CATALOG.length}</strong> career roles
                  {selectedDomain !== 'All' && <span> in <em>"{selectedDomain}"</em></span>}
                  {selectedSkill && <span> matching <em>"{selectedSkill}"</em></span>}
                </div>

                {hasActiveFilters && (
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>
                    Active filters applied
                  </span>
                )}
              </div>

              {/* Grid of Career Cards or Empty State */}
              {filteredCareers.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '18px',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    border: '1px dashed #d8d0c5',
                    margin: '1rem 0',
                  }}
                >
                  <Compass size={44} color="#8c827a" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.6 }} />
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#4d1f27', fontWeight: 700 }}>
                    No Career Horizons Match Your Filter Criteria
                  </h4>
                  <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: '#666', maxWidth: '420px', marginInline: 'auto' }}>
                    Try clearing your search query or selecting a different domain category to explore roles.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    style={{
                      padding: '0.6rem 1.35rem',
                      borderRadius: '10px',
                      backgroundColor: '#4d1f27',
                      color: '#faf7f2',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {filteredCareers.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '18px',
                        padding: '1.4rem',
                        border: '1px solid #e8e0d5',
                        boxShadow: '0 2px 10px rgba(77, 31, 39, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 24px rgba(77, 31, 39, 0.09)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(77, 31, 39, 0.04)';
                      }}
                    >
                      <div>
                        {/* Domain & Level Badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                          <span
                            onClick={() => setSelectedDomain(c.domain)}
                            title="Click to filter by domain"
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              color: '#c2410c',
                              backgroundColor: '#fff7ed',
                              padding: '3px 9px',
                              borderRadius: '8px',
                              letterSpacing: '0.05em',
                              cursor: 'pointer',
                            }}
                          >
                            {c.domain}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#065f46',
                              backgroundColor: '#ecfdf5',
                              padding: '3px 9px',
                              borderRadius: '8px',
                            }}
                          >
                            {c.level}
                          </span>
                        </div>

                        {/* Title */}
                        <h4
                          style={{
                            margin: '0 0 0.45rem',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#1c1917',
                            fontFamily: 'var(--font-serif)',
                            lineHeight: 1.3,
                          }}
                        >
                          {c.title}
                        </h4>

                        {/* Subtitle / Synopsis */}
                        <p style={{ fontSize: '0.82rem', color: '#574f4b', margin: '0 0 0.85rem', lineHeight: 1.5 }}>
                          {c.subtitle}
                        </p>

                        {/* Compensation Pill */}
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: '#4d1f27',
                            backgroundColor: '#faf7f2',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #ece5dc',
                            marginBottom: '0.9rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ color: '#776e6a' }}>Compensation Band:</span>
                          <strong>{c.salary}</strong>
                        </div>

                        {/* Clickable Skill Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.25rem' }}>
                          {c.skills.map((skill) => {
                            const isSkillActive = selectedSkill.toLowerCase() === skill.toLowerCase();
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => setSelectedSkill(isSkillActive ? '' : skill)}
                                title={`Filter by ${skill}`}
                                style={{
                                  fontSize: '0.7rem',
                                  backgroundColor: isSkillActive ? '#4d1f27' : '#f5f0ea',
                                  color: isSkillActive ? '#ffffff' : '#4d1f27',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.12s ease',
                                }}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Launch Benchmark Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsExplorerOpen(false);
                          navigate('/analyze', { state: { prefilledRole: c.title } });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#4d1f27',
                          color: '#faf7f2',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(77, 31, 39, 0.22)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#692a35')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4d1f27')}
                      >
                        <Sparkles size={14} />
                        <span>Benchmark My Resume for this Role</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
