import React from 'react';
import { X, Printer, CheckCircle, FileText, Download } from 'lucide-react';

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
                margin: 8mm;
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
    <div className="no-print-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      
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

                  {/* Header Section with Logo & Company Title */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                    
                    {/* Logo Box */}
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

                    {/* Original Badge */}
                    <div style={{ width: '85px', borderLeft: '1px solid #000', padding: '0.4rem', textAlign: 'right', fontWeight: 'bold', fontSize: '10.5px' }}>
                      ORIGINAL
                    </div>
                  </div>

                  {/* Invoice Meta Grid */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderBottom: '1px solid #000' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ width: '100px', padding: '3px 6px', fontWeight: 'bold' }}>Invoice No.</td>
                        <td style={{ width: '230px', padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.challanNumber}</td>
                        <td style={{ width: '90px', padding: '3px 6px', fontWeight: 'bold' }}>Date :</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{formattedDate}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px' }}>Vendor Code</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.vendorCode || '253540'}</td>
                        <td style={{ padding: '3px 6px' }}>Page</td>
                        <td style={{ padding: '3px 6px' }}>1 of 1</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px' }}>P.O. No.</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.poNumber || ''}</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>GSTIN</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.gstin || '34ABDFS4476N1ZN'}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px' }}>P.O. Date</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.poDate || ''}</td>
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
                                <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>{challan.customerPan || ''}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>State Code</td>
                                <td style={{ padding: '3px 6px' }}>{challan.customerStateCode || 'PUDUCHERRY (34)'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      <tr style={{ borderTop: '1px solid #000' }}>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold' }}>GST</td>
                        <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000' }}>{challan.customerGstin || ''}</td>
                        <td colSpan={2} style={{ padding: 0 }}></td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Line Items Table */}
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
