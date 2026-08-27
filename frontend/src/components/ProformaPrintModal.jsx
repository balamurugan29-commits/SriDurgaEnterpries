import React, { useState, useEffect } from 'react';
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

export const ProformaPrintModal = ({ isOpen, onClose, proforma }) => {
  const [copyType, setCopyType] = useState('ORIGINAL'); // 'ORIGINAL', 'DUPLICATE', 'OFFICE COPY', 'ALL'

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

  if (!isOpen || !proforma) return null;

  // Ultra-reliable Print Handler: Opens a clean dedicated print window
  const handlePrint = () => {
    const printArea = document.getElementById('proforma-invoice-print-area');
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
            <title>Proforma Invoice - ${proforma.proformaNumber || 'Sri Durga Enterprises'}</title>
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
                font-size: 12px;
              }
              #proforma-invoice-print-area {
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

  const invoiceNo = proforma.proformaNumber || 'PC/01/26-27';
  const formattedDate = proforma.proformaDate
    ? new Date(proforma.proformaDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  const items = proforma.items || [];

  // Calculate total amount from all items
  const subTotal = items.reduce(
    (sum, i) => sum + (Number(i.amount) || (Number(i.quantity || 0) * Number(i.rate || 0))),
    0
  );

  const gstPercent = Number(proforma.gstPercent !== undefined ? proforma.gstPercent : 18);
  const halfGst = gstPercent / 2;

  // GST Calculation Rule:
  // If Customer GSTIN starts with '34' (or not specified), use CGST + UGST/SGST
  // If Customer GSTIN starts with anything else (<34 or >34 e.g. 33, 29, 27), use IGST
  const customerGstPrefix = (proforma.customerGstin || '').trim().substring(0, 2);
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

  // Full A4 Page Utilization Chunking Logic
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
          #proforma-invoice-print-area, #proforma-invoice-print-area * {
            visibility: visible !important;
          }
          #proforma-invoice-print-area {
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
          border: '1.5px solid rgba(56, 189, 248, 0.4)', 
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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
                Proforma Invoice Preview & Print ({pages.length} {pages.length > 1 ? 'Pages' : 'Page'})
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
          <div id="proforma-invoice-print-area" style={{ background: '#fff', width: '100%', maxWidth: '820px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)' }}>

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
                      {/* 1. HEADER SECTION (Page 1 has full 9 rows; Page 2+ has concise 2 rows) */}
                      <div style={{ flexShrink: 0 }}>
                        {/* Company Header Box */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #000', position: 'relative' }}>
                          {/* Left: Logo Box with Border */}
                          <div style={{ width: '85px', minWidth: '85px', borderRight: '1px solid #000', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/logo.jpg" alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                          </div>

                          {/* Center: Title & Company Info */}
                          <div style={{ flex: 1, padding: '4px 8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '1px', marginBottom: '2px' }}>
                              PROFORMA INVOICE
                            </div>
                            <h1 style={{ fontSize: '19px', fontWeight: '900', margin: '2px 0', letterSpacing: '3px', fontFamily: 'Arial, sans-serif' }}>
                              SRI &nbsp; DURGA &nbsp; ENTERPRISES
                            </h1>
                            <p style={{ margin: '1px 0', fontSize: '12px', fontWeight: '600' }}>
                              No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602
                            </p>
                            {/* Page 1 includes Email & Cell */}
                            {isFirstPage && (
                              <p style={{ margin: '1px 0', fontSize: '12px', fontWeight: '600' }}>
                                E-mail : sridurgaenterprises@yahoo.com &nbsp;&nbsp; Cell: 9842492946
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
                            {/* Row 1: Invoice No & Date with Light Shading Background (Present on ALL Pages) */}
                            <tr style={{ background: '#dce4dc', borderBottom: '1px solid #000' }}>
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

                            {/* Row 2: Contract No & Page (Present on ALL Pages) */}
                            <tr style={{ borderBottom: isFirstPage ? '1px solid #000' : 'none' }}>
                              <td style={{ padding: '4px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                Contract No.
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                {proforma.contractNo || '9010038288'}
                              </td>
                              <td style={{ padding: '4px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                Page
                              </td>
                              <td style={{ padding: '4px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                {pageIdx + 1} of {pages.length}
                              </td>
                            </tr>

                            {/* Rows 3 to 9: Rendered ONLY on Page 1 */}
                            {isFirstPage && (
                              <>
                                {/* Row 3: C. Period & Vendor Code */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    C. Period
                                  </td>
                                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {proforma.contractPeriod || '01.05.2024 to 30.04.2027'}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    Vendor Code
                                  </td>
                                  <td style={{ padding: '3px 6px', fontSize: '12px' }}>
                                    {proforma.vendorCode || '840305'}
                                  </td>
                                </tr>

                                {/* Row 4: P.O. No. & GSTIN */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    P.O. No.
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {proforma.poNumber || '5060173862'}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    GSTIN
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                    {proforma.gstin || '34ABDFS4476N1ZN'}
                                  </td>
                                </tr>

                                {/* Row 5: B.G. NO. & PAN */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    B.G. NO.
                                  </td>
                                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {proforma.bgNo || '8110IPEBG240001 Validity Upto : 30.09.2027'}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    PAN
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', fontSize: '12px' }}>
                                    {proforma.pan || 'ABDFS4476N'}
                                  </td>
                                </tr>

                                {/* Row 6: EPF Code & State Code */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    EPF Code
                                  </td>
                                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {proforma.epfCode || 'PC 1758'}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    State Code
                                  </td>
                                  <td style={{ padding: '3px 6px', fontSize: '12px' }}>
                                    {proforma.stateCode || 'Puducherry (34)'}
                                  </td>
                                </tr>

                                {/* Row 7: ESI CODE & Invoice Value */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    ESI CODE
                                  </td>
                                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {proforma.esiCode || '55000426770000602'}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    Invoice Value
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: '900', fontSize: '12.5px' }}>
                                    Rs. {grossAmount.toFixed(2)}
                                  </td>
                                </tr>

                                {/* Row 8: BILLED TO & PAN */}
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px', verticalAlign: 'top' }}>
                                    BILLED TO
                                  </td>
                                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{proforma.customerName || 'The G.M (Electrical), Surface Team , ONGC, Tamilnadu.'}</div>
                                    {proforma.customerAddress && (
                                      <div style={{ fontSize: '11px', color: '#111827', marginTop: '1px' }}>
                                        {proforma.customerAddress}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px', verticalAlign: 'top' }}>
                                    PAN
                                  </td>
                                  <td style={{ padding: '3px 6px', fontSize: '12px', verticalAlign: 'top', fontWeight: 'bold' }}>
                                    {proforma.customerPan || 'AAACO1598A'}
                                  </td>
                                </tr>

                                {/* Row 9: GST & State Code */}
                                <tr>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    GST
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    {proforma.customerGstin || '33AAACO1598A1ZU'}
                                  </td>
                                  <td style={{ padding: '3px 6px', fontWeight: 'bold', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    State Code
                                  </td>
                                  <td style={{ padding: '3px 6px', fontSize: '12px' }}>
                                    {proforma.customerStateCode || 'TAMILNADU (33)'}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* 2. BODY / LINE ITEMS SECTION (Grows to fill page) */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: 0 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #000', borderTop: 'none', background: '#ffffff' }}>
                              <th style={{ width: '5%', padding: '4px 2px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                Sl.No.
                              </th>
                              {hasAnyItemCode && (
                                <th style={{ width: '10%', padding: '4px 4px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                  Item No.
                                </th>
                              )}
                              <th style={{ width: hasAnyItemCode ? '53%' : '63%', padding: '4px 6px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                Description
                              </th>
                              <th style={{ width: '10%', padding: '4px 4px', borderRight: '1px solid #000', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                                Rate
                              </th>
                              <th style={{ width: '6%', padding: '4px 2px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                Qty
                              </th>
                              <th style={{ width: '16%', padding: '4px 6px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Page 2+: Show Amount Brought Forward at top */}
                            {!isFirstPage && (
                              <tr style={{ borderBottom: '1px solid #000', background: '#f8fafc' }}>
                                <td style={{ padding: '3px', borderRight: '1px solid #000', textAlign: 'center' }}>-</td>
                                {hasAnyItemCode && <td style={{ padding: '3px', borderRight: '1px solid #000' }}>-</td>}
                                <td style={{ padding: '3px 6px', borderRight: '1px solid #000', fontWeight: 'bold', fontSize: '12px' }}>
                                  Amount Brought Forward from Page {pageIdx}
                                </td>
                                <td style={{ padding: '3px', borderRight: '1px solid #000' }}></td>
                                <td style={{ padding: '3px', borderRight: '1px solid #000' }}></td>
                                <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                                  {bForward.toFixed(2)}
                                </td>
                              </tr>
                            )}

                            {/* Line Items */}
                            {pageItems.map((item, itemIdx) => {
                              const qty = Number(item.quantity) || 1;
                              const rate = Number(item.rate) || 0;
                              const amt = Number(item.amount) || (qty * rate);

                              return (
                                <tr key={itemIdx} style={{ verticalAlign: 'top' }}>
                                  <td style={{ padding: '3px 2px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>
                                    {item.serialNumber || (itemIdx + 1)}
                                  </td>
                                  {hasAnyItemCode && (
                                    <td style={{ padding: '3px 4px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                      {item.itemCode && item.itemCode.toUpperCase() !== 'CUSTOM' ? item.itemCode : ''}
                                    </td>
                                  )}
                                  <td style={{ padding: '3px 6px', borderRight: '1px solid #000', textAlign: 'left', fontSize: '12px', lineHeight: '1.25' }}>
                                    {item.description}
                                  </td>
                                  <td style={{ padding: '3px 4px', borderRight: '1px solid #000', textAlign: 'right', fontSize: '12px' }}>
                                    {rate.toFixed(2)}
                                  </td>
                                  <td style={{ padding: '3px 2px', borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px' }}>
                                    {qty}
                                  </td>
                                  <td style={{ padding: '3px 6px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>
                                    {amt.toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* 3. FOOTER / TOTALS SECTION */}
                      <div style={{ flexShrink: 0 }}>
                        {/* If NOT the last page: Print Subtotal and Carried Over line */}
                        {!isLastPage && (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', borderTop: '1px solid #000' }}>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid #000', background: '#f8fafc' }}>
                                <td style={{ width: hasAnyItemCode ? '68%' : '78%', padding: '4px 6px', borderRight: '1px solid #000', fontWeight: 'bold', textAlign: 'right' }}>
                                  Page {pageIdx + 1} Total:
                                </td>
                                <td style={{ width: '6%', borderRight: '1px solid #000' }}></td>
                                <td style={{ width: '16%', padding: '4px 6px', textAlign: 'right', fontWeight: 'bold' }}>
                                  {pTotal.toFixed(2)}
                                </td>
                              </tr>
                              <tr style={{ background: '#dce4dc' }}>
                                <td style={{ width: hasAnyItemCode ? '68%' : '78%', padding: '4px 6px', borderRight: '1px solid #000', fontWeight: '900', textAlign: 'right' }}>
                                  Amount Carried Over to Page {pageIdx + 2}:
                                </td>
                                <td style={{ width: '6%', borderRight: '1px solid #000' }}></td>
                                <td style={{ width: '16%', padding: '4px 6px', textAlign: 'right', fontWeight: '900' }}>
                                  {(bForward + pTotal).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* If LAST PAGE: Print Final Full Tax Invoice Footer Table with GST & Signatures */}
                        {isLastPage && (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: 0, borderTop: '1px solid #000' }}>
                            <tbody>
                              {/* Total Amount Line */}
                              <tr style={{ borderBottom: '1px solid #000' }}>
                                <td style={{ width: hasAnyItemCode ? '68%' : '78%', padding: '3px 6px', borderRight: '1px solid #000', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                                  Total Amount
                                </td>
                                <td style={{ width: '6%', borderRight: '1px solid #000' }}></td>
                                <td style={{ width: '16%', padding: '3px 6px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                                  {subTotal.toFixed(2)}
                                </td>
                              </tr>

                              {/* SAC Code & GST Breakdown */}
                              {isIntraState ? (
                                <>
                                  <tr style={{ borderBottom: '1px solid #000' }}>
                                    <td style={{ padding: '2px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                      SAC CODE : {proforma.sacCode || '995469'}
                                    </td>
                                    <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                      CGST
                                    </td>
                                    <td style={{ padding: '2px 6px', textAlign: 'right', fontSize: '12px' }}>
                                      {halfGst}% &nbsp;&nbsp;&nbsp; {cgst.toFixed(2)}
                                    </td>
                                  </tr>
                                  <tr style={{ borderBottom: '1px solid #000' }}>
                                    <td style={{ padding: '2px 6px', borderRight: '1px solid #000', fontSize: '12px' }}></td>
                                    <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                      SGST / UGST
                                    </td>
                                    <td style={{ padding: '2px 6px', textAlign: 'right', fontSize: '12px' }}>
                                      {halfGst}% &nbsp;&nbsp;&nbsp; {sgst.toFixed(2)}
                                    </td>
                                  </tr>
                                </>
                              ) : (
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                  <td style={{ padding: '2px 6px', borderRight: '1px solid #000', fontSize: '12px' }}>
                                    SAC CODE : {proforma.sacCode || '995469'}
                                  </td>
                                  <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                    IGST
                                  </td>
                                  <td style={{ padding: '2px 6px', textAlign: 'right', fontSize: '12px' }}>
                                    {gstPercent}% &nbsp;&nbsp;&nbsp; {igst.toFixed(2)}
                                  </td>
                                </tr>
                              )}

                              {/* Gross Total */}
                              <tr style={{ borderBottom: '1px solid #000', background: '#dce4dc' }}>
                                <td style={{ padding: '3px 6px', borderRight: '1px solid #000', textAlign: 'right', fontWeight: '900', fontSize: '12.5px' }}>
                                  GROSS TOTAL
                                </td>
                                <td style={{ borderRight: '1px solid #000' }}></td>
                                <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: '900', fontSize: '13px' }}>
                                  {grossAmount.toFixed(2)}
                                </td>
                              </tr>

                              {/* Amount in Words */}
                              <tr style={{ borderBottom: '1px solid #000' }}>
                                <td colSpan={3} style={{ padding: '4px 6px', fontSize: '12px', fontWeight: 'bold' }}>
                                  {amountInWords}
                                </td>
                              </tr>

                              {/* Bank Details & Signature Section */}
                              <tr>
                                <td style={{ padding: '4px 6px', borderRight: '1px solid #000', fontSize: '11px', lineHeight: '1.3' }}>
                                  <div>Bank Account Details for Payment:</div>
                                  <div>Account Name: <strong>SRI DURGA ENTERPRISES</strong></div>
                                  <div>Account No: <strong>1152135000003056</strong> &nbsp;&nbsp; IFSC: <strong>KVBL0001152</strong></div>
                                  <div>Bank: <strong>Karur Vysya Bank, Karaikal</strong></div>
                                </td>
                                <td colSpan={2} style={{ padding: '4px 6px', textAlign: 'center', verticalAlign: 'bottom', fontSize: '12px' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>For SRI DURGA ENTERPRISES</div>
                                  <div style={{ height: '35px' }}></div>
                                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>Authorised Signatory</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

          </div>
        </div>

        {/* BOTTOM ACTION BAR: Clean Multi-Copy Selector + Direct Print Button */}
        <div 
          style={{ 
            padding: '0.75rem 1.25rem', 
            background: 'rgba(15, 23, 42, 0.98)', 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '0.75rem',
            flexShrink: 0 
          }}
        >
          {/* Copy Selector Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginRight: '0.2rem' }}>
              COPY:
            </span>
            {[
              { id: 'ORIGINAL', label: 'Original' },
              { id: 'DUPLICATE', label: 'Duplicate' },
              { id: 'OFFICE COPY', label: 'Office Copy' },
              { id: 'ALL', label: 'All 3 Copies' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCopyType(tab.id)}
                className="btn btn-outline"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: copyType === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: copyType === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: copyType === tab.id ? '#38bdf8' : '#cbd5e1',
                  fontWeight: copyType === tab.id ? 800 : 500
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button 
              onClick={onClose} 
              className="btn btn-outline" 
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Close
            </button>
            <button 
              onClick={handlePrint} 
              className="btn btn-primary" 
              style={{ 
                fontSize: '0.85rem', 
                padding: '0.5rem 1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Printer size={16} />
              <span>Print Invoice / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
