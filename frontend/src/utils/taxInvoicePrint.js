// Utility for Direct Chrome Print & Tax Invoice Generation matching exact format

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

export function generateTaxInvoicePrintHtml(challan) {
  if (!challan) return '';

  const cleanChallanNo = challan.challanNumber ? String(challan.challanNumber).replace(/^SD-TAX-/, '') : '01/26-27';
  
  let formattedDate = '31-12-2025';
  if (challan.challanDate) {
    const d = new Date(challan.challanDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    }
  }

  const rawItems = Array.isArray(challan.items) ? challan.items : [];
  const items = rawItems.filter(i => (i.itemCode && i.itemCode.trim()) || (i.description && i.description.trim()) || Number(i.rate) > 0);

  // Subtotal calculation
  const subTotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || ((Number(curr.quantity) || 1) * (Number(curr.rate) || 0))), 0);

  // GST calculation
  const gstPct = Number(challan.gstPercent) !== undefined && !isNaN(Number(challan.gstPercent)) ? Number(challan.gstPercent) : 18;
  const isIntraState = challan.customerStateCode && (
    challan.customerStateCode.toLowerCase().includes('puducherry') || 
    challan.customerStateCode.includes('34')
  );

  const gstAmount = (subTotal * gstPct) / 100;
  const grossAmount = subTotal + gstAmount;

  const contractNo = challan.contractNo || challan.poNumber || '9010038288';
  const contractPeriod = challan.contractPeriod || '01.05.2024 to 30.04.2027';
  const vendorCode = challan.vendorCode || '840305';
  const poNo = challan.poNumber || '5060173862';
  const bgNo = challan.bgNo || '8110IPEBG240001  Validity Upto : 30.09.2027';
  const gstin = challan.gstin || '34ABDFS4476N1ZN';
  const pan = challan.pan || 'ABDFS4476N';
  const epfCode = challan.epfCode || 'PC 1758';
  const esiCode = challan.esiCode || '55000426770000602';
  const stateCode = challan.stateCode || 'Puducherry (34)';
  const sacCode = challan.sacCode || '995469';

  const customerName = challan.customerName || 'The G.M (Electrical), Surface Team , ONGC, Tamilnadu.';
  const customerPan = challan.customerPan || 'AAACO1598A';
  const customerGstin = challan.customerGstin || '33AAACO1598A1ZU';
  const customerState = challan.customerStateCode || 'TAMILNADU (33)';

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

    // Set totalPages on all pages
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
            <div class="header-main-title">TAX INVOICE</div>
            <div class="header-copy-type">OFFICE COPY</div>
          </div>

          <!-- Company Header Section -->
          <div class="company-header-box">
            <div class="logo-box">
              <svg width="48" height="64" viewBox="0 0 100 135" xmlns="http://www.w3.org/2000/svg">
                <!-- Central vertical axis line -->
                <line x1="50" y1="10" x2="50" y2="124" stroke="#000000" stroke-width="2.8" stroke-linecap="round" />
                
                <!-- Main outer stylized SDE contour -->
                <path d="M 50,14 C 22,14 12,32 12,53 C 12,74 30,81 50,83 C 70,85 86,92 86,108 C 86,122 72,126 50,126 C 28,126 16,118 14,102" 
                      fill="none" stroke="#000000" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                
                <!-- Upper left interior loop -->
                <path d="M 50,26 C 28,26 20,38 20,53 C 20,68 30,75 50,77" 
                      fill="none" stroke="#000000" stroke-width="2.6" stroke-linecap="round" />
                
                <!-- Central circle and core dot -->
                <circle cx="50" cy="53" r="8" fill="none" stroke="#000000" stroke-width="2.2" />
                <circle cx="50" cy="53" r="2.5" fill="#000000" />
                
                <!-- Right upper accent loop -->
                <path d="M 50,26 C 68,26 78,38 78,50 C 78,60 65,68 50,72" 
                      fill="none" stroke="#000000" stroke-width="2.4" stroke-linecap="round" />
              </svg>
            </div>
            <div class="company-info">
              <div class="company-name">SRI &nbsp; DURGA &nbsp; ENTERPRISES</div>
              <div class="company-address">No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602</div>
              <div class="company-contacts">E-mail : sridurgaenterprises@yahoo.com &nbsp;&nbsp; Cell: 9842492946</div>
            </div>
          </div>

          <!-- Metadata Table Grid -->
          <table class="meta-table">
            <tbody>
              <tr class="meta-row-highlight" style="background-color: #dbe2ea !important;">
                <td style="width: 15%; font-weight: 700;">Invoice No.</td>
                <td style="width: 45%; font-weight: 800; font-size: 13px;">${cleanChallanNo}</td>
                <td style="width: 15%; font-weight: 700;">Date :</td>
                <td style="width: 25%; font-weight: 800; font-size: 13px;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Contract No.</td>
                <td>${contractNo || '-'}</td>
                <td style="font-weight: 700;">Page</td>
                <td style="font-weight: 700;">${page.pageNum} of ${page.totalPages}</td>
              </tr>
              ${isFirstPage ? `
                <tr>
                  <td style="font-weight: 700;">Contract Period (C. Period)</td>
                  <td>${contractPeriod}</td>
                  <td style="font-weight: 700;">Vendor Code</td>
                  <td>${vendorCode || '-'}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">P.O. No.</td>
                  <td style="font-weight: 700;">${poNo || 'NA'} ${challan.poDate ? `Dt: ${new Date(challan.poDate).toLocaleDateString('en-GB')}` : ''}</td>
                  <td style="font-weight: 700;">GSTIN</td>
                  <td style="font-weight: 800;">${gstin}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">B.G. Number & Validity</td>
                  <td>${bgNo}</td>
                  <td style="font-weight: 700;">PAN</td>
                  <td style="font-weight: 800;">${pan}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">EPF Code</td>
                  <td>${epfCode}</td>
                  <td style="font-weight: 700;">State Code</td>
                  <td>${stateCode}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">ESI CODE</td>
                  <td>${esiCode}</td>
                  <td style="font-weight: 700;">Invoice Value</td>
                  <td style="font-weight: 800;">Rs. ${grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="meta-row-billed" style="background-color: #dbe2ea !important;">
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">BILLED TO</td>
                  <td style="font-weight: 700; line-height: 1.3; background-color: #dbe2ea !important;">
                    <div style="font-weight: 800;">${customerName}</div>
                    ${challan.customerAddress ? `<div style="font-weight: 400; font-size: 11px;">${challan.customerAddress}</div>` : ''}
                    ${challan.customerPhone ? `<div style="font-weight: 400; font-size: 11px;">Phone: ${challan.customerPhone}</div>` : ''}
                  </td>
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">PAN</td>
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">${customerPan || '-'}</td>
                </tr>
                <tr class="meta-row-billed" style="background-color: #dbe2ea !important;">
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">GST</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">${customerGstin || '-'}</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">State Code</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">${customerState}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <!-- Line Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 42px; text-align: center;">Sl.No.</th>
                <th style="width: 75px; text-align: center;">Item No.</th>
                <th style="text-align: center;">Description</th>
                <th style="width: 85px; text-align: center;">Rate</th>
                <th style="width: 60px; text-align: center;">Qty</th>
                <th style="width: 105px; text-align: center;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <!-- Brought Forward Row for subsequent pages -->
              ${!isFirstPage ? `
                <tr class="brought-forward-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="text-align: center; font-weight: 800; font-style: italic;">Brought Forward (Page ${page.pageNum - 1})</td>
                  <td style="text-align: right;"></td>
                  <td style="text-align: center;"></td>
                  <td style="text-align: right; font-weight: 800;">${broughtForwardAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ''}

              <!-- Page Items -->
              ${page.items.map((it, idx) => {
                const itemSl = page.startIdx + idx + 1;
                const itemCode = it.itemCode && it.itemCode !== 'CUSTOM' ? it.itemCode : '-';
                const desc = it.description || '';
                const rate = Number(it.rate) || 0;
                const qty = Number(it.quantity) || 1;
                const unit = it.unit || (qty === 1 ? 'No' : 'Nos');
                const amt = Number(it.amount) || (qty * rate);

                const qtyDisplay = `${qty} ${unit}`;

                return `
                  <tr>
                    <td style="text-align: center; vertical-align: top;">${it.serialNumber || itemSl}</td>
                    <td style="text-align: center; vertical-align: top; font-weight: 600;">${itemCode}</td>
                    <td style="text-align: left; vertical-align: top; line-height: 1.35; white-space: pre-line;">${desc}</td>
                    <td style="text-align: right; vertical-align: top;">${rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style="text-align: center; vertical-align: top; white-space: nowrap; font-weight: 600;">${qtyDisplay}</td>
                    <td style="text-align: right; vertical-align: top; font-weight: 600;">${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                `;
              }).join('')}

              <!-- Intermediate Carried Over Row (if not last page) -->
              ${!isLastPage ? `
                <tr class="carried-over-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="text-align: center; font-weight: 800;">Page - ${page.pageNum} Total</td>
                  <td style="text-align: right;"></td>
                  <td style="text-align: center;"></td>
                  <td style="text-align: right; font-weight: 800;">${carriedOverAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ''}

              <!-- Sub-Total (Only on Last Page) -->
              ${isLastPage ? `
                <tr class="summary-row-subtotal" style="border-top: 1.5px solid #000;">
                  <td colspan="5" style="text-align: right; font-style: italic; font-weight: 700; padding: 4px 12px;">Total</td>
                  <td style="text-align: right; font-weight: 700;">${subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <!-- Final Calculation & Footer Blocks (Only on Last Page) -->
          ${isLastPage ? `
            <div style="border-top: 1.5px solid #000; display: flex; font-size: 11.5px; border-bottom: 1px solid #000;">
              <!-- Left: SAC Code & Words -->
              <div style="flex: 1; border-right: 1px solid #000; padding: 4px 8px; display: flex; flexDirection: column; justify-content: space-between;">
                <div style="font-weight: 700; font-size: 11.5px;">
                  SAC Code : ${sacCode || '995464'}, GST : ${gstPct}%
                </div>
                <div style="font-style: italic; font-weight: 700; font-size: 11px; margin-top: 6px;">
                  ${wordsInRupees}
                </div>
              </div>

              <!-- Right: Tax Breakdown & Gross Amount -->
              <div style="width: 255px; display: flex; flex-direction: column;">
                ${isIntraState ? `
                  <div style="display: flex; justify-content: space-between; padding: 3px 8px; border-bottom: 1px solid #000; font-style: italic; font-size: 11.5px;">
                    <span>CGST @ ${gstPct / 2}%</span>
                    <span style="font-weight: 600;">${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 3px 8px; border-bottom: 1px solid #000; font-style: italic; font-size: 11.5px;">
                    <span>SGST @ ${gstPct / 2}%</span>
                    <span style="font-weight: 600;">${(gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ` : `
                  <div style="display: flex; justify-content: space-between; padding: 3px 8px; border-bottom: 1px solid #000; font-style: italic; font-size: 11.5px;">
                    <span>IGST @ ${gstPct}%</span>
                    <span style="font-weight: 600;">${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                `}
                <div style="display: flex; justify-content: space-between; padding: 4px 8px; font-weight: 700; font-size: 12px;">
                  <span>GROSS AMOUNT</span>
                  <span>Rs. ${grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <!-- Footer: E & O.E, Bank Account Details, Signatory -->
            <div style="display: flex; font-size: 11px; min-height: 80px;">
              <div style="width: 15%; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; padding: 4px;">
                <u style="font-weight: 700; font-size: 11.5px;">E & O.E</u>
              </div>
              <div style="width: 45%; border-right: 1px solid #000; padding: 4px 8px; line-height: 1.4;">
                <div style="font-weight: 700; text-decoration: underline; margin-bottom: 2px;">Bank Account Details</div>
                <div>Bank Name &nbsp;&nbsp;: Bank of India</div>
                <div>Account No. : <strong>811030100000006</strong></div>
                <div>Branch &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: Karaikal</div>
                <div>IFSC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>BKID0008110</strong></div>
              </div>
              <div style="width: 40%; padding: 4px 10px; display: flex; flex-direction: column; justify-content: space-between; text-align: right;">
                <div style="font-size: 11.5px;">For <strong>SRI DURGA ENTERPRISES</strong></div>
                <div style="font-style: italic; font-size: 10.5px;">Authorised Signatory</div>
              </div>
            </div>
          ` : `
            <!-- Footer continuation indicator for page 1 -->
            <div class="page-footer-conti">
              <em>Conti...</em>
            </div>
          `}

        </div>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Tax Invoice - ${cleanChallanNo} - Sri Durga Enterprises</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: #ffffff;
            color: #000000;
            font-size: 11.5px;
            line-height: 1.25;
          }

          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }

          .invoice-page {
            width: 100%;
            background: #ffffff;
            page-break-inside: avoid;
          }

          .page-break {
            page-break-before: always;
            margin-top: 15px;
          }

          .invoice-frame {
            border: 2px solid #000000;
            background: #ffffff;
            width: 100%;
            display: flex;
            flex-direction: column;
          }

          /* Header Section */
          .header-title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 4px 10px;
            border-bottom: 1.5px solid #000000;
          }

          .header-main-title {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-decoration: underline;
          }

          .header-copy-type {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 10.5px;
            font-weight: 800;
            letter-spacing: 0.04em;
          }

          .company-header-box {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-bottom: 1.5px solid #000000;
          }

          .logo-box {
            width: 65px;
            height: 72px;
            border: 1.5px solid #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
          }

          .company-info {
            flex: 1;
            text-align: center;
          }

          .company-name {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 0.12em;
            color: #000000;
            margin-bottom: 3px;
          }

          .company-address {
            font-size: 10.5px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 2px;
          }

          .company-contacts {
            font-size: 10px;
            font-weight: 600;
            color: #111827;
          }

          /* Metadata Table */
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            border-bottom: 1.5px solid #000000;
          }

          .meta-table td {
            border: 1px solid #000000;
            padding: 3px 6px;
            font-size: 11px;
            vertical-align: middle;
          }

          .meta-row-highlight,
          .meta-row-highlight td {
            background-color: #dbe2ea !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .meta-row-billed,
          .meta-row-billed td {
            background-color: #dbe2ea !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Items Table */
          .items-table {
            width: 100%;
            border-collapse: collapse;
          }

          .items-table th {
            border: 1px solid #000000;
            padding: 4px 6px;
            font-size: 11px;
            font-weight: 800;
            background-color: #ffffff;
            text-transform: capitalize;
          }

          .items-table td {
            border: 1px solid #000000;
            padding: 3.5px 6px;
            font-size: 10.5px;
          }

          .brought-forward-row td,
          .carried-over-row td {
            background-color: #f9fafb !important;
            padding: 4px 6px;
          }

          .summary-row-subtotal td,
          .summary-row-tax td,
          .summary-row-gross td {
            border: 1px solid #000000;
            padding: 4px 6px;
          }

          .summary-row-gross {
            background-color: #ffffff;
          }

          /* Declaration Block */
          .declaration-box {
            border-top: 1.5px solid #000000;
            padding: 6px 12px;
            text-align: center;
          }

          .declaration-heading {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.05em;
            margin-bottom: 2px;
          }

          .declaration-text {
            font-size: 9.5px;
            font-style: italic;
            line-height: 1.3;
          }

          /* Signature Block */
          .signature-box {
            border-top: 1px solid #000000;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 8px 16px 10px 16px;
          }

          .sig-left {
            font-size: 11px;
            font-weight: 700;
          }

          .sig-right {
            text-align: right;
          }

          .sig-company {
            font-size: 11.5px;
            margin-bottom: 35px;
          }

          .sig-space {
            height: 25px;
          }

          .sig-designation {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.05em;
          }

          .page-footer-conti {
            text-align: right;
            padding: 4px 12px;
            font-size: 11px;
            font-weight: 700;
          }

          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            .invoice-page {
              margin: 0;
              padding: 0;
            }
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `;
}

/**
 * Direct Print Trigger: Creates a hidden iframe, writes exact HTML, and opens Chrome Print directly
 */
export function printTaxInvoiceDirect(challan) {
  if (!challan) return;

  const htmlContent = generateTaxInvoicePrintHtml(challan);

  // Remove any existing print iframe
  const existingIframe = document.getElementById('tax-invoice-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  // Create clean invisible iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'tax-invoice-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow || iframe.contentDocument;
  const targetDoc = doc.document || doc;

  targetDoc.open();
  targetDoc.write(htmlContent);
  targetDoc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    } catch (e) {
      console.error('Error invoking print iframe:', e);
      window.print();
    }
  }, 250);
}
