import React, { useEffect } from 'react';
import { X, Printer, CheckCircle, ArrowLeftRight } from 'lucide-react';

export const GatePassPrintModal = ({ isOpen, onClose, gatePass }) => {
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

  if (!isOpen || !gatePass) return null;

  const handlePrint = () => {
    const printArea = document.getElementById('gatepass-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (printWindow) {
      const gatePassHtml = printArea.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gate Pass - ${gatePass.gatePassNo || ''}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: Arial, sans-serif;
                background: #ffffff;
                color: #000000;
                padding: 8mm;
              }
              #gatepass-print-area {
                border: 2px solid #000000;
                width: 100%;
                background: #ffffff;
                color: #000000;
                font-size: 13px;
                line-height: 1.4;
                padding: 0;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
            </style>
          </head>
          <body>
            ${gatePassHtml}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const formattedDate = gatePass.gatePassDate
    ? new Date(gatePass.gatePassDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  // Fill in empty rows if table is small, to preserve physical dimensions (e.g. 10 rows minimum)
  const items = gatePass.items || [];
  const minRows = 10;
  const displayItems = [...items];
  while (displayItems.length < minRows) {
    displayItems.push({
      serialNumber: displayItems.length + 1,
      description: '',
      quantity: '',
      remarks: ''
    });
  }

  return (
    <div 
      className="no-print-modal-overlay" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 999999, 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(10px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0.75rem', 
        overflow: 'hidden' 
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-panel-print-wrap" 
        style={{ 
          width: '100%', 
          maxWidth: '900px', 
          height: '95vh', 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#0f172a', 
          border: '1.5px solid rgba(99, 102, 241, 0.4)', 
          borderRadius: '16px', 
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          position: 'relative' 
        }}
      >
        {/* TOP HEADER: Clean Title Bar + Dedicated Corner Close (X) Button */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0.75rem 1.25rem', 
            background: 'rgba(30, 41, 59, 0.98)', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
            flexShrink: 0 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftRight size={18} color="#fbbf24" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                {gatePass.passType === 'IN' ? 'In' : 'Out'} Gate Pass Preview & Print
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Doc No: <strong style={{ color: '#fbbf24' }}>{gatePass.gatePassNo}</strong> &bull; Customer: <strong style={{ color: '#34d399' }}>{gatePass.customerName || '-'}</strong>
              </span>
            </div>
          </div>

          {/* DEDICATED TOP-RIGHT CORNER CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              padding: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderColor: 'rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Close Preview (Esc)"
            aria-label="Close Preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* MIDDLE BODY: Scrollable Printable Gate Pass Template */}
        <div 
          style={{ 
            flex: 1, 
            padding: '1.5rem', 
            overflowY: 'auto', 
            background: '#334155', 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          <div 
            id="gatepass-print-area" 
            style={{ 
              border: '2px solid #000', 
              background: '#fff', 
              fontSize: '13px', 
              lineHeight: '1.4', 
              color: '#000', 
              padding: '18px 22px',
              width: '100%',
              maxWidth: '820px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              borderRadius: '2px'
            }}
          >
            {/* Top Row: GSTIN, DELIVERY CHALLAN, No. */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                GSTIN : 34AGKPB3918J1ZV
              </div>

              <div style={{ textAlign: 'center', border: '1.5px solid #000', padding: '3px 12px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }}>
                DELIVERY CHALLAN
              </div>

              <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                <div>No. <span style={{ textDecoration: 'underline' }}>{gatePass.gatePassNo}</span></div>
                <div style={{ marginTop: '2px' }}>Date: <span style={{ textDecoration: 'underline' }}>{formattedDate}</span></div>
              </div>
            </div>

            {/* Header: Sri Durga Enterprises Info */}
            <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#000', margin: '0 0 2px 0', letterSpacing: '0.5px', fontFamily: 'Georgia, serif' }}>
                SRI DURGA ENTERPRISES
              </h1>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>
                # 10, V.G. NAGAR, KOVILPATHU, KARAIKAL - 609 605.
              </div>
              <div style={{ fontSize: '12px', fontWeight: '500' }}>
                Ph: 04368 - 225786 &bull; Cell: 94432 87986, 93454 87986
              </div>
            </div>

            {/* To Customer / Address Box */}
            <div style={{ display: 'flex', borderBottom: '1.5px solid #000', paddingBottom: '8px', marginBottom: '10px' }}>
              <div style={{ width: '40px', fontWeight: 'bold' }}>To:</div>
              <div style={{ flex: 1, minHeight: '65px', fontSize: '13px', lineHeight: '1.4' }}>
                <div style={{ fontWeight: 'bold' }}>{gatePass.customerName || ''}</div>
                <div style={{ whiteSpace: 'pre-line' }}>{gatePass.customerAddress || ''}</div>
                {gatePass.customerGstin && <div>GSTIN: {gatePass.customerGstin}</div>}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '12px', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #000', background: '#f8fafc' }}>
                  <th style={{ borderRight: '1.5px solid #000', padding: '6px 4px', width: '45px', textAlign: 'center' }}>Sl.No</th>
                  <th style={{ borderRight: '1.5px solid #000', padding: '6px 8px', textAlign: 'left' }}>Particulars</th>
                  <th style={{ borderRight: '1.5px solid #000', padding: '6px 8px', width: '70px', textAlign: 'center' }}>Qty.</th>
                  <th style={{ padding: '6px 8px', width: '110px', textAlign: 'center' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd', height: '26px' }}>
                    <td style={{ borderRight: '1.5px solid #000', padding: '4px', textAlign: 'center', verticalAlign: 'top' }}>
                      {item.description ? item.serialNumber || index + 1 : ''}
                    </td>
                    <td style={{ borderRight: '1.5px solid #000', padding: '4px 8px', verticalAlign: 'top' }}>
                      {item.description}
                    </td>
                    <td style={{ borderRight: '1.5px solid #000', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                      {item.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bottom Meta & Vehicle Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px', marginBottom: '30px', fontSize: '12px' }}>
              <div>
                <div><strong>Reason for Transfer:</strong> {gatePass.reasonForTransfer || '-'}</div>
                <div style={{ marginTop: '4px' }}><strong>Vehicle No:</strong> {gatePass.vehicleNo || '-'}</div>
              </div>
              <div>
                <div><strong>Approx Value (Rs.):</strong> {gatePass.approxValue ? `₹ ${Number(gatePass.approxValue).toLocaleString('en-IN')}` : '-'}</div>
                <div style={{ marginTop: '4px' }}><strong>Mode of Transport:</strong> {gatePass.modeOfTransport || '-'}</div>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '40px', fontSize: '12.5px', fontWeight: 'bold' }}>
              <div>Receiver's Signature</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '35px', fontWeight: 'normal', fontSize: '11.5px' }}>For SRI DURGA ENTERPRISES</div>
                <div>Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FIXED ACTION TOOLBAR: Print Button + Close Button */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0.85rem 1.5rem', 
            background: 'rgba(15, 23, 42, 0.98)', 
            borderTop: '1px solid rgba(255, 255, 255, 0.12)', 
            flexShrink: 0,
            zIndex: 10
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            A4 Portrait Layout &bull; Ready for High-Quality Print
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={onClose} 
              className="btn btn-outline" 
              style={{ 
                padding: '0.55rem 1rem', 
                fontSize: '0.825rem',
                color: '#cbd5e1',
                borderColor: 'rgba(255, 255, 255, 0.2)' 
              }}
            >
              Close
            </button>

            <button 
              onClick={handlePrint} 
              className="btn btn-primary" 
              style={{ 
                padding: '0.55rem 1.35rem', 
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
              }}
            >
              <Printer size={17} />
              <span>Print Gate Pass / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
