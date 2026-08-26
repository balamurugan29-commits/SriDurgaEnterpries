import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  Factory, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Menu, 
  X,
  LayoutDashboard,
  Layers,
  Database,
  Building2,
  Award,
  History,
  FileSpreadsheet,
  Wrench,
  ClipboardList,
  ArrowLeftRight,
  ChevronDown
} from 'lucide-react';

export const Navbar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const { 
    theme, 
    toggleTheme, 
    layout, 
    navMode, 
    setIsSettingsOpen, 
    mobileMenuOpen, 
    setMobileMenuOpen 
  } = useSettings();

  const [topMasterOpen, setTopMasterOpen] = useState(false);
  const topDropdownRef = useRef(null);

  // Click outside to close top nav dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topDropdownRef.current && !topDropdownRef.current.contains(event.target)) {
        setTopMasterOpen(false);
      }
    };
    if (topMasterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [topMasterOpen]);

  const getTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'master': return 'Item Master Management';
      case 'customer-master': return 'Customer Directory Management';
      case 'challan': return 'Create Tax Invoice';
      case 'challans-list': case 'challan-list': return 'Tax Invoice History';
      case 'gate-pass': return 'Create In & Out Gate Pass';
      case 'gate-pass-list': case 'gate-pass-history': return 'In & Out Gate Pass History';
      case 'job-card': return 'Create Job Card';
      case 'job-card-history': case 'job-card-list': return 'Job Card History';
      case 'work-completion': return 'Create Work Completion Certificate';
      case 'work-completion-history': case 'work-completion-list': return 'Work Completion History';
      default: return 'Sri Durga Management System';
    }
  };

  const isMasterActive = activePage === 'master' || activePage === 'customer-master';

  return (
    <header 
      className="glass-panel no-print navbar-container" 
      style={{ 
        borderRadius: 0, 
        borderTop: 'none', 
        borderLeft: 'none', 
        borderRight: 'none', 
        padding: '0.75rem 1.75rem', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '0.625rem',
        position: 'sticky',
        top: 0,
        zIndex: 500,
        background: 'var(--bg-card)'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        
        {/* Left Side: Mobile Menu Button & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline"
            style={{ 
              display: 'none', 
              padding: '0.45rem', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
            id="mobile-nav-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo & Company Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)', 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              flexShrink: 0 
            }}>
              <Factory size={22} color="white" />
            </div>
            <div>
              <h1 className="navbar-brand-title" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                SRI DURGA ENTERPRISES
              </h1>
              <p className="navbar-page-title" style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>
                {getTitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: User Profile, App Settings & Controls */}
        {user && (
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            
            {/* User Profile Badge */}
            <div className="navbar-user-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'var(--bg-card)', padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon size={15} color="#818cf8" />
              </div>
              <div className="navbar-user-details">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', lineHeight: 1.2, color: 'var(--text-main)' }}>
                  {user.fullName || user.userId}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                  <ShieldCheck size={10} /> User ID: {user.userId}
                </span>
              </div>
            </div>

            {/* APP SETTINGS BUTTON (Beside Sri Durga Administrator) */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="btn btn-outline"
              style={{ 
                padding: '0.45rem 0.875rem', 
                fontSize: '0.8rem', 
                gap: '0.4rem', 
                borderColor: 'var(--border-color-accent)',
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--text-main)'
              }} 
              title="Open Application Settings (Themes, Layouts, Navigation)"
            >
              <SettingsIcon size={15} color="#818cf8" />
              <span>App Settings</span>
            </button>

            {/* Quick 1-Click Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline"
              style={{ 
                padding: '0.45rem', 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
            </button>

            {/* Logout Button */}
            <button 
              onClick={logout} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem 0.875rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }} 
              title="Sign Out"
            >
              <LogOut size={15} />
              <span className="navbar-user-details">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* TOP NAVIGATION BAR (Rendered horizontally when layout === 'top') */}
      {layout === 'top' && user && (
        <div 
          className="top-nav-bar"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            paddingTop: '0.5rem', 
            borderTop: '1px solid var(--border-color)',
            overflow: 'visible',
            flexWrap: 'wrap',
            width: '100%',
            position: 'relative',
            zIndex: 600
          }}
        >
          {/* Top Nav: Dashboard */}
          <button
            onClick={() => setActivePage('dashboard')}
            className={`has-tooltip top-nav-item btn ${activePage === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <LayoutDashboard size={15} />
            {navMode === 'full' && <span>Dashboard</span>}
            <span className="nav-tooltip">Dashboard</span>
          </button>

          {/* Top Nav: Master Page Dropdown */}
          <div ref={topDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
            <button
              onClick={() => setTopMasterOpen(!topMasterOpen)}
              className={`has-tooltip top-nav-item btn ${isMasterActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Master Pages"
            >
              <Layers size={15} />
              {navMode === 'full' && <span>Master Directory</span>}
              <ChevronDown size={13} />
              {navMode === 'icons' && !topMasterOpen && <span className="nav-tooltip">Master Pages</span>}
            </button>

            {topMasterOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: 'var(--bg-card-solid)',
                  border: '1.5px solid var(--border-color-accent)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  zIndex: 999999,
                  minWidth: '220px',
                  animation: 'scaleIn 0.15s ease-out'
                }}
              >
                <div style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    MASTER PAGES
                  </span>
                </div>

                <button
                  onClick={() => { setActivePage('master'); setTopMasterOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'master' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'master' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Database size={15} color="#818cf8" />
                  <span>Item Master Catalog</span>
                </button>
                <button
                  onClick={() => { setActivePage('customer-master'); setTopMasterOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'customer-master' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'customer-master' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Building2 size={15} color="#34d399" />
                  <span>Customer Directory</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Nav: Work Completion Certificate */}
          <button
            onClick={() => setActivePage('work-completion')}
            className={`has-tooltip top-nav-item btn ${activePage === 'work-completion' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Award size={15} />
            {navMode === 'full' && <span>Work Completion</span>}
            <span className="nav-tooltip">Work Completion Cert</span>
          </button>

          {/* Top Nav: Work Completion History */}
          <button
            onClick={() => setActivePage('work-completion-history')}
            className={`has-tooltip top-nav-item btn ${activePage === 'work-completion-history' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <History size={15} />
            {navMode === 'full' && <span>WCC History</span>}
            <span className="nav-tooltip">Work Completion History</span>
          </button>

          {/* Top Nav: Tax Invoice */}
          <button
            onClick={() => setActivePage('challan')}
            className={`has-tooltip top-nav-item btn ${activePage === 'challan' ? 'btn-secondary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <FileSpreadsheet size={15} />
            {navMode === 'full' && <span>Tax Invoice</span>}
            <span className="nav-tooltip">Create Tax Invoice</span>
          </button>

          {/* Top Nav: Tax Invoice History */}
          <button
            onClick={() => setActivePage('challan-list')}
            className={`has-tooltip top-nav-item btn ${activePage === 'challan-list' || activePage === 'challans-list' ? 'btn-accent' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <History size={15} />
            {navMode === 'full' && <span>Invoice History</span>}
            <span className="nav-tooltip">Tax Invoice History</span>
          </button>

          {/* Top Nav: Job Card */}
          <button
            onClick={() => setActivePage('job-card')}
            className={`has-tooltip top-nav-item btn ${activePage === 'job-card' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Wrench size={15} />
            {navMode === 'full' && <span>Job Card</span>}
            <span className="nav-tooltip">Create Job Card</span>
          </button>

          {/* Top Nav: Job Card History */}
          <button
            onClick={() => setActivePage('job-card-history')}
            className={`has-tooltip top-nav-item btn ${activePage === 'job-card-history' || activePage === 'job-card-list' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <ClipboardList size={15} />
            {navMode === 'full' && <span>Job Card History</span>}
            <span className="nav-tooltip">Job Card History</span>
          </button>

          {/* Top Nav: Out Gate Pass */}
          <button
            onClick={() => setActivePage('gate-pass')}
            className={`has-tooltip top-nav-item btn ${activePage === 'gate-pass' ? 'btn-accent' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <ArrowLeftRight size={15} />
            {navMode === 'full' && <span>Gate Pass</span>}
            <span className="nav-tooltip">Create Gate Pass</span>
          </button>

          {/* Top Nav: Gate Pass History */}
          <button
            onClick={() => setActivePage('gate-pass-list')}
            className={`has-tooltip top-nav-item btn ${activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <History size={15} />
            {navMode === 'full' && <span>Gate Pass History</span>}
            <span className="nav-tooltip">Gate Pass History</span>
          </button>
        </div>
      )}
    </header>
  );
};
