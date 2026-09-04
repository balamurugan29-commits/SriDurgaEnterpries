import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [message, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={18} color="#10b981" />;
      case 'error': return <AlertCircle size={18} color="#ef4444" />;
      default: return <Info size={18} color="#6366f1" />;
    }
  };

  const getBorder = () => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.4)';
      case 'error': return 'rgba(239, 68, 68, 0.4)';
      default: return 'rgba(99, 102, 241, 0.4)';
    }
  };

  return (
    <div 
      role="alert"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 1000000,
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${getBorder()}`,
        borderRadius: '12px',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        color: 'white',
        fontSize: '0.875rem',
        maxWidth: '420px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {getIcon()}
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <kbd 
          title="Press Esc on keyboard to close"
          style={{
            fontSize: '0.68rem',
            padding: '2px 5px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: '#94a3b8',
            fontFamily: 'monospace',
            fontWeight: 600
          }}
        >
          Esc
        </kbd>
        <button 
          onClick={onClose} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: '2px' }}
          title="Close (Esc)"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
