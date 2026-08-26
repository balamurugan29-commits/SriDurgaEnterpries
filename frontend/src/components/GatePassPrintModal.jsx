import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

export const GatePassPrintModal = ({ isOpen, onClose, gatePass }) => {
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
    <div className="no-print-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #gatepass-print-area, #gatepass-print-area * {
            visibility: visible !important;
          }
          #gatepass-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 2px solid #000000 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="glass-panel-print-wrap" style={{ width: '100%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Modal Toolbar */}
        <div className="no-print-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(31, 41, 55, 0.9)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 600 }}>
            <CheckCircle size={18} />
            <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>{gatePass.passType === 'IN' ? 'In' : 'Out'} Gate Pass Print Preview</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              <Printer size={16} />
              <span>Print Gate Pass / Save PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable PDF Template Box */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', background: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
          
          <div id="gatepass-print-area" style={{ border: '2px solid #000', background: '#fff', fontSize: '13px', lineHeight: '1.4', color: '#000', padding: '15px' }}>
            
            {/* Top Row: GSTIN, DELIVERY CHALLAN, No. */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                GSTIN : 34ABDFS4476N1ZN
              </div>
              <div style={{ border: '2px solid #000', padding: '3px 12px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {gatePass.passType === 'IN' ? 'IN GATE PASS' : 'OUT GATE PASS'}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                No. <span style={{ textDecoration: 'underline' }}>{gatePass.gatePassNo || ''}</span>
              </div>
            </div>

            {/* Business Logo Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '12px' }}>
              <img src="/logo.jpg" alt="Logo" style={{ height: '48px', marginBottom: '4px', objectFit: 'contain' }} />
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Georgia, serif', letterSpacing: '1px', marginBottom: '2px' }}>
                Sri Durga Enterprises
              </div>
              <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                No.10, V.G.Nagar Kovilpathu, Karaikal - 609 602. U.T. of Puducherry.<br />
                Cell : 98424 92946
              </div>
            </div>

            {/* Separator line */}
            <hr style={{ border: '0', borderTop: '1px solid #000', margin: '8px 0' }} />

            {/* To & Date row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginRight: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', marginRight: '6px', whiteSpace: 'nowrap' }}>{gatePass.passType === 'IN' ? 'From:' : 'To:'}</span>
                  <span style={{ borderBottom: '1px dotted #000', flex: 1, paddingLeft: '4px', whiteSpace: 'pre-wrap', fontWeight: 'bold' }}>
                    {gatePass.receiverName || ''}
                  </span>
                </div>
                {gatePass.siteName && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '4px' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '6px', whiteSpace: 'nowrap' }}>Site Name:</span>
                    <span style={{ borderBottom: '1px dotted #000', flex: 1, paddingLeft: '4px', fontWeight: 'bold' }}>
                      {gatePass.siteName}
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', width: '180px', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 'bold', marginRight: '6px' }}>Date:</span>
                <span style={{ borderBottom: '1px dotted #000', flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Standard instruction text */}
            <div style={{ fontSize: '12.5px', fontStyle: 'italic', marginBottom: '12px', marginTop: '4px' }}>
              Dear Sir, Kindly arrange to receive the following and acknowledge
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '25px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ border: '1.5px solid #000', padding: '6px', width: '8%', fontSize: '12px', textAlign: 'center' }}>Sl.No.</th>
                  <th style={{ border: '1.5px solid #000', padding: '6px', width: '62%', fontSize: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ border: '1.5px solid #000', padding: '6px', width: '15%', fontSize: '12px', textAlign: 'center' }}>Quantity</th>
                  <th style={{ border: '1.5px solid #000', padding: '6px', width: '15%', fontSize: '12px', textAlign: 'left' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item, idx) => (
                  <tr key={idx} style={{ height: '32px' }}>
                    <td style={{ border: '1.5px solid #000', padding: '4px', textAlign: 'center', verticalAlign: 'middle', fontWeight: item.description ? 'bold' : 'normal' }}>
                      {idx + 1}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 8px', verticalAlign: 'middle', fontWeight: item.description ? 'bold' : 'normal' }}>
                      {item.description}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px', textAlign: 'center', verticalAlign: 'middle', fontWeight: item.description ? 'bold' : 'normal' }}>
                      {item.quantity}
                    </td>
                    <td style={{ border: '1.5px solid #000', padding: '4px 8px', verticalAlign: 'middle', fontWeight: item.description ? 'bold' : 'normal' }}>
                      {item.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Footer Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '0 10px 10px 10px' }}>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ borderTop: '1.5px solid #000', paddingTop: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  Received the above<br />
                  Indentor's Agent
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '35px' }}>
                  For Sri Durga Enterprises
                </div>
                <div style={{ borderTop: '1.5px solid #000', paddingTop: '5px', fontWeight: 'bold', fontSize: '12px' }}>
                  Manager
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
