// Utility for Direct Chrome Print & Proforma Invoice Generation matching exact format

export function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  const inWords = (n) => {
    let str = '';
    const numStr = ('000000000' + n).slice(-9);
    const crore = parseInt(numStr.substring(0, 2), 10);
    const lakh = parseInt(numStr.substring(2, 4), 10);
    const thousand = parseInt(numStr.substring(4, 6), 10);
    const hundred = parseInt(numStr.substring(6, 7), 10);
    const rest = parseInt(numStr.substring(7, 9), 10);

    if (crore > 0) str += (a[crore] || (b[Math.floor(crore / 10)] + a[crore % 10])) + 'Crore ';
    if (lakh > 0) str += (a[lakh] || (b[Math.floor(lakh / 10)] + a[lakh % 10])) + 'Lakhs ';
    if (thousand > 0) str += (a[thousand] || (b[Math.floor(thousand / 10)] + a[thousand % 10])) + 'Thousand ';
    if (hundred > 0) str += a[hundred] + 'Hundred ';
    if (rest > 0) {
      if (str !== '') str += 'and ';
      str += a[rest] || (b[Math.floor(rest / 10)] + a[rest % 10]);
    }
    return str;
  };

  const words = inWords(num).trim();
  return words ? `(Rupees : ${words} Only)` : '(Rupees : Zero Only)';
}

