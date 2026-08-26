import React, { useState } from 'react';
import { X, Printer, CheckCircle, FileText, Download } from 'lucide-react';

export const WorkCompletionPrintModal = ({ isOpen, onClose, certificate }) => {
  const [activeDocType, setActiveDocType] = useState('both'); // 'wcc', 'defect', 'both'

  if (!isOpen || !certificate) return null;

  const isService = certificate.equipmentDescription === 'Service';
  const serviceItems = (certificate.items || []).filter(item => item.itemType === 'SERVICE');
  const materialItems = (certificate.items || []).filter(item => item.itemType === 'MATERIAL' || !item.itemType);

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
    if (isService) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '6px 14px', fontSize: '13px' }}>
          <div><strong>Description:</strong> Service</div>
          <div><strong>Equipment:</strong> {certificate.equipment || '-'}</div>
          <div><strong>Location:</strong> {certificate.location || '-'}</div>

          <div><strong>Make:</strong> {certificate.make || '-'}</div>
          <div><strong>Sl. No.:</strong> {certificate.slNo || '-'}</div>
          <div><strong>Capacity:</strong> {certificate.capacity || '-'}</div>

          <div style={{ gridColumn: 'span 3' }}><strong>Type / Model:</strong> {certificate.typeModel || '-'}</div>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '6px 12px', fontSize: '13px' }}>
        <div><strong>Description:</strong> Material</div>
        <div><strong>Location:</strong> {certificate.location || '-'}</div>
        <div><strong>Make:</strong> {certificate.make || '-'}</div>

        <div><strong>Sl. No.:</strong> {certificate.slNo || '-'}</div>
        <div><strong>Capacity:</strong> {certificate.capacity || '-'}</div>
        <div><strong>Type / Model:</strong> {certificate.typeModel || '-'}</div>
      </div>
    );
  };

  const renderItemsTable = (itemsList) => (
    <table className="cert-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '14px 0', fontSize: '13px' }}>
      <thead>
        <tr style={{ borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000' }}>
          <th style={{ width: '60px', padding: '6px 8px', fontWeight: 'bold' }}>Sl.No.</th>
          <th style={{ width: '120px', padding: '6px 8px', fontWeight: 'bold' }}>RC Item No.</th>
          <th style={{ padding: '6px 8px', fontWeight: 'bold' }}>Description</th>
          <th style={{ width: '80px', padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>Qty.</th>
        </tr>
      </thead>
      <tbody>
        {itemsList && itemsList.length > 0 ? (
          itemsList.map((item, idx) => (
            <tr key={idx} style={idx === itemsList.length - 1 ? { borderBottom: '1.5px solid #000' } : {}}>
              <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{idx + 1}</td>
              <td style={{ padding: '6px 8px', verticalAlign: 'top', fontWeight: '600' }}>{item.rcItemNo || '-'}</td>
              <td style={{ padding: '6px 8px', verticalAlign: 'top', whiteSpace: 'pre-line' }}>{item.description}</td>
              <td style={{ padding: '6px 8px', verticalAlign: 'top', textAlign: 'right', fontWeight: '600' }}>
                {item.quantity} {item.unit || 'No.'}
              </td>
            </tr>
          ))
        ) : (
          <tr style={{ borderBottom: '1.5px solid #000' }}>
            <td colSpan={4} style={{ padding: '12px 8px', textAlign: 'center' }}>No items listed</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="no-print-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>

      <div className="glass-panel-print-wrap" style={{ width: '100%', maxWidth: '880px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>

        {/* Modal Toolbar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(31, 41, 55, 0.95)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#34d399' }}>
            <FileText size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Certificate Preview & Print ({certificate.certificateNo}) - Mode: {certificate.equipmentDescription || 'Material'}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* View Filter Toggles */}
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveDocType('both')}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: activeDocType === 'both' ? '#4f46e5' : 'transparent', color: activeDocType === 'both' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
              >
                Both Pages
              </button>
              <button
                onClick={() => setActiveDocType('wcc')}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: activeDocType === 'wcc' ? '#4f46e5' : 'transparent', color: activeDocType === 'wcc' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
              >
                Work Completion
              </button>
              <button
                onClick={() => setActiveDocType('defect')}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: activeDocType === 'defect' ? '#4f46e5' : 'transparent', color: activeDocType === 'defect' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
              >
                Defect Report
              </button>
            </div>

            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.55rem 1.1rem' }}>
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>

            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Template Area */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', background: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div id="work-cert-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* DOCUMENT 1: JOINT INSPECTION / DEFECT REPORT */}
            {(activeDocType === 'both' || activeDocType === 'defect') && (
              <div
                className="cert-page"
                style={{
                  background: '#ffffff',
                  color: '#000000',
                  padding: '30px 35px',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  minHeight: '750px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Georgia, serif' }}>Sri Durga Enterprises</span>
                  </div>
                  <div style={{ fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                    No. 10 V.G. Nagar, Kovilpathu, Karaikal<br />
                    Cell: 9842492946
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
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
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '13.5px' }}>
                    WORK RELEASE
                  </div>
                  {isService ? (
                    <>
                      <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Work to be carried out:</div>
                      {renderItemsTable(serviceItems)}
                      
                      <div style={{ fontWeight: 'bold', marginTop: '12px' }}>Materials</div>
                      {renderItemsTable(materialItems)}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Materials</div>
                      {renderItemsTable(materialItems)}
                    </>
                  )}

                  <div style={{ marginTop: '8px', fontSize: '13px' }}>
                    <strong>Completion Time :</strong> {certificate.completionTime || '5 Day(s)'}
                  </div>
                </div>

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
                  padding: '30px 35px',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  minHeight: '750px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'Georgia, serif' }}>Sri Durga Enterprises</span>
                  </div>
                  <div style={{ fontSize: '10px', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                    No. 10 V.G. Nagar, Kovilpathu, Karaikal<br />
                    Cell: 9842492946
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
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
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '13.5px' }}>
                    WORK COMPLETED
                  </div>
                  {isService ? (
                    <>
                      <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Work to be carried out:</div>
                      {renderItemsTable(serviceItems)}
                      
                      <div style={{ fontWeight: 'bold', marginTop: '12px' }}>Materials</div>
                      {renderItemsTable(materialItems)}
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 'bold', marginTop: '6px' }}>Materials</div>
                      {renderItemsTable(materialItems)}
                    </>
                  )}
                </div>

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

      </div>
    </div>
  );
};
