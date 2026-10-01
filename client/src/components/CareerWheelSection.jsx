import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CAREER_CARDS } from '../data/careersData';
import './CareerWheel.css';

export default function CareerWheelSection() {
  const runwayRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [radius, setRadius] = useState(580);
  const [cardWidth, setCardWidth] = useState(220);

  // User requested: in the wheel, instead of 25, change it to only 15
  const wheelCards = CAREER_CARDS.slice(0, 15);
  const numCards = wheelCards.length; // Exactly 15
  const stepAngle = 360 / numCards;

  // Dynamic responsive sizing
  useEffect(() => {
    const updateSize = () => {
      const w = Math.max(180, Math.min(240, window.innerWidth * 0.16));
      setCardWidth(w);
      const r = Math.max(520, Math.min(680, window.innerHeight * 0.74));
      setRadius(r);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // NATURAL SCROLL-BASED ROTATION:
  // As the user naturally scrolls down the runway, the cards rotate sequentially from 1 to 25.
  // Releases smoothly to next section upon completing all cards.
  useEffect(() => {
    let rafId;

    const handleScroll = () => {
      if (!runwayRef.current) return;
      const rect = runwayRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.max(0, Math.min(scrollable, -rect.top));
      const fraction = progress / scrollable;
      const nextIndex = Math.min(numCards - 1, Math.floor(fraction * numCards));

      setCurrentIndex((prev) => (prev !== nextIndex ? nextIndex : prev));
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
  }, [numCards]);

  const jumpToIndex = (targetIdx) => {
    if (!runwayRef.current) return;
    const runwayTop = runwayRef.current.offsetTop;
    const scrollable = runwayRef.current.offsetHeight - window.innerHeight;
    const targetScroll = runwayTop + (targetIdx / (numCards - 1)) * scrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    setCurrentIndex(targetIdx);
  };

  // Keyboard navigation support (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!runwayRef.current) return;
      const rect = runwayRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex((prev) => {
          const next = Math.min(numCards - 1, prev + 1);
          jumpToIndex(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex((prev) => {
          const next = Math.max(0, prev - 1);
          jumpToIndex(next);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numCards]);

  const activeCard = wheelCards[currentIndex] || wheelCards[0];
  const progressRatio = (currentIndex + 1) / numCards;

  return (
    <section 
      className="career-wheel-wrapper" 
      id="career-wheel-section" 
      ref={runwayRef}
      style={{
        '--wheel-radius': `${radius}px`,
        '--card-width': `${cardWidth}px`,
      }}
    >
      <div className="career-wheel-sticky">
        {/* Minimalist Top Header */}
        <div className="career-wheel-header">
          <div>
            <div className="career-wheel-badge">
              <span>CAREER HORIZONS</span>
              <span>•</span>
              <span>EXHIBITION</span>
            </div>
            <h2 className="career-wheel-title">Visual Career Horizons</h2>
          </div>

          {/* Right Top Corner: Explore More Jobs Button */}
          <button
            type="button"
            className="career-wheel-explore-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('open-career-explorer'))}
            aria-label="Explore more jobs"
          >
            <Sparkles size={14} />
            <span>Explore More Jobs</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 3D Wheel Center: Trigonometrically placed cards */}
        <div className="career-wheel-center">
          {wheelCards.map((card, i) => {
            const diff = i - currentIndex;
            const angleDeg = diff * stepAngle;
            const normAngle = ((angleDeg + 180) % 360 + 360) % 360 - 180;
            const absAngle = Math.abs(normAngle);

            const rad = (normAngle * Math.PI) / 180;
            const x = Math.sin(rad) * radius;
            const y = -Math.cos(rad) * radius;

            const tilt = normAngle * 0.72;
            const isActive = i === currentIndex;
            const blurAmount = isActive ? 0 : Math.min(8, (absAngle / 30) * 6);
            const grayscaleAmount = isActive ? 0 : Math.min(90, (absAngle / 25) * 85);
            const opacity = isActive ? 1 : Math.max(0.15, 1 - absAngle / 65);
            const scale = isActive ? 1.08 : Math.max(0.85, 1 - absAngle / 120);

            if (absAngle > 95) return null;

            return (
              <div
                key={card.id}
                className={`career-wheel-card ${isActive ? 'career-wheel-card-active' : ''}`}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${tilt}deg) scale(${scale})`,
                  filter: `blur(${blurAmount}px) grayscale(${grayscaleAmount}%)`,
                  opacity,
                  zIndex: isActive ? 25 : Math.max(1, 20 - Math.round(absAngle / 8)),
                }}
                onClick={() => jumpToIndex(i)}
              >
                <img
                  src={card.img}
                  alt={card.title}
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = card.fallbackGrad;
                  }}
                />

                <div className="career-wheel-card-overlay" />

                <div className="career-wheel-card-inner">
                  <span className="career-wheel-card-domain">{card.domain}</span>
                  <h3 className="career-wheel-card-heading">{card.title}</h3>
                  <p className="career-wheel-card-sub">{card.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Title directly below the top card */}
        <div className="career-wheel-active-title-banner">
          <div className="career-wheel-hero-role">
            {activeCard.title}
          </div>
        </div>

        {/* MINIMALIST ARCHITECTURAL INDICATOR LINE:
            Tells the user at what card they are, with clean editorial hairline & progress marker */}
        <div className="career-wheel-indicator-line-container">
          <div className="career-wheel-indicator-header">
            <span className="career-wheel-step-counter">
              {String(currentIndex + 1).padStart(2, '0')} / {String(numCards).padStart(2, '0')}
            </span>
            <span className="career-wheel-step-title">
              {activeCard.title}
            </span>
            <span className="career-wheel-step-domain">
              {activeCard.domain}
            </span>
          </div>

          <div className="career-wheel-track-line">
            <div 
              className="career-wheel-track-progress" 
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
