// Utility for Direct Chrome Print & Proforma Invoice Generation matching exact Tax Invoice format
import { companyLogoBase64 } from '../assets/companyLogo';

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
  const customerGstPrefix = (proforma.customerGstin || '').trim().substring(0, 2);
  const isIntraState = !customerGstPrefix || customerGstPrefix === '34' || (proforma.customerStateCode && (
    proforma.customerStateCode.toLowerCase().includes('puducherry') || 
    proforma.customerStateCode.includes('34')
  ));

  const gstAmount = (subTotal * gstPct) / 100;
  const grossAmount = subTotal + gstAmount;

  const contractNo = proforma.contractNo || proforma.poNumber || '9010038288';
  const contractPeriod = proforma.contractPeriod || '01.05.2024 to 30.04.2027';
  const vendorCode = proforma.vendorCode || '840305';
  const poNo = proforma.poNumber || '5060173862';
  const bgNo = proforma.bgNo || '8110IPEBG240001  Validity Upto : 30.09.2027';
  const gstin = proforma.gstin || '34ABDFS4476N1ZN';
  const pan = proforma.pan || 'ABDFS4476N';
  const epfCode = proforma.epfCode || 'PC 1758';
  const esiCode = proforma.esiCode || '55000426770000602';
  const stateCode = proforma.stateCode || 'Puducherry (34)';
  const sacCode = proforma.sacCode || '995469';

  const customerName = proforma.customerName || 'The G.M (Electrical), Surface Team , ONGC, Tamilnadu.';
  const customerPan = proforma.customerPan || 'AAACO1598A';
  const customerGstin = proforma.customerGstin || '33AAACO1598A1ZU';
  const customerState = proforma.customerStateCode || 'TAMILNADU (33)';

  // Pagination logic: ~28-30 items per page
  const ITEMS_PER_PAGE_FIRST = 28;
  const ITEMS_PER_PAGE_OTHER = 26;

  const pages = [];
  if (items.length <= 22) {
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

  // Calculate running cumulative totals
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
            <div class="header-copy-type">OFFICE COPY</div>
          </div>

          <!-- Company Header Section -->
          <div class="company-header-box">
            <div class="logo-box">
              <img src="${companyLogoBase64}" alt="Logo" style="width: 70px; height: 70px; object-fit: contain;" />
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
              <tr class="meta-row-highlight">
                <td style="width: 15%; font-weight: 700;">Invoice No.</td>
                <td style="width: 45%; font-weight: 800; font-size: 13px;">${cleanProformaNo}</td>
                <td style="width: 15%; font-weight: 700;">Date :</td>
                <td style="width: 25%; font-weight: 800; font-size: 13px;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Contract No.</td>
                <td>${contractNo}</td>
                <td style="font-weight: 700;">Page</td>
                <td style="font-weight: 700;">${page.pageNum} of ${page.totalPages}</td>
              </tr>
              ${isFirstPage ? `
                <tr>
                  <td style="font-weight: 700;">CON. Period</td>
                  <td>${contractPeriod}</td>
                  <td style="font-weight: 700;">Vendor Code</td>
                  <td>${vendorCode}</td>
                </tr>
                <tr>
                  <td style="font-weight: 800;">P.O. No.</td>
                  <td style="font-weight: 800;">${poNo}</td>
                  <td style="font-weight: 800;">GSTIN</td>
                  <td style="font-weight: 800;">${gstin}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">B.G. No</td>
                  <td>${bgNo}</td>
                  <td style="font-weight: 800;">PAN</td>
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
                  <td style="font-weight: 800;">Rs. ${Math.round(grossAmount)}.00</td>
                </tr>
                <tr class="meta-row-billed" style="background-color: #dbe2ea !important;">
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">BILLED TO</td>
                  <td style="font-weight: 700; line-height: 1.3; background-color: #dbe2ea !important;">
                    <div style="font-weight: 800;">${customerName}</div>
                    ${proforma.customerAddress ? `<div style="font-size: 11px; font-weight: normal; margin-top: 2px;">${proforma.customerAddress}</div>` : ''}
                  </td>
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">PAN</td>
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">${customerPan}</td>
                </tr>
                <tr class="meta-row-billed" style="background-color: #dbe2ea !important;">
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">GST</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">${customerGstin}</td>
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
                <th style="width: 38px; text-align: center;">Sl.No.</th>
                <th style="width: 65px; text-align: center;">Item No.</th>
                <th style="text-align: center;">Description</th>
                <th style="width: 85px; text-align: right;">Rate</th>
                <th style="width: 75px; text-align: center;">Qty</th>
                <th style="width: 105px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${!isFirstPage ? `
                <tr class="brought-forward-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 700;">Amount Brought Forward from Page ${page.pageNum - 1}:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 800;">${broughtForwardAmount.toFixed(2)}</td>
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
                    <td style="text-align: center; font-weight: 700;">${item.itemCode || ''}</td>
                    <td style="text-align: left; line-height: 1.3;">${item.description || ''}</td>
                    <td style="text-align: right;">${rate.toFixed(2)}</td>
                    <td style="text-align: center;">${qty}</td>
                    <td style="text-align: right; font-weight: 700;">${amt.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}

              <!-- Stretcher row to ensure vertical border lines connect seamlessly all the way down to bottom footer -->
              <tr style="height: 100%;">
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              ${!isLastPage ? `
                <tr class="carried-over-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 700; text-align: right;">Page ${page.pageNum} Total:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 700;">${(carriedOverAmount - broughtForwardAmount).toFixed(2)}</td>
                </tr>
                <tr class="carried-over-row highlight">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 800; text-align: right;">Amount Carried Over to Page ${page.pageNum + 1}:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 800;">${carriedOverAmount.toFixed(2)}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          ${isLastPage ? `
            <!-- Footer Totals Table -->
            <table class="totals-table">
              <tbody>
                <tr class="total-amount-row">
                  <td style="text-align: right; font-weight: 700; border-right: 1px solid #000;">Total Amount</td>
                  <td style="width: 105px; text-align: right; font-weight: 800;">${subTotal.toFixed(2)}</td>
                </tr>
                ${isIntraState ? `
                  <tr>
                    <td style="border-right: 1px solid #000;">SAC CODE : ${sacCode} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CGST &nbsp;&nbsp;&nbsp;&nbsp; ${(gstPct / 2).toFixed(1)}%</td>
                    <td style="text-align: right;">${(gstAmount / 2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-right: 1px solid #000;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SGST / UGST &nbsp;&nbsp;&nbsp;&nbsp; ${(gstPct / 2).toFixed(1)}%</td>
                    <td style="text-align: right;">${(gstAmount / 2).toFixed(2)}</td>
                  </tr>
                ` : `
                  <tr>
                    <td style="border-right: 1px solid #000;">SAC CODE : ${sacCode} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IGST &nbsp;&nbsp;&nbsp;&nbsp; ${gstPct}%</td>
                    <td style="text-align: right;">${gstAmount.toFixed(2)}</td>
                  </tr>
                `}
                <tr class="gross-total-row">
                  <td style="text-align: right; font-weight: 900; border-right: 1px solid #000; font-size: 13px;">GROSS TOTAL</td>
                  <td style="text-align: right; font-weight: 900; font-size: 13.5px;">${grossAmount.toFixed(2)}</td>
                </tr>
                <tr class="rupees-words-row">
                  <td colspan="2" style="font-weight: 800; padding: 4px 6px;">${wordsInRupees}</td>
                </tr>
                <tr class="signature-bank-row">
                  <td style="border-right: 1px solid #000; font-size: 11px; padding: 4px 6px; line-height: 1.3;">
                    <div>Bank Account Details for Payment:</div>
                    <div>Account Name: <strong>SRI DURGA ENTERPRISES</strong></div>
                    <div>Account No: <strong>1152135000003056</strong> &nbsp;&nbsp; IFSC: <strong>KVBL0001152</strong></div>
                    <div>Bank: <strong>Karur Vysya Bank, Karaikal</strong></div>
                  </td>
                  <td style="text-align: center; vertical-align: bottom; padding: 4px 6px;">
                    <div style="font-weight: 800; font-size: 12px; margin-bottom: 28px;">For SRI DURGA ENTERPRISES</div>
                    <div style="font-weight: 800; font-size: 11px; border-top: 1px dashed #000; padding-top: 2px;">Authorised Signatory</div>
                  </td>
                </tr>
              </tbody>
            </table>
          ` : ''}

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
          margin: 6mm 8mm !important;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          color: #000000;
          background: #ffffff;
          font-size: 12px;
        }
        .invoice-page {
          width: 100%;
          height: 285mm;
          min-height: 285mm;
          padding: 0;
          margin: 0 auto;
          page-break-after: always;
          break-after: page;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 2px solid #000000;
          overflow: hidden;
        }
        .invoice-page:last-child {
          page-break-after: avoid;
          break-after: avoid;
        }
        .page-break {
          page-break-before: always;
        }
        .invoice-frame {
          padding: 0;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .header-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #000000;
          padding: 2px 8px;
        }
        .header-main-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          text-decoration: underline;
        }
        .header-copy-type {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .company-header-box {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #000000;
          padding: 4px;
        }
        .logo-box {
          width: 85px;
          min-width: 85px;
          border-right: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .company-info {
          flex: 1;
          text-align: center;
          padding: 2px 6px;
        }
        .company-name {
          font-size: 19px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 1px 0;
        }
        .company-address {
          font-size: 12px;
          font-weight: 600;
          margin: 1px 0;
        }
        .company-contacts {
          font-size: 12px;
          font-weight: 600;
          margin: 1px 0;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          border-bottom: 1px solid #000000;
        }
        .meta-table td {
          border-right: 1px solid #000000;
          border-bottom: 1px solid #000000;
          padding: 3px 6px;
        }
        .meta-table td:last-child {
          border-right: none;
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
        .items-table {
          width: 100%;
          height: 100%;
          border-collapse: collapse;
          font-size: 12px;
          flex: 1;
        }
        .items-table th, .items-table td {
          border-right: 1px solid #000000;
          border-bottom: 1px solid #000000;
          padding: 3px 5px;
        }
        .items-table th:last-child, .items-table td:last-child {
          border-right: none;
        }
        .items-table th {
          background: #ffffff;
          font-weight: bold;
        }
        .brought-forward-row, .carried-over-row {
          background: #f8fafc;
        }
        .carried-over-row.highlight {
          background: #dce4dc;
        }
        .totals-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          border-top: 1px solid #000000;
        }
        .totals-table td {
          border-bottom: 1px solid #000000;
          padding: 3px 6px;
        }
        .gross-total-row {
          background: #dce4dc;
        }
        .rupees-words-row {
          background: #ffffff;
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
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
