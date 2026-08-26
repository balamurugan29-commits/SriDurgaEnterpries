import React, { useEffect } from 'react';
import { X, Printer, FileText } from 'lucide-react';

const formatPrintList = (val) => {
  if (!val) return '';
  return val.split(',').map(item => item.trim()).filter(Boolean).join(' / ');
};

export const JobCardPrintModal = ({ isOpen, onClose, jobCard }) => {
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

  if (!isOpen || !jobCard) return null;

  const handlePrint = () => {
    const printArea = document.getElementById('job-card-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1050');
    if (printWindow) {
      const htmlContent = printArea.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Job Card - ${jobCard.jobNo || 'Sri Durga Enterprises'}</title>
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
                padding: 6mm 8mm;
              }
              #job-card-print-area {
                width: 100%;
                background: #ffffff;
                color: #000000;
                font-size: 13px;
                line-height: 1.45;
              }
              .border-box {
                border: 2px solid #000000;
                padding: 8px 12px;
                margin-bottom: 6px;
              }
              .underline-val {
                font-weight: bold;
                color: #000000;
              }
              .dotted-line {
                border-bottom: 1px dotted #000000;
                display: inline-block;
                min-width: 120px;
                padding: 0 4px;
                font-weight: bold;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              @media print {
                body {
                  padding: 0;
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

  const formattedDate = jobCard.jobDate
    ? new Date(jobCard.jobDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                Job Card Preview & Print
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Job No: <strong style={{ color: '#38bdf8' }}>{jobCard.jobNo}</strong> &bull; Customer: <strong style={{ color: '#34d399' }}>{jobCard.customerName || '-'}</strong>
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

        {/* MIDDLE BODY: Scrollable Printable Job Card Area */}
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
            id="job-card-print-area" 
            style={{ 
              border: '2px solid #000', 
              padding: '12px 18px', 
              background: '#fff', 
              fontSize: '12px', 
              lineHeight: '1.4', 
              color: '#000',
              width: '100%',
              maxWidth: '820px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              borderRadius: '2px'
            }}
          >
            {/* Top Header with Logo, Title & JOB CARD Inverted Box */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#000', margin: 0, letterSpacing: '0.5px', fontFamily: 'Georgia, serif' }}>
                  Sri Durga Enterprises
                </h1>
              </div>

              <div style={{ background: '#000', color: '#fff', padding: '6px 14px', fontWeight: '900', fontSize: '15px', letterSpacing: '1px', borderRadius: '2px' }}>
                JOB CARD
              </div>
            </div>

            {/* Sub-header: Address & Contact */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#000', marginBottom: '8px', borderBottom: '1.5px solid #000', paddingBottom: '4px' }}>
              <div>#10, V.G. NAGAR, KOVILPATHU, KARAIKAL - 609 605.</div>
              <div>PH : 04368 - 225786 &bull; CELL : 94432 87986, 93454 87986</div>
            </div>

            {/* Box 1: Customer Details & Job Identity */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4px 16px' }}>
                <div><strong>M/s. :</strong> <span className="underline-val">{jobCard.customerName || '-'}</span></div>
                <div><strong>JOB NO. :</strong> <span className="underline-val" style={{ fontSize: '13px' }}>{jobCard.jobNo}</span></div>

                <div style={{ gridColumn: 'span 2' }}><strong>Address :</strong> <span className="underline-val">{jobCard.customerAddress || '-'}</span></div>

                <div><strong>Location :</strong> <span className="underline-val">{jobCard.location || '-'}</span></div>
                <div><strong>DATE :</strong> <span className="underline-val">{formattedDate}</span></div>
              </div>
            </div>

            {/* Box 2: Equipment / Motor Specifications Grid */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px' }}>
                <div><strong>H.P. / K.W. :</strong> <span className="underline-val">{jobCard.hpKw || '-'}</span></div>
                <div><strong>R.P.M. :</strong> <span className="underline-val">{jobCard.rpm || '-'}</span></div>
                <div><strong>VOLTS :</strong> <span className="underline-val">{jobCard.volts || '-'}</span></div>

                <div><strong>AMPS :</strong> <span className="underline-val">{jobCard.amps || '-'}</span></div>
                <div><strong>FRAME :</strong> <span className="underline-val">{jobCard.frame || '-'}</span></div>
                <div><strong>PHASE :</strong> <span className="underline-val">{jobCard.phase || '-'}</span></div>

                <div><strong>MAKE :</strong> <span className="underline-val">{jobCard.make || '-'}</span></div>
                <div><strong>TYPE :</strong> <span className="underline-val">{jobCard.type || '-'}</span></div>
                <div><strong>SL. NO. :</strong> <span className="underline-val">{jobCard.slNo || '-'}</span></div>
              </div>
            </div>

            {/* Box 3: Incoming Inspection / Physical Condition */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>
                Incoming Physical Condition:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                <div><strong>Body / Cover :</strong> <span>{formatPrintList(jobCard.bodyCondition) || 'Normal'}</span></div>
                <div><strong>Terminal Block :</strong> <span>{formatPrintList(jobCard.terminalBlock) || 'Normal'}</span></div>
                <div><strong>Fan & Cover :</strong> <span>{formatPrintList(jobCard.fanCondition) || 'Normal'}</span></div>
                <div><strong>Shaft :</strong> <span>{formatPrintList(jobCard.shaftCondition) || 'Normal'}</span></div>
              </div>
            </div>

            {/* Box 4: Repairs Carried Out */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>
                Repairs / Services Carried Out:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                <div><strong>Rewinding :</strong> <span>{formatPrintList(jobCard.rewindingType) || 'N/A'}</span></div>
                <div><strong>Shaft Repair :</strong> <span>{formatPrintList(jobCard.shaftWork) || 'N/A'}</span></div>
                <div><strong>Housing Repair :</strong> <span>{formatPrintList(jobCard.housingWork) || 'N/A'}</span></div>
                <div><strong>Dynamic Balancing :</strong> <span>{jobCard.dynamicBalancing ? 'Done' : 'N/A'}</span></div>
              </div>
            </div>

            {/* Box 5: Spares Replaced */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>
                Spares / Components Replaced:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 16px' }}>
                <div><strong>Bearings :</strong> <span>{jobCard.bearingReplaced || 'N/A'}</span></div>
                <div><strong>Oil Seal / O-Ring :</strong> <span>{jobCard.oilSealReplaced || 'N/A'}</span></div>
                <div><strong>Cooling Fan :</strong> <span>{jobCard.fanReplaced || 'N/A'}</span></div>
                <div><strong>Other Spares :</strong> <span>{jobCard.otherSpares || 'N/A'}</span></div>
              </div>
            </div>

            {/* Box 6: Electrical Test Report */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '6px' }}>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '4px' }}>
                Final Electrical Testing Report:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px 12px' }}>
                <div><strong>No Load Current :</strong> <span>{jobCard.noLoadAmps || '-'} A</span></div>
                <div><strong>Insulation Resistance :</strong> <span>{jobCard.irValue || '-'} MΩ</span></div>
                <div><strong>Winding Resistance :</strong> <span>{jobCard.windingResistance || '-'} Ω</span></div>
              </div>
            </div>

            {/* Personnel Signatures Grid */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
                <div><strong>Dismantled by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px', fontWeight: 'bold' }}>{jobCard.dismantledBy || ''}</span></div>
                <div><strong>Coil Dismantled by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px', fontWeight: 'bold' }}>{jobCard.coilDismantledBy || ''}</span></div>

                <div><strong>Winding by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px', fontWeight: 'bold' }}>{jobCard.windingBy || ''}</span></div>
                <div><strong>Assembled by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px', fontWeight: 'bold' }}>{jobCard.assembledBy || ''}</span></div>

                <div><strong>Tested by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '140px', fontWeight: 'bold' }}>{jobCard.testedBy || ''}</span></div>
                <div></div>
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
              <span>Print Job Card / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
