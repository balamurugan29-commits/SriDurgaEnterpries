import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  X, 
  Sun, 
  Moon, 
  PanelLeft, 
  PanelTop, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  Sliders, 
  Sparkles,
  Smartphone,
  Monitor
} from 'lucide-react';

export const AppSettingsModal = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    theme, 
    setTheme, 
    layout, 
    setLayout, 
    navMode, 
    setNavMode, 
    resetSettings 
  } = useSettings();

  if (!isSettingsOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={() => setIsSettingsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color-accent)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)' }}>
              <Sliders size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Application Settings
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Customize theme, navigation layout & display preferences
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="btn-outline"
            style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Section 1: Theme Selection */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                Appearance & Color Theme
              </label>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', textTransform: 'capitalize' }}>
                Active: <strong>{theme} Mode</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {/* Dark Theme Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: theme === 'dark' ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {theme === 'dark' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                    <Moon size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Dark Theme</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Deep slate & glow</span>
                  </div>
                </div>
                {/* Visual Swatch */}
                <div style={{ height: '24px', borderRadius: '6px', background: '#060913', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 6px', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <div style={{ width: '30px', height: '4px', borderRadius: '2px', background: '#334155', marginLeft: 'auto' }} />
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: theme === 'light' ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: theme === 'light' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {theme === 'light' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                    <Sun size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Light Theme</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Crisp high contrast</span>
                  </div>
                </div>
                {/* Visual Swatch */}
                <div style={{ height: '24px', borderRadius: '6px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 6px', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                  <div style={{ width: '30px', height: '4px', borderRadius: '2px', background: '#cbd5e1', marginLeft: 'auto' }} />
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Layout Orientation (Sidebar vs Topbar) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                Navigation Layout Orientation
              </label>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', textTransform: 'capitalize' }}>
                Active: <strong>{layout === 'side' ? 'Sidebar (Left)' : 'Top Navigation Bar'}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {/* Sidebar Navigation */}
              <button
                type="button"
                onClick={() => setLayout('side')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: layout === 'side' ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: layout === 'side' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {layout === 'side' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                    <PanelLeft size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Side Navigation</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Left-docked sidebar</span>
                  </div>
                </div>
                {/* Visual Layout Mockup */}
                <div style={{ height: '36px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: '25%', background: 'rgba(99, 102, 241, 0.35)', borderRight: '1px solid var(--border-color)' }} />
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', padding: '4px' }}>
                    <div style={{ width: '60%', height: '4px', background: 'var(--border-color)', borderRadius: '2px' }} />
                  </div>
                </div>
              </button>

              {/* Top Navigation */}
              <button
                type="button"
                onClick={() => setLayout('top')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: layout === 'top' ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: layout === 'top' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {layout === 'top' && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                    <PanelTop size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Top Navigation</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Horizontal top bar</span>
                  </div>
                </div>
                {/* Visual Layout Mockup */}
                <div style={{ height: '36px', borderRadius: '6px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ height: '10px', background: 'rgba(16, 185, 129, 0.4)', borderBottom: '1px solid var(--border-color)' }} />
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', padding: '4px' }}>
                    <div style={{ width: '60%', height: '4px', background: 'var(--border-color)', borderRadius: '2px' }} />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Navigation Display (Full with labels vs Icon Only) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                Navigation Bar Display Mode
              </label>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                Active: <strong>{navMode === 'full' ? 'Icons + Labels' : 'Icons Only (Compact)'}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {/* Full Mode */}
              <button
                type="button"
                onClick={() => setNavMode('full')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: navMode === 'full' ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: navMode === 'full' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
                  <Eye size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Full Labels</span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Icons + text wording</span>
                </div>
                {navMode === 'full' && <Check size={14} color="#6366f1" strokeWidth={3} />}
              </button>

              {/* Icon Only Mode */}
              <button
                type="button"
                onClick={() => setNavMode('icons')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: navMode === 'icons' ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: navMode === 'icons' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0 }}>
                  <EyeOff size={15} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Icons Only</span>
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Hide text wording</span>
                </div>
                {navMode === 'icons' && <Check size={14} color="#6366f1" strokeWidth={3} />}
              </button>
            </div>
          </div>

          {/* Quick Notice on Mobile Responsiveness */}
          <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Smartphone size={20} color="#10b981" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              <strong>Adaptive Layout:</strong> On mobile screens & tablets, the navigation automatically becomes a smooth touch-enabled drawer menu for optimal usability.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={resetSettings}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
          >
            <Check size={15} />
            <span>Done & Apply</span>
          </button>
        </div>

      </div>
    </div>
  );
};
