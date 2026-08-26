import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
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
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 2000,
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
      maxWidth: '380px'
    }}>
      {getIcon()}
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
        <X size={16} />
      </button>
    </div>
  );
};
