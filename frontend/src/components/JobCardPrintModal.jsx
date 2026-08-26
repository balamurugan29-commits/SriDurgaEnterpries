import React from 'react';
import { X, Printer, CheckCircle, FileText } from 'lucide-react';

const formatPrintList = (val) => {
  if (!val) return '';
  return val.split(',').map(item => item.trim()).filter(Boolean).join(' / ');
};

export const JobCardPrintModal = ({ isOpen, onClose, jobCard }) => {
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
    <div className="no-print-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      
      <div className="glass-panel-print-wrap" style={{ width: '100%', maxWidth: '860px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Toolbar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(31, 41, 55, 0.95)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#34d399' }}>
            <FileText size={20} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Job Card Preview & Print ({jobCard.jobNo})
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
              <Printer size={16} />
              <span>Print Job Card / Save PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Job Card Template (Exact 1:1 Layout from Official PDF) */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', background: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
          
          <div id="job-card-print-area" style={{ border: '2px solid #000', padding: '10px 16px', background: '#fff', fontSize: '12px', lineHeight: '1.4', color: '#000' }}>
            
            {/* Top Header with Logo, Title & JOB CARD Inverted Box */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Logo Icon */}
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round">
                    <path d="M 50 15 C 30 15, 25 35, 45 45 C 70 55, 65 85, 40 85 C 20 85, 20 65, 35 65" />
                    <circle cx="50" cy="12" r="6" fill="#000" />
                  </svg>
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#000', margin: 0, letterSpacing: '0.5px', fontFamily: 'Georgia, serif' }}>
                  Sri Durga Enterprises
                </h1>
              </div>

              {/* Inverted Black Box: JOB CARD */}
              <div style={{ background: '#000', color: '#fff', padding: '6px 14px', fontWeight: '900', fontSize: '15px', letterSpacing: '1px', borderRadius: '2px' }}>
                JOB CARD
              </div>
            </div>

            {/* General Job Info Box */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '4px 12px' }}>
                <div><strong>Job No :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '110px', fontWeight: 'bold' }}>{jobCard.jobNo || ''}</span></div>
                <div><strong>G.Pass :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.gPass || ''}</span></div>
                <div><strong>Date :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{formattedDate}</span></div>

                <div><strong>Customer :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '110px', fontWeight: 'bold' }}>{jobCard.customerName || ''}</span></div>
                <div><strong>Site :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.site || ''}</span></div>
                <div><strong>Make :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.make || ''}</span></div>

                <div style={{ gridColumn: 'span 2' }}><strong>Equipment :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '220px', fontWeight: 'bold' }}>{jobCard.equipment || ''}</span></div>
                <div><strong>Sl.No. :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.slNo || ''}</span></div>

                <div><strong>Delivered on :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '110px', fontWeight: 'bold' }}>{jobCard.deliveredOn || ''}</span></div>
                <div style={{ gridColumn: 'span 2' }}><strong>Others :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '220px', fontWeight: 'bold' }}>{jobCard.others || ''}</span></div>
              </div>
            </div>

            {/* Equipment Details Section */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '8px' }}>
              <div style={{ textDecoration: 'underline', fontWeight: '900', fontSize: '13px', marginBottom: '6px' }}>
                Equipment Details
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>
                  <strong>1. Rating :</strong> &nbsp;
                  <strong>HP :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '50px', textAlign: 'center', fontWeight: 'bold' }}>{jobCard.ratingHp || ''}</span> &nbsp;|&nbsp;
                  <strong>KW :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '50px', textAlign: 'center', fontWeight: 'bold' }}>{jobCard.ratingKw || ''}</span> &nbsp;|&nbsp;
                  <strong>KVA :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '50px', textAlign: 'center', fontWeight: 'bold' }}>{jobCard.ratingKva || ''}</span>
                </div>

                <div><strong>2. Volt :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '150px', fontWeight: 'bold' }}>{jobCard.volt || ''}</span></div>

                <div><strong>3. Current :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '150px', fontWeight: 'bold' }}>{jobCard.current || ''}</span></div>

                <div>
                  <strong>4. Frame Size :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{jobCard.frameSize || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>Type :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{jobCard.type || ''}</span>
                </div>

                <div>
                  <strong>5. Bearing :</strong> &nbsp;
                  <strong>DE :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.bearingDe || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>NDE :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.bearingNde || ''}</span>
                </div>

                <div>
                  <strong>6. Cooling Fan :</strong> &nbsp;
                  <strong>ID :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.coolingFanId || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                  <strong>OD :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '100px', fontWeight: 'bold' }}>{jobCard.coolingFanOd || ''}</span>
                </div>

                <div>
                  <strong>7. Fan Cover :</strong> &nbsp;
                  <strong>Circumference :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '70px', fontWeight: 'bold' }}>{jobCard.fanCoverCircumference || ''}</span> &nbsp;
                  <strong>Height :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '70px', fontWeight: 'bold' }}>{jobCard.fanCoverHeight || ''}</span> &nbsp;
                  <strong>Dia :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '70px', fontWeight: 'bold' }}>{jobCard.fanCoverDia || ''}</span>
                </div>

                <div><strong>8. Speed :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '150px', fontWeight: 'bold' }}>{jobCard.speed || ''}</span></div>

                <div>
                  <strong>9. Terminal Box :</strong> (if viewed from Drive end side) &nbsp;
                  <strong><span style={{ textDecoration: jobCard.terminalBox === 'LEFT' ? 'underline' : 'none', fontWeight: '900' }}>LEFT</span> / <span style={{ textDecoration: jobCard.terminalBox === 'RIGHT' ? 'underline' : 'none', fontWeight: '900' }}>RIGHT</span></strong>
                  <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#16a34a' }}>[{jobCard.terminalBox || 'N/A'}]</span>
                </div>

                <div><strong>10. Connection :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '150px', fontWeight: 'bold' }}>{jobCard.connection || ''}</span></div>

                {/* 11. Winding Detail */}
                <div style={{ marginTop: '2px' }}>
                  <strong>11. Winding Detail :</strong>
                  
                  {jobCard.volt === '220' ? (
                    <div style={{ display: 'flex', gap: '15px', marginTop: '4px', paddingLeft: '1rem' }}>
                      {/* Running Coil Winding Details Column */}
                      <div style={{ flex: 1, borderRight: '1px dashed #000', paddingRight: '15px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', textDecoration: 'underline', marginBottom: '3px' }}>A. Running Coil Winding Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div><strong>Pitch :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{formatPrintList(jobCard.pitch)}</span></div>
                          <div><strong>Turns :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{formatPrintList(jobCard.turns)}</span></div>
                          <div><strong>Bobbin :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{formatPrintList(jobCard.bobbin)}</span></div>
                          <div><strong>Core Length :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.coreLength || ''}</span></div>
                          <div><strong>SWG :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.swg || ''}</span></div>
                          <div><strong>Coil Wt (1 Set) :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.coilWeight1Set || ''}</span></div>
                          <div><strong>Total Weight :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.coilWeightTotal || ''}</span></div>
                          <div><strong>Set of Coil :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.setOfCoil || ''}</span></div>
                          <div><strong>No. of Slots :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.noOfSlots || ''}</span></div>
                          <div><strong>Total No. Coil :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.totalNoCoil || ''}</span></div>
                        </div>
                      </div>

                      {/* Starting Coil Winding Details Column */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', textDecoration: 'underline', marginBottom: '3px' }}>B. Starting Coil Winding Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div><strong>Pitch :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{formatPrintList(jobCard.scPitch)}</span></div>
                          <div><strong>Turns :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{formatPrintList(jobCard.scTurns)}</span></div>
                          <div><strong>Bobbin :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{formatPrintList(jobCard.scBobbin)}</span></div>
                          <div><strong>Core Length :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scCoreLength || ''}</span></div>
                          <div><strong>SWG :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scSwg || ''}</span></div>
                          <div><strong>Coil Wt (1 Set) :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scCoilWeight1Set || ''}</span></div>
                          <div><strong>Total Weight :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scCoilWeightTotal || ''}</span></div>
                          <div><strong>Set of Coil :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scSetOfCoil || ''}</span></div>
                          <div><strong>No. of Slots :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scNoOfSlots || ''}</span></div>
                          <div><strong>Total No. Coil :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '80px', fontWeight: 'bold' }}>{jobCard.scTotalNoCoil || ''}</span></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      <div><strong>Pitch :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{formatPrintList(jobCard.pitch)}</span></div>
                      <div><strong>Turns :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{formatPrintList(jobCard.turns)}</span></div>
                      <div><strong>Bobbin :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{formatPrintList(jobCard.bobbin)}</span></div>
                      <div><strong>Core Length :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{jobCard.coreLength || ''}</span></div>
                      <div><strong>SWG :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '120px', fontWeight: 'bold' }}>{jobCard.swg || ''}</span></div>
                      <div>
                        <strong>Coil Weight :</strong> &nbsp;
                        <strong>1 Set :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '90px', fontWeight: 'bold' }}>{jobCard.coilWeight1Set || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                        <strong>Total Weight :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '90px', fontWeight: 'bold' }}>{jobCard.coilWeightTotal || ''}</span>
                      </div>
                      <div>
                        <strong>Set of Coil :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '70px', fontWeight: 'bold' }}>{jobCard.setOfCoil || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                        <strong>No. of Slots :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '70px', fontWeight: 'bold' }}>{jobCard.noOfSlots || ''}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                        <strong>Total No. Coil :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '70px', fontWeight: 'bold' }}>{jobCard.totalNoCoil || ''}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 12. Job Carried */}
                <div style={{ marginTop: '2px' }}>
                  <strong>12. Job Carried :</strong>
                  {jobCard.volt === '220' ? (
                    <div style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      <div><strong>Running Coil :</strong> <span style={{ fontWeight: 'bold' }}>{jobCard.jobCarried || 'Nil'}</span></div>
                      <div><strong>Starting Coil :</strong> <span style={{ fontWeight: 'bold' }}>{jobCard.scJobCarried || 'Nil'}</span></div>
                    </div>
                  ) : (
                    <div style={{ borderBottom: '1px dotted #000', minHeight: '22px', fontWeight: 'bold', paddingLeft: '4px', whiteSpace: 'pre-line' }}>
                      {jobCard.jobCarried || ''}
                    </div>
                  )}
                </div>

                {/* 13. Test Details */}
                <div style={{ marginTop: '2px' }}>
                  <strong>13. Test Details :</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 14px', paddingLeft: '1.5rem', marginTop: '2px' }}>
                    <div><strong>(i) W-W Resistance :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '90px', fontWeight: 'bold' }}>{jobCard.testWwResistance || ''}</span></div>
                    <div><strong>(iii) No Load Current :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '90px', fontWeight: 'bold' }}>{jobCard.testNoLoadCurrent || ''}</span></div>
                    <div><strong>(ii) W-B Resistance :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '90px', fontWeight: 'bold' }}>{jobCard.testWbResistance || ''}</span></div>
                    <div><strong>(iv) RPM :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '90px', fontWeight: 'bold' }}>{jobCard.testRpm || ''}</span></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Remarks Section */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', marginBottom: '8px' }}>
              <div style={{ textDecoration: 'underline', fontWeight: '900', fontSize: '13px', marginBottom: '4px' }}>
                Remarks
              </div>
              <div style={{ minHeight: '24px', fontWeight: 'bold', whiteSpace: 'pre-line' }}>
                {jobCard.remarks || 'Nil'}
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

      </div>
    </div>
  );
};
