import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, FileText, Download } from 'lucide-react';
import { companyLogoBase64 } from '../assets/companyLogo';

// Utility to convert amount in numbers to Indian Rupee Words
function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    let str = '';
    const numStr = ('000000000' + n).slice(-9);
    const crore = parseInt(numStr.substring(0, 2), 10);
    const lakh = parseInt(numStr.substring(2, 4), 10);
    const thousand = parseInt(numStr.substring(4, 6), 10);
    const hundred = parseInt(numStr.substring(6, 7), 10);
    const rest = parseInt(numStr.substring(7, 9), 10);

    if (crore > 0) str += (a[crore] || (b[Math.floor(crore / 10)] + ' ' + a[crore % 10])) + 'Crore ';
    if (lakh > 0) str += (a[lakh] || (b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10])) + 'Lakh ';
    if (thousand > 0) str += (a[thousand] || (b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10])) + 'Thousand ';
    if (hundred > 0) str += a[hundred] + 'Hundred ';
    if (rest > 0) {
      if (str !== '') str += 'and ';
      str += a[rest] || (b[Math.floor(rest / 10)] + ' ' + a[rest % 10]);
    }
    return str;
  };

  const words = inWords(num).trim();
  return words ? `(Rupees :${words} Only)` : '(Rupees :Zero Only)';
}

