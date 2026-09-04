import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { 
  getServerApiUrl, 
  setServerApiUrl, 
  testServerConnection,
  downloadTotalDatabaseBackup,
  uploadTotalDatabaseBackup
} from '../services/api';
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
  Download, 
  Upload, 
  Database, 
  Smartphone, 
  RefreshCw, 
  AlertCircle,
  HardDrive,
  ShieldCheck
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

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, setIsSettingsOpen]);

  const [serverUrl, setServerUrl] = useState(getServerApiUrl());
  const [testingConn, setTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState(null);

  // Backup & Restore state
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const fileInputRef = useRef(null);

  const isCustomServer = !!localStorage.getItem('sri_durga_custom_api_url');

  const handleTestConnection = async () => {
    setTestingConn(true);
    setConnStatus(null);
    const res = await testServerConnection(serverUrl);
    setConnStatus(res);
    setTestingConn(false);
  };

  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      setDbStatus(null);
      await downloadTotalDatabaseBackup();
      setDbStatus({
        type: 'success',
        message: 'Total database downloaded successfully! All records safely backed up.'
      });
    } catch (err) {
      setDbStatus({
        type: 'error',
        message: 'Failed to download database backup: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      `Are you sure you want to restore the database from file "${file.name}"?\n\n` +
      `WARNING: This will replace all existing records with the data from this backup file.`
    );

    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploading(true);
      setDbStatus(null);
      const res = await uploadTotalDatabaseBackup(file);
      
      const counts = res.counts || {};
      const countDetails = Object.entries(counts)
        .filter(([_, val]) => val > 0)
        .map(([key, val]) => `${key}: ${val}`)
        .join(', ');

      setDbStatus({
        type: 'success',
        message: `Database restored successfully! (${countDetails || 'All records restored'}). Reloading view in 2 seconds...`
      });

      setTimeout(() => {
        window.location.reload();
      }, 2200);
    } catch (err) {
      setDbStatus({
        type: 'error',
        message: 'Failed to restore database: ' + (err.response?.data?.message || err.message)
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
        zIndex: 999999,
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
          maxWidth: '580px',
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
                Total Database Backup, Restore & UI Preferences
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
          
          {/* PRIMARY FEATURE: Total Database Backup & Restore */}
          <div style={{ 
            padding: '1.25rem', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)', 
            border: '1.5px solid rgba(99, 102, 241, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} color="#818cf8" />
                <span style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Total Database Management
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: '3px' }} /> Full Backup & Restore
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
              Download the complete ERP database (Customers, Items, Invoices, Job Cards, Gate Passes, Certificates, Ledgers, Company Details) and restore it anytime on any computer.
            </p>

            {/* Hidden File Input for Database Upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json,.sdbak" 
              onChange={handleUploadFileChange} 
              style={{ display: 'none' }} 
            />

            {/* Two Primary Buttons: Download Total Database & Upload Total Database */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              
              {/* Button 1: Download Total Database */}
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={downloading || uploading}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)',
                  cursor: downloading ? 'wait' : 'pointer'
                }}
              >
                {downloading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download Total Database</span>
                  </>
                )}
              </button>

              {/* Button 2: Upload Total Database */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={downloading || uploading}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  cursor: uploading ? 'wait' : 'pointer'
                }}
              >
                {uploading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload Total Database</span>
                  </>
                )}
              </button>

            </div>

            {/* Database Status Feedback Alert */}
            {dbStatus && (
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                background: dbStatus.type === 'success' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                border: dbStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                color: dbStatus.type === 'success' ? '#34d399' : '#f87171'
              }}>
                {dbStatus.type === 'success' ? <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                <span>{dbStatus.message}</span>
              </div>
            )}
          </div>

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

          {/* Section 2: Navigation Layout Orientation */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                Navigation Layout Orientation
              </label>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                Active: <strong>{layout === 'top' || layout === 'topbar' ? 'Top Navigation' : 'Side Navigation'}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <button
                type="button"
                onClick={() => setLayout('side')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: (layout === 'side' || layout === 'sidebar') ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: (layout === 'side' || layout === 'sidebar') ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {(layout === 'side' || layout === 'sidebar') && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                    <PanelLeft size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Side Navigation</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Full-docked sidebar</span>
                  </div>
                </div>
                {/* Visual Wireframe */}
                <div style={{ height: '28px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', overflow: 'hidden' }}>
                  <div style={{ width: '28%', background: '#6366f1', opacity: 0.6 }} />
                  <div style={{ flex: 1 }} />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('top')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '14px',
                  border: (layout === 'top' || layout === 'topbar') ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: (layout === 'top' || layout === 'topbar') ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {(layout === 'top' || layout === 'topbar') && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                    <PanelTop size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Top Navigation</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Horizontal top bar</span>
                  </div>
                </div>
                {/* Visual Wireframe */}
                <div style={{ height: '28px', borderRadius: '6px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ height: '8px', background: '#10b981', opacity: 0.6 }} />
                  <div style={{ flex: 1 }} />
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Navigation Display Mode */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
                Navigation Bar Display Mode
              </label>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                Active: <strong>{navMode === 'icons' || navMode === 'collapsed' ? 'Icons Only' : 'Icons + Labels'}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
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
                <Eye size={18} color="#818cf8" />
                <div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Full Labels</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Icons + text wording</span>
                </div>
                {navMode === 'full' && (
                  <Check size={14} color="#6366f1" style={{ marginLeft: 'auto' }} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setNavMode('icons')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: (navMode === 'icons' || navMode === 'collapsed') ? '2px solid #6366f1' : '1px solid var(--border-color)',
                  background: (navMode === 'icons' || navMode === 'collapsed') ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <EyeOff size={18} color="#f59e0b" />
                <div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>Icons Only</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hide text wording</span>
                </div>
                {(navMode === 'icons' || navMode === 'collapsed') && (
                  <Check size={14} color="#6366f1" style={{ marginLeft: 'auto' }} />
                )}
              </button>
            </div>
          </div>

          {/* Section 4: Multi-PC LAN & Central Server Connection */}
          <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={18} color="#6366f1" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Multi-PC LAN & Central Server Connection
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: isCustomServer ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: isCustomServer ? '#818cf8' : '#34d399', fontWeight: 600 }}>
                {isCustomServer ? '🌐 Remote LAN Client' : '💻 Local Server Mode'}
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              To share the live database across multiple office computers (PC1, PC2, PC3), enter the Central Main Server PC IP below or click the quick preset button.
            </p>

            {/* Quick 1-Click Server Presets */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const url = 'http://192.168.1.39:8085/api';
                  setServerUrl(url);
                  setConnStatus(null);
                  handleTestConnection();
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8', fontWeight: 600 }}
              >
                🎯 Use Main Server PC (192.168.1.39)
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = 'http://127.0.0.1:8085/api';
                  setServerUrl(url);
                  setConnStatus(null);
                  handleTestConnection();
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', color: 'var(--text-muted)' }}
              >
                💻 Localhost (127.0.0.1)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: '240px', fontSize: '0.8rem' }}
                placeholder="http://192.168.1.39:8085/api"
                value={serverUrl}
                onChange={e => {
                  setServerUrl(e.target.value);
                  setConnStatus(null);
                }}
              />

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConn}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RefreshCw size={13} className={testingConn ? 'animate-spin' : ''} />
                <span>{testingConn ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {connStatus && (
              <div style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: connStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: connStatus.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: connStatus.success ? '#34d399' : '#f87171'
              }}>
                {connStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{connStatus.message}</span>
              </div>
            )}
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
            onClick={() => {
              setServerApiUrl(serverUrl);
              setIsSettingsOpen(false);
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
          >
            <Check size={15} />
            <span>Save & Apply</span>
          </button>
        </div>

      </div>
    </div>
  );
};
