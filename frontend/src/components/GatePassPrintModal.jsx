import React, { useState, useEffect } from 'react';
import { X, Printer, ArrowLeftRight } from 'lucide-react';
import { companyLogoBase64 } from '../assets/companyLogo';
import { fetchCompanyDetails, DEFAULT_COMPANY_DETAILS } from '../services/api';

export const GatePassPrintModal = ({ isOpen, onClose, gatePass }) => {
  const [companyDetails, setCompanyDetails] = useState(() => {
    const cached = localStorage.getItem('sri_durga_company_details');
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    return DEFAULT_COMPANY_DETAILS;
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanyDetails().then(data => {
        if (data) setCompanyDetails(data);
      }).catch(err => console.warn('Could not load company details for gate pass print', err));
    }
  }, [isOpen]);

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

    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (printWindow) {
      const gatePassHtml = printArea.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gate Pass - ${gatePass.gatePassNo || 'Delivery Challan'}</title>
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
                font-family: Arial, Helvetica, sans-serif;
                background: #ffffff;
                color: #000000;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #gatepass-print-area {
                border: 2px solid #000000 !important;
                width: 100% !important;
                height: 280mm !important;
                min-height: 280mm !important;
                background: #ffffff !important;
                color: #000000 !important;
                font-size: 13px !important;
                line-height: 1.4 !important;
                padding: 16px 20px !important;
                display: flex !important;
                flex-direction: column !important;
                justifyContent: space-between !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 8mm 10mm;
              }
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                }
                #gatepass-print-area {
                  border: 2px solid #000000 !important;
                  height: 280mm !important;
                  min-height: 280mm !important;
                  box-shadow: none !important;
                }
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

  // Fill in empty rows to fill full A4 page perfectly (23 rows for full box ending ~2 inches above signatures)
  const items = gatePass.items || [];
  const minRows = 23;
  const displayItems = [...items];
  while (displayItems.length < minRows) {
    displayItems.push({
      serialNumber: displayItems.length + 1,
      description: '',
      quantity: '',
      remarks: ''
    });
  }

  const customerName = (gatePass.receiverName || gatePass.customerName || '').trim();
  const siteName = (gatePass.siteName || '').trim();
  const vehicleNo = (gatePass.vehicleNo || '').trim();
  const purpose = (gatePass.purposeForTransport || gatePass.reasonForTransfer || '').trim();

  const hasRecipientData = Boolean(customerName || siteName);
  const hasTransportDetails = Boolean(vehicleNo || purpose);

  // Dynamic Company Details (GSTIN, Name, Address, Contact)
  const companyGstin = companyDetails.gstin || '34AGKPB3918J1ZV';
  const companyName = companyDetails.companyName || 'SRI DURGA ENTERPRISES';
  const companyAddress = companyDetails.address || '# 10, V.G. NAGAR, KOVILPATHU, KARAIKAL - 609 605.';
  const companyPhone = companyDetails.phone ? `Ph: ${companyDetails.phone}` : 'Ph: 04368 - 225786 • Cell: 94432 87986, 93454 87986';

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
          height: '96vh', 
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
        {/* TOP HEADER: Clean Title Bar + Dedicated Close Button */}
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
                {gatePass.passType === 'IN' ? 'In' : 'Out'} Gate Pass (A4 Format)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Doc No: <strong style={{ color: '#fbbf24' }}>{gatePass.gatePassNo}</strong> &bull; Date: <strong style={{ color: '#34d399' }}>{formattedDate}</strong>
              </span>
            </div>
          </div>

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

        {/* MIDDLE BODY: Scrollable Printable A4 Area */}
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
              width: '210mm',
              maxWidth: '820px', 
              minHeight: '282mm',
              height: '282mm',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)', 
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Content Block (Header + Recipient + Acknowledgment + Table) */}
            <div>
              {/* Top Row: Dynamic Company GSTIN, DELIVERY CHALLAN, No. & Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 'bold' }}>
                  GSTIN : {companyGstin}
                </div>

                <div style={{ textAlign: 'center', border: '1.5px solid #000', padding: '3px 14px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.5px' }}>
                  DELIVERY CHALLAN
                </div>

                <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>
                  <div>No. <span style={{ textDecoration: 'underline' }}>{gatePass.gatePassNo}</span></div>
                  <div style={{ marginTop: '2px' }}>Date: <span style={{ textDecoration: 'underline' }}>{formattedDate}</span></div>
                </div>
              </div>

              {/* Header: Company Details with Logo (from configured Company Details) */}
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1.5px solid #000', paddingBottom: '8px', marginBottom: '10px', position: 'relative' }}>
                {/* Left Logo */}
                <div style={{ width: '70px', minWidth: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: '0px', top: '50%', transform: 'translateY(-50%)' }}>
                  <img 
                    src={companyLogoBase64} 
                    alt="Sri Durga Logo" 
                    style={{ width: '65px', height: '65px', objectFit: 'contain' }} 
                  />
                </div>

                {/* Center: Company Name & Address */}
                <div style={{ flex: 1, textAlign: 'center', paddingLeft: '75px', paddingRight: '75px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#000', margin: '0 0 2px 0', letterSpacing: '0.5px', fontFamily: 'Georgia, serif' }}>
                    {companyName}
                  </h1>
                  <div style={{ fontSize: '12px', fontWeight: '600' }}>
                    {companyAddress}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                    {companyPhone}
                  </div>
                </div>
              </div>

              {/* To Customer & Site Details Section: Both aligned on the same line with a gap */}
              <div style={{ borderBottom: '1.5px solid #000', padding: '8px 8px 8px 8px', marginBottom: '12px', fontSize: '13px', display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13.5px', whiteSpace: 'nowrap' }}>
                  {gatePass.passType === 'IN' ? 'From:' : 'To:'}
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '24px', paddingLeft: '6px' }}>
                  {customerName && (
                    <span style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#000' }}>
                      {customerName}
                    </span>
                  )}
                  {siteName && (
                    <span style={{ fontWeight: 'bold', fontSize: '13.5px', color: '#000' }}>
                      {siteName}
                    </span>
                  )}
                  {!hasRecipientData && (
                    <span style={{ color: '#666', fontStyle: 'italic' }}>-</span>
                  )}
                </div>
              </div>

              {/* Acknowledgment Text Before Table Start */}
              <div style={{ marginBottom: '10px', fontSize: '12px', color: '#000', letterSpacing: '0.2px' }}>
                <div style={{ fontWeight: 'bold' }}>DEAR SIR;</div>
                <div style={{ paddingLeft: '70px', marginTop: '2px', fontWeight: 'bold' }}>
                  KINDLY ARRANGE TO RECEIVER THE FOLLOWING AND ACKNOWELEDGE
                </div>
              </div>

              {/* Items Table - Complete Solid Dark Box Extending Down to ~2 Inches Above Signatures */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', marginBottom: '35px', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000', background: '#f8fafc' }}>
                    <th style={{ borderRight: '1.5px solid #000', padding: '5px 4px', width: '45px', textAlign: 'center', fontWeight: 'bold' }}>Sl.No</th>
                    <th style={{ borderRight: '1.5px solid #000', padding: '5px 8px', textAlign: 'center', fontWeight: 'bold' }}>DESCRIPTION</th>
                    <th style={{ borderRight: '1.5px solid #000', padding: '5px 8px', width: '75px', textAlign: 'center', fontWeight: 'bold' }}>Qty.</th>
                    <th style={{ padding: '5px 8px', width: '120px', textAlign: 'center', fontWeight: 'bold' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1;
                    return (
                      <tr key={index} style={{ borderBottom: isLast ? 'none' : '1px solid #ddd', height: '22px' }}>
                        <td style={{ borderRight: '1.5px solid #000', padding: '2px 4px', textAlign: 'center', verticalAlign: 'top' }}>
                          {item.description ? item.serialNumber || index + 1 : ''}
                        </td>
                        <td style={{ borderRight: '1.5px solid #000', padding: '2px 8px', verticalAlign: 'top' }}>
                          {item.description}
                        </td>
                        <td style={{ borderRight: '1.5px solid #000', padding: '2px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                          {item.quantity}
                        </td>
                        <td style={{ padding: '2px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                          {item.remarks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Content Block (Transport Info + ~2 Inches Gap + Signatures pinned to bottom) */}
            <div style={{ marginTop: 'auto' }}>
              {/* Transport & Vehicle Details (Only Displays What is Entered) */}
              {hasTransportDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px', fontSize: '12px', padding: '2px 8px' }}>
                  {vehicleNo && (
                    <div>
                      <strong>Vehicle No:</strong> {vehicleNo}
                    </div>
                  )}
                  {purpose && (
                    <div>
                      <strong>Purpose for Transport:</strong> {purpose}
                    </div>
                  )}
                </div>
              )}

              {/* Signatures with ~2 inches of clean space above "For SRI DURGA ENTERPRISES" */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: hasTransportDetails ? '10px' : '20px', fontSize: '12.5px', fontWeight: 'bold' }}>
                <div>Receiver's Signature</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '35px', fontWeight: 'normal', fontSize: '11.5px' }}>For {companyName}</div>
                  <div>Authorized Signatory</div>
                </div>
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
            A4 Portrait Layout (210mm &times; 297mm) &bull; Ready for High-Quality Print
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
