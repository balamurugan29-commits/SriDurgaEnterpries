import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  LayoutDashboard, 
  Database, 
  FileSpreadsheet, 
  History, 
  PackageCheck, 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  Layers, 
  Wrench, 
  ClipboardList, 
  Award, 
  ArrowLeftRight, 
  X
} from 'lucide-react';

export const Sidebar = ({ activePage, setActivePage }) => {
  const { 
    layout, 
    navMode, 
    mobileMenuOpen, 
    setMobileMenuOpen
  } = useSettings();

  const [masterDropdownOpen, setMasterDropdownOpen] = useState(
    activePage === 'master' || activePage === 'customer-master'
  );
  
  // State for icon-only mode flyout popover
  const [iconFlyoutOpen, setIconFlyoutOpen] = useState(false);
  const flyoutRef = useRef(null);

  const isMasterActive = activePage === 'master' || activePage === 'customer-master';
  const isCompact = navMode === 'icons';

  // Handle click outside icon flyout menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) {
        setIconFlyoutOpen(false);
      }
    };
    if (iconFlyoutOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [iconFlyoutOpen]);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIconFlyoutOpen(false);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleMasterClick = () => {
    if (isCompact && !mobileMenuOpen) {
      setIconFlyoutOpen(!iconFlyoutOpen);
    } else {
      setMasterDropdownOpen(!masterDropdownOpen);
    }
  };

  // If layout is top and not mobile menu open, hide sidebar on desktop
  const isDesktopHidden = layout === 'top';

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`glass-panel no-print ${mobileMenuOpen ? 'mobile-sidebar-drawer' : isDesktopHidden ? 'desktop-sidebar' : ''}`} 
        style={{ 
          width: isCompact && !mobileMenuOpen ? '72px' : '260px', 
          height: 'calc(100vh - 65px)', 
          borderRadius: 0, 
          borderTop: 'none', 
          borderBottom: 'none', 
          borderLeft: 'none', 
          padding: isCompact && !mobileMenuOpen ? '1rem 0.5rem' : '1.25rem 1rem', 
          display: isDesktopHidden && !mobileMenuOpen ? 'none' : 'flex', 
          flexDirection: 'column', 
          gap: '0.35rem', 
          flexShrink: 0, 
          overflowY: isCompact && !mobileMenuOpen ? 'visible' : 'auto',
          overflowX: 'visible',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg-card)',
          position: 'relative',
          zIndex: 120
        }}
      >
        {/* Sidebar Header for Mobile Drawer */}
        {mobileMenuOpen && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              NAVIGATION MENU
            </span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="btn-outline"
              style={{ width: '30px', height: '30px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Section Label (Full Mode) */}
        {!isCompact && !mobileMenuOpen && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)' }}>
              MAIN MENU
            </span>
          </div>
        )}

        {/* 1. Dashboard */}
        <button
          onClick={() => handleNavClick('dashboard')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            background: activePage === 'dashboard' ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0.05) 100%)' : 'transparent',
            color: activePage === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'dashboard' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Dashboard' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard size={18} color={activePage === 'dashboard' ? '#818cf8' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Dashboard</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Dashboard</span>}
        </button>

        {/* 2. Master Page (Dropdown / Submenu) */}
        <div ref={flyoutRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <button
            onClick={handleMasterClick}
            className="has-tooltip"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
              width: '100%',
              padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
              borderRadius: '10px',
              border: isMasterActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              background: isMasterActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isMasterActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isMasterActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            title={isCompact ? 'Master Pages (Click to Open)' : ''}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={18} color={isMasterActive ? '#818cf8' : '#9ca3af'} />
              {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Master Page</span>}
            </div>
            {(!isCompact || mobileMenuOpen) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.625rem', background: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  2
                </span>
                {masterDropdownOpen ? <ChevronDown size={15} color="#818cf8" /> : <ChevronRight size={15} color="#9ca3af" />}
              </div>
            )}
            {isCompact && !mobileMenuOpen && !iconFlyoutOpen && <span className="nav-tooltip">Master Pages (Click to Open)</span>}
          </button>

          {/* FLYOUT POPOVER MENU FOR ICON-ONLY MODE */}
          {isCompact && !mobileMenuOpen && iconFlyoutOpen && (
            <div 
              style={{
                position: 'absolute',
                left: '100%',
                top: 0,
                marginLeft: '8px',
                background: 'var(--bg-card-solid)',
                border: '1.5px solid var(--border-color-accent)',
                borderRadius: '14px',
                padding: '0.6rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                minWidth: '220px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
                zIndex: 999999,
                animation: 'scaleIn 0.15s ease-out'
              }}
            >
              <div style={{ padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MASTER CATALOGS
                </span>
              </div>
              
              <button
                onClick={() => handleNavClick('master')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'master' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: activePage === 'master' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  color: activePage === 'master' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'master' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Database size={16} color="#818cf8" />
                <span>Item Master Catalog</span>
              </button>

              <button
                onClick={() => handleNavClick('customer-master')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'customer-master' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: activePage === 'customer-master' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                  color: activePage === 'customer-master' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'customer-master' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Building2 size={16} color="#34d399" />
                <span>Customer Directory</span>
              </button>
            </div>
          )}

          {/* Submenu Accordion: Item Master & Customer Master (For Full Mode) */}
          {(!isCompact || mobileMenuOpen) && masterDropdownOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                paddingLeft: '1.25rem', 
                borderLeft: '2px solid rgba(99, 102, 241, 0.3)', 
                marginLeft: '1rem', 
                marginTop: '0.1rem', 
                marginBottom: '0.2rem' 
              }}
            >
              {/* Sub-item 1: Item Master Page */}
              <button
                onClick={() => handleNavClick('master')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'master' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: activePage === 'master' ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0.05) 100%)' : 'transparent',
                  color: activePage === 'master' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'master' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Database size={16} color={activePage === 'master' ? '#818cf8' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Item Master</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-subtle)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                  Catalog
                </span>
              </button>

              {/* Sub-item 2: Customer Page */}
              <button
                onClick={() => handleNavClick('customer-master')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'customer-master' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: activePage === 'customer-master' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
                  color: activePage === 'customer-master' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'customer-master' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Building2 size={16} color={activePage === 'customer-master' ? '#34d399' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Customer Page</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  Directory
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Work Completion Certificate */}
        <button
          onClick={() => handleNavClick('work-completion')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'work-completion' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
            background: activePage === 'work-completion' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
            color: activePage === 'work-completion' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'work-completion' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Work Completion Certificate' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={18} color={activePage === 'work-completion' ? '#34d399' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Work Completion Cert</span>}
          </div>
          {(!isCompact || mobileMenuOpen) && (
            <span style={{ fontSize: '0.625rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
              Workflow
            </span>
          )}
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Work Completion Certificate</span>}
        </button>

        {/* 4. Work Completion History */}
        <button
          onClick={() => handleNavClick('work-completion-history')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            background: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
            color: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Work Completion History' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={18} color={activePage === 'work-completion-history' || activePage === 'work-completion-list' ? '#38bdf8' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Work Completion History</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Work Completion History</span>}
        </button>

        {/* 5. Tax Invoice */}
        <button
          onClick={() => handleNavClick('challan')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'challan' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            background: activePage === 'challan' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
            color: activePage === 'challan' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'challan' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Tax Invoice' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={18} color={activePage === 'challan' ? '#34d399' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Tax Invoice</span>}
          </div>
          {(!isCompact || mobileMenuOpen) && (
            <span style={{ fontSize: '0.625rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
              Auto
            </span>
          )}
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Create Tax Invoice</span>}
        </button>

        {/* 6. Tax Invoice History */}
        <button
          onClick={() => handleNavClick('challan-list')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'challan-list' || activePage === 'challans-list' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            background: activePage === 'challan-list' || activePage === 'challans-list' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
            color: activePage === 'challan-list' || activePage === 'challans-list' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'challan-list' || activePage === 'challans-list' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Tax Invoice History' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={18} color={activePage === 'challan-list' || activePage === 'challans-list' ? '#fbbf24' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Tax Invoice History</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Tax Invoice History</span>}
        </button>

        {/* 7. Job Card */}
        <button
          onClick={() => handleNavClick('job-card')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'job-card' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            background: activePage === 'job-card' ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
            color: activePage === 'job-card' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'job-card' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Job Card' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wrench size={18} color={activePage === 'job-card' ? '#818cf8' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Job Card</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Create Job Card</span>}
        </button>

        {/* 8. Job Card History */}
        <button
          onClick={() => handleNavClick('job-card-history')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'job-card-history' || activePage === 'job-card-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            background: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
            color: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'job-card-history' || activePage === 'job-card-list' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Job Card History' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={18} color={activePage === 'job-card-history' || activePage === 'job-card-list' ? '#38bdf8' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Job Card History</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Job Card History</span>}
        </button>

        {/* 9. Out Gate Pass */}
        <button
          onClick={() => handleNavClick('gate-pass')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'gate-pass' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            background: activePage === 'gate-pass' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
            color: activePage === 'gate-pass' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'gate-pass' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Out Gate Pass' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ArrowLeftRight size={18} color={activePage === 'gate-pass' ? '#fbbf24' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Out Gate Pass</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Create Out Gate Pass</span>}
        </button>

        {/* 10. Gate Pass History */}
        <button
          onClick={() => handleNavClick('gate-pass-list')}
          className="has-tooltip"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
            width: '100%',
            padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
            borderRadius: '10px',
            border: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            background: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
            color: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'var(--text-main)' : 'var(--text-muted)',
            fontWeight: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
          title={isCompact ? 'Gate Pass History' : ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={18} color={activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '#38bdf8' : '#9ca3af'} />
            {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Gate Pass History</span>}
          </div>
          {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Gate Pass History</span>}
        </button>

        {/* Bottom Card (Full mode only) */}
        {!isCompact && (
          <div style={{ marginTop: 'auto', padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <PackageCheck size={16} color="#34d399" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>Auto-Fetch Active</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Entering Item Code or Customer Name auto-loads catalog details!
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
