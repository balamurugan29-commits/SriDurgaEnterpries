import React, { useEffect, useState } from 'react';
import { X, Printer, FileText, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { companyLogoBase64 } from '../assets/companyLogo';

// Configure PDF.js worker if in browser
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.warn('PDF.js worker setup note:', e);
  }
}

/**
 * Extracts high-resolution page images from a base64/data URI PDF
 */
async function extractPdfPages(pdfDataUri) {
  if (!pdfDataUri) return [];

  // If already an image data URI, return as single page
  if (pdfDataUri.startsWith('data:image/')) {
    return [pdfDataUri];
  }

  try {
    let base64 = pdfDataUri;
    if (base64.includes(',')) {
      base64 = base64.split(',')[1];
    }
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pagePromises = [];

    for (let i = 1; i <= numPages; i++) {
      pagePromises.push(
        (async (pageNumber) => {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for crisp print quality
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          return canvas.toDataURL('image/png');
        })(i)
      );
    }

    return await Promise.all(pagePromises);
  } catch (err) {
    console.error('Error extracting PDF attachment pages:', err);
    return [];
  }
}

export const JobCardPrintModal = ({ isOpen, onClose, jobCard }) => {
  const [attachmentPages, setAttachmentPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);

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

  // Load and convert PDF attachment pages whenever jobCard changes
  useEffect(() => {
    let isMounted = true;
    const loadAttachment = async () => {
      // Find the extra attachment PDF or diagram if PDF
      const rawAttachment = jobCard?.extraAttachment || (
        jobCard?.diagramPhoto && (jobCard?.attachmentType === 'pdf' || jobCard?.diagramPhoto.startsWith('data:application/pdf'))
          ? jobCard.diagramPhoto
          : null
      );

      if (rawAttachment) {
        setLoadingPages(true);
        try {
          const pages = await extractPdfPages(rawAttachment);
          if (isMounted) setAttachmentPages(pages);
        } catch (err) {
          console.error('Failed to parse PDF attachment for printing:', err);
        } finally {
          if (isMounted) setLoadingPages(false);
        }
      } else {
        setAttachmentPages([]);
      }
    };

    if (isOpen && jobCard) {
      loadAttachment();
    }

    return () => { isMounted = false; };
  }, [isOpen, jobCard]);

  if (!isOpen || !jobCard) return null;

  const handlePrint = () => {
    const printArea = document.getElementById('job-card-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=1050');
    if (printWindow) {
      const htmlContent = printArea.innerHTML;
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
                margin: 0;
                padding: 0;
                font-size: 12px;
                line-height: 1.35;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                size: A4 portrait;
                margin: 6mm 8mm;
              }
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                .no-print {
                  display: none !important;
                }
                .page-break {
                  page-break-before: always !important;
                  break-before: page !important;
                }
              }
              .job-card-page-1 {
                width: 100%;
                min-height: 280mm;
                padding: 12px 14px;
                background: #ffffff;
                color: #000000;
                font-size: 12px;
                line-height: 1.35;
                border: 2px solid #000;
                box-sizing: border-box;
              }
              .job-card-attachment-page {
                page-break-before: always !important;
                break-before: page !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                width: 100%;
                min-height: 285mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justifyContent: center;
                box-sizing: border-box;
                padding: 4mm 0;
                background: #ffffff;
              }
              .job-card-attachment-img {
                max-width: 100%;
                max-height: 280mm;
                width: auto;
                height: auto;
                object-fit: contain;
                display: block;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 400);
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

  const totalPagesCount = 1 + attachmentPages.length;

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
                Job Card Preview & Multi-Page Print
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Job No: <strong style={{ color: '#38bdf8' }}>{jobCard.jobNo}</strong> &bull; Pages: <strong style={{ color: '#34d399' }}>{totalPagesCount} {totalPagesCount === 1 ? 'Page' : 'Pages (Job Card + Attached PDF)'}</strong>
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
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}
        >
          {loadingPages && (
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Rendering attached PDF pages for high-definition consecutive printing...</span>
            </div>
          )}

          <div 
            id="job-card-print-area" 
            style={{ 
              width: '100%',
              maxWidth: '820px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              alignItems: 'center'
            }}
          >
            {/* PAGE 1: Official Job Card Document */}
            <div 
              className="job-card-page-1"
              style={{ 
                border: '2px solid #000', 
                padding: '14px 18px', 
                background: '#fff', 
                fontSize: '12px', 
                lineHeight: '1.38', 
                color: '#000',
                width: '100%',
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

                {/* Right Side: Diagram / Equipment Photo Frame (Only for Diagram Photo) */}
                <div style={{ width: '220px', marginLeft: '12px', flexShrink: 0, textAlign: 'center', border: '1px solid #000', padding: '4px', background: '#fafafa', minHeight: '180px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10.5px', textDecoration: 'underline', marginBottom: '4px' }}>
                    Diagram / Equipment Photo
                  </div>
                  {jobCard.diagramPhoto && !jobCard.diagramPhoto.startsWith('data:application/pdf') && jobCard.attachmentType !== 'pdf' ? (
                    <img 
                      src={jobCard.diagramPhoto} 
                      alt="Equipment / Winding Diagram" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block', margin: 'auto' }} 
                    />
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '10px', fontStyle: 'italic', minHeight: '140px' }}>
                      (Diagram / Photo space)
                    </div>
                  )}
                </div>
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

          {/* SUBSEQUENT ATTACHMENT PAGES (Consecutive Full A4 Pages for Attached PDF) */}
          {attachmentPages.map((pageImg, idx) => (
            <div 
              key={idx} 
              className="job-card-attachment-page page-break"
              style={{
                pageBreakBefore: 'always',
                breakBefore: 'page',
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '2px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '820px',
                width: '100%',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                boxSizing: 'border-box'
              }}
            >
              {/* Non-printing preview page divider & header */}
              <div 
                className="no-print" 
                style={{ 
                  width: '100%', 
                  padding: '6px 12px', 
                  background: '#f1f5f9', 
                  borderBottom: '1px solid #e2e8f0', 
                  marginBottom: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  fontSize: '11px', 
                  color: '#475569', 
                  fontWeight: 700 
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#f43f5e" />
                  <span>Attached Document Page {idx + 1} of {attachmentPages.length} &bull; {jobCard.extraAttachmentName || 'Document.pdf'}</span>
                </span>
                <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#0f172a' }}>
                  Print Page {idx + 2}
                </span>
              </div>

              {/* Full high-resolution page image */}
              <img 
                src={pageImg} 
                alt={`Attachment Page ${idx + 1}`} 
                className="job-card-attachment-img"
                style={{
                  maxWidth: '100%',
                  maxHeight: '1000px',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
          ))}

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