export const MultiInvoiceExportModal = ({ isOpen, onClose, selectedChallans = [] }) => {
  const [showDeclaration, setShowDeclaration] = useState(() => {
    const saved = localStorage.getItem('sri_durga_print_show_declaration');
    return saved !== null ? saved === 'true' : true;
  });

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedChallans || selectedChallans.length === 0) return null;

  // Ultra-reliable Batch Print Handler with Strict 1-Invoice-Per-Page Break
  const handlePrintAll = () => {
    const printArea = document.getElementById('multi-invoice-batch-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (printWindow) {
      const contentHtml = printArea.innerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tax Invoices Batch Export (${selectedChallans.length} Invoices)</title>
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
                padding: 0;
                font-size: 11.5px;
              }
              .single-invoice-page {
                border: 2px solid #000000;
                width: 100%;
                background: #ffffff;
                color: #000000;
                font-size: 11.5px;
                line-height: 1.3;
                margin-bottom: 20px;
                page-break-after: always !important;
                break-after: page !important;
              }
              .single-invoice-page:last-child {
                margin-bottom: 0;
                page-break-after: auto !important;
                break-after: auto !important;
              }
              @page {
                size: A4 portrait;
                margin: 6mm 8mm !important;
              }
              @media print {
                body {
                  padding: 0;
                }
                .single-invoice-page {
                  margin-bottom: 0 !important;
                  page-break-after: always !important;
                  break-after: page !important;
                }
                .single-invoice-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
                }
              }
            </style>
          </head>
          <body>
            ${contentHtml}
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

  return (
    <div className="no-print-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      
      <div className="glass-panel-print-wrap" style={{ width: '100%', maxWidth: '920px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Modal Toolbar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', background: 'rgba(31, 41, 55, 0.95)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} color="#34d399" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Batch Export Tax Invoices ({selectedChallans.length} Invoices Selected)
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Each invoice is automatically formatted on its own dedicated separate page
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                background: showDeclaration ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)', 
                border: showDeclaration ? '1.5px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.45rem 0.85rem', 
                borderRadius: '8px', 
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease'
              }}
              title="Toggle to Show or Hide statutory Declaration in batch printout"
            >
              <input
                type="checkbox"
                checked={showDeclaration}
                onChange={(e) => {
                  setShowDeclaration(e.target.checked);
                  localStorage.setItem('sri_durga_print_show_declaration', String(e.target.checked));
                }}
                style={{ width: '15px', height: '15px', accentColor: '#10b981', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: showDeclaration ? '#ffffff' : '#94a3b8' }}>
                Declaration
              </span>
            </label>

            <button onClick={handlePrintAll} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', fontWeight: 700 }}>
              <Printer size={16} />
              <span>Print All / Save Multipage PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', background: '#334155', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div id="multi-invoice-batch-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {selectedChallans.map((challan, invoiceIndex) => {
              const formattedDate = challan.challanDate
                ? new Date(challan.challanDate).toLocaleDateString('en-GB')
                : new Date().toLocaleDateString('en-GB');

              const subTotal = challan.items
                ? challan.items.reduce((sum, i) => sum + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))), 0)
                : Number(challan.totalAmount || 0);

              const gstPercent = Number(challan.gstPercent !== undefined ? challan.gstPercent : 18);
              const halfGst = gstPercent / 2;

              const customerGstPrefix = (challan.customerGstin || '').trim().substring(0, 2);
              const isIntraState = customerGstPrefix === '34' || customerGstPrefix === '';

              let cgst = 0;
              let sgst = 0;
              let igst = 0;

              if (isIntraState) {
                cgst = subTotal * (halfGst / 100);
                sgst = subTotal * (halfGst / 100);
                igst = 0;
              } else {
                cgst = 0;
                sgst = 0;
                igst = subTotal * (gstPercent / 100);
              }

              const grossAmount = subTotal + cgst + sgst + igst;
              const amountInWords = numberToWordsINR(grossAmount);

              const hasAnyItemCode = challan.items && challan.items.some(
                i => i.itemCode && i.itemCode.trim() !== '' && i.itemCode.trim().toUpperCase() !== 'CUSTOM'
              );

              return (
                <div 
                  key={challan.id || invoiceIndex} 
                  className="single-invoice-page"
                  style={{ 
                    border: '2px solid #000', 
                    background: '#fff', 
                    fontSize: '11.5px', 
                    lineHeight: '1.3', 
                    color: '#000',
                    fontFamily: 'Arial, sans-serif',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  
                  {/* Top Page Indicator Header in Preview */}
                  <div className="no-print" style={{ background: '#0f172a', color: '#fbbf24', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #000' }}>
                    <span>PAGE {invoiceIndex + 1} OF {selectedChallans.length}</span>
                    <span>TAX INVOICE NO: {challan.challanNumber}</span>
                  </div>

                  {/* Header Section with Logo & Company Title matching User Photo */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #000', position: 'relative' }}>
                    {/* Left: Logo Box */}
                    <div style={{ width: '85px', minWidth: '85px', borderRight: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={companyLogoBase64} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                    </div>

                    {/* Center: Title & Company Info */}
                    <div style={{ flex: 1, padding: '4px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px', marginBottom: '2px' }}>
                        TAX INVOICE
                      </div>
                      <h1 style={{ fontSize: '18px', fontWeight: '900', margin: '2px 0', letterSpacing: '3px', fontFamily: 'Arial, sans-serif' }}>
                        SRI &nbsp; DURGA &nbsp; ENTERPRISES
                      </h1>
                      <p style={{ margin: '1px 0', fontSize: '11px', fontWeight: '600' }}>
                        No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602
                      </p>
                      <p style={{ margin: '1px 0', fontSize: '11px', fontWeight: '600' }}>
                        E-mail : sridurgaenterprises@yahoo.com &nbsp;&nbsp; Cell: 9842492946
                      </p>
                    </div>

                    {/* Top Right Copy */}
                    <div style={{ position: 'absolute', right: '10px', top: '6px', fontWeight: 'bold', fontSize: '11.5px', textTransform: 'uppercase' }}>
                      OFFICE COPY
                    </div>
                  </div>

                  {/* Exact Metadata Grid Matching User Reference Photo */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderBottom: '1px solid #000' }}>
                    <tbody>
                      {/* Row 1: Invoice No & Date */}
                      <tr style={{ background: '#dce4dc', borderBottom: '1px solid #000' }}>
                        <td style={{ width: '15%', padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Invoice No.</td>
                        <td style={{ width: '45%', padding: '3px 6px', fontWeight: '900', fontSize: '12px', borderRight: '1px solid #000' }}>{challan.challanNumber}</td>
                        <td style={{ width: '15%', padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Date :</td>
                        <td style={{ width: '25%', padding: '3px 6px', fontWeight: '900', fontSize: '12px' }}>{formattedDate}</td>
                      </tr>

                      {/* Row 2: Contract No & Page */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Contract No.</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.contractNo || '9010038288'}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Page</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>1 of 1</td>
                      </tr>

                      {/* Row 3: CON. Period & Vendor Code */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>CON. Period</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.contractPeriod || '01.05.2024 to 30.04.2027'}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Vendor Code</td>
                        <td style={{ padding: '3px 6px' }}>{challan.vendorCode || '840305'}</td>
                      </tr>

                      {/* Row 4: P.O. No. & GSTIN */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>P.O. No.</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.poNumber || '5060173862'} {challan.poDate ? `Dt: ${new Date(challan.poDate).toLocaleDateString('en-GB')}` : ''}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>GSTIN</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.gstin || '34ABDFS4476N1ZN'}</td>
                      </tr>

                      {/* Row 5: B.G. No & PAN */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>B.G. No</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.bgNo || '8110IPEBG240001  Validity Upto : 30.09.2027'}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>PAN</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.pan || 'ABDFS4476N'}</td>
                      </tr>

                      {/* Row 6: EPF Code & State Code */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>EPF Code</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.epfCode || 'PC 1758'}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>State Code</td>
                        <td style={{ padding: '3px 6px' }}>{challan.stateCode || 'Puducherry (34)'}</td>
                      </tr>

                      {/* Row 7: ESI CODE & Invoice Value */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>ESI CODE</td>
                        <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.esiCode || '55000426770000602'}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>Invoice Value</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>Rs. {grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>

                      {/* Row 8: BILLED TO */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#dce4dc', verticalAlign: 'top', borderRight: '1px solid #000' }}>BILLED TO</td>
                        <td style={{ padding: '4px 6px', fontWeight: 'bold', lineHeight: '1.35', borderRight: '1px solid #000' }}>
                          <div>{challan.customerName || ''}</div>
                          {challan.customerAddress && <div style={{ fontWeight: 'normal', fontSize: '10px' }}>{challan.customerAddress}</div>}
                          {challan.customerPhone && <div style={{ fontWeight: 'normal', fontSize: '10px' }}>Phone: {challan.customerPhone}</div>}
                        </td>
                        <td style={{ padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top', borderRight: '1px solid #000' }}>PAN</td>
                        <td style={{ padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>{challan.customerPan || ''}</td>
                      </tr>

                      {/* Row 9: Customer GST & Customer State Code */}
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', background: '#dce4dc', borderRight: '1px solid #000' }}>GST</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.customerGstin || ''}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>State Code</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.customerStateCode || 'TAMILNADU (33)'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Line Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #000', background: '#f1f5f9' }}>
                        <th style={{ width: '45px', padding: '4px', textAlign: 'center', borderRight: '1px solid #000' }}>Sl.No.</th>
                        {hasAnyItemCode && (
                          <th style={{ width: '95px', padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #000' }}>Item Code</th>
                        )}
                        <th style={{ padding: '4px 8px', textAlign: 'center', borderRight: '1px solid #000' }}>Description</th>
                        <th style={{ width: '75px', padding: '4px 8px', textAlign: 'right', borderRight: '1px solid #000' }}>Rate</th>
                        <th style={{ width: '65px', padding: '4px 8px', textAlign: 'center', borderRight: '1px solid #000' }}>Qty</th>
                        <th style={{ width: '95px', padding: '4px 8px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Optional Equipment Header */}
                      {challan.equipmentHeader && (
                        <tr>
                          <td style={{ borderRight: '1px solid #000' }}></td>
                          {hasAnyItemCode && <td style={{ borderRight: '1px solid #000' }}></td>}
                          <td style={{ padding: '5px 8px', fontWeight: 'bold', textDecoration: 'underline', borderRight: '1px solid #000' }}>
                            {challan.equipmentHeader}
                          </td>
                          <td style={{ borderRight: '1px solid #000' }}></td>
                          <td style={{ borderRight: '1px solid #000' }}></td>
                          <td></td>
                        </tr>
                      )}

                      {challan.items && challan.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '5px 4px', textAlign: 'center', verticalAlign: 'top', borderRight: '1px solid #000' }}>
                            {item.serialNumber || idx + 1}
                          </td>
                          {hasAnyItemCode && (
                            <td style={{ padding: '5px 6px', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', borderRight: '1px solid #000' }}>
                              {item.itemCode && item.itemCode !== 'CUSTOM' ? item.itemCode : ''}
                            </td>
                          )}
                          <td style={{ padding: '5px 8px', verticalAlign: 'top', borderRight: '1px solid #000', whiteSpace: 'pre-line' }}>
                            <div>{item.description}</div>
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', verticalAlign: 'top', borderRight: '1px solid #000' }}>
                            {Number(item.rate).toFixed(2)}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', verticalAlign: 'top', borderRight: '1px solid #000' }}>
                            {item.quantity} {item.unit || 'No'}
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold' }}>
                            {Number(item.amount || (item.quantity * item.rate)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Subtotal & Taxes Section */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderTop: '1px solid #000' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td colSpan={hasAnyItemCode ? 4 : 3} style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 'bold', fontStyle: 'italic', borderRight: '1px solid #000' }}>Total</td>
                        <td style={{ width: '95px', textAlign: 'right', padding: '4px 8px', fontWeight: 'bold' }}>
                          {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>

                      {isIntraState ? (
                        <>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td colSpan={hasAnyItemCode ? 3 : 2} style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #000' }}>
                              SAC Code : {challan.sacCode || '995464'}, GST : {gstPercent}%
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>
                              CGST @ {halfGst}%
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                              {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>

                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td colSpan={hasAnyItemCode ? 3 : 2} style={{ padding: '4px 8px', fontStyle: 'italic', borderRight: '1px solid #000' }}>
                              {amountInWords}
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>
                              UGST / SGST @ {halfGst}%
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                              {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td colSpan={hasAnyItemCode ? 3 : 2} style={{ padding: '4px 8px', fontWeight: 'bold', borderRight: '1px solid #000' }}>
                              SAC Code : {challan.sacCode || '995464'}, GST : {gstPercent}%
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>
                              IGST @ {gstPercent}%
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                              {igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>

                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td colSpan={hasAnyItemCode ? 3 : 2} style={{ padding: '4px 8px', fontStyle: 'italic', borderRight: '1px solid #000' }}>
                              {amountInWords}
                            </td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td></td>
                          </tr>
                        </>
                      )}

                      <tr style={{ borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                        <td colSpan={hasAnyItemCode ? 3 : 2} style={{ borderRight: '1px solid #000' }}></td>
                        <td style={{ textAlign: 'right', padding: '4px 8px', borderRight: '1px solid #000' }}>
                          GROSS AMOUNT
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 8px', fontSize: '11.5px' }}>
                          Rs. {grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Declaration Section */}
                  {showDeclaration && (
                    <div style={{ borderBottom: '1px solid #000', padding: '5px 12px', textAlign: 'center', background: '#ffffff' }}>
                      <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '11px', marginBottom: '2px', letterSpacing: '0.5px' }}>
                        DECLARATION
                      </div>
                      <div style={{ fontSize: '10.5px', fontWeight: 500, lineHeight: '1.35', color: '#000' }}>
                        We hereby certifying that all the clause of the contract agreement including statutory clauses, Remittance of EPF payment have been complied.
                      </div>
                    </div>
                  )}

                  {/* Bank Details & Authorised Signatory Footer */}
                  <div style={{ display: 'flex', fontSize: '10.5px' }}>
                    <div style={{ flex: 1, padding: '5px 8px', borderRight: '1px solid #000' }}>
                      <div style={{ textDecoration: 'underline', fontWeight: 'bold', marginBottom: '2px' }}>Bank Account Details</div>
                      <div>Bank Name : {challan.bankName || 'Bank of India'}</div>
                      <div>Account No. : {challan.accountNo || '811030100000006'}</div>
                      <div>Branch : {challan.branch || 'Karaikal'}</div>
                      <div>IFSC : {challan.ifsc || 'BKID0008110'}</div>
                      <div style={{ marginTop: '8px', fontWeight: 'bold' }}>E & O.E</div>
                    </div>

                    <div style={{ width: '250px', padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '10.5px' }}>
                        For SRI DURGA ENTERPRISES
                      </div>

                      <div style={{ marginTop: '40px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '10.5px' }}>Authorised Signatory</div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>
    </div>
  );
};
