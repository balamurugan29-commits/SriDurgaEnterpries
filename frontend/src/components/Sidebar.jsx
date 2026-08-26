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
  ShieldCheck,
  BookOpen,
  ShoppingBag,
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

  const [certDropdownOpen, setCertDropdownOpen] = useState(
    activePage === 'work-completion' || activePage === 'work-completion-history' || activePage === 'work-completion-list'
  );

  const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(
    activePage === 'challan' || activePage === 'challan-list' || activePage === 'challans-list'
  );

  const [cardDropdownOpen, setCardDropdownOpen] = useState(
    activePage === 'job-card' || activePage === 'job-card-history' || activePage === 'job-card-list'
  );

  const [passDropdownOpen, setPassDropdownOpen] = useState(
    activePage === 'gate-pass' || activePage === 'gate-pass-list' || activePage === 'gate-pass-history'
  );

  const [auditDropdownOpen, setAuditDropdownOpen] = useState(
    activePage === 'sales-ledger' || activePage === 'purchase-ledger'
  );
  
  // State for icon-only mode flyout popovers
  const [iconFlyoutOpen, setIconFlyoutOpen] = useState(false);
  const [certIconFlyoutOpen, setCertIconFlyoutOpen] = useState(false);
  const [invoiceIconFlyoutOpen, setInvoiceIconFlyoutOpen] = useState(false);
  const [cardIconFlyoutOpen, setCardIconFlyoutOpen] = useState(false);
  const [passIconFlyoutOpen, setPassIconFlyoutOpen] = useState(false);
  const [auditIconFlyoutOpen, setAuditIconFlyoutOpen] = useState(false);
  
  const flyoutRef = useRef(null);
  const certFlyoutRef = useRef(null);
  const invoiceFlyoutRef = useRef(null);
  const cardFlyoutRef = useRef(null);
  const passFlyoutRef = useRef(null);
  const auditFlyoutRef = useRef(null);

  const isMasterActive = activePage === 'master' || activePage === 'customer-master';
  const isCertActive = activePage === 'work-completion' || activePage === 'work-completion-history' || activePage === 'work-completion-list';
  const isInvoiceActive = activePage === 'challan' || activePage === 'challan-list' || activePage === 'challans-list';
  const isCardActive = activePage === 'job-card' || activePage === 'job-card-history' || activePage === 'job-card-list';
  const isPassActive = activePage === 'gate-pass' || activePage === 'gate-pass-list' || activePage === 'gate-pass-history';
  const isAuditActive = activePage === 'sales-ledger' || activePage === 'purchase-ledger';
  const isCompact = navMode === 'icons';

  // Handle click outside icon flyout menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) {
        setIconFlyoutOpen(false);
      }
      if (certFlyoutRef.current && !certFlyoutRef.current.contains(event.target)) {
        setCertIconFlyoutOpen(false);
      }
      if (invoiceFlyoutRef.current && !invoiceFlyoutRef.current.contains(event.target)) {
        setInvoiceIconFlyoutOpen(false);
      }
      if (cardFlyoutRef.current && !cardFlyoutRef.current.contains(event.target)) {
        setCardIconFlyoutOpen(false);
      }
      if (passFlyoutRef.current && !passFlyoutRef.current.contains(event.target)) {
        setPassIconFlyoutOpen(false);
      }
      if (auditFlyoutRef.current && !auditFlyoutRef.current.contains(event.target)) {
        setAuditIconFlyoutOpen(false);
      }
    };
    if (iconFlyoutOpen || certIconFlyoutOpen || invoiceIconFlyoutOpen || cardIconFlyoutOpen || passIconFlyoutOpen || auditIconFlyoutOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [iconFlyoutOpen, certIconFlyoutOpen, invoiceIconFlyoutOpen, cardIconFlyoutOpen, passIconFlyoutOpen, auditIconFlyoutOpen]);

  const handleNavClick = (page) => {
    setActivePage(page);
    setIconFlyoutOpen(false);
    setCertIconFlyoutOpen(false);
    setInvoiceIconFlyoutOpen(false);
    setCardIconFlyoutOpen(false);
    setPassIconFlyoutOpen(false);
    setAuditIconFlyoutOpen(false);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleMasterClick = () => {
    if (isCompact && !mobileMenuOpen) {
      setIconFlyoutOpen(!iconFlyoutOpen);
      setCertIconFlyoutOpen(false);
      setInvoiceIconFlyoutOpen(false);
      setCardIconFlyoutOpen(false);
      setPassIconFlyoutOpen(false);
    } else {
      setMasterDropdownOpen(!masterDropdownOpen);
    }
  };

  const handleCertClick = () => {
    if (isCompact && !mobileMenuOpen) {
      setCertIconFlyoutOpen(!certIconFlyoutOpen);
      setIconFlyoutOpen(false);
      setInvoiceIconFlyoutOpen(false);
      setCardIconFlyoutOpen(false);
      setPassIconFlyoutOpen(false);
    } else {
      setCertDropdownOpen(!certDropdownOpen);
    }
  };

  const handleInvoiceClick = () => {
    if (isCompact && !mobileMenuOpen) {
      setInvoiceIconFlyoutOpen(!invoiceIconFlyoutOpen);
      setIconFlyoutOpen(false);
      setCertIconFlyoutOpen(false);
      setCardIconFlyoutOpen(false);
      setPassIconFlyoutOpen(false);
    } else {
      setInvoiceDropdownOpen(!invoiceDropdownOpen);
    }
  };

  const handleCardClick = () => {
    if (isCompact && !mobileMenuOpen) {
      setCardIconFlyoutOpen(!cardIconFlyoutOpen);
      setIconFlyoutOpen(false);
      setCertIconFlyoutOpen(false);
      setInvoiceIconFlyoutOpen(false);
      setPassIconFlyoutOpen(false);
    } else {
      setCardDropdownOpen(!cardDropdownOpen);
    }
  };

  const handlePassClick = () => {
    if (isCompact && !mobileMenuOpen) {
      setPassIconFlyoutOpen(!passIconFlyoutOpen);
      setIconFlyoutOpen(false);
      setCertIconFlyoutOpen(false);
      setInvoiceIconFlyoutOpen(false);
      setCardIconFlyoutOpen(false);
    } else {
      setPassDropdownOpen(!passDropdownOpen);
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

        {/* 3. Certificate (Dropdown / Group for Work Completed Certificate & History) */}
        <div ref={certFlyoutRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <button
            onClick={handleCertClick}
            className="has-tooltip"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
              width: '100%',
              padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
              borderRadius: '10px',
              border: isCertActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              background: isCertActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: isCertActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isCertActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            title={isCompact ? 'Certificate (Click to Open)' : ''}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Award size={18} color={isCertActive ? '#34d399' : '#9ca3af'} />
              {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Certificate</span>}
            </div>
            {(!isCompact || mobileMenuOpen) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.625rem', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  2
                </span>
                {certDropdownOpen ? <ChevronDown size={15} color="#34d399" /> : <ChevronRight size={15} color="#9ca3af" />}
              </div>
            )}
            {isCompact && !mobileMenuOpen && !certIconFlyoutOpen && <span className="nav-tooltip">Certificate (Click to Open)</span>}
          </button>

          {/* FLYOUT POPOVER MENU FOR CERTIFICATE IN ICON-ONLY MODE */}
          {isCompact && !mobileMenuOpen && certIconFlyoutOpen && (
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
                minWidth: '240px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
                zIndex: 999999,
                animation: 'scaleIn 0.15s ease-out'
              }}
            >
              <div style={{ padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CERTIFICATES MENU
                </span>
              </div>
              
              <button
                onClick={() => handleNavClick('work-completion')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'work-completion' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: activePage === 'work-completion' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                  color: activePage === 'work-completion' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'work-completion' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Award size={16} color="#34d399" />
                <span>Work Completed Certificate</span>
              </button>

              <button
                onClick={() => handleNavClick('work-completion-history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  color: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <History size={16} color="#38bdf8" />
                <span>Work Completed Certificate History</span>
              </button>
            </div>
          )}

          {/* Submenu Accordion: Work Completed Certificate & History (For Full Mode) */}
          {(!isCompact || mobileMenuOpen) && certDropdownOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                paddingLeft: '1.25rem', 
                borderLeft: '2px solid rgba(16, 185, 129, 0.35)', 
                marginLeft: '1rem', 
                marginTop: '0.1rem', 
                marginBottom: '0.2rem' 
              }}
            >
              {/* Sub-item 1: Work Completed Certificate */}
              <button
                onClick={() => handleNavClick('work-completion')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'work-completion' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
                  background: activePage === 'work-completion' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
                  color: activePage === 'work-completion' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'work-completion' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Award size={16} color={activePage === 'work-completion' ? '#34d399' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Work Completed Certificate</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  Form
                </span>
              </button>

              {/* Sub-item 2: Work Completed Certificate History */}
              <button
                onClick={() => handleNavClick('work-completion-history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
                  color: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <History size={16} color={activePage === 'work-completion-history' || activePage === 'work-completion-list' ? '#38bdf8' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Certificate History</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  History
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Invoice (Dropdown / Group for Tax Invoice & Tax Invoice History) */}
        <div ref={invoiceFlyoutRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <button
            onClick={handleInvoiceClick}
            className="has-tooltip"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
              width: '100%',
              padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
              borderRadius: '10px',
              border: isInvoiceActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: isInvoiceActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: isInvoiceActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isInvoiceActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            title={isCompact ? 'Invoice (Click to Open)' : ''}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileSpreadsheet size={18} color={isInvoiceActive ? '#fbbf24' : '#9ca3af'} />
              {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Invoice</span>}
            </div>
            {(!isCompact || mobileMenuOpen) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.625rem', background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  2
                </span>
                {invoiceDropdownOpen ? <ChevronDown size={15} color="#fbbf24" /> : <ChevronRight size={15} color="#9ca3af" />}
              </div>
            )}
            {isCompact && !mobileMenuOpen && !invoiceIconFlyoutOpen && <span className="nav-tooltip">Invoice (Click to Open)</span>}
          </button>

          {/* FLYOUT POPOVER MENU FOR INVOICE IN ICON-ONLY MODE */}
          {isCompact && !mobileMenuOpen && invoiceIconFlyoutOpen && (
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
                  INVOICE MENU
                </span>
              </div>
              
              <button
                onClick={() => handleNavClick('challan')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'challan' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: activePage === 'challan' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                  color: activePage === 'challan' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'challan' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <FileSpreadsheet size={16} color="#34d399" />
                <span>Tax Invoice</span>
              </button>

              <button
                onClick={() => handleNavClick('challan-list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'challan-list' || activePage === 'challans-list' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  background: activePage === 'challan-list' || activePage === 'challans-list' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                  color: activePage === 'challan-list' || activePage === 'challans-list' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'challan-list' || activePage === 'challans-list' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <History size={16} color="#fbbf24" />
                <span>Tax Invoice History</span>
              </button>
            </div>
          )}

          {/* Submenu Accordion: Tax Invoice & History (For Full Mode) */}
          {(!isCompact || mobileMenuOpen) && invoiceDropdownOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                paddingLeft: '1.25rem', 
                borderLeft: '2px solid rgba(245, 158, 11, 0.35)', 
                marginLeft: '1rem', 
                marginTop: '0.1rem', 
                marginBottom: '0.2rem' 
              }}
            >
              {/* Sub-item 1: Tax Invoice */}
              <button
                onClick={() => handleNavClick('challan')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'challan' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  background: activePage === 'challan' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
                  color: activePage === 'challan' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'challan' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <FileSpreadsheet size={16} color={activePage === 'challan' ? '#34d399' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Tax Invoice</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  Auto
                </span>
              </button>

              {/* Sub-item 2: Tax Invoice History */}
              <button
                onClick={() => handleNavClick('challan-list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'challan-list' || activePage === 'challans-list' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  background: activePage === 'challan-list' || activePage === 'challans-list' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
                  color: activePage === 'challan-list' || activePage === 'challans-list' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'challan-list' || activePage === 'challans-list' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <History size={16} color={activePage === 'challan-list' || activePage === 'challans-list' ? '#fbbf24' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Tax Invoice History</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  History
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 5. Card (Dropdown / Group for Job Card & Job Card History) */}
        <div ref={cardFlyoutRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <button
            onClick={handleCardClick}
            className="has-tooltip"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
              width: '100%',
              padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
              borderRadius: '10px',
              border: isCardActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              background: isCardActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isCardActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isCardActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            title={isCompact ? 'Card (Click to Open)' : ''}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Wrench size={18} color={isCardActive ? '#818cf8' : '#9ca3af'} />
              {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Card</span>}
            </div>
            {(!isCompact || mobileMenuOpen) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.625rem', background: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  2
                </span>
                {cardDropdownOpen ? <ChevronDown size={15} color="#818cf8" /> : <ChevronRight size={15} color="#9ca3af" />}
              </div>
            )}
            {isCompact && !mobileMenuOpen && !cardIconFlyoutOpen && <span className="nav-tooltip">Card (Click to Open)</span>}
          </button>

          {/* FLYOUT POPOVER MENU FOR CARD IN ICON-ONLY MODE */}
          {isCompact && !mobileMenuOpen && cardIconFlyoutOpen && (
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
                  JOB CARD MENU
                </span>
              </div>
              
              <button
                onClick={() => handleNavClick('job-card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'job-card' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: activePage === 'job-card' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  color: activePage === 'job-card' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'job-card' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Wrench size={16} color="#818cf8" />
                <span>Job Card</span>
              </button>

              <button
                onClick={() => handleNavClick('job-card-history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'job-card-history' || activePage === 'job-card-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  color: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'job-card-history' || activePage === 'job-card-list' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ClipboardList size={16} color="#38bdf8" />
                <span>Job Card History</span>
              </button>
            </div>
          )}

          {/* Submenu Accordion: Job Card & History (For Full Mode) */}
          {(!isCompact || mobileMenuOpen) && cardDropdownOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                paddingLeft: '1.25rem', 
                borderLeft: '2px solid rgba(99, 102, 241, 0.35)', 
                marginLeft: '1rem', 
                marginTop: '0.1rem', 
                marginBottom: '0.2rem' 
              }}
            >
              {/* Sub-item 1: Job Card */}
              <button
                onClick={() => handleNavClick('job-card')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'job-card' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: activePage === 'job-card' ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                  color: activePage === 'job-card' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'job-card' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <Wrench size={16} color={activePage === 'job-card' ? '#818cf8' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Job Card</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  Form
                </span>
              </button>

              {/* Sub-item 2: Job Card History */}
              <button
                onClick={() => handleNavClick('job-card-history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'job-card-history' || activePage === 'job-card-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
                  color: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'job-card-history' || activePage === 'job-card-list' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <ClipboardList size={16} color={activePage === 'job-card-history' || activePage === 'job-card-list' ? '#38bdf8' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Job Card History</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  History
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Pass (Dropdown / Group for In & Out Gate Pass & Gate Pass History) */}
        <div ref={passFlyoutRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <button
            onClick={handlePassClick}
            className="has-tooltip"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
              width: '100%',
              padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
              borderRadius: '10px',
              border: isPassActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: isPassActive ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: isPassActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isPassActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            title={isCompact ? 'Pass (Click to Open)' : ''}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ArrowLeftRight size={18} color={isPassActive ? '#fbbf24' : '#9ca3af'} />
              {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pass</span>}
            </div>
            {(!isCompact || mobileMenuOpen) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.625rem', background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                  2
                </span>
                {passDropdownOpen ? <ChevronDown size={15} color="#fbbf24" /> : <ChevronRight size={15} color="#9ca3af" />}
              </div>
            )}
            {isCompact && !mobileMenuOpen && !passIconFlyoutOpen && <span className="nav-tooltip">Pass (Click to Open)</span>}
          </button>

          {/* FLYOUT POPOVER MENU FOR PASS IN ICON-ONLY MODE */}
          {isCompact && !mobileMenuOpen && passIconFlyoutOpen && (
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
                minWidth: '240px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
                zIndex: 999999,
                animation: 'scaleIn 0.15s ease-out'
              }}
            >
              <div style={{ padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GATE PASS MENU
                </span>
              </div>
              
              <button
                onClick={() => handleNavClick('gate-pass')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'gate-pass' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  background: activePage === 'gate-pass' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                  color: activePage === 'gate-pass' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'gate-pass' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ArrowLeftRight size={16} color="#fbbf24" />
                <span>In & Out Gate Pass</span>
              </button>

              <button
                onClick={() => handleNavClick('gate-pass-list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                  color: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <History size={16} color="#38bdf8" />
                <span>In & Out Gate Pass History</span>
              </button>
            </div>
          )}

          {/* Submenu Accordion: In & Out Gate Pass & History (For Full Mode) */}
          {(!isCompact || mobileMenuOpen) && passDropdownOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                paddingLeft: '1.25rem', 
                borderLeft: '2px solid rgba(245, 158, 11, 0.35)', 
                marginLeft: '1rem', 
                marginTop: '0.1rem', 
                marginBottom: '0.2rem' 
              }}
            >
              {/* Sub-item 1: In & Out Gate Pass */}
              <button
                onClick={() => handleNavClick('gate-pass')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'gate-pass' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  background: activePage === 'gate-pass' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
                  color: activePage === 'gate-pass' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'gate-pass' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <ArrowLeftRight size={16} color={activePage === 'gate-pass' ? '#fbbf24' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>In & Out Gate Pass</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  Form
                </span>
              </button>

              {/* Sub-item 2: In & Out Gate Pass History */}
              <button
                onClick={() => handleNavClick('gate-pass-list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  background: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
                  color: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <History size={16} color={activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '#38bdf8' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Gate Pass History</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  History
                </span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Audit Group (Sales Ledger & Purchase Ledger) */}
        <div style={{ position: 'relative' }} ref={auditFlyoutRef}>
          <button
            onClick={() => {
              if (isCompact && !mobileMenuOpen) {
                setAuditIconFlyoutOpen(prev => !prev);
              } else {
                setAuditDropdownOpen(prev => !prev);
              }
            }}
            className="has-tooltip"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCompact && !mobileMenuOpen ? 'center' : 'space-between',
              width: '100%',
              padding: isCompact && !mobileMenuOpen ? '0.7rem' : '0.7rem 0.9rem',
              borderRadius: '10px',
              border: isAuditActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              background: isAuditActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
              color: isAuditActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isAuditActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
            title={isCompact ? 'Audit' : ''}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={18} color={isAuditActive ? '#818cf8' : '#9ca3af'} />
              {(!isCompact || mobileMenuOpen) && <span style={{ fontSize: '0.85rem' }}>Audit</span>}
            </div>
            {(!isCompact || mobileMenuOpen) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.625rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                  2
                </span>
                {auditDropdownOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            )}
            {isCompact && !mobileMenuOpen && <span className="nav-tooltip">Audit (Sales & Purchase)</span>}
          </button>

          {/* Flyout for Compact Icon Mode */}
          {isCompact && !mobileMenuOpen && auditIconFlyoutOpen && (
            <div 
              className="animate-fade-in"
              style={{
                position: 'absolute',
                left: 'calc(100% + 10px)',
                top: 0,
                background: 'var(--card-bg, #0f172a)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                padding: '0.5rem',
                minWidth: '210px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ padding: '0.3rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AUDIT REGISTERS
                </span>
              </div>
              
              <button
                onClick={() => { handleNavClick('sales-ledger'); setAuditIconFlyoutOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'sales-ledger' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: activePage === 'sales-ledger' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                  color: activePage === 'sales-ledger' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'sales-ledger' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <BookOpen size={16} color="#818cf8" />
                <span>Sales Ledger</span>
              </button>

              <button
                onClick={() => { handleNavClick('purchase-ledger'); setAuditIconFlyoutOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: activePage === 'purchase-ledger' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                  background: activePage === 'purchase-ledger' ? 'rgba(236, 72, 153, 0.18)' : 'transparent',
                  color: activePage === 'purchase-ledger' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.825rem',
                  fontWeight: activePage === 'purchase-ledger' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ShoppingBag size={16} color="#f472b6" />
                <span>Purchase Ledger</span>
              </button>
            </div>
          )}

          {/* Submenu Accordion: Sales Ledger & Purchase Ledger (For Full Mode) */}
          {(!isCompact || mobileMenuOpen) && auditDropdownOpen && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                paddingLeft: '1.25rem', 
                borderLeft: '2px solid rgba(99, 102, 241, 0.35)', 
                marginLeft: '1rem', 
                marginTop: '0.1rem', 
                marginBottom: '0.2rem' 
              }}
            >
              {/* Sub-item 1: Sales Ledger */}
              <button
                onClick={() => handleNavClick('sales-ledger')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'sales-ledger' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: activePage === 'sales-ledger' ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                  color: activePage === 'sales-ledger' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'sales-ledger' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <BookOpen size={16} color={activePage === 'sales-ledger' ? '#818cf8' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Sales Ledger</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  GSTR-1
                </span>
              </button>

              {/* Sub-item 2: Purchase Ledger */}
              <button
                onClick={() => handleNavClick('purchase-ledger')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  border: activePage === 'purchase-ledger' ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid transparent',
                  background: activePage === 'purchase-ledger' ? 'linear-gradient(90deg, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.05) 100%)' : 'transparent',
                  color: activePage === 'purchase-ledger' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: activePage === 'purchase-ledger' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <ShoppingBag size={16} color={activePage === 'purchase-ledger' ? '#f472b6' : '#9ca3af'} />
                  <span style={{ fontSize: '0.8rem' }}>Purchase Ledger</span>
                </div>
                <span style={{ fontSize: '0.6rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 600 }}>
                  GSTR-2
                </span>
              </button>
            </div>
          )}
        </div>
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