export function generateProformaInvoicePrintHtml(proforma) {
  if (!proforma) return '';

  const cleanProformaNo = proforma.proformaNumber || 'PC/01/26-27';
  
  let formattedDate = '31-12-2025';
  if (proforma.proformaDate) {
    const d = new Date(proforma.proformaDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    }
  }

  const rawItems = Array.isArray(proforma.items) ? proforma.items : [];
  const items = rawItems.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()) || Number(i.rate) > 0);

  // Subtotal calculation
  const subTotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.quantity) || 1) * (Number(curr.rate) || 0))), 0);

  // GST calculation
  const gstPct = Number(proforma.gstPercent) !== undefined && !isNaN(Number(proforma.gstPercent)) ? Number(proforma.gstPercent) : 18;
  const isIntraState = proforma.customerStateCode && (
    proforma.customerStateCode.toLowerCase().includes('puducherry') || 
    proforma.customerStateCode.includes('34')
  );

  const gstAmount = (subTotal * gstPct) / 100;
  const grossAmount = subTotal + gstAmount;

  const vendorCode = proforma.vendorCode || '840305';
  const poNo = proforma.poNumber || '';
  const gstin = proforma.gstin || '34ABDFS4476N1ZN';
  const pan = proforma.pan || 'ABDFS4476N';
  const epfCode = proforma.epfCode || 'PC 1758';
  const esiCode = proforma.esiCode || '55000426770000602';
  const stateCode = proforma.stateCode || 'Puducherry (34)';
  const sacCode = proforma.sacCode || '995469';

  const customerName = proforma.customerName || 'The Client / Customer';
  const customerPan = proforma.customerPan || '';
  const customerGstin = proforma.customerGstin || '';
  const customerState = proforma.customerStateCode || '';

  // Pagination logic: ~28-30 items per page
  const ITEMS_PER_PAGE_FIRST = 28;
  const ITEMS_PER_PAGE_OTHER = 26;

  const pages = [];
  if (items.length <= 22) {
    // Single page contains everything
    pages.push({ pageNum: 1, totalPages: 1, items: items, isFirst: true, isLast: true, startIdx: 0 });
  } else {
    let currentIdx = 0;
    let pageNum = 1;
    
    // First page
    const firstPageItems = items.slice(0, ITEMS_PER_PAGE_FIRST);
    currentIdx += firstPageItems.length;
    pages.push({ pageNum: 1, items: firstPageItems, isFirst: true, isLast: currentIdx >= items.length, startIdx: 0 });
    
    // Subsequent pages
    while (currentIdx < items.length) {
      pageNum++;
      const nextBatch = items.slice(currentIdx, currentIdx + ITEMS_PER_PAGE_OTHER);
      currentIdx += nextBatch.length;
      pages.push({ pageNum, items: nextBatch, isFirst: false, isLast: currentIdx >= items.length, startIdx: currentIdx - nextBatch.length });
    }

    const totalPages = pages.length;
    pages.forEach(p => { p.totalPages = totalPages; });
  }

  // Calculate running cumulative totals for brought forward / carried over
  let cumulativeSubtotals = [];
  let running = 0;
  pages.forEach((p, pIdx) => {
    const pageSubtotal = p.items.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.quantity) || 1) * (Number(curr.rate) || 0))), 0);
    running += pageSubtotal;
    cumulativeSubtotals.push(running);
  });

  const wordsInRupees = numberToWordsINR(grossAmount);

  // Generate HTML for all pages
  const pagesHtml = pages.map((page, pIdx) => {
    const isFirstPage = page.pageNum === 1;
    const isLastPage = page.pageNum === page.totalPages;
    const carriedOverAmount = cumulativeSubtotals[pIdx];
    const broughtForwardAmount = pIdx > 0 ? cumulativeSubtotals[pIdx - 1] : 0;

    return `
      <div class="invoice-page ${pIdx > 0 ? 'page-break' : ''}">
        <div class="invoice-frame">
          
          <!-- Top Header Title Row -->
          <div class="header-title-row">
            <div class="header-main-title">PROFORMA INVOICE</div>
            <div class="header-copy-type">CUSTOMER ESTIMATE / PROFORMA</div>
          </div>

          <!-- Company Header Section -->
          <div class="company-header-box">
            <div class="logo-box">
              <svg width="48" height="64" viewBox="0 0 100 135" xmlns="http://www.w3.org/2000/svg">
                <line x1="50" y1="10" x2="50" y2="124" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />
                <path d="M 50,14 C 22,14 12,32 12,53 C 12,74 30,81 50,83 C 70,85 86,92 86,108 C 86,122 72,126 50,126 C 28,126 16,118 14,102" 
                      fill="none" stroke="#000000" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="50" cy="14" r="5" fill="#000000" />
                <circle cx="50" cy="83" r="4.5" fill="#000000" />
                <circle cx="14" cy="102" r="4" fill="#000000" />
                <path d="M 50,22 C 34,22 28,34 28,48 C 28,62 38,67 50,68 C 62,69 72,74 72,86 C 72,96 62,100 50,100" 
                      fill="none" stroke="#000000" stroke-width="2.2" stroke-dasharray="3,2" />
                <path d="M 50,28 L 74,48 L 50,68 L 26,48 Z" fill="none" stroke="#000000" stroke-width="1.8" />
                <path d="M 50,72 L 72,88 L 50,104 L 28,88 Z" fill="none" stroke="#000000" stroke-width="1.8" />
                <text x="50" y="52" font-family="'Times New Roman', serif" font-size="11" font-weight="900" fill="#000000" text-anchor="middle">SDE</text>
                <text x="50" y="118" font-family="'Times New Roman', serif" font-size="8" font-weight="bold" fill="#000000" text-anchor="middle">ESTD</text>
              </svg>
            </div>
            <div class="company-text">
              <h1 class="comp-title">SRI DURGA ENTERPRISES</h1>
              <p class="comp-subtitle">Authorised Industrial Tools, Hardware Suppliers & Electrical Contractors</p>
              <p class="comp-address">11, Bharathiyar Road, Karaikal - 609 602 | Ph: 04368-222724, Cell: 98424 92946</p>
              <p class="comp-address">E-mail: sridurgaenterprises@gmail.com | GSTIN: ${gstin}</p>
            </div>
          </div>

          <!-- Metadata 2-Column Grid (Invoice No, Date, Vendor Code, Customer Details) -->
          <div class="meta-section">
            <div class="meta-col-left">
              <div class="meta-row"><span class="lbl">Proforma Invoice No:</span> <span class="val bold-txt">${cleanProformaNo}</span></div>
              <div class="meta-row"><span class="lbl">Dated:</span> <span class="val">${formattedDate}</span></div>
              <div class="meta-row"><span class="lbl">Vendor Code:</span> <span class="val">${vendorCode}</span></div>
              <div class="meta-row"><span class="lbl">PO No / Ref:</span> <span class="val">${poNo || 'N/A'}</span></div>
              <div class="meta-row"><span class="lbl">SAC / HSN Code:</span> <span class="val">${sacCode}</span></div>
            </div>
            <div class="meta-col-right">
              <div class="meta-row"><span class="lbl">Billed To (Customer):</span> <span class="val bold-txt">${customerName}</span></div>
              <div class="meta-row"><span class="lbl">Address:</span> <span class="val">${proforma.customerAddress || 'N/A'}</span></div>
              <div class="meta-row"><span class="lbl">Customer GSTIN:</span> <span class="val bold-txt">${customerGstin || 'N/A'}</span></div>
              <div class="meta-row"><span class="lbl">Customer PAN:</span> <span class="val">${customerPan || 'N/A'}</span></div>
              <div class="meta-row"><span class="lbl">State & Code:</span> <span class="val">${customerState || stateCode}</span></div>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="items-table-wrapper">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;">Sl.No</th>
                  <th style="width: 15%;">Item Code</th>
                  <th style="width: 46%;">Description of Goods / Services</th>
                  <th style="width: 8%;">Qty</th>
                  <th style="width: 8%;">Unit</th>
                  <th style="width: 9%;">Rate (₹)</th>
                  <th style="width: 9%;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${!isFirstPage ? `
                  <tr class="continuation-row">
                    <td colspan="6" style="text-align: right; font-weight: bold; padding: 4px 8px;">Amount Brought Forward from Page ${page.pageNum - 1}:</td>
                    <td style="text-align: right; font-weight: bold; padding: 4px 8px;">₹${broughtForwardAmount.toFixed(2)}</td>
                  </tr>
                ` : ''}
                
                ${page.items.map((item, idx) => {
                  const globalIdx = page.startIdx + idx + 1;
                  const qty = Number(item.quantity) || 1;
                  const rate = Number(item.rate) || 0;
                  const amt = Number(item.amount) || (qty * rate);
                  return `
                    <tr>
                      <td style="text-align: center;">${item.serialNumber || globalIdx}</td>
                      <td style="font-weight: 700; font-family: monospace;">${item.itemCode || '-'}</td>
                      <td style="text-align: left;">${item.description || '-'}</td>
                      <td style="text-align: center;">${qty}</td>
                      <td style="text-align: center;">${item.unit || 'No'}</td>
                      <td style="text-align: right;">${rate.toFixed(2)}</td>
                      <td style="text-align: right; font-weight: 700;">${amt.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}

                ${!isLastPage ? `
                  <tr class="continuation-row">
                    <td colspan="6" style="text-align: right; font-weight: bold; padding: 4px 8px;">Amount Carried Over to Page ${page.pageNum + 1}:</td>
                    <td style="text-align: right; font-weight: bold; padding: 4px 8px;">₹${carriedOverAmount.toFixed(2)}</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          ${isLastPage ? `
            <!-- Financial Totals & Tax Split Section -->
            <div class="totals-section">
              <div class="totals-left">
                <div class="rupees-words-box">
                  <span class="rupees-label">Amount Chargeable (in words):</span>
                  <div class="rupees-text">${wordsInRupees}</div>
                </div>
                <div class="bank-details-box">
                  <div class="bank-title">Bank Account Details for Payment:</div>
                  <div class="bank-row"><span>Account Name:</span> <strong>SRI DURGA ENTERPRISES</strong></div>
                  <div class="bank-row"><span>Account No:</span> <strong>1152135000003056</strong></div>
                  <div class="bank-row"><span>Bank & Branch:</span> <strong>Karur Vysya Bank, Karaikal</strong></div>
                  <div class="bank-row"><span>IFSC Code:</span> <strong>KVBL0001152</strong></div>
                </div>
              </div>
              <div class="totals-right">
                <div class="tot-row">
                  <span class="tot-lbl">Taxable SubTotal:</span>
                  <span class="tot-val">₹${subTotal.toFixed(2)}</span>
                </div>
                ${isIntraState ? `
                  <div class="tot-row">
                    <span class="tot-lbl">CGST / SGST (${(gstPct / 2).toFixed(1)}%):</span>
                    <span class="tot-val">₹${(gstAmount / 2).toFixed(2)}</span>
                  </div>
                  <div class="tot-row">
                    <span class="tot-lbl">UGST (${(gstPct / 2).toFixed(1)}%):</span>
                    <span class="tot-val">₹${(gstAmount / 2).toFixed(2)}</span>
                  </div>
                ` : `
                  <div class="tot-row">
                    <span class="tot-lbl">IGST (${gstPct}%):</span>
                    <span class="tot-val">₹${gstAmount.toFixed(2)}</span>
                  </div>
                `}
                <div class="tot-row grand-total-row">
                  <span class="tot-lbl">Gross Total (₹):</span>
                  <span class="tot-val">₹${grossAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Terms & Signature Box -->
            <div class="footer-sign-section">
              <div class="terms-box">
                <div style="font-weight: bold; text-decoration: underline; margin-bottom: 2px;">Terms & Conditions:</div>
                <ol style="margin: 0; padding-left: 14px; font-size: 8pt;">
                  <li>This is a Proforma Estimate issued for advance processing & procurement.</li>
                  <li>Goods once sold will not be taken back or exchanged.</li>
                  <li>Subject to Karaikal Jurisdiction.</li>
                </ol>
              </div>
              <div class="sign-box">
                <div style="font-weight: 800; font-size: 8.5pt;">For SRI DURGA ENTERPRISES</div>
                <div style="height: 45px;"></div>
                <div style="font-weight: bold; border-top: 1px dashed #000; padding-top: 2px; font-size: 8pt;">Authorised Signatory</div>
              </div>
            </div>
          ` : `
            <div style="text-align: right; font-size: 8pt; font-weight: bold; padding: 6px 10px;">
              Continued on Page ${page.pageNum + 1}...
            </div>
          `}

          <!-- Page Number Footer -->
          <div class="page-footer">
            Page ${page.pageNum} of ${page.totalPages}
          </div>

        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proforma Invoice - ${cleanProformaNo} - Sri Durga Enterprises</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 8mm 8mm 8mm 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          color: #000000;
          background: #ffffff;
          font-size: 9pt;
          line-height: 1.25;
        }
        .invoice-page {
          width: 100%;
          min-height: 275mm;
          padding: 0;
          margin: 0 auto;
          page-break-after: always;
          display: flex;
          flex-direction: column;
        }
        .page-break {
          page-break-before: always;
        }
        .invoice-frame {
          border: 1.5px solid #000000;
          padding: 8px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .header-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid #000000;
          padding-bottom: 4px;
          margin-bottom: 6px;
        }
        .header-main-title {
          font-size: 13pt;
          font-weight: 900;
          letter-spacing: 0.08em;
        }
        .header-copy-type {
          font-size: 8pt;
          font-weight: 800;
          padding: 2px 6px;
          border: 1px solid #000000;
          background: #f1f5f9;
        }
        .company-header-box {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1.5px solid #000000;
          padding-bottom: 6px;
          margin-bottom: 6px;
        }
        .comp-title {
          font-size: 15pt;
          font-weight: 900;
          margin: 0 0 2px 0;
          letter-spacing: 0.03em;
        }
        .comp-subtitle {
          font-size: 8pt;
          font-weight: 700;
          margin: 0 0 2px 0;
          color: #1e293b;
        }
        .comp-address {
          font-size: 7.5pt;
          margin: 0 0 1px 0;
          color: #334155;
        }
        .meta-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          border-bottom: 1.5px solid #000000;
          padding-bottom: 6px;
          margin-bottom: 6px;
          font-size: 8.5pt;
        }
        .meta-row {
          display: flex;
          margin-bottom: 2px;
        }
        .lbl {
          font-weight: 700;
          width: 130px;
          flex-shrink: 0;
          color: #1e293b;
        }
        .val {
          flex: 1;
        }
        .bold-txt {
          font-weight: 800;
        }
        .items-table-wrapper {
          flex: 1;
          margin-bottom: 6px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8pt;
        }
        .items-table th, .items-table td {
          border: 1px solid #000000;
          padding: 4px 6px;
        }
        .items-table th {
          background: #f1f5f9;
          font-weight: 800;
          text-align: center;
        }
        .continuation-row td {
          background: #f8fafc;
        }
        .totals-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 8px;
          border: 1.5px solid #000000;
          margin-bottom: 6px;
          padding: 6px;
          font-size: 8pt;
        }
        .rupees-words-box {
          margin-bottom: 6px;
        }
        .rupees-label {
          font-weight: 800;
          text-decoration: underline;
        }
        .rupees-text {
          font-style: italic;
          font-weight: 700;
          margin-top: 2px;
        }
        .bank-details-box {
          font-size: 7.5pt;
          background: #f8fafc;
          padding: 4px 6px;
          border: 1px dashed #64748b;
        }
        .bank-title {
          font-weight: 800;
          margin-bottom: 2px;
        }
        .bank-row {
          display: flex;
          justify-content: space-between;
        }
        .totals-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
        }
        .tot-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 4px;
        }
        .tot-lbl {
          font-weight: 700;
        }
        .tot-val {
          font-weight: 800;
        }
        .grand-total-row {
          border-top: 1.5px solid #000000;
          border-bottom: 1.5px solid #000000;
          padding: 4px;
          font-size: 9.5pt;
          background: #f1f5f9;
        }
        .footer-sign-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 8px;
          border: 1.5px solid #000000;
          padding: 6px;
        }
        .sign-box {
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .page-footer {
          text-align: center;
          font-size: 7.5pt;
          font-weight: bold;
          margin-top: 4px;
        }
      </style>
    </head>
    <body>
      ${pagesHtml}
    </body>
    </html>
  `;
}

export function printProformaInvoiceDirect(proforma) {
  const html = generateProformaInvoicePrintHtml(proforma);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  }
}
