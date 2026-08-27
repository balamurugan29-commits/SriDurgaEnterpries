import React, { useEffect } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { printProformaInvoiceDirect, generateProformaInvoicePrintHtml } from '../utils/proformaInvoicePrint';

export const ProformaPrintModal = ({ isOpen, onClose, proforma }) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !proforma) return null;

  const handlePrint = () => {
    printProformaInvoiceDirect(proforma);
  };

  const previewHtml = generateProformaInvoicePrintHtml(proforma);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '92vh',
          background: '#ffffff',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.5rem',
            background: '#0f172a',
            color: '#ffffff',
            borderBottom: '1px solid #334155'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} color="#38bdf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                Proforma Invoice Preview — {proforma.proformaNumber || 'PC/01/26-27'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Customer: {proforma.customerName || 'N/A'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#38bdf8',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>Print / Export PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #475569',
                background: 'transparent',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body iframe preview */}
        <div style={{ flex: 1, background: '#e2e8f0', padding: '1rem', overflow: 'hidden' }}>
          <iframe
            srcDoc={previewHtml}
            title="Proforma Invoice Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px',
              background: '#ffffff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
