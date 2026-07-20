import { X } from 'lucide-react';

interface HeroSectionProps {
  totalTasks: number;
  onClose: () => void;
  isCollapsed: boolean;
}

export default function HeroSection({ totalTasks, onClose, isCollapsed }: HeroSectionProps) {
  const thisWeekCount = totalTasks < 10 ? `0${totalTasks}` : `${totalTasks}`;
  
  // Projektově specifický Focus Note
  const focusNoteTitle = totalTasks === 0 ? "Začněte plánovat nový projekt" : "Keep the work moving.";
  const focusNoteSub = totalTasks === 0 ? "Přidejte karty do sloupců a začněte dělat pokroky." : "A thoughtful handoff is progress too.";

  return (
    <section className={`app-hero ${isCollapsed ? 'collapsed' : ''}`} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '3rem',
          background: 'none',
          border: 'none',
          color: 'var(--gray-text)',
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '50%',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
          e.currentTarget.style.color = 'var(--dark-navy)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--gray-text)';
        }}
        title="Skrýt hlavičku"
        data-testid="hide-hero-btn"
      >
        <X size={16} />
      </button>

      <div className="hero-collapse-inner">
        <div className="hero-content">
          <div className="hero-left">
            <span className="hero-team-label">PRODUCT TEAM / Q3</span>
            <h1 className="hero-title">Make meaningful progress.</h1>
            <p className="hero-desc">A calm space for the work that moves your team forward.</p>
          </div>
          <div className="hero-right">
            <div className="hero-double-cards">
              <div className="hero-info-card highlighted-border">
                <span className="info-card-label">THIS WEEK</span>
                <span className="info-card-huge" data-testid="hero-this-week-count">{thisWeekCount}</span>
                <span className="info-card-sub">things thoughtfully moving forward</span>
              </div>
              <div className="hero-info-card">
                <span className="info-card-label">FOCUS NOTE</span>
                <span className="info-card-title">{focusNoteTitle}</span>
                <span className="info-card-sub">{focusNoteSub}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
