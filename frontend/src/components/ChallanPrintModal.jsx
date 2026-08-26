import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';

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

export const ChallanPrintModal = ({ isOpen, onClose, challan }) => {
  const [copyType, setCopyType] = React.useState('OFFICE COPY');

  if (!isOpen || !challan) return null;

  // Ultra-reliable Print Handler: Opens a clean dedicated print window
  const handlePrint = () => {
    const printArea = document.getElementById('invoice-print-area');
    if (!printArea) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (printWindow) {
      const invoiceHtml = printArea.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Tax Invoice - ${challan.challanNumber || 'Sri Durga Enterprises'}</title>
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
              }
              #invoice-print-area {
                width: 100% !important;
                background: #ffffff !important;
              }
              .invoice-page {
                border: 2px solid #000000 !important;
                padding: 8mm !important;
                width: 100% !important;
                min-height: 295mm !important;
                background: #ffffff !important;
                color: #000000 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                page-break-after: always !important;
                break-after: page !important;
              }
              .invoice-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
            </style>
          </head>
          <body>
            ${invoiceHtml}
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

  const formattedDate = challan.challanDate
    ? new Date(challan.challanDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  const items = challan.items || [];

  // Calculate total amount from all items
  const subTotal = items.reduce(
    (sum, i) => sum + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))),
    0
  );

  const gstPercent = Number(challan.gstPercent !== undefined ? challan.gstPercent : 18);
  const halfGst = gstPercent / 2;

  // GST Calculation Rule:
  // If Customer GSTIN starts with '34' (or not specified), use CGST + UGST/SGST
  // If Customer GSTIN starts with anything else (<34 or >34 e.g. 33, 29, 27), use IGST
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

  // Dynamic Column Check: If NO items have an Item Code, hide Item Code column from printed invoice!
  const hasAnyItemCode = items.some(
    i => i.itemCode && i.itemCode.trim() !== '' && i.itemCode.trim().toUpperCase() !== 'CUSTOM'
  );

  // Pagination Chunking Logic matching screenshots
  const chunkItems = (itemList) => {
    const pages = [];
    let remaining = [...itemList];
    
    // Page 1
    if (remaining.length <= 30) {
      pages.push(remaining);
      return pages;
    }
    
    // Page 1 gets exactly 30 items
    pages.push(remaining.splice(0, 30));
    
    // Subsequent pages
    while (remaining.length > 0) {
      if (remaining.length <= 25) {
        pages.push(remaining);
        break;
      } else {
        if (remaining.length <= 30) {
          // If remaining is between 26 and 30, split it so the last page doesn't overflow
          pages.push(remaining.splice(0, 25));
        } else {
          // Intermediate pages can take 30
          pages.push(remaining.splice(0, 30));
        }
      }
    }
    return pages;
  };

  const pages = chunkItems(items);

  // Helper to compute brought forward total for pageIdx
  const getBroughtForwardAmount = (pageIdx) => {
    return pages.slice(0, pageIdx).reduce(
      (sum, p) => sum + p.reduce((s, i) => s + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))), 0),
      0
    );
  };

  // Helper to compute page total (brought forward + current page items)
  const getPageTotalAmount = (pageIdx) => {
    const currentSubtotal = pages[pageIdx].reduce(
      (sum, i) => sum + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))),
      0
    );
    return getBroughtForwardAmount(pageIdx) + currentSubtotal;
  };

  return (
    <div className="no-print-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      
      {/* Clean In-Page @media print CSS fallback */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible !important;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .invoice-page {
            border: 2px solid #000000 !important;
            padding: 8mm !important;
            width: 100% !important;
            min-height: 295mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
          }
          .invoice-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="glass-panel-print-wrap" style={{ width: '100%', maxWidth: '850px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Modal Toolbar */}
        <div className="no-print-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(31, 41, 55, 0.9)', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
            <CheckCircle size={18} />
            <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>Tax Invoice Preview</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Copy Type Selection Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 600 }}>Copy Type:</span>
              <select
                value={copyType}
                onChange={(e) => setCopyType(e.target.value)}
                style={{ 
                  padding: '0.45rem 1.75rem 0.45rem 0.75rem', 
                  fontSize: '0.85rem', 
                  fontWeight: 750, 
                  background: 'rgba(15, 23, 42, 0.9)', 
                  color: '#34d399', 
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="ORIGINAL FOR BUYER">Original for Buyer</option>
                <option value="DUPLICATE FOR TRANSPORTER">Duplicate for Transporter</option>
                <option value="TRIPLICATE FOR ASSESSEE">Triplicate for Assessee</option>
                <option value="OFFICE COPY">Office Copy</option>
                <option value="EXTRA COPY">Extra Copy</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                <Printer size={16} />
                <span>Print Invoice / Save PDF</span>
              </button>
              <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Printable PDF Template Box */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', background: '#0f172a' }}>
          
          <div id="invoice-print-area" style={{ background: '#fff', width: '100%' }}>
            
            {pages.map((pageItems, pageIdx) => {
              const bForward = getBroughtForwardAmount(pageIdx);
              const pTotal = getPageTotalAmount(pageIdx);

              return (
                <div 
                  key={pageIdx} 
                  className="invoice-page" 
                  style={{ 
                    border: '2px solid #000000', 
                    padding: '8mm', 
                    marginBottom: pageIdx === pages.length - 1 ? '0' : '20px', 
                    background: '#ffffff',
                    color: '#000000',
                    boxSizing: 'border-box',
                    minHeight: '280mm',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* Header Section */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                      
                      {/* Logo */}
                      <div style={{ width: '100px', borderRight: '1px solid #000', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ border: '2px solid #000', borderRadius: '50% 0 50% 0', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '26px', fontFamily: 'Georgia, serif' }}>
                          S
                        </div>
                      </div>

                      {/* Title & Company Info */}
                      <div style={{ flex: 1, padding: '0.4rem 0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px' }}>TAX INVOICE</span>
                        <h1 style={{ fontSize: '19px', fontWeight: '900', margin: '2px 0', letterSpacing: '1.5px', fontFamily: 'Arial Black, sans-serif' }}>
                          SRI DURGA ENTERPRISES
                        </h1>
                        <p style={{ margin: '1px 0', fontSize: '10.5px' }}>
                          No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602
                        </p>
                        <p style={{ margin: '1px 0', fontSize: '10.5px' }}>
                          E-mail : sridurgaenterprises@yahoo.com Cell: 9842492946
                        </p>
                      </div>

                      {/* Top Right Copy Tag */}
                      <div style={{ width: '100px', borderLeft: '1px solid #000', padding: '0.4rem', textAlign: 'right', fontWeight: 'bold', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textTransform: 'uppercase' }}>
                        {copyType}
                      </div>
                    </div>

                    {/* Invoice Meta Grid */}
                    {pageIdx === 0 ? (
                      /* Full Meta Grid on Page 1 */
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderBottom: '1px solid #000' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ width: '100px', padding: '3px 6px', fontWeight: 'bold' }}>Invoice No.</td>
                            <td style={{ width: '230px', padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.challanNumber}</td>
                            <td style={{ width: '90px', padding: '3px 6px', fontWeight: 'bold' }}>Date :</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{formattedDate}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px' }}>Contract No.</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>9010038288</td>
                            <td style={{ padding: '3px 6px' }}>Page</td>
                            <td style={{ padding: '3px 6px' }}>1 of {pages.length}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px' }}>C. Period</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>01.05.2024 to 30.04.2027</td>
                            <td style={{ padding: '3px 6px' }}>Vendor Code</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.vendorCode || '840305'}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>P.O. No.</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.poNumber || '5060173862'}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>GSTIN</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.gstin || '34ABDFS4476N1ZN'}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px' }}>B.G. NO.</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>8110IPEBG240001 Validity Upto : 30.09.2027</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>PAN</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.pan || 'ABDFS4476N'}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px' }}>EPF Code</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.epfCode || 'PC 1758'}</td>
                            <td style={{ padding: '3px 6px' }}>State Code</td>
                            <td style={{ padding: '3px 6px' }}>{challan.stateCode || 'Puducherry (34)'}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px' }}>ESI CODE</td>
                            <td style={{ padding: '3px 6px', borderRight: '1px solid #000' }}>{challan.esiCode || '55000426770000602'}</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>Invoice Value</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>Rs. {grossAmount.toFixed(2)}</td>
                          </tr>

                          {/* Billed To Row */}
                          <tr>
                            <td style={{ padding: '4px 6px', fontWeight: 'bold', verticalAlign: 'top' }}>BILLED TO</td>
                            <td style={{ padding: '4px 6px', borderRight: '1px solid #000', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 'bold' }}>{challan.customerName || ''}</div>
                              <div style={{ whiteSpace: 'pre-line' }}>{challan.customerAddress || ''}</div>
                            </td>
                            <td colSpan={2} style={{ padding: 0, verticalAlign: 'top' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <tbody>
                                  <tr style={{ borderBottom: '1px solid #000' }}>
                                    <td style={{ width: '90px', padding: '3px 6px', fontWeight: 'bold' }}>PAN</td>
                                    <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.customerPan || 'AAACO1598A'}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>State Code</td>
                                    <td style={{ padding: '3px 6px' }}>{challan.customerStateCode || 'TAMILNADU (33)'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>

                          <tr style={{ borderTop: '1px solid #000' }}>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>GST</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.customerGstin || '33AAACO1598A1ZU'}</td>
                            <td colSpan={2} style={{ padding: 0 }}></td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      /* Simple Meta Grid on subsequent pages */
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderBottom: '1px solid #000' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td style={{ width: '100px', padding: '3px 6px', fontWeight: 'bold' }}>Invoice No.</td>
                            <td style={{ width: '230px', padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.challanNumber}</td>
                            <td style={{ width: '90px', padding: '3px 6px', fontWeight: 'bold' }}>Date :</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{formattedDate}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '3px 6px' }}>Contract No.</td>
                            <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>9010038288</td>
                            <td style={{ padding: '3px 6px' }}>Page</td>
                            <td style={{ padding: '3px 6px' }}>{pageIdx + 1} of {pages.length}</td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
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
                        {/* Brought Forward row (if pageIdx > 0) */}
                        {pageIdx > 0 && (
                          <tr style={{ borderBottom: '1px solid #000', fontWeight: 'bold', fontStyle: 'italic' }}>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            {hasAnyItemCode && <td style={{ borderRight: '1px solid #000' }}></td>}
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #000' }}>
                              Brought Forward (Page {pageIdx})
                            </td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>
                              {bForward.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}

                        {/* Equipment Header (Page 1 only) */}
                        {pageIdx === 0 && challan.equipmentHeader && (
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

                        {/* Item Rows */}
                        {pageItems.map((item, idx) => {
                          const absoluteIndex = pages.slice(0, pageIdx).reduce((sum, p) => sum + p.length, 0) + idx + 1;
                          return (
                            <tr key={idx}>
                              <td style={{ padding: '5px 4px', textAlign: 'center', verticalAlign: 'top', borderRight: '1px solid #000' }}>
                                {item.serialNumber || absoluteIndex}
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
                          );
                        })}

                        {/* Page Total row (if not the last page) */}
                        {pageIdx < pages.length - 1 && (
                          <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold' }}>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            {hasAnyItemCode && <td style={{ borderRight: '1px solid #000' }}></td>}
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic' }}>
                              Page - {pageIdx + 1} Total
                            </td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ borderRight: '1px solid #000' }}></td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>
                              {pTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Section */}
                  <div>
                    {/* Conti Tag at bottom of non-last pages */}
                    {pageIdx < pages.length - 1 && (
                      <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: 'bold', fontStyle: 'italic', padding: '4px 8px' }}>
                        Conti...
                      </div>
                    )}

                    {/* Subtotal, GST, Grand Total, and Signatures (Only on last page) */}
                    {pageIdx === pages.length - 1 && (
                      <div style={{ borderTop: '1px solid #000', marginTop: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                              <td colSpan={hasAnyItemCode ? 4 : 3} style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 'bold', fontStyle: 'italic', borderRight: '1px solid #000' }}>Sub-Total</td>
                              <td style={{ width: '95px', textAlign: 'right', padding: '6px 8px', fontWeight: 'bold' }}>
                                {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>

                            {/* Intra-State (34 Prefix) -> CGST & UGST / SGST */}
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
                              /* Inter-State (Non-34 Prefix) -> IGST */
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
                              <td style={{ textAlign: 'right', padding: '6px 8px', borderRight: '1px solid #000' }}>
                                GROSS AMOUNT
                              </td>
                              <td style={{ textAlign: 'right', padding: '6px 8px', fontSize: '11.5px', color: '#000' }}>
                                Rs. {grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Declaration & Signature Block */}
                        <div style={{ display: 'flex', fontSize: '10.5px' }}>
                          
                          {/* Declaration */}
                          <div style={{ flex: 1, padding: '5px 8px', borderRight: '1px solid #000' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px', textDecoration: 'underline' }}>DECLARATION</div>
                            <div style={{ fontSize: '9.5px', lineHeight: '1.3' }}>
                              We hereby certifying that all the clause of the contract agreement including statutory clauses, Remittance of EPF payment have been complied.
                            </div>
                            <div style={{ marginTop: '8px', fontWeight: 'bold' }}>E & O.E</div>
                          </div>

                          {/* Signatory */}
                          <div style={{ width: '250px', padding: '5px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '10.5px' }}>
                              For SRI DURGA ENTERPRISES
                            </div>

                            <div style={{ marginTop: '40px', textAlign: 'right' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '10.5px' }}>MANAGING PARTNER</div>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
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
