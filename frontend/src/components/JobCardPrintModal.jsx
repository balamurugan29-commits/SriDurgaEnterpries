import React, { useEffect } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { companyLogoBase64 } from '../assets/companyLogo';

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
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              body {
                font-family: Arial, sans-serif;
                background: #ffffff;
                color: #000000;
                padding: 4mm 6mm;
                font-size: 12px;
                line-height: 1.35;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #job-card-print-area {
                width: 100%;
                background: #ffffff;
                color: #000000;
                font-size: 12px;
                line-height: 1.35;
              }
              .dotted-line {
                border-bottom: 1px dotted #000000;
                display: inline-block;
                padding: 0 4px;
                font-weight: bold;
                color: #000000;
              }
              @page {
                size: A4 portrait;
                margin: 6mm 8mm;
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
              padding: '14px 18px', 
              background: '#fff', 
              fontSize: '12px', 
              lineHeight: '1.38', 
              color: '#000',
              width: '100%',
              maxWidth: '820px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
              borderRadius: '2px',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {/* Top Header: Logo + "Sri Durga Enterprises" + JOB CARD Inverted Box */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={companyLogoBase64} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#000', margin: 0, letterSpacing: '0.5px', fontFamily: 'Georgia, serif' }}>
                  Sri Durga Enterprises
                </h1>
              </div>

              <div style={{ background: '#000', color: '#fff', padding: '4px 12px', fontWeight: '900', fontSize: '14px', letterSpacing: '1.5px', borderRadius: '1px', textTransform: 'uppercase' }}>
                JOB CARD
              </div>
            </div>

            {/* Box 1: Top Details Box */}
            <div style={{ border: '1.5px solid #000', padding: '6px 10px', fontSize: '12px' }}>
              {/* Row 1: Job No | G.Pass | Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ width: '33%' }}>
                  <span style={{ fontWeight: 'bold' }}>Job No &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '100px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.jobNo || ''}
                  </span>
                </div>
                <div style={{ width: '34%' }}>
                  <span style={{ fontWeight: 'bold' }}>G.Pass &nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '100px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.gPass || ''}
                  </span>
                </div>
                <div style={{ width: '33%', textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold' }}>Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '100px', display: 'inline-block', fontWeight: 'bold', textAlign: 'left' }}>
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Row 2: Customer | Site | Make */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ width: '33%' }}>
                  <span style={{ fontWeight: 'bold' }}>Customer &nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '100px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.customerName || ''}
                  </span>
                </div>
                <div style={{ width: '34%' }}>
                  <span style={{ fontWeight: 'bold' }}>Site &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '100px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.site || ''}
                  </span>
                </div>
                <div style={{ width: '33%', textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold' }}>Make &nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '100px', display: 'inline-block', fontWeight: 'bold', textAlign: 'left' }}>
                    {jobCard.make || ''}
                  </span>
                </div>
              </div>

              {/* Row 3: Equipment | Sl.No */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ width: '40%' }}>
                  <span style={{ fontWeight: 'bold' }}>Equipment &nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '140px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.equipment || ''}
                  </span>
                </div>
                <div style={{ width: '60%' }}>
                  <span style={{ fontWeight: 'bold' }}>Sl.No. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '320px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.slNo || ''}
                  </span>
                </div>
              </div>

              {/* Row 4: Delivered on | Others */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '40%' }}>
                  <span style={{ fontWeight: 'bold' }}>Delivered on : </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '140px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.deliveredOn || ''}
                  </span>
                </div>
                <div style={{ width: '60%' }}>
                  <span style={{ fontWeight: 'bold' }}>Others &nbsp;&nbsp;&nbsp;&nbsp;: </span>
                  <span style={{ borderBottom: '1px dotted #000', minWidth: '320px', display: 'inline-block', fontWeight: 'bold' }}>
                    {jobCard.others || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Equipment Details (Double Border Top, Solid Border Sides & Bottom) */}
            <div style={{ 
              borderLeft: '1.5px solid #000', 
              borderRight: '1.5px solid #000', 
              borderBottom: '1.5px solid #000', 
              borderTop: '3px double #000', 
              padding: '6px 10px', 
              fontSize: '12px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* Title */}
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '12.5px' }}>
                    Equipment Details
                  </div>

                  {/* 1. Rating */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>1. Rating</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>HP :</strong> {jobCard.ratingHp || ''} &nbsp;&nbsp;&nbsp;&nbsp; | <strong>KW :</strong> {jobCard.ratingKw || ''} &nbsp;&nbsp;&nbsp;&nbsp; | <strong>KVA :</strong> {jobCard.ratingKva || ''}</div>
                  </div>

                  {/* 2. Volt */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>2. Volt</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.volt || ''}</strong></div>
                  </div>

                  {/* 3. Current */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>3. Current</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.current || ''}</strong></div>
                  </div>

                  {/* 4. Frame Size & Type */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>4. Frame Size</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.frameSize || ''}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Type :</strong> {jobCard.type || ''}</div>
                  </div>

                  {/* 5. Bearing DE & NDE */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>5. Bearing</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>DE :</strong> {jobCard.bearingDe || ''} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>NDE :</strong> {jobCard.bearingNde || ''}</div>
                  </div>

                  {/* 6. Cooling Fan */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>6. Cooling Fan</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>ID :</strong> {jobCard.coolingFanId || ''} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>OD :</strong> {jobCard.coolingFanOd || ''}</div>
                  </div>

                  {/* 7. Fan Cover */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>7. Fan Cover</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>Circumference :</strong> {jobCard.fanCoverCircumference || ''} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Height :</strong> {jobCard.fanCoverHeight || ''} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Dia :</strong> {jobCard.fanCoverDia || ''}</div>
                  </div>

                  {/* 8. Speed */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>8. Speed</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.speed || ''}</strong></div>
                  </div>

                  {/* 9. Terminal Box */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>9. Terminal Box</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; (if viewed from Drive end side) &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.terminalBox === 'LEFT' ? 'LEFT' : 'RIGHT'}</strong></div>
                  </div>

                  {/* 10. Connection */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>10. Connection</div>
                    <div>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.connection || ''}</strong></div>
                  </div>

                  {/* 11. Winding Detail */}
                  <div style={{ marginBottom: '3.5px' }}>
                    <div style={{ fontWeight: 'bold' }}>11. Winding Detail:</div>
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>Pitch</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.pitch || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>Turns</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.turns || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>Bobbin</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.bobbin || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>Core Length</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.coreLength || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>SWG</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.swg || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>Coil Weight</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; 1 Set: <strong>{jobCard.coilWeight1Set || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ width: '110px' }}>Total Weight</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.coilWeightTotal || ''}</strong></span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        <span style={{ width: '110px' }}>Set of Coil</span>
                        <span>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.setOfCoil || ''}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>No. of Slots :</strong> {jobCard.noOfSlots || ''} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Total No. Coil:</strong> {jobCard.totalNoCoil || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* 12. Job Carried */}
                  <div style={{ display: 'flex', marginBottom: '3.5px' }}>
                    <div style={{ width: '130px', fontWeight: 'bold' }}>12. Job Carried</div>
                    <div style={{ flex: 1 }}>: &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.jobCarried || ''}</strong></div>
                  </div>

                  {/* 13. Test Details */}
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>13. Test Details</div>
                    <div style={{ paddingLeft: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: '2px' }}>
                      <div>(i) W-W Resistance : <strong>{jobCard.testWwResistance || ''}</strong></div>
                      <div>(iii) No Load Current : <strong>{jobCard.testNoLoadCurrent || ''}</strong></div>
                      <div>(ii) W-B Resistance : <strong>{jobCard.testWbResistance || ''}</strong></div>
                      <div>(iv) RPM : <strong>{jobCard.testRpm || ''}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Photo / Diagram / PDF Attachment Display if Uploaded */}
                {(jobCard.diagramPhoto || jobCard.extraAttachment) && (
                  <div style={{ width: '220px', marginLeft: '12px', flexShrink: 0, textAlign: 'center', border: '1px solid #000', padding: '4px', background: '#fafafa', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {jobCard.diagramPhoto ? (
                      <>
                        <div style={{ fontWeight: 'bold', fontSize: '10.5px', textDecoration: 'underline', marginBottom: '4px' }}>
                          Diagram / Equipment Photo
                        </div>
                        <img 
                          src={jobCard.diagramPhoto} 
                          alt="Equipment / Winding Diagram" 
                          style={{ width: '100%', maxHeight: jobCard.extraAttachment ? '150px' : '220px', objectFit: 'contain', display: 'block', margin: '0 auto' }} 
                        />
                      </>
                    ) : (
                      <div style={{ padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#fee2e2', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#b91c1c', fontSize: '11px' }}>
                          PDF
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#000', wordBreak: 'break-word', maxWidth: '200px' }}>
                          {jobCard.extraAttachmentName || jobCard.attachmentName || 'Technical_Document.pdf'}
                        </span>
                        <span style={{ fontSize: '9px', color: '#475569' }}>
                          (PDF Attached)
                        </span>
                      </div>
                    )}

                    {/* If both diagram photo and extra PDF are attached, show the extra document note below photo */}
                    {jobCard.diagramPhoto && jobCard.extraAttachment && (
                      <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #999', fontSize: '9px', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#b91c1c' }}>[PDF Attached]:</span>
                        <span style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {jobCard.extraAttachmentName || 'Document.pdf'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Box 3: Remarks & Personnel Signatures */}
            <div style={{ 
              borderLeft: '1.5px solid #000', 
              borderRight: '1.5px solid #000', 
              borderBottom: '1.5px solid #000', 
              padding: '6px 10px', 
              fontSize: '12px' 
            }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Remarks</span>
                <span> &nbsp;&nbsp;&nbsp;&nbsp; <strong>{jobCard.remarks || ''}</strong></span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
                <div><strong>Dismantled by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '130px', fontWeight: 'bold' }}>{jobCard.dismantledBy || ''}</span></div>
                <div><strong>Coil Dismantled by :</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '130px', fontWeight: 'bold' }}>{jobCard.coilDismantledBy || ''}</span></div>

                <div><strong>Winding by &nbsp;&nbsp;&nbsp;:</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '130px', fontWeight: 'bold' }}>{jobCard.windingBy || ''}</span></div>
                <div><strong>Assembled by &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '130px', fontWeight: 'bold' }}>{jobCard.assembledBy || ''}</span></div>

                <div><strong>Tested by &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</strong> <span style={{ borderBottom: '1px dotted #000', display: 'inline-block', minWidth: '130px', fontWeight: 'bold' }}>{jobCard.testedBy || ''}</span></div>
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
            A4 Portrait Layout &bull; Follows Exact Template Format
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

