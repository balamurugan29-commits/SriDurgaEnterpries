import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, CheckCircle, Eye } from 'lucide-react';

export const WorkCompletionPrintModal = ({ isOpen, onClose, certificate }) => {
  const [activeDocType, setActiveDocType] = useState('both'); // 'wcc', 'defect', 'both'

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

  if (!isOpen || !certificate) return null;

  const isValidItem = (item) => {
    if (!item) return false;
    const rc = (item.rcItemNo || '').toString().trim();
    const desc = (item.description || '').toString().trim();
    const hasRc = rc !== '' && rc !== '-';
    const hasDesc = desc !== '' && desc !== '-';
    return hasRc || hasDesc;
  };

  const serviceItems = (certificate.items || [])
    .filter(item => (item.itemType === 'SERVICE' || item.itemType === 'Service') && isValidItem(item));

  const materialItems = (certificate.items || [])
    .filter(item => (item.itemType === 'MATERIAL' || item.itemType === 'Material' || !item.itemType) && isValidItem(item));

  const hasServiceItems = serviceItems.length > 0;
  const hasMaterialItems = materialItems.length > 0;

  const handlePrint = () => {
    const printArea = document.getElementById('work-cert-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1050');
    if (printWindow) {
      const htmlContent = printArea.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Work Completion Certificate - ${certificate.certificateNo || 'Sri Durga Enterprises'}</title>
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
                padding: 12mm 15mm;
              }
              .cert-page {
                width: 100%;
                background: #ffffff;
                color: #000000;
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 25px;
                page-break-after: always !important;
                break-after: page !important;
              }
              .cert-page:last-child {
                margin-bottom: 0;
                page-break-after: auto !important;
                break-after: auto !important;
              }
              .cert-table {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0;
                font-size: 12.5px;
              }
              .cert-table th {
                border-top: 1.5px solid #000;
                border-bottom: 1.5px solid #000;
                padding: 6px 8px;
                text-align: left;
                font-weight: bold;
              }
              .cert-table td {
                padding: 6px 8px;
                vertical-align: top;
              }
              .cert-table tr.last-row td {
                border-bottom: 1.5px solid #000;
              }
              @page {
                size: A4 portrait;
                margin: 12mm 15mm;
              }
              @media print {
                body {
                  padding: 0;
                }
                .cert-page {
                  margin-bottom: 0 !important;
                  page-break-after: always !important;
                  break-after: page !important;
                }
                .cert-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
                }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 350);
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

  const renderEquipmentDetailsGrid = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '6px 14px', fontSize: '13px' }}>
        <div><strong>Description:</strong> {certificate.equipmentDescription || 'Service'}</div>
        <div><strong>Location:</strong> {certificate.location || '-'}</div>
        <div><strong>Make:</strong> {certificate.make || '-'}</div>

        <div><strong>Sl. No.:</strong> {certificate.slNo || '-'}</div>
        <div><strong>Capacity:</strong> {certificate.capacity || '-'}</div>
        <div><strong>Type / Model:</strong> {certificate.typeModel || '-'}</div>
      </div>
    );
  };

  const renderItemsTable = (itemsList) => {
    if (!itemsList || itemsList.length === 0) return null;
    return (
      <table className="cert-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>
            <th style={{ width: '60px', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Sl.No.</th>
            <th style={{ width: '130px', padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>RC Item No.</th>
            <th style={{ padding: '5px 8px', fontWeight: 'bold', textAlign: 'left' }}>Description</th>
            <th style={{ width: '80px', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>Qty.</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.map((item, idx) => (
            <tr key={idx} style={idx === itemsList.length - 1 ? { borderBottom: '1.5px solid #000' } : {}}>
              <td style={{ padding: '5px 8px', verticalAlign: 'top' }}>{idx + 1}</td>
              <td style={{ padding: '5px 8px', verticalAlign: 'top', fontWeight: '600' }}>{item.rcItemNo || '-'}</td>
              <td style={{ padding: '5px 8px', verticalAlign: 'top', whiteSpace: 'pre-line' }}>{item.description || '-'}</td>
              <td style={{ padding: '5px 8px', verticalAlign: 'top', textAlign: 'right', fontWeight: '600' }}>
                {item.quantity} {item.unit || 'No.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div 
      className="no-print-modal-overlay" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 999999, 
        background: 'rgba(0, 0, 0, 0.85)', 
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
          maxWidth: '920px', 
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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                Certificate Preview & Print
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Doc No: <strong style={{ color: '#38bdf8' }}>{certificate.certificateNo}</strong> &bull; Type: <strong style={{ color: '#34d399' }}>{certificate.equipmentDescription || 'Material'}</strong>
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

        {/* MIDDLE BODY: Scrollable Printable Template Area */}
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
            id="work-cert-print-area" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '2rem', 
              width: '100%', 
              maxWidth: '820px' 
            }}
          >
            {/* DOCUMENT 1: JOINT INSPECTION / DEFECT REPORT */}
            {(activeDocType === 'both' || activeDocType === 'defect') && (
              <div
                className="cert-page"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  padding: '35px 40px',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                  minHeight: '780px',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
                    JOINT INSPECTION / DEFECT REPORT
                  </h2>
                </div>

                {/* Agency & Rate Contract Ref */}
                <div style={{ marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                  <div><strong>AGENCY:</strong> {certificate.agency}</div>
                  <div style={{ marginTop: '4px' }}><strong>RATE CONTRACT REF:</strong> {certificate.rateContractRef}</div>
                </div>

                {/* Equipment Details */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', fontSize: '13.5px' }}>
                    EQUIPMENT DETAILS
                  </div>

                  {renderEquipmentDetailsGrid()}
                </div>

                {/* Work Release & Materials */}
                {(hasServiceItems || hasMaterialItems) && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '13.5px' }}>
                      WORK RELEASE
                    </div>

                    {/* 1. Work to be carried out (Only if entered) */}
                    {hasServiceItems && (
                      <div style={{ marginBottom: hasMaterialItems ? '12px' : '4px' }}>
                        <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '13px' }}>Work to be carried out:</div>
                        {renderItemsTable(serviceItems)}
                      </div>
                    )}

                    {/* 2. Materials (Only if entered) */}
                    {hasMaterialItems && (
                      <div style={{ marginBottom: '4px' }}>
                        <div style={{ fontWeight: 'bold', marginTop: hasServiceItems ? '8px' : '4px', fontSize: '13px' }}>Materials</div>
                        {renderItemsTable(materialItems)}
                      </div>
                    )}

                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      <strong>Completion Time :</strong> {certificate.completionTime || '5 Day(s)'}
                    </div>
                  </div>
                )}

                {/* Signatures */}
                <div style={{ marginTop: 'auto', paddingTop: '70px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13px', fontWeight: '500' }}>
                  <div>Signature of Contractor</div>
                  <div>Signature of EIC</div>
                </div>
              </div>
            )}

            {/* DOCUMENT 2: WORK COMPLETION CERTIFICATE */}
            {(activeDocType === 'both' || activeDocType === 'wcc') && (
              <div
                className="cert-page"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  padding: '35px 40px',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                  minHeight: '780px',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
                    WORK COMPLETION CERTIFICATE
                  </h2>
                </div>

                {/* Agency & Rate Contract Ref */}
                <div style={{ marginBottom: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                  <div><strong>AGENCY:</strong> {certificate.agency}</div>
                  <div style={{ marginTop: '4px' }}><strong>RATE CONTRACT REF:</strong> {certificate.rateContractRef}</div>
                </div>

                {/* Equipment Details */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', fontSize: '13.5px' }}>
                    EQUIPMENT DETAILS
                  </div>

                  {renderEquipmentDetailsGrid()}
                </div>

                {/* Work Completed & Materials */}
                {(hasServiceItems || hasMaterialItems) && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '13.5px' }}>
                      WORK COMPLETED
                    </div>

                    {/* 1. Work to be carried out (Only if entered) */}
                    {hasServiceItems && (
                      <div style={{ marginBottom: hasMaterialItems ? '12px' : '4px' }}>
                        <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '13px' }}>Work to be carried out:</div>
                        {renderItemsTable(serviceItems)}
                      </div>
                    )}

                    {/* 2. Materials (Only if entered) */}
                    {hasMaterialItems && (
                      <div style={{ marginBottom: '4px' }}>
                        <div style={{ fontWeight: 'bold', marginTop: hasServiceItems ? '8px' : '4px', fontSize: '13px' }}>Materials</div>
                        {renderItemsTable(materialItems)}
                      </div>
                    )}
                  </div>
                )}

                {/* Other Details */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', fontSize: '13.5px' }}>
                    Other Details
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '13px' }}>
                    <div>a.Date of handing over for repairs: <strong>{certificate.dateHandingOver || '-'}</strong></div>
                    <div>b.Date of completion of work: <strong>{certificate.dateCompletion || '-'}</strong></div>
                    <div>c.Delay in completion of work, if any: <strong>{certificate.delayInCompletion || 'NIL'}</strong></div>
                    <div>d.Performance of machines/ equipment after repair: <strong>{certificate.performanceOfMachines || 'OK'}</strong></div>
                    <div>e.Defective spares/ material returned: <strong>{certificate.defectiveSparesReturned || 'NA'}</strong></div>
                  </div>
                </div>

                {/* Signature of EIC with Seal */}
                <div style={{ marginTop: 'auto', paddingTop: '70px', textAlign: 'right', fontSize: '13px', fontWeight: '500' }}>
                  <div>Signature of EIC with Seal</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM FIXED ACTION TOOLBAR: Both Pages / WCC / Defect + Print Button + Close Button */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0.85rem 1.5rem', 
            background: 'rgba(15, 23, 42, 0.98)', 
            borderTop: '1px solid rgba(255, 255, 255, 0.12)', 
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '0.75rem',
            zIndex: 10
          }}
        >
          {/* Left: View Filter Toggles (Both Pages, Work Completion, Defect Report) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              View:
            </span>
            <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setActiveDocType('both')}
                style={{ 
                  padding: '0.45rem 0.85rem', 
                  borderRadius: '7px', 
                  fontSize: '0.8rem', 
                  fontWeight: activeDocType === 'both' ? 700 : 500, 
                  background: activeDocType === 'both' ? '#4f46e5' : 'transparent', 
                  color: activeDocType === 'both' ? '#ffffff' : '#94a3b8', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Both Pages
              </button>
              <button
                onClick={() => setActiveDocType('wcc')}
                style={{ 
                  padding: '0.45rem 0.85rem', 
                  borderRadius: '7px', 
                  fontSize: '0.8rem', 
                  fontWeight: activeDocType === 'wcc' ? 700 : 500, 
                  background: activeDocType === 'wcc' ? '#4f46e5' : 'transparent', 
                  color: activeDocType === 'wcc' ? '#ffffff' : '#94a3b8', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Work Completion
              </button>
              <button
                onClick={() => setActiveDocType('defect')}
                style={{ 
                  padding: '0.45rem 0.85rem', 
                  borderRadius: '7px', 
                  fontSize: '0.8rem', 
                  fontWeight: activeDocType === 'defect' ? 700 : 500, 
                  background: activeDocType === 'defect' ? '#4f46e5' : 'transparent', 
                  color: activeDocType === 'defect' ? '#ffffff' : '#94a3b8', 
                  border: 'none', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Defect Report
              </button>
            </div>
          </div>

          {/* Right: Print / Save PDF and Close */}
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
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
