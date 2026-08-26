import React, { useState } from 'react';
import { LayoutDashboard, Database, FileSpreadsheet, History, PackageCheck, ChevronDown, ChevronRight, Building2, Layers, Wrench, ClipboardList, Award, CheckCircle2, ArrowLeftRight } from 'lucide-react';

export const Sidebar = ({ activePage, setActivePage }) => {
  const [masterDropdownOpen, setMasterDropdownOpen] = useState(
    activePage === 'master' || activePage === 'customer-master'
  );

  const isMasterActive = activePage === 'master' || activePage === 'customer-master';

  return (
    <aside className="glass-panel no-print" style={{ width: '260px', height: 'calc(100vh - 65px)', borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0, overflowY: 'auto' }}>
      <div style={{ padding: '0.4rem 0.75rem', marginBottom: '0.2rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)' }}>
          NAVIGATION MENU
        </span>
      </div>

      {/* 1. Dashboard */}
      <button
        onClick={() => setActivePage('dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
          background: activePage === 'dashboard' ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0.05) 100%)' : 'transparent',
          color: activePage === 'dashboard' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'dashboard' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LayoutDashboard size={17} color={activePage === 'dashboard' ? '#818cf8' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Dashboard</span>
        </div>
      </button>

      {/* 2. Master Page (Dropdown: Item Master Page & Customer Page) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <button
          onClick={() => setMasterDropdownOpen(!masterDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.7rem 0.9rem',
            borderRadius: '10px',
            border: isMasterActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            background: isMasterActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: isMasterActive ? '#ffffff' : 'var(--text-muted)',
            fontWeight: isMasterActive ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={17} color={isMasterActive ? '#818cf8' : '#9ca3af'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Master Page</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.625rem', background: 'rgba(99, 102, 241, 0.3)', color: '#c7d2fe', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
              Dropdown
            </span>
            {masterDropdownOpen ? <ChevronDown size={15} color="#818cf8" /> : <ChevronRight size={15} color="#9ca3af" />}
          </div>
        </button>

        {/* Dropdown Items Sub-list */}
        {masterDropdownOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingLeft: '1.25rem', borderLeft: '2px solid rgba(99, 102, 241, 0.3)', marginLeft: '1rem', marginTop: '0.1rem', marginBottom: '0.2rem' }}>
            
            {/* Sub-item 1: Item Master Page */}
            <button
              onClick={() => setActivePage('master')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.55rem 0.8rem',
                borderRadius: '8px',
                border: activePage === 'master' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                background: activePage === 'master' ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.25) 0%, rgba(79, 70, 229, 0.05) 100%)' : 'transparent',
                color: activePage === 'master' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activePage === 'master' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Database size={15} color={activePage === 'master' ? '#818cf8' : '#9ca3af'} />
                <span style={{ fontSize: '0.8rem' }}>Item Master Page</span>
              </div>
              <span style={{ fontSize: '0.6rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-subtle)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                Catalog
              </span>
            </button>

            {/* Sub-item 2: Customer Page */}
            <button
              onClick={() => setActivePage('customer-master')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.55rem 0.8rem',
                borderRadius: '8px',
                border: activePage === 'customer-master' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                background: activePage === 'customer-master' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
                color: activePage === 'customer-master' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: activePage === 'customer-master' ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Building2 size={15} color={activePage === 'customer-master' ? '#34d399' : '#9ca3af'} />
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
        onClick={() => setActivePage('work-completion')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'work-completion' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid transparent',
          background: activePage === 'work-completion' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
          color: activePage === 'work-completion' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'work-completion' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award size={17} color={activePage === 'work-completion' ? '#34d399' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Work Completion Cert</span>
        </div>
        <span style={{ fontSize: '0.625rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
          Workflow
        </span>
      </button>

      {/* 4. Work Completion Certificate History */}
      <button
        onClick={() => setActivePage('work-completion-history')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'work-completion-history' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          background: activePage === 'work-completion-history' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
          color: activePage === 'work-completion-history' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'work-completion-history' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History size={17} color={activePage === 'work-completion-history' ? '#38bdf8' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Work Completion History</span>
        </div>
      </button>

      {/* 5. Tax Invoice */}
      <button
        onClick={() => setActivePage('challan')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'challan' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
          background: activePage === 'challan' ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'transparent',
          color: activePage === 'challan' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'challan' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileSpreadsheet size={17} color={activePage === 'challan' ? '#34d399' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Tax Invoice</span>
        </div>
        <span style={{ fontSize: '0.625rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
          Auto-Fetch
        </span>
      </button>

      {/* 6. Tax Invoice History */}
      <button
        onClick={() => setActivePage('challan-list')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'challan-list' || activePage === 'challans-list' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
          background: activePage === 'challan-list' || activePage === 'challans-list' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
          color: activePage === 'challan-list' || activePage === 'challans-list' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'challan-list' || activePage === 'challans-list' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History size={17} color={activePage === 'challan-list' || activePage === 'challans-list' ? '#fbbf24' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Tax Invoice History</span>
        </div>
      </button>

      {/* 7. Job Card (Create / Form) */}
      <button
        onClick={() => setActivePage('job-card')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'job-card' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
          background: activePage === 'job-card' ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
          color: activePage === 'job-card' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'job-card' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Wrench size={17} color={activePage === 'job-card' ? '#818cf8' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Job Card</span>
        </div>
        <span style={{ fontSize: '0.625rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
          Equipment
        </span>
      </button>

      {/* 8. Job Card History (Records / List) */}
      <button
        onClick={() => setActivePage('job-card-history')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'job-card-history' || activePage === 'job-card-list' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          background: activePage === 'job-card-history' || activePage === 'job-card-list' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
          color: activePage === 'job-card-history' || activePage === 'job-card-list' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'job-card-history' || activePage === 'job-card-list' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ClipboardList size={17} color={activePage === 'job-card-history' || activePage === 'job-card-list' ? '#38bdf8' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Job Card History</span>
        </div>
      </button>

      {/* 9. Out Gate Pass */}
      <button
        onClick={() => setActivePage('gate-pass')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'gate-pass' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
          background: activePage === 'gate-pass' ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'transparent',
          color: activePage === 'gate-pass' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'gate-pass' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ArrowLeftRight size={17} color={activePage === 'gate-pass' ? '#fbbf24' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Out Gate Pass</span>
        </div>
        <span style={{ fontSize: '0.625rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
          Gate Pass
        </span>
      </button>

      {/* 10. Gate Pass History */}
      <button
        onClick={() => setActivePage('gate-pass-list')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.7rem 0.9rem',
          borderRadius: '10px',
          border: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
          background: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
          color: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '#ffffff' : 'var(--text-muted)',
          fontWeight: activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History size={17} color={activePage === 'gate-pass-list' || activePage === 'gate-pass-history' ? '#38bdf8' : '#9ca3af'} />
          <span style={{ fontSize: '0.85rem' }}>Gate Pass History</span>
        </div>
      </button>

      <div style={{ marginTop: 'auto', padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <PackageCheck size={16} color="#34d399" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>Auto-Fetch Active</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
          Entering Item Code or Customer Name in Tax Invoice auto-loads catalog & directory details!
        </p>
      </div>
    </aside>
  );
};
