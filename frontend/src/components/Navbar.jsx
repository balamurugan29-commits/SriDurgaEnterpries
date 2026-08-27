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
  ChevronDown,
  BookOpen,
  ShoppingBag
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
  const [topCertOpen, setTopCertOpen] = useState(false);
  const [topInvoiceOpen, setTopInvoiceOpen] = useState(false);
  const [topCardOpen, setTopCardOpen] = useState(false);
  const [topPassOpen, setTopPassOpen] = useState(false);
  const [topAuditOpen, setTopAuditOpen] = useState(false);
  
  const topDropdownRef = useRef(null);
  const topCertDropdownRef = useRef(null);
  const topInvoiceDropdownRef = useRef(null);
  const topCardDropdownRef = useRef(null);
  const topPassDropdownRef = useRef(null);
  const topAuditDropdownRef = useRef(null);

  // Click outside to close top nav dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topDropdownRef.current && !topDropdownRef.current.contains(event.target)) {
        setTopMasterOpen(false);
      }
      if (topCertDropdownRef.current && !topCertDropdownRef.current.contains(event.target)) {
        setTopCertOpen(false);
      }
      if (topInvoiceDropdownRef.current && !topInvoiceDropdownRef.current.contains(event.target)) {
        setTopInvoiceOpen(false);
      }
      if (topCardDropdownRef.current && !topCardDropdownRef.current.contains(event.target)) {
        setTopCardOpen(false);
      }
      if (topPassDropdownRef.current && !topPassDropdownRef.current.contains(event.target)) {
        setTopPassOpen(false);
      }
      if (topAuditDropdownRef.current && !topAuditDropdownRef.current.contains(event.target)) {
        setTopAuditOpen(false);
      }
    };
    if (topMasterOpen || topCertOpen || topInvoiceOpen || topCardOpen || topPassOpen || topAuditOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [topMasterOpen, topCertOpen, topInvoiceOpen, topCardOpen, topPassOpen, topAuditOpen]);

  const getTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'master': return 'Item Master Management';
      case 'customer-master': return 'Customer Directory Management';
      case 'challan': return 'Create Tax Invoice';
      case 'challans-list': case 'challan-list': return 'Tax Invoice History';
      case 'proforma-invoice': return 'Create Proforma Invoice';
      case 'proforma-invoice-history': case 'proforma-invoice-list': case 'proforma-invoices': return 'Proforma Invoice History';
      case 'gate-pass': return 'Create In & Out Gate Pass';
      case 'gate-pass-list': case 'gate-pass-history': return 'In & Out Gate Pass History';
      case 'job-card': return 'Create Job Card';
      case 'job-card-history': case 'job-card-list': return 'Job Card History';
      case 'work-completion': return 'Work Completed Certificate';
      case 'work-completion-history': case 'work-completion-list': return 'Work Completed Certificate History';
      case 'sales-ledger': return 'Sales Ledger & GST Tax Register';
      case 'purchase-ledger': return 'Purchase Ledger & Supplier Payments';
      default: return 'Sri Durga Management System';
    }
  };

  const isMasterActive = activePage === 'master' || activePage === 'customer-master';
  const isCertActive = activePage === 'work-completion' || activePage === 'work-completion-history' || activePage === 'work-completion-list';
  const isInvoiceActive = activePage === 'challan' || activePage === 'challan-list' || activePage === 'challans-list' || activePage === 'proforma-invoice' || activePage === 'proforma-invoice-history' || activePage === 'proforma-invoice-list' || activePage === 'proforma-invoices';
  const isCardActive = activePage === 'job-card' || activePage === 'job-card-history' || activePage === 'job-card-list';
  const isPassActive = activePage === 'gate-pass' || activePage === 'gate-pass-list' || activePage === 'gate-pass-history';
  const isAuditActive = activePage === 'sales-ledger' || activePage === 'purchase-ledger';

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

          {/* Logo & Company Title (Click to Redirect to Home / Dashboard) */}
          <div 
            onClick={() => setActivePage('dashboard')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.875rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            title="Go to Dashboard / Home"
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              overflow: 'hidden',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              flexShrink: 0,
              background: '#ffffff'
            }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
              onClick={() => { setTopMasterOpen(!topMasterOpen); setTopCertOpen(false); setTopInvoiceOpen(false); setTopCardOpen(false); setTopPassOpen(false); }}
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

          {/* Top Nav: Certificate Dropdown */}
          <div ref={topCertDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
            <button
              onClick={() => { setTopCertOpen(!topCertOpen); setTopMasterOpen(false); setTopInvoiceOpen(false); setTopCardOpen(false); setTopPassOpen(false); }}
              className={`has-tooltip top-nav-item btn ${isCertActive ? 'btn-secondary' : 'btn-outline'}`}
              style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Certificate"
            >
              <Award size={15} />
              {navMode === 'full' && <span>Certificate</span>}
              <ChevronDown size={13} />
              {navMode === 'icons' && !topCertOpen && <span className="nav-tooltip">Certificate</span>}
            </button>

            {topCertOpen && (
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
                  minWidth: '240px',
                  animation: 'scaleIn 0.15s ease-out'
                }}
              >
                <div style={{ padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                    CERTIFICATE MENU
                  </span>
                </div>

                <button
                  onClick={() => { setActivePage('work-completion'); setTopCertOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'work-completion' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'work-completion' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Award size={15} color="#34d399" />
                  <span>Work Completed Certificate</span>
                </button>
                <button
                  onClick={() => { setActivePage('work-completion-history'); setTopCertOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'work-completion-history' || activePage === 'work-completion-list' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <History size={15} color="#38bdf8" />
                  <span>Work Completed Certificate History</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Nav: Invoice Dropdown */}
          <div ref={topInvoiceDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
            <button
              onClick={() => { setTopInvoiceOpen(!topInvoiceOpen); setTopMasterOpen(false); setTopCertOpen(false); setTopCardOpen(false); setTopPassOpen(false); }}
              className={`has-tooltip top-nav-item btn ${isInvoiceActive ? 'btn-accent' : 'btn-outline'}`}
              style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Invoice"
            >
              <FileSpreadsheet size={15} />
              {navMode === 'full' && <span>Invoice</span>}
              <ChevronDown size={13} />
              {navMode === 'icons' && !topInvoiceOpen && <span className="nav-tooltip">Invoice</span>}
            </button>

            {topInvoiceOpen && (
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
                    INVOICE MENU
                  </span>
                </div>

                <button
                  onClick={() => { setActivePage('challan'); setTopInvoiceOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'challan' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'challan' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <FileSpreadsheet size={15} color="#34d399" />
                  <span>Tax Invoice</span>
                </button>
                <button
                  onClick={() => { setActivePage('challan-list'); setTopInvoiceOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'challan-list' || activePage === 'challans-list' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'challan-list' || activePage === 'challans-list' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <History size={15} color="#fbbf24" />
                  <span>Tax Invoice History</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />

                <button
                  onClick={() => { setActivePage('proforma-invoice'); setTopInvoiceOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'proforma-invoice' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'proforma-invoice' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <FileSpreadsheet size={15} color="#38bdf8" />
                  <span>Proforma Invoice</span>
                </button>
                <button
                  onClick={() => { setActivePage('proforma-invoice-history'); setTopInvoiceOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'proforma-invoice-history' || activePage === 'proforma-invoice-list' || activePage === 'proforma-invoices' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'proforma-invoice-history' || activePage === 'proforma-invoice-list' || activePage === 'proforma-invoices' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <History size={15} color="#38bdf8" />
                  <span>Proforma Invoice History</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Nav: Card Dropdown */}
          <div ref={topCardDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
            <button
              onClick={() => { setTopCardOpen(!topCardOpen); setTopMasterOpen(false); setTopCertOpen(false); setTopInvoiceOpen(false); setTopPassOpen(false); }}
              className={`has-tooltip top-nav-item btn ${isCardActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Card"
            >
              <Wrench size={15} />
              {navMode === 'full' && <span>Card</span>}
              <ChevronDown size={13} />
              {navMode === 'icons' && !topCardOpen && <span className="nav-tooltip">Card</span>}
            </button>

            {topCardOpen && (
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
                    JOB CARD MENU
                  </span>
                </div>

                <button
                  onClick={() => { setActivePage('job-card'); setTopCardOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'job-card' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'job-card' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Wrench size={15} color="#818cf8" />
                  <span>Job Card</span>
                </button>
                <button
                  onClick={() => { setActivePage('job-card-history'); setTopCardOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'job-card-history' || activePage === 'job-card-list' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <ClipboardList size={15} color="#38bdf8" />
                  <span>Job Card History</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Nav: Pass Dropdown */}
          <div ref={topPassDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
            <button
              onClick={() => { setTopPassOpen(!topPassOpen); setTopMasterOpen(false); setTopCertOpen(false); setTopInvoiceOpen(false); setTopCardOpen(false); }}
              className={`has-tooltip top-nav-item btn ${isPassActive ? 'btn-accent' : 'btn-outline'}`}
              style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Pass"
            >
              <ArrowLeftRight size={15} />
              {navMode === 'full' && <span>Pass</span>}
              <ChevronDown size={13} />
              {navMode === 'icons' && !topPassOpen && <span className="nav-tooltip">Pass</span>}
            </button>

            {topPassOpen && (
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
                    GATE PASS MENU
                  </span>
                </div>

                <button
                  onClick={() => { setActivePage('gate-pass'); setTopPassOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'gate-pass' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'gate-pass' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <ArrowLeftRight size={15} color="#fbbf24" />
                  <span>In & Out Gate Pass</span>
                </button>
                <button
                  onClick={() => { setActivePage('gate-pass-list'); setTopPassOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <History size={15} color="#38bdf8" />
                  <span>In & Out Gate Pass History</span>
                </button>
              </div>
            )}
          </div>

          {/* Top Nav: Audit (Sales Ledger & Purchase Ledger) */}
          <div style={{ position: 'relative' }} ref={topAuditDropdownRef}>
            <button
              onClick={() => setTopAuditOpen(prev => !prev)}
              className={`has-tooltip top-nav-item btn ${isAuditActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', 
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <BookOpen size={15} color={isAuditActive ? '#ffffff' : '#818cf8'} />
              {navMode === 'full' && <span>Audit</span>}
              {navMode === 'full' && <ChevronDown size={13} style={{ opacity: 0.7 }} />}
              <span className="nav-tooltip">Audit (Sales & Purchase Registers)</span>
            </button>

            {topAuditOpen && (
              <div 
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: 'var(--card-bg, #0f172a)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '10px',
                  padding: '0.4rem',
                  minWidth: '190px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                {/* Sales Ledger */}
                <button
                  onClick={() => {
                    setActivePage('sales-ledger');
                    setTopAuditOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePage === 'sales-ledger' ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'sales-ledger' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <BookOpen size={15} color="#818cf8" />
                  <span>Sales Ledger</span>
                </button>

                {/* Purchase Ledger */}
                <button
                  onClick={() => {
                    setActivePage('purchase-ledger');
                    setTopAuditOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: activePage === 'purchase-ledger' ? 'rgba(236, 72, 153, 0.18)' : 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem',
                    fontWeight: activePage === 'purchase-ledger' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <ShoppingBag size={15} color="#f472b6" />
                  <span>Purchase Ledger</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
