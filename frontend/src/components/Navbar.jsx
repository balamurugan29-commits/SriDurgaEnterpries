import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { UserManagementModal } from './UserManagementModal';
import companyLogo from '../assets/companyLogo';
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
  ShoppingBag,
  Users,
  PanelLeftClose,
  PanelLeftOpen
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
    setMobileMenuOpen,
    sidebarHidden,
    toggleSidebarHidden
  } = useSettings();

  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

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

  // Permission Access Helper
  const canAccess = (pageKey) => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.permissions === 'all') return true;
    if (!user.permissions) return false;
    const perms = user.permissions.split(',').map(s => s.trim());
    return perms.includes(pageKey);
  };

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'master':
        return 'Item Master Management';
      case 'customer-master':
        return 'Customer & Party Master Directory';
      case 'company-details':
        return 'Company Details Master Profile';
      case 'challan':
        return 'Tax Invoice Management';
      case 'challan-list':
      case 'challans-list':
        return 'Tax Invoice History & Archives';
      case 'proforma-invoice':
        return 'Proforma Invoice Management';
      case 'proforma-invoice-history':
      case 'proforma-invoice-list':
      case 'proforma-invoices':
        return 'Proforma Invoice History & Archives';
      case 'work-completion':
        return 'Work Completion Certificate';
      case 'work-completion-history':
      case 'work-completion-list':
        return 'Certificate History & Archives';
      case 'job-card':
        return 'Motor Service Job Card Entry';
      case 'job-card-history':
      case 'job-card-list':
        return 'Motor Service Job Card History';
      case 'gate-pass':
        return 'In & Out Material Gate Pass';
      case 'gate-pass-list':
      case 'gate-pass-history':
        return 'In & Out Gate Pass History';
      case 'sales-ledger':
        return 'Sales Ledger Register & Tax Audit';
      case 'purchase-ledger':
        return 'Purchase Ledger Register & Tax Audit';
      default:
        return 'Dashboard';
    }
  };

  const isMasterActive = activePage === 'master' || activePage === 'customer-master' || activePage === 'company-details';
  const isCertActive = activePage === 'work-completion' || activePage === 'work-completion-history' || activePage === 'work-completion-list';
  const isInvoiceActive = activePage === 'challan' || activePage === 'challan-list' || activePage === 'challans-list' || activePage === 'proforma-invoice' || activePage === 'proforma-invoice-history' || activePage === 'proforma-invoice-list' || activePage === 'proforma-invoices';
  const isCardActive = activePage === 'job-card' || activePage === 'job-card-history' || activePage === 'job-card-list';
  const isPassActive = activePage === 'gate-pass' || activePage === 'gate-pass-list' || activePage === 'gate-pass-history';
  const isAuditActive = activePage === 'sales-ledger' || activePage === 'purchase-ledger';

  return (
    <header 
      className="glass-panel no-print" 
      style={{ 
        borderRadius: 0, 
        borderTop: 'none', 
        borderLeft: 'none', 
        borderRight: 'none', 
        padding: '0.625rem 1.5rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 500,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      {/* Upper Main Brand & Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Left Side: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          
          {/* Mobile Drawer Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn btn-outline"
            style={{ 
              display: 'none', 
              padding: '0.45rem', 
              borderRadius: '8px',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo & Company Name */}
          <div 
            onClick={() => setActivePage('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                overflow: 'hidden',
                padding: '2px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <img 
                src={companyLogo} 
                alt="Sri Durga Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
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

          {/* Hide / Show Sidebar Menu Toggle Option */}
          <button 
            type="button"
            onClick={toggleSidebarHidden}
            className="btn btn-outline hide-menu-toggle-btn"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              padding: '0.4rem 0.85rem', 
              borderRadius: '10px', 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              borderColor: sidebarHidden ? 'rgba(52, 211, 153, 0.5)' : 'rgba(99, 102, 241, 0.4)', 
              background: sidebarHidden ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)' : 'rgba(99, 102, 241, 0.08)', 
              color: sidebarHidden ? '#34d399' : '#818cf8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: sidebarHidden ? '0 0 14px rgba(52, 211, 153, 0.3)' : 'none',
              marginLeft: '0.75rem'
            }}
            title={sidebarHidden ? "Click to Show / Open the Navigation Menu Bar" : "Click to Hide the Navigation Menu Bar"}
          >
            {sidebarHidden ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span>{sidebarHidden ? 'Show Menu' : 'Hide Menu'}</span>
          </button>
        </div>

        {/* Right Side: User Profile, Users & Roles, App Settings & Controls */}
        {user && (
          <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            
            {/* User Profile Badge (Clickable to open User Management / Profile) */}
            <div 
              onClick={() => setIsUserMgmtOpen(true)}
              className="navbar-user-pill" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.625rem', 
                background: 'var(--bg-card)', 
                padding: '0.35rem 0.85rem', 
                borderRadius: '9999px', 
                border: '1.5px solid rgba(99, 102, 241, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              title={user.role === 'ADMIN' ? "Click to Manage Users & Granular Permissions" : `Logged in as ${user.fullName || user.userId}`}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <UserIcon size={15} color="#818cf8" />
              </div>
              <div className="navbar-user-details">
                <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', lineHeight: 1.2, color: 'var(--text-main)' }}>
                  {user.fullName || user.userId}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                  <ShieldCheck size={10} /> User ID: {user.userId} {user.role === 'ADMIN' ? '• Admin' : ''}
                </span>
              </div>
            </div>

            {/* Direct Users & Permissions Button for Admin */}
            {user.role === 'ADMIN' && (
              <button 
                onClick={() => setIsUserMgmtOpen(true)}
                className="btn btn-outline"
                style={{ 
                  padding: '0.45rem 0.875rem', 
                  fontSize: '0.8rem', 
                  gap: '0.4rem', 
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8'
                }} 
                title="Manage User Accounts & Module Permissions"
              >
                <Users size={15} />
                <span className="navbar-user-details">Users & Roles</span>
              </button>
            )}

            {/* APP SETTINGS BUTTON */}
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
          {canAccess('dashboard') && (
            <button
              onClick={() => setActivePage('dashboard')}
              className={`has-tooltip top-nav-item btn ${activePage === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: navMode === 'icons' ? '0.45rem 0.65rem' : '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <LayoutDashboard size={15} />
              {navMode === 'full' && <span>Dashboard</span>}
              <span className="nav-tooltip">Dashboard</span>
            </button>
          )}

          {/* Top Nav: Master Page Dropdown */}
          {(canAccess('master') || canAccess('customer-master')) && (
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

                  {canAccess('master') && (
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
                  )}
                  {canAccess('customer-master') && (
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
                  )}
                  {canAccess('company-details') && (
                    <button
                      onClick={() => { setActivePage('company-details'); setTopMasterOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: activePage === 'company-details' ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                        color: 'var(--text-main)',
                        fontSize: '0.825rem',
                        fontWeight: activePage === 'company-details' ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <ShieldCheck size={15} color="#38bdf8" />
                      <span>Company Details</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top Nav: Invoice Dropdown */}
          {(canAccess('challan') || canAccess('challan-list') || canAccess('proforma-invoice') || canAccess('proforma-invoice-history')) && (
            <div ref={topInvoiceDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
              <button
                onClick={() => { setTopInvoiceOpen(!topInvoiceOpen); setTopMasterOpen(false); setTopCertOpen(false); setTopCardOpen(false); setTopPassOpen(false); setTopAuditOpen(false); }}
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

                  {canAccess('challan') && (
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
                  )}
                  {canAccess('challan-list') && (
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
                  )}

                  {(canAccess('proforma-invoice') || canAccess('proforma-invoice-history')) && (
                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '2px 0' }} />
                  )}

                  {canAccess('proforma-invoice') && (
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
                  )}
                  {canAccess('proforma-invoice-history') && (
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
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top Nav: Certificate Dropdown */}
          {(canAccess('work-completion') || canAccess('work-completion-history')) && (
            <div ref={topCertDropdownRef} style={{ position: 'relative', zIndex: 99999 }}>
              <button
                onClick={() => { setTopCertOpen(!topCertOpen); setTopMasterOpen(false); setTopInvoiceOpen(false); setTopCardOpen(false); setTopPassOpen(false); setTopAuditOpen(false); }}
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

                  {canAccess('work-completion') && (
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
                  )}
                  {canAccess('work-completion-history') && (
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
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top Nav: Card Dropdown */}
          {(canAccess('job-card') || canAccess('job-card-history')) && (
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

                  {canAccess('job-card') && (
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
                  )}
                  {canAccess('job-card-history') && (
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
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top Nav: Pass Dropdown */}
          {(canAccess('gate-pass') || canAccess('gate-pass-list')) && (
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

                  {canAccess('gate-pass') && (
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
                  )}
                  {canAccess('gate-pass-list') && (
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
                  )}
                </div>
              )}
            </div>
          )}

          {/* Top Nav: Audit (Sales Ledger & Purchase Ledger) */}
          {(canAccess('sales-ledger') || canAccess('purchase-ledger')) && (
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
                  {canAccess('sales-ledger') && (
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
                  )}

                  {/* Purchase Ledger */}
                  {canAccess('purchase-ledger') && (
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
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Management & Permissions Modal Mount */}
      <UserManagementModal 
        isOpen={isUserMgmtOpen} 
        onClose={() => setIsUserMgmtOpen(false)} 
        currentUser={user} 
      />
    </header>
  );
};
