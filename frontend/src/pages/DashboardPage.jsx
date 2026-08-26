import React, { useState, useEffect } from 'react';
import { fetchItems, fetchChallans, calculateChallanTotalAmount } from '../services/api';
import { Database, FileSpreadsheet, ArrowUpRight, Plus, ShieldCheck, Receipt, ArrowLeftRight } from 'lucide-react';

export const DashboardPage = ({ setActivePage }) => {
  const [items, setItems] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [itemsData, challansData] = await Promise.all([
          fetchItems(),
          fetchChallans()
        ]);
        setItems(itemsData || []);
        setChallans(challansData || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalInvoiceValue = challans.reduce((sum, c) => sum + calculateChallanTotalAmount(c), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldCheck size={12} /> System Status: Operational & Auto-Fetch Enabled
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Sri Durga Management Overview
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Central item master repository, automated Tax Invoice generator, and revenue analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActivePage('master')} className="btn btn-outline">
            <Database size={16} />
            <span>Open Master Page</span>
          </button>
          <button onClick={() => setActivePage('challan')} className="btn btn-primary">
            <Plus size={16} />
            <span>New Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: 3 Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Metric 1: Master Items Count */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
              Master Items Count
            </span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {loading ? '...' : items.length}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>Maintained in Master Page</span>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '1rem', borderRadius: '14px', color: '#818cf8' }}>
            <Database size={30} />
          </div>
        </div>

        {/* Metric 2: Total Tax Invoices Issued */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', letterSpacing: '0.05em' }}>
              Tax Invoices Count
            </span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
              {loading ? '...' : challans.length}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Total Invoices Issued</span>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '1rem', borderRadius: '14px', color: '#fbbf24' }}>
            <FileSpreadsheet size={30} />
          </div>
        </div>

        {/* Metric 3: Total Invoice Value (Sum of all Tax Invoice Total Amounts) */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em' }}>
              Total Invoice Value
            </span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
              {loading ? '...' : `₹${totalInvoiceValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sum of All Invoices (Inc. GST)</span>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '1rem', borderRadius: '14px', color: '#38bdf8' }}>
            <Receipt size={30} />
          </div>
        </div>

      </div>

      {/* Quick Action Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* Master Page Feature Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setActivePage('master')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#818cf8' }}>
              <Database size={24} />
            </div>
            <ArrowUpRight size={20} color="var(--text-subtle)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            1. Master Page
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Central database for entering items catalog. Includes Serial Number, Item Code, Description, Unit, Rate, and Service Charge. Live Search and Excel Bulk Upload/Export.
          </p>
        </div>

        {/* Tax Invoice Feature Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setActivePage('challan')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#34d399' }}>
              <FileSpreadsheet size={24} />
            </div>
            <ArrowUpRight size={20} color="var(--text-subtle)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            2. Tax Invoice (Auto-Fetch)
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Select Item Code (e.g. W101) or Customer Name. The system automatically fetches Description, Rate & Customer GSTIN directly with Indian FY numbering (01/26-27).
          </p>
        </div>

        {/* Out Gate Pass Feature Box */}
        <div className="glass-panel" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => setActivePage('gate-pass')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#fbbf24' }}>
              <ArrowLeftRight size={24} />
            </div>
            <ArrowUpRight size={20} color="var(--text-subtle)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            3. Out Gate Pass
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Create and print official material Gate Passes. Input item descriptions, quantities, and receiver details with clean replica PDF layouts.
          </p>
        </div>

      </div>

    </div>
  );
};
