import React, { useState, useEffect } from 'react';
import { X, Printer, CheckCircle, FileText } from 'lucide-react';
import { companyLogoBase64 } from '../assets/companyLogo';
import { fetchCompanyDetails, DEFAULT_COMPANY_DETAILS } from '../services/api';

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
  const [copyType, setCopyType] = useState('ORIGINAL'); // 'ORIGINAL', 'DUPLICATE', 'OFFICE COPY', 'ALL'
  const [showItemNumber, setShowItemNumber] = useState(() => {
    const saved = localStorage.getItem('sri_durga_print_show_item_number');
    return saved !== null ? saved === 'true' : true;
  });
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
      }).catch(err => console.warn('Could not load company details for print', err));
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
            <title>Tax Invoice - ${challan.challanNumber || challan.challanNo || 'Sri Durga Enterprises'}</title>
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
                padding: 0;
                font-size: 12px;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              #invoice-print-area {
                width: 100% !important;
                background: #ffffff !important;
              }
              .invoice-page {
                border: 2px solid #000000 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 285mm !important;
                min-height: 285mm !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                color: #000000 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                page-break-after: always !important;
                break-after: page !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .invoice-page:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 6mm 8mm !important;
              }
            </style>
          </head>
          <body>
            ${invoiceHtml}
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

  const invoiceNo = challan.challanNumber || challan.challanNo || '-';
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

  // Dynamic Column Check: Controls whether "Item No." column is displayed in printed invoice
  const hasAnyItemCode = showItemNumber;

  // Full A4 Page Utilization Chunking Logic:
  // - 1 to 16 items fit COMPLETELY on a Single Page (Page 1) without premature second page.
  // - If items > 16, Page 1 fills completely with up to 22 items before spilling to Page 2.
  const chunkItems = (itemList) => {
    const pages = [];
    let remaining = [...itemList];

    const SINGLE_PAGE_MAX = 16;     // Single page fills up to 16 items + bottom summary
    const FIRST_PAGE_MAX = 22;      // Page 1 of multi-page fills up to 22 items
    const SUBSEQUENT_PAGE_MAX = 22; // Page 2+ fills up to 22 items

    if (remaining.length <= SINGLE_PAGE_MAX) {
      pages.push(remaining);
      return pages;
    }

    // Page 1: Fill completely with up to FIRST_PAGE_MAX
    pages.push(remaining.slice(0, FIRST_PAGE_MAX));
    remaining = remaining.slice(FIRST_PAGE_MAX);

    // Subsequent Pages
    while (remaining.length > 0) {
      pages.push(remaining.slice(0, SUBSEQUENT_PAGE_MAX));
      remaining = remaining.slice(SUBSEQUENT_PAGE_MAX);
    }

    return pages;
  };

  const pages = chunkItems(items);

  const getBroughtForwardAmount = (pageIndex) => {
    if (pageIndex === 0) return 0;
    let sum = 0;
    for (let p = 0; p < pageIndex; p++) {
      for (const item of pages[p]) {
        sum += (Number(item.amount) || (Number(item.quantity || 0) * Number(item.rate || 0)));
      }
    }
    return sum;
  };

  const getPageTotalAmount = (pageIndex) => {
    return pages[pageIndex].reduce(
      (sum, i) => sum + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))),
      0
    );
  };

  // Exact names: 'ORIGINAL', 'DUPLICATE', 'OFFICE COPY'
  const getCopyLabel = (type) => {
    if (type === 'ORIGINAL') return 'ORIGINAL';
    if (type === 'DUPLICATE') return 'DUPLICATE';
    if (type === 'OFFICE COPY') return 'OFFICE COPY';
    return type;
  };

  const copiesToRender = copyType === 'ALL'
    ? ['ORIGINAL', 'DUPLICATE', 'OFFICE COPY']
    : [getCopyLabel(copyType)];

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
            padding: 0 !important;
            width: 100% !important;
            height: 285mm !important;
            min-height: 285mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
            overflow: hidden !important;
          }
          .invoice-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm 8mm !important;
          }
        }
      `}</style>

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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                Tax Invoice Preview & Print ({pages.length} {pages.length > 1 ? 'Pages' : 'Page'})
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Invoice No: <strong style={{ color: '#38bdf8' }}>{invoiceNo}</strong> &bull; Total Items: <strong style={{ color: '#34d399' }}>{items.length}</strong>
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

        {/* MIDDLE BODY: Printable PDF Template Box */}
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
          <div id="invoice-print-area" style={{ background: '#fff', width: '100%', maxWidth: '820px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)' }}>

            {copiesToRender.map((currentCopyName, copyIdx) => (
              <React.Fragment key={copyIdx}>
                {pages.map((pageItems, pageIdx) => {
                  const isFirstPage = pageIdx === 0;
                  const isLastPage = pageIdx === pages.length - 1;
                  const bForward = getBroughtForwardAmount(pageIdx);
                  const pTotal = getPageTotalAmount(pageIdx);

                  return (
                    <div
                      key={`${copyIdx}-${pageIdx}`}
                      className="invoice-page"
                      style={{
                        border: '2px solid #000000',
                        padding: '0',
                        marginBottom: (copyIdx === copiesToRender.length - 1 && pageIdx === pages.length - 1) ? '0' : '25px',
                        background: '#ffffff',
                        color: '#000000',
                        boxSizing: 'border-box',
                        width: '100%',
                        height: '285mm',
                        minHeight: '285mm',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        fontSize: '12px',
                        fontFamily: 'Arial, sans-serif'
                      }}
                    >
                      {/* 1. HEADER SECTION (Page 1 has full 9 rows; Page 2+ has concise 2 rows as per user photo) */}
                      <div style={{ flexShrink: 0 }}>
                        {/* Company Header Box */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #000', position: 'relative' }}>
                          {/* Left: Logo Box with Border */}
                          <div style={{ width: '85px', minWidth: '85px', borderRight: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={companyLogoBase64} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                          </div>

                          {/* Center: Title & Company Info */}
                          <div style={{ flex: 1, padding: '4px 8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px', marginBottom: '2px' }}>
                              TAX INVOICE
                            </div>
                            <h1 style={{ fontSize: '19px', fontWeight: '900', margin: '2px 0', letterSpacing: '3px', fontFamily: 'Arial, sans-serif' }}>
                              {companyDetails?.companyName || 'SRI DURGA ENTERPRISES'}
                            </h1>
                            <p style={{ margin: '1px 0', fontSize: '12px', fontWeight: '600' }}>
                              {companyDetails?.address || 'No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602'}
                            </p>
                            {/* Page 1 includes Email & Cell; Page 2 keeps it concise as shown in reference photo */}
                            {isFirstPage && (
                              <p style={{ margin: '1px 0', fontSize: '12px', fontWeight: '600' }}>
                                E-mail : {companyDetails?.email || 'sridurgaenterprises@yahoo.com'} &nbsp;&nbsp; Cell: {companyDetails?.phone || '9842492946'}
                              </p>
                            )}
                          </div>

                          {/* Top Right: Exact Copy Name (OFFICE COPY / ORIGINAL / DUPLICATE) */}
                          <div style={{ position: 'absolute', right: '10px', top: '6px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {currentCopyName}
                          </div>
                        </div>

                        {/* Metadata Grid Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: 0, borderBottom: '1px solid #000' }}>
                          <tbody>
                            {/* Row 1: Invoice No & Date with Light Shading Background */}
                            <tr style={{ background: '#dbe2ea', borderBottom: '1px solid #000' }}>
                              <td style={{ width: '15%', padding: '4px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                Invoice No.
                              </td>
                              <td style={{ width: '45%', padding: '4px 6px', fontWeight: '900', fontSize: '12.5px', borderRight: '1px solid #000' }}>
                                {invoiceNo}
                              </td>
                              <td style={{ width: '15%', padding: '4px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                Date :
                              </td>
                              <td style={{ width: '25%', padding: '4px 6px', fontWeight: '900', fontSize: '12.5px' }}>
                                {formattedDate}
                              </td>
                            </tr>

                            {/* Row 2: Vendor Code & Page */}
                            <tr style={{ borderBottom: '1px solid #000' }}>
                              <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                Vendor Code
                              </td>
                              <td style={{ padding: '3.5px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                {challan.vendorCode || '-'}
                              </td>
                              <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                Page
                              </td>
                              <td style={{ padding: '3.5px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                {pageIdx + 1} of {pages.length}
                              </td>
                            </tr>

                            {/* Rows 3 to 8: Rendered ONLY on Page 1 */}
                            {isFirstPage && (
                              <>
                                {/* Row 3: P.O. No. & GSTIN */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    P.O. No.
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {challan.poNumber || 'NA'}
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    GSTIN
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                    {companyDetails?.gstin || challan.gstin || '34ABDFS4476N1ZN'}
                                  </td>
                                </tr>

                                {/* Row 4: P.O. Date & PAN */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    P.O. Date
                                  </td>
                                  <td style={{ padding: '3.5px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {challan.poDate ? new Date(challan.poDate).toLocaleDateString('en-GB') : (challan.poNumber ? '-' : 'NA')}
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    PAN
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                    {companyDetails?.pan || challan.pan || 'ABDFS4476N'}
                                  </td>
                                </tr>

                                {/* Row 5: EPF Code & State Code */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    EPF Code
                                  </td>
                                  <td style={{ padding: '3.5px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {companyDetails?.epfCode || challan.epfCode || 'PC 1758'}
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    State Code
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontSize: '12px' }}>
                                    {companyDetails?.state || challan.stateCode || 'Puducherry (34)'}
                                  </td>
                                </tr>

                                {/* Row 6: ESI CODE & Invoice Value */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    ESI CODE
                                  </td>
                                  <td style={{ padding: '3.5px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {companyDetails?.esiCode || challan.esiCode || '55000426770000602'}
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    Invoice Value
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                    Rs. {grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>

                                {/* Row 7: BILLED TO Section (Entire Row Highlighted) */}
                                <tr style={{ background: '#dbe2ea', borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#dbe2ea', verticalAlign: 'top', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    BILLED TO
                                  </td>
                                  <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#dbe2ea', lineHeight: '1.35', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{challan.customerName || '-'}</div>
                                    {challan.customerAddress && <div style={{ fontWeight: 'normal', fontSize: '11px', whiteSpace: 'pre-line' }}>{challan.customerAddress}</div>}
                                    {challan.customerPhone && <div style={{ fontWeight: 'normal', fontSize: '11px' }}>Phone: {challan.customerPhone}</div>}
                                  </td>
                                  <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#dbe2ea', verticalAlign: 'top', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    PAN
                                  </td>
                                  <td style={{ padding: '4px 6px', fontWeight: 'bold', background: '#dbe2ea', verticalAlign: 'top', fontSize: '12px' }}>
                                    {challan.customerPan || '-'}
                                  </td>
                                </tr>

                                {/* Row 8: Customer GST & Customer State Code (Entire Row Highlighted) */}
                                <tr style={{ background: '#dbe2ea', borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', background: '#dbe2ea', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    GST
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', background: '#dbe2ea', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {challan.customerGstin || '-'}
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', background: '#dbe2ea', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    State Code
                                  </td>
                                  <td style={{ padding: '3.5px 6px', fontWeight: 'bold', background: '#dbe2ea', fontSize: '12px' }}>
                                    {challan.customerStateCode || 'TAMILNADU (33)'}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>

                        {/* Equipment / Job Header (If provided) */}
                        {challan.equipmentHeader && isFirstPage && (
                          <div style={{ borderBottom: '1px solid #000', padding: '0.35rem 0.75rem', background: '#f8fafc', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }}>
                            {challan.equipmentHeader}
                          </div>
                        )}
                      </div>

                      {/* 2. ITEMS TABLE WITH CLEAN BORDERS */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', margin: 0, display: 'table' }}>
                          <thead>
                            <tr style={{ borderBottom: '1.5px solid #000', background: '#f1f5f9', fontWeight: 'bold', textAlign: 'center', height: '28px' }}>
                              <th style={{ width: '42px', padding: '4px 2px', borderRight: '1px solid #000', fontSize: '12px' }}>Sl.No.</th>
                              {hasAnyItemCode && <th style={{ width: '80px', padding: '4px 2px', borderRight: '1px solid #000', fontSize: '12px' }}>Item No.</th>}
                              <th style={{ padding: '4px 6px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>Description</th>
                              <th style={{ width: '85px', padding: '4px 4px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>Rate</th>
                              <th style={{ width: '60px', padding: '4px 2px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>Qty</th>
                              <th style={{ width: '105px', padding: '4px 6px', textAlign: 'center', fontSize: '12px' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Brought Forward row for page 2 onwards */}
                            {pageIdx > 0 && (
                              <tr style={{ fontWeight: 'bold', background: '#f8fafc', borderBottom: '1px solid #000', height: '26px' }}>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                {hasAnyItemCode && <td style={{ borderRight: '1px solid #000' }}></td>}
                                <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #000', fontStyle: 'italic', fontWeight: 800, fontSize: '12px' }}>
                                  Brought Forward from Page {pageIdx}
                                </td>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 800, fontSize: '12px' }}>
                                  {bForward.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            )}

                            {/* Actual Item Rows Filling The Available Space */}
                            {pageItems.map((item, itemIdx) => {
                              const calcAmount = Number(item.amount) || (Number(item.quantity || 0) * Number(item.rate || 0));
                              const overallIndex = pageIdx === 0 ? itemIdx + 1 : (pages.slice(0, pageIdx).reduce((acc, p) => acc + p.length, 0) + itemIdx + 1);

                              return (
                                <tr key={itemIdx} style={{ verticalAlign: 'top', minHeight: '24px' }}>
                                  <td style={{ textAlign: 'center', padding: '4px 2px', borderRight: '1px solid #000', fontSize: '12px' }}>{item.serialNumber || overallIndex}</td>
                                  {hasAnyItemCode && (
                                    <td style={{ textAlign: 'center', padding: '4px 2px', borderRight: '1px solid #000', fontWeight: '600', fontSize: '12px' }}>
                                      {item.itemCode && item.itemCode !== 'CUSTOM' ? item.itemCode : '-'}
                                    </td>
                                  )}
                                  <td style={{ padding: '4px 6px', borderRight: '1px solid #000', whiteSpace: 'pre-line', fontSize: '12px', lineHeight: '1.35' }}>
                                    {item.description}
                                  </td>
                                  <td style={{ textAlign: 'right', padding: '4px 4px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td style={{ textAlign: 'center', padding: '4px 2px', borderRight: '1px solid #000', fontWeight: '600', fontSize: '12px' }}>
                                    {item.quantity} {item.unit || (Number(item.quantity) === 1 ? 'No' : 'Nos')}
                                  </td>
                                  <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: '600', fontSize: '12px' }}>
                                    {calcAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              );
                            })}

                            {/* Stretcher row to ensure vertical border lines connect seamlessly to bottom */}
                            <tr style={{ height: '100%' }}>
                              <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                              {hasAnyItemCode && <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>}
                              <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                              <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                              <td style={{ borderRight: '1px solid #000' }}>&nbsp;</td>
                              <td>&nbsp;</td>
                            </tr>

                            {/* Carried Forward row for Page 1 / Intermediate Pages - Touches the bottom border */}
                            {pageIdx < pages.length - 1 && (
                              <tr style={{ fontWeight: 'bold', background: '#f8fafc', borderTop: '1.5px solid #000', height: '30px' }}>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                {hasAnyItemCode && <td style={{ borderRight: '1px solid #000' }}></td>}
                                <td style={{ padding: '5px 8px', textAlign: 'center', borderRight: '1px solid #000', fontSize: '12px', fontStyle: 'italic' }}>
                                  Carried Over to Page {pageIdx + 2}
                                </td>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', fontSize: '12px', fontWeight: 800 }}>
                                  {(bForward + pTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            )}

                            {/* Final Total row on last page */}
                            {isLastPage && (
                              <tr style={{ borderTop: '1.5px solid #000', height: '28px' }}>
                                <td colSpan={hasAnyItemCode ? 5 : 4} style={{ padding: '4px 12px', textAlign: 'right', fontStyle: 'italic', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                  Total
                                </td>
                                <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                                  {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* 3. BOTTOM SUMMARY SECTION: Rendered on Final Page */}
                      {isLastPage && (
                        <div style={{ flexShrink: 0, borderTop: '1.5px solid #000' }}>
                          {/* SAC Code, Words, Tax Breakdown & Gross Amount Box */}
                          <div style={{ borderBottom: '1px solid #000', display: 'flex', fontSize: '12px' }}>
                            {/* Left: SAC Code & Words */}
                            <div style={{ flex: 1, borderRight: '1px solid #000', padding: '4px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                                SAC Code : {challan.sacCode || '995464'}, GST : {gstPercent}%
                              </div>
                              <div style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '11.5px', marginTop: '6px' }}>
                                {amountInWords}
                              </div>
                            </div>

                            {/* Right: IGST / CGST+SGST & Gross Amount */}
                            <div style={{ width: '255px', display: 'flex', flexDirection: 'column' }}>
                              {isIntraState ? (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', borderBottom: '1px solid #000', fontStyle: 'italic', fontSize: '12px' }}>
                                    <span>CGST @ {halfGst}%</span>
                                    <span style={{ fontWeight: '600' }}>{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', borderBottom: '1px solid #000', fontStyle: 'italic', fontSize: '12px' }}>
                                    <span>SGST @ {halfGst}%</span>
                                    <span style={{ fontWeight: '600' }}>{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                </>
                              ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #000', fontStyle: 'italic', fontSize: '12px' }}>
                                  <span>IGST @ {gstPercent}%</span>
                                  <span style={{ fontWeight: '600' }}>{igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              )}

                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontWeight: 'bold', fontSize: '12.5px' }}>
                                <span>GROSS AMOUNT</span>
                                <span>Rs. {grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Terms, Bank Details & Signatures */}
                          <div style={{ display: 'flex', fontSize: '11.5px', minHeight: '85px' }}>
                            {/* Col 1: E & O.E */}
                            <div style={{ width: '15%', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                              <u style={{ fontWeight: 'bold', fontSize: '12px' }}>E & O.E</u>
                            </div>

                            {/* Col 2: Bank Account Details */}
                            <div style={{ width: '45%', borderRight: '1px solid #000', padding: '4px 8px', lineHeight: '1.4' }}>
                              <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '2px', fontSize: '12px' }}>
                                Bank Account Details
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span style={{ width: '85px', fontWeight: '500' }}>Bank Name</span>
                                <span>: {companyDetails?.bankName || 'Bank of India'}</span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span style={{ width: '85px', fontWeight: '500' }}>Account No.</span>
                                <span>: <strong>{companyDetails?.accountNumber || '811030100000006'}</strong></span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span style={{ width: '85px', fontWeight: '500' }}>Branch</span>
                                <span>: {companyDetails?.branch || 'Karaikal'}</span>
                              </div>
                              <div style={{ display: 'flex' }}>
                                <span style={{ width: '85px', fontWeight: '500' }}>IFSC</span>
                                <span>: <strong>{companyDetails?.ifscCode || 'BKID0008110'}</strong></span>
                              </div>
                            </div>

                            {/* Col 3: Signatory */}
                            <div style={{ width: '40%', padding: '4px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
                              <div style={{ fontSize: '12px' }}>
                                For <strong>{companyDetails?.companyName || 'SRI DURGA ENTERPRISES'}</strong>
                              </div>
                              <div style={{ fontStyle: 'italic', fontSize: '11px', textAlign: 'right' }}>
                                Authorised Signatory
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

          </div>
        </div>

        {/* BOTTOM FIXED ACTION TOOLBAR: Copy Type Interactive Toggle Buttons + Print Button + Close Button */}
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
          {/* Left: Copy Type Toggle Buttons (Original, Duplicate, Office Copy, All 3 Copies) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Copy:
            </span>
            <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.8)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button
                type="button"
                onClick={() => setCopyType('ORIGINAL')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: copyType === 'ORIGINAL' ? 700 : 500,
                  background: copyType === 'ORIGINAL' ? '#4f46e5' : 'transparent',
                  color: copyType === 'ORIGINAL' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setCopyType('DUPLICATE')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: copyType === 'DUPLICATE' ? 700 : 500,
                  background: copyType === 'DUPLICATE' ? '#4f46e5' : 'transparent',
                  color: copyType === 'DUPLICATE' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => setCopyType('OFFICE COPY')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: copyType === 'OFFICE COPY' ? 700 : 500,
                  background: copyType === 'OFFICE COPY' ? '#4f46e5' : 'transparent',
                  color: copyType === 'OFFICE COPY' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Office Copy
              </button>
              <button
                type="button"
                onClick={() => setCopyType('ALL')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: copyType === 'ALL' ? 700 : 500,
                  background: copyType === 'ALL' ? '#10b981' : 'transparent',
                  color: copyType === 'ALL' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                All 3 Copies
              </button>
            </div>
          </div>

          {/* Middle: Item Number Selector Option */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                background: showItemNumber ? 'rgba(79, 70, 229, 0.25)' : 'rgba(30, 41, 59, 0.8)', 
                border: showItemNumber ? '1.5px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.42rem 0.85rem', 
                borderRadius: '8px', 
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease'
              }}
              title="Toggle to Show or Hide Item Number column in Tax Invoice printout"
            >
              <input
                type="checkbox"
                checked={showItemNumber}
                onChange={(e) => {
                  setShowItemNumber(e.target.checked);
                  localStorage.setItem('sri_durga_print_show_item_number', String(e.target.checked));
                }}
                style={{ width: '15px', height: '15px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: showItemNumber ? '#ffffff' : '#94a3b8' }}>
                Item Number
              </span>
            </label>
          </div>

          {/* Right: Print Invoice / Save PDF and Close */}
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
              <span>Print Invoice / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
