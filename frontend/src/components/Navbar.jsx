import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck, Factory } from 'lucide-react';

export const Navbar = ({ activePage }) => {
  const { user, logout } = useAuth();

  const getTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'master': return 'Item Master Management';
      case 'customer-master': return 'Customer Directory Management';
      case 'challan': return 'Create Tax Invoice';
      case 'challans-list': return 'Tax Invoice History';
      case 'gate-pass': return 'Create In & Out Gate Pass';
      case 'gate-pass-list': case 'gate-pass-history': return 'In & Out Gate Pass History';
      case 'job-card': return 'Create Job Card';
      case 'job-card-history': case 'job-card-list': return 'Job Card History';
      case 'work-completion': return 'Create Work Completion Certificate';
      case 'work-completion-history': case 'work-completion-list': return 'Work Completion History';
      default: return 'Sri Durga Management System';
    }
  };

  return (
    <header className="glass-panel no-print" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
          <Factory size={24} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SRI DURGA ENTERPRISES
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            {getTitle()}
          </p>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.375rem 0.875rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={16} color="#818cf8" />
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>{user.fullName || user.userId}</span>
              <span style={{ fontSize: '0.675rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ShieldCheck size={10} /> User ID: {user.userId}
              </span>
            </div>
          </div>

          <button onClick={logout} className="btn btn-outline" style={{ padding: '0.45rem 0.875rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }} title="Sign Out">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};
