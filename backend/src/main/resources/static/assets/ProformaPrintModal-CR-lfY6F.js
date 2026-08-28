import{n as e}from"./Toast-Cy-0rMph.js";import{t}from"./printer-iHWfwa3S.js";import{Dt as n,Et as r,k as i,n as a,t as o}from"./index-DG215SlJ.js";function s(e){let t=Math.round(Number(e)||0);if(t===0)return`Zero Only`;let n=[``,`One `,`Two `,`Three `,`Four `,`Five `,`Six `,`Seven `,`Eight `,`Nine `,`Ten `,`Eleven `,`Twelve `,`Thirteen `,`Fourteen `,`Fifteen `,`Sixteen `,`Seventeen `,`Eighteen `,`Nineteen `],r=[``,``,`Twenty `,`Thirty `,`Forty `,`Fifty `,`Sixty `,`Seventy `,`Eighty `,`Ninety `],i=(e=>{let t=``,i=(`000000000`+e).slice(-9),a=parseInt(i.substring(0,2),10),o=parseInt(i.substring(2,4),10),s=parseInt(i.substring(4,6),10),c=parseInt(i.substring(6,7),10),l=parseInt(i.substring(7,9),10);return a>0&&(t+=(n[a]||r[Math.floor(a/10)]+n[a%10])+`Crore `),o>0&&(t+=(n[o]||r[Math.floor(o/10)]+n[o%10])+`Lakhs `),s>0&&(t+=(n[s]||r[Math.floor(s/10)]+n[s%10])+`Thousand `),c>0&&(t+=n[c]+`Hundred `),l>0&&(t!==``&&(t+=`and `),t+=n[l]||r[Math.floor(l/10)]+n[l%10]),t})(t).trim();return i?`(Rupees : ${i} Only)`:`(Rupees : Zero Only)`}function c(e){if(!e)return``;let t=e.proformaNumber||`PC/01/26-27`,n=`31-12-2025`;if(e.proformaDate){let t=new Date(e.proformaDate);isNaN(t.getTime())||(n=`${String(t.getDate()).padStart(2,`0`)}-${String(t.getMonth()+1).padStart(2,`0`)}-${t.getFullYear()}`)}let r=(Array.isArray(e.items)?e.items:[]).filter(e=>e.itemCode&&e.itemCode.trim()||e.description&&e.description.trim()||Number(e.rate)>0),i=r.reduce((e,t)=>e+(Number(t.amount)||(Number(t.quantity)||1)*(Number(t.rate)||0)),0),a=Number(e.gstPercent)!==void 0&&!isNaN(Number(e.gstPercent))?Number(e.gstPercent):18,c=e.customerStateCode&&(e.customerStateCode.toLowerCase().includes(`puducherry`)||e.customerStateCode.includes(`34`)),l=i*a/100,u=i+l,d=e.contractNo||e.poNumber||`9010038288`,f=e.contractPeriod||`01.05.2024 to 30.04.2027`,p=e.vendorCode||`840305`,m=e.poNumber||`5060173862`,h=e.bgNo||`8110IPEBG240001  Validity Upto : 30.09.2027`,g=e.gstin||`34ABDFS4476N1ZN`,_=e.pan||`ABDFS4476N`,v=e.epfCode||`PC 1758`,y=e.esiCode||`55000426770000602`,b=e.stateCode||`Puducherry (34)`,x=e.sacCode||`995469`,S=e.customerName||`The G.M (Electrical), Surface Team , ONGC, Tamilnadu.`,C=e.customerPan||`AAACO1598A`,w=e.customerGstin||`33AAACO1598A1ZU`,T=e.customerStateCode||`TAMILNADU (33)`,E=[];if(r.length<=22)E.push({pageNum:1,totalPages:1,items:r,isFirst:!0,isLast:!0,startIdx:0});else{let e=0,t=1,n=r.slice(0,28);for(e+=n.length,E.push({pageNum:1,items:n,isFirst:!0,isLast:e>=r.length,startIdx:0});e<r.length;){t++;let n=r.slice(e,e+26);e+=n.length,E.push({pageNum:t,items:n,isFirst:!1,isLast:e>=r.length,startIdx:e-n.length})}let i=E.length;E.forEach(e=>{e.totalPages=i})}let D=[],O=0;E.forEach((e,t)=>{let n=e.items.reduce((e,t)=>e+(Number(t.amount)||(Number(t.quantity)||1)*(Number(t.rate)||0)),0);O+=n,D.push(O)});let k=s(u);return`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proforma Invoice - ${t} - Sri Durga Enterprises</title>
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
        .meta-row-highlight {
          background: #dce4dc;
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
      ${E.map((r,s)=>{let E=r.pageNum===1,O=r.pageNum===r.totalPages,A=D[s],j=s>0?D[s-1]:0;return`
      <div class="invoice-page ${s>0?`page-break`:``}">
        <div class="invoice-frame">
          
          <!-- Top Header Title Row -->
          <div class="header-title-row">
            <div class="header-main-title">PROFORMA INVOICE</div>
            <div class="header-copy-type">OFFICE COPY</div>
          </div>

          <!-- Company Header Section -->
          <div class="company-header-box">
            <div class="logo-box">
              <img src="${o}" alt="Logo" style="width: 70px; height: 70px; object-fit: contain;" />
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
                <td style="width: 45%; font-weight: 800; font-size: 13px;">${t}</td>
                <td style="width: 15%; font-weight: 700;">Date :</td>
                <td style="width: 25%; font-weight: 800; font-size: 13px;">${n}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Contract No.</td>
                <td>${d}</td>
                <td style="font-weight: 700;">Page</td>
                <td style="font-weight: 700;">${r.pageNum} of ${r.totalPages}</td>
              </tr>
              ${E?`
                <tr>
                  <td style="font-weight: 700;">C. Period</td>
                  <td>${f}</td>
                  <td style="font-weight: 700;">Vendor Code</td>
                  <td>${p}</td>
                </tr>
                <tr>
                  <td style="font-weight: 800;">P.O. No.</td>
                  <td style="font-weight: 800;">${m}</td>
                  <td style="font-weight: 800;">GSTIN</td>
                  <td style="font-weight: 800;">${g}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">B.G. No.</td>
                  <td>${h}</td>
                  <td style="font-weight: 800;">PAN</td>
                  <td style="font-weight: 800;">${_}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">EPF Code</td>
                  <td>${v}</td>
                  <td style="font-weight: 700;">State Code</td>
                  <td>${b}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">ESI CODE</td>
                  <td>${y}</td>
                  <td style="font-weight: 700;">Invoice Value</td>
                  <td style="font-weight: 800;">Rs. ${Math.round(u)}.00</td>
                </tr>
                <tr class="meta-row-billed">
                  <td style="font-weight: 800; vertical-align: top;">BILLED TO</td>
                  <td style="font-weight: 700; line-height: 1.3;">
                    ${S}
                    ${e.customerAddress?`<div style="font-size: 11px; font-weight: normal; margin-top: 2px;">${e.customerAddress}</div>`:``}
                  </td>
                  <td style="font-weight: 800; vertical-align: top;">PAN</td>
                  <td style="font-weight: 800; vertical-align: top;">${C}</td>
                </tr>
                <tr class="meta-row-billed">
                  <td style="font-weight: 800;">GST</td>
                  <td style="font-weight: 800;">${w}</td>
                  <td style="font-weight: 800;">State Code</td>
                  <td style="font-weight: 800;">${T}</td>
                </tr>
              `:``}
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
              ${E?``:`
                <tr class="brought-forward-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 700;">Amount Brought Forward from Page ${r.pageNum-1}:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 800;">${j.toFixed(2)}</td>
                </tr>
              `}

              ${r.items.map((e,t)=>{let n=r.startIdx+t+1,i=Number(e.quantity)||1,a=Number(e.rate)||0,o=Number(e.amount)||i*a;return`
                  <tr>
                    <td style="text-align: center;">${e.serialNumber||n}</td>
                    <td style="text-align: center; font-weight: 700;">${e.itemCode||``}</td>
                    <td style="text-align: left; line-height: 1.3;">${e.description||``}</td>
                    <td style="text-align: right;">${a.toFixed(2)}</td>
                    <td style="text-align: center;">${i}</td>
                    <td style="text-align: right; font-weight: 700;">${o.toFixed(2)}</td>
                  </tr>
                `}).join(``)}

              <!-- Stretcher row to ensure vertical border lines connect seamlessly all the way down to bottom footer -->
              <tr style="height: 100%;">
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td style="border-right: 1px solid #000;">&nbsp;</td>
                <td>&nbsp;</td>
              </tr>

              ${O?``:`
                <tr class="carried-over-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 700; text-align: right;">Page ${r.pageNum} Total:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 700;">${(A-j).toFixed(2)}</td>
                </tr>
                <tr class="carried-over-row highlight">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 800; text-align: right;">Amount Carried Over to Page ${r.pageNum+1}:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 800;">${A.toFixed(2)}</td>
                </tr>
              `}
            </tbody>
          </table>

          ${O?`
            <!-- Footer Totals Table -->
            <table class="totals-table">
              <tbody>
                <tr class="total-amount-row">
                  <td style="text-align: right; font-weight: 700; border-right: 1px solid #000;">Total Amount</td>
                  <td style="width: 105px; text-align: right; font-weight: 800;">${i.toFixed(2)}</td>
                </tr>
                ${c?`
                  <tr>
                    <td style="border-right: 1px solid #000;">SAC CODE : ${x} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CGST &nbsp;&nbsp;&nbsp;&nbsp; ${(a/2).toFixed(1)}%</td>
                    <td style="text-align: right;">${(l/2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-right: 1px solid #000;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SGST / UGST &nbsp;&nbsp;&nbsp;&nbsp; ${(a/2).toFixed(1)}%</td>
                    <td style="text-align: right;">${(l/2).toFixed(2)}</td>
                  </tr>
                `:`
                  <tr>
                    <td style="border-right: 1px solid #000;">SAC CODE : ${x} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IGST &nbsp;&nbsp;&nbsp;&nbsp; ${a}%</td>
                    <td style="text-align: right;">${l.toFixed(2)}</td>
                  </tr>
                `}
                <tr class="gross-total-row">
                  <td style="text-align: right; font-weight: 900; border-right: 1px solid #000; font-size: 13px;">GROSS TOTAL</td>
                  <td style="text-align: right; font-weight: 900; font-size: 13.5px;">${u.toFixed(2)}</td>
                </tr>
                <tr class="rupees-words-row">
                  <td colspan="2" style="font-weight: 800; padding: 4px 6px;">${k}</td>
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
          `:``}

        </div>
      </div>
    `}).join(``)}
    </body>
    </html>
  `}function l(e){let t=c(e),n=window.open(``,`_blank`,`width=900,height=1000`);n&&(n.document.open(),n.document.write(t),n.document.close(),n.focus(),setTimeout(()=>{n.print()},400))}var u=n(r()),d=i();function f(e){let t=Math.round(Number(e)||0);if(t===0)return`Zero Only`;let n=[``,`One `,`Two `,`Three `,`Four `,`Five `,`Six `,`Seven `,`Eight `,`Nine `,`Ten `,`Eleven `,`Twelve `,`Thirteen `,`Fourteen `,`Fifteen `,`Sixteen `,`Seventeen `,`Eighteen `,`Nineteen `],r=[``,``,`Twenty`,`Thirty`,`Forty`,`Fifty`,`Sixty`,`Seventy`,`Eighty`,`Ninety`],i=(e=>{let t=``,i=(`000000000`+e).slice(-9),a=parseInt(i.substring(0,2),10),o=parseInt(i.substring(2,4),10),s=parseInt(i.substring(4,6),10),c=parseInt(i.substring(6,7),10),l=parseInt(i.substring(7,9),10);return a>0&&(t+=(n[a]||r[Math.floor(a/10)]+` `+n[a%10])+`Crore `),o>0&&(t+=(n[o]||r[Math.floor(o/10)]+` `+n[o%10])+`Lakh `),s>0&&(t+=(n[s]||r[Math.floor(s/10)]+` `+n[s%10])+`Thousand `),c>0&&(t+=n[c]+`Hundred `),l>0&&(t!==``&&(t+=`and `),t+=n[l]||r[Math.floor(l/10)]+` `+n[l%10]),t})(t).trim();return i?`(Rupees :${i} Only)`:`(Rupees :Zero Only)`}var p=({isOpen:n,onClose:r,proforma:i})=>{let[s,c]=(0,u.useState)(`ORIGINAL`);if((0,u.useEffect)(()=>{let e=e=>{e.key===`Escape`&&r()};return n&&window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[n,r]),!n||!i)return null;let l=()=>{let e=document.getElementById(`proforma-invoice-print-area`);if(!e){window.print();return}let t=window.open(``,`_blank`,`width=900,height=1000`);if(t){let n=e.outerHTML;t.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Proforma Invoice - ${i.proformaNumber||`Sri Durga Enterprises`}</title>
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
            ${n}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 350);
              };
            <\/script>
          </body>
        </html>
      `),t.document.close()}else window.print()},p=i.proformaNumber||`PC/01/26-27`,m=i.proformaDate?new Date(i.proformaDate).toLocaleDateString(`en-GB`):new Date().toLocaleDateString(`en-GB`),h=i.items||[],g=h.reduce((e,t)=>e+(Number(t.amount)||Number(t.quantity||0)*Number(t.rate||0)),0),_=Number(i.gstPercent===void 0?18:i.gstPercent),v=_/2,y=(i.customerGstin||``).trim().substring(0,2),b=y===`34`||y===``,x=0,S=0,C=0;b?(x=v/100*g,S=v/100*g,C=0):(x=0,S=0,C=_/100*g);let w=g+x+S+C,T=f(w),E=h.some(e=>e.itemCode&&e.itemCode.trim()!==``&&e.itemCode.trim().toUpperCase()!==`CUSTOM`),D=(e=>{let t=[],n=[...e];if(n.length<=16)return t.push(n),t;for(t.push(n.slice(0,22)),n=n.slice(22);n.length>0;)t.push(n.slice(0,22)),n=n.slice(22);return t})(h),O=e=>{if(e===0)return 0;let t=0;for(let n=0;n<e;n++)for(let e of D[n])t+=Number(e.amount)||Number(e.quantity||0)*Number(e.rate||0);return t},k=e=>D[e].reduce((e,t)=>e+(Number(t.amount)||Number(t.quantity||0)*Number(t.rate||0)),0),A=s===`ALL`?[`ORIGINAL`,`DUPLICATE`,`OFFICE COPY`]:[(e=>e===`ORIGINAL`?`ORIGINAL`:e===`DUPLICATE`?`DUPLICATE`:e===`OFFICE COPY`?`OFFICE COPY`:e)(s)];return(0,d.jsxs)(`div`,{className:`no-print-modal-overlay`,style:{position:`fixed`,inset:0,zIndex:999999,background:`rgba(0, 0, 0, 0.85)`,backdropFilter:`blur(10px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`0.75rem`,overflow:`hidden`},onClick:e=>{e.target===e.currentTarget&&r()},children:[(0,d.jsx)(`style`,{children:`
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
      `}),(0,d.jsxs)(`div`,{className:`glass-panel-print-wrap`,style:{width:`100%`,maxWidth:`920px`,height:`95vh`,display:`flex`,flexDirection:`column`,background:`#0f172a`,border:`1.5px solid rgba(56, 189, 248, 0.4)`,borderRadius:`16px`,boxShadow:`0 25px 60px rgba(0, 0, 0, 0.65)`,overflow:`hidden`,position:`relative`},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.75rem 1.25rem`,background:`rgba(30, 41, 59, 0.98)`,borderBottom:`1px solid rgba(255, 255, 255, 0.1)`,flexShrink:0},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`},children:[(0,d.jsx)(`div`,{style:{width:`32px`,height:`32px`,borderRadius:`8px`,background:`rgba(56, 189, 248, 0.18)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,d.jsx)(e,{size:18,color:`#38bdf8`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsxs)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:800,color:`#f8fafc`,margin:0,lineHeight:1.2},children:[`Proforma Invoice Preview & Print (`,D.length,` `,D.length>1?`Pages`:`Page`,`)`]}),(0,d.jsxs)(`span`,{style:{fontSize:`0.75rem`,color:`#94a3b8`},children:[`Invoice No: `,(0,d.jsx)(`strong`,{style:{color:`#38bdf8`},children:p}),` • Total Items: `,(0,d.jsx)(`strong`,{style:{color:`#34d399`},children:h.length})]})]})]}),(0,d.jsx)(`button`,{onClick:r,className:`btn btn-outline`,style:{width:`36px`,height:`36px`,borderRadius:`50%`,padding:0,display:`flex`,alignItems:`center`,justifyContent:`center`,borderColor:`rgba(255, 255, 255, 0.2)`,background:`rgba(255, 255, 255, 0.06)`,color:`#f8fafc`,cursor:`pointer`,transition:`all 0.2s ease`},title:`Close Preview (Esc)`,"aria-label":`Close Preview`,children:(0,d.jsx)(a,{size:18})})]}),(0,d.jsx)(`div`,{style:{flex:1,padding:`1.5rem`,overflowY:`auto`,background:`#334155`,display:`flex`,justifyContent:`center`,alignItems:`flex-start`},children:(0,d.jsx)(`div`,{id:`proforma-invoice-print-area`,style:{background:`#fff`,width:`100%`,maxWidth:`820px`,boxShadow:`0 8px 30px rgba(0, 0, 0, 0.35)`},children:A.map((e,t)=>(0,d.jsx)(u.Fragment,{children:D.map((n,r)=>{let a=r===0,s=r===D.length-1,c=O(r),l=k(r);return(0,d.jsxs)(`div`,{className:`invoice-page`,style:{border:`2px solid #000000`,padding:`0`,marginBottom:t===A.length-1&&r===D.length-1?`0`:`25px`,background:`#ffffff`,color:`#000000`,boxSizing:`border-box`,width:`100%`,height:`285mm`,minHeight:`285mm`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`,overflow:`hidden`,fontSize:`12px`,fontFamily:`Arial, sans-serif`},children:[(0,d.jsxs)(`div`,{style:{flexShrink:0},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,borderBottom:`1px solid #000`,position:`relative`},children:[(0,d.jsx)(`div`,{style:{width:`85px`,minWidth:`85px`,borderRight:`1px solid #000`,padding:`4px`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,d.jsx)(`img`,{src:o,alt:`Logo`,style:{width:`70px`,height:`70px`,objectFit:`contain`}})}),(0,d.jsxs)(`div`,{style:{flex:1,padding:`4px 8px`,textAlign:`center`},children:[(0,d.jsx)(`div`,{style:{fontSize:`13px`,fontWeight:`bold`,textDecoration:`underline`,letterSpacing:`1px`,marginBottom:`2px`},children:`PROFORMA INVOICE`}),(0,d.jsx)(`h1`,{style:{fontSize:`19px`,fontWeight:`900`,margin:`2px 0`,letterSpacing:`3px`,fontFamily:`Arial, sans-serif`},children:`SRI \xA0 DURGA \xA0 ENTERPRISES`}),(0,d.jsx)(`p`,{style:{margin:`1px 0`,fontSize:`12px`,fontWeight:`600`},children:`No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602`}),a&&(0,d.jsx)(`p`,{style:{margin:`1px 0`,fontSize:`12px`,fontWeight:`600`},children:`E-mail : sridurgaenterprises@yahoo.com \xA0\xA0 Cell: 9842492946`})]}),(0,d.jsx)(`div`,{style:{position:`absolute`,right:`10px`,top:`6px`,fontWeight:`bold`,fontSize:`12px`,textTransform:`uppercase`,letterSpacing:`0.5px`},children:e})]}),(0,d.jsx)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,fontSize:`12px`,margin:0,borderBottom:`1px solid #000`},children:(0,d.jsxs)(`tbody`,{children:[(0,d.jsxs)(`tr`,{style:{background:`#dce4dc`,borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{width:`15%`,padding:`4px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Invoice No.`}),(0,d.jsx)(`td`,{style:{width:`45%`,padding:`4px 6px`,fontWeight:`900`,fontSize:`12.5px`,borderRight:`1px solid #000`},children:p}),(0,d.jsx)(`td`,{style:{width:`15%`,padding:`4px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Date :`}),(0,d.jsx)(`td`,{style:{width:`25%`,padding:`4px 6px`,fontWeight:`900`,fontSize:`12.5px`},children:m})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:a?`1px solid #000`:`none`},children:[(0,d.jsx)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Contract No.`}),(0,d.jsx)(`td`,{style:{padding:`4px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.contractNo||`9010038288`}),(0,d.jsx)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Page`}),(0,d.jsxs)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,fontSize:`12px`},children:[r+1,` of `,D.length]})]}),a&&(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`C. Period`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.contractPeriod||`01.05.2024 to 30.04.2027`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Vendor Code`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontSize:`12px`},children:i.vendorCode||`840305`})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`P.O. No.`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.poNumber||`5060173862`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`GSTIN`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,fontSize:`12px`},children:i.gstin||`34ABDFS4476N1ZN`})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`B.G. NO.`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.bgNo||`8110IPEBG240001 Validity Upto : 30.09.2027`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`PAN`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,fontSize:`12px`},children:i.pan||`ABDFS4476N`})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`EPF Code`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.epfCode||`PC 1758`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`State Code`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontSize:`12px`},children:i.stateCode||`Puducherry (34)`})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`ESI CODE`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.esiCode||`55000426770000602`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Invoice Value`}),(0,d.jsxs)(`td`,{style:{padding:`3px 6px`,fontWeight:`900`,fontSize:`12.5px`},children:[`Rs. `,w.toFixed(2)]})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`,verticalAlign:`top`},children:`BILLED TO`}),(0,d.jsxs)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:[(0,d.jsx)(`div`,{style:{fontWeight:`bold`},children:i.customerName||`The G.M (Electrical), Surface Team , ONGC, Tamilnadu.`}),i.customerAddress&&(0,d.jsx)(`div`,{style:{fontSize:`11px`,color:`#111827`,marginTop:`1px`},children:i.customerAddress})]}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`,verticalAlign:`top`},children:`PAN`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontSize:`12px`,verticalAlign:`top`,fontWeight:`bold`},children:i.customerPan||`AAACO1598A`})]}),(0,d.jsxs)(`tr`,{children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`GST`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:i.customerGstin||`33AAACO1598A1ZU`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`State Code`}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,fontSize:`12px`},children:i.customerStateCode||`TAMILNADU (33)`})]})]})]})})]}),(0,d.jsx)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minHeight:0},children:(0,d.jsxs)(`table`,{style:{width:`100%`,height:`100%`,borderCollapse:`collapse`,fontSize:`12px`,textAlign:`left`,margin:0,display:`table`},children:[(0,d.jsx)(`thead`,{children:(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`,borderTop:`none`,background:`#ffffff`,height:`26px`},children:[(0,d.jsx)(`th`,{style:{width:`42px`,padding:`4px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`Sl.No.`}),E&&(0,d.jsx)(`th`,{style:{width:`75px`,padding:`4px 4px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`Item No.`}),(0,d.jsx)(`th`,{style:{padding:`4px 6px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`Description`}),(0,d.jsx)(`th`,{style:{width:`85px`,padding:`4px 4px`,borderRight:`1px solid #000`,textAlign:`right`,fontSize:`12px`,fontWeight:`bold`},children:`Rate`}),(0,d.jsx)(`th`,{style:{width:`50px`,padding:`4px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`Qty`}),(0,d.jsx)(`th`,{style:{width:`105px`,padding:`4px 6px`,textAlign:`right`,fontSize:`12px`,fontWeight:`bold`},children:`Amount`})]})}),(0,d.jsxs)(`tbody`,{children:[!a&&(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`,background:`#f8fafc`,height:`24px`},children:[(0,d.jsx)(`td`,{style:{padding:`3px`,borderRight:`1px solid #000`,textAlign:`center`},children:`-`}),E&&(0,d.jsx)(`td`,{style:{padding:`3px`,borderRight:`1px solid #000`},children:`-`}),(0,d.jsxs)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,fontWeight:`bold`,fontSize:`12px`},children:[`Amount Brought Forward from Page `,r]}),(0,d.jsx)(`td`,{style:{padding:`3px`,borderRight:`1px solid #000`}}),(0,d.jsx)(`td`,{style:{padding:`3px`,borderRight:`1px solid #000`}}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,textAlign:`right`,fontWeight:`bold`,fontSize:`12px`},children:c.toFixed(2)})]}),n.map((e,t)=>{let n=Number(e.quantity)||1,r=Number(e.rate)||0,i=Number(e.amount)||n*r;return(0,d.jsxs)(`tr`,{style:{verticalAlign:`top`,minHeight:`24px`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`},children:e.serialNumber||t+1}),E&&(0,d.jsx)(`td`,{style:{padding:`3px 4px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:e.itemCode&&e.itemCode.toUpperCase()!==`CUSTOM`?e.itemCode:``}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,textAlign:`left`,fontSize:`12px`,lineHeight:`1.25`},children:e.description}),(0,d.jsx)(`td`,{style:{padding:`3px 4px`,borderRight:`1px solid #000`,textAlign:`right`,fontSize:`12px`},children:r.toFixed(2)}),(0,d.jsx)(`td`,{style:{padding:`3px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`},children:n}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,textAlign:`right`,fontSize:`12px`,fontWeight:`600`},children:i.toFixed(2)})]},t)}),(0,d.jsxs)(`tr`,{style:{height:`100%`},children:[(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),E&&(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,d.jsx)(`td`,{children:`\xA0`})]})]})]})}),(0,d.jsxs)(`div`,{style:{flexShrink:0},children:[!s&&(0,d.jsx)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,fontSize:`12px`,borderTop:`1px solid #000`},children:(0,d.jsxs)(`tbody`,{children:[(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`,background:`#f8fafc`},children:[(0,d.jsxs)(`td`,{style:{width:E?`68%`:`78%`,padding:`4px 6px`,borderRight:`1px solid #000`,fontWeight:`bold`,textAlign:`right`},children:[`Page `,r+1,` Total:`]}),(0,d.jsx)(`td`,{style:{width:`6%`,borderRight:`1px solid #000`}}),(0,d.jsx)(`td`,{style:{width:`16%`,padding:`4px 6px`,textAlign:`right`,fontWeight:`bold`},children:l.toFixed(2)})]}),(0,d.jsxs)(`tr`,{style:{background:`#dce4dc`},children:[(0,d.jsxs)(`td`,{style:{width:E?`68%`:`78%`,padding:`4px 6px`,borderRight:`1px solid #000`,fontWeight:`900`,textAlign:`right`},children:[`Amount Carried Over to Page `,r+2,`:`]}),(0,d.jsx)(`td`,{style:{width:`6%`,borderRight:`1px solid #000`}}),(0,d.jsx)(`td`,{style:{width:`16%`,padding:`4px 6px`,textAlign:`right`,fontWeight:`900`},children:(c+l).toFixed(2)})]})]})}),s&&(0,d.jsx)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,fontSize:`12px`,margin:0,borderTop:`1px solid #000`},children:(0,d.jsxs)(`tbody`,{children:[(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{width:E?`68%`:`78%`,padding:`3px 6px`,borderRight:`1px solid #000`,textAlign:`right`,fontWeight:`bold`,fontSize:`12px`},children:`Total Amount`}),(0,d.jsx)(`td`,{style:{width:`6%`,borderRight:`1px solid #000`}}),(0,d.jsx)(`td`,{style:{width:`16%`,padding:`3px 6px`,textAlign:`right`,fontWeight:`bold`,fontSize:`12px`},children:g.toFixed(2)})]}),b?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsxs)(`td`,{style:{padding:`2px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:[`SAC CODE : `,i.sacCode||`995469`]}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`CGST`}),(0,d.jsxs)(`td`,{style:{padding:`2px 6px`,textAlign:`right`,fontSize:`12px`},children:[v,`% \xA0\xA0\xA0 `,x.toFixed(2)]})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsx)(`td`,{style:{padding:`2px 6px`,borderRight:`1px solid #000`,fontSize:`12px`}}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`SGST / UGST`}),(0,d.jsxs)(`td`,{style:{padding:`2px 6px`,textAlign:`right`,fontSize:`12px`},children:[v,`% \xA0\xA0\xA0 `,S.toFixed(2)]})]})]}):(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,d.jsxs)(`td`,{style:{padding:`2px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:[`SAC CODE : `,i.sacCode||`995469`]}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`bold`},children:`IGST`}),(0,d.jsxs)(`td`,{style:{padding:`2px 6px`,textAlign:`right`,fontSize:`12px`},children:[_,`% \xA0\xA0\xA0 `,C.toFixed(2)]})]}),(0,d.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`,background:`#dce4dc`},children:[(0,d.jsx)(`td`,{style:{padding:`3px 6px`,borderRight:`1px solid #000`,textAlign:`right`,fontWeight:`900`,fontSize:`12.5px`},children:`GROSS TOTAL`}),(0,d.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,d.jsx)(`td`,{style:{padding:`3px 6px`,textAlign:`right`,fontWeight:`900`,fontSize:`13px`},children:w.toFixed(2)})]}),(0,d.jsx)(`tr`,{style:{borderBottom:`1px solid #000`},children:(0,d.jsx)(`td`,{colSpan:3,style:{padding:`4px 6px`,fontSize:`12px`,fontWeight:`bold`},children:T})}),(0,d.jsxs)(`tr`,{children:[(0,d.jsxs)(`td`,{style:{padding:`4px 6px`,borderRight:`1px solid #000`,fontSize:`11px`,lineHeight:`1.3`},children:[(0,d.jsx)(`div`,{children:`Bank Account Details for Payment:`}),(0,d.jsxs)(`div`,{children:[`Account Name: `,(0,d.jsx)(`strong`,{children:`SRI DURGA ENTERPRISES`})]}),(0,d.jsxs)(`div`,{children:[`Account No: `,(0,d.jsx)(`strong`,{children:`1152135000003056`}),` \xA0\xA0 IFSC: `,(0,d.jsx)(`strong`,{children:`KVBL0001152`})]}),(0,d.jsxs)(`div`,{children:[`Bank: `,(0,d.jsx)(`strong`,{children:`Karur Vysya Bank, Karaikal`})]})]}),(0,d.jsxs)(`td`,{colSpan:2,style:{padding:`4px 6px`,textAlign:`center`,verticalAlign:`bottom`,fontSize:`12px`},children:[(0,d.jsx)(`div`,{style:{fontWeight:`bold`,fontSize:`12px`},children:`For SRI DURGA ENTERPRISES`}),(0,d.jsx)(`div`,{style:{height:`35px`}}),(0,d.jsx)(`div`,{style:{fontWeight:`bold`,fontSize:`11px`},children:`Authorised Signatory`})]})]})]})})]})]},`${t}-${r}`)})},t))})}),(0,d.jsxs)(`div`,{style:{padding:`0.75rem 1.25rem`,background:`rgba(15, 23, 42, 0.98)`,borderTop:`1px solid rgba(255, 255, 255, 0.1)`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,flexWrap:`wrap`,gap:`0.75rem`,flexShrink:0},children:[(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,d.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`#94a3b8`,fontWeight:800,textTransform:`uppercase`,marginRight:`0.2rem`},children:`COPY:`}),[{id:`ORIGINAL`,label:`Original`},{id:`DUPLICATE`,label:`Duplicate`},{id:`OFFICE COPY`,label:`Office Copy`},{id:`ALL`,label:`All 3 Copies`}].map(e=>(0,d.jsx)(`button`,{onClick:()=>c(e.id),className:`btn btn-outline`,style:{fontSize:`0.78rem`,padding:`0.35rem 0.75rem`,borderRadius:`6px`,border:s===e.id?`1px solid #38bdf8`:`1px solid rgba(255, 255, 255, 0.12)`,background:s===e.id?`rgba(56, 189, 248, 0.2)`:`rgba(255, 255, 255, 0.04)`,color:s===e.id?`#38bdf8`:`#cbd5e1`,fontWeight:s===e.id?800:500},children:e.label},e.id))]}),(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`},children:[(0,d.jsx)(`button`,{onClick:r,className:`btn btn-outline`,style:{fontSize:`0.85rem`,padding:`0.5rem 1rem`},children:`Close`}),(0,d.jsxs)(`button`,{onClick:l,className:`btn btn-primary`,style:{fontSize:`0.85rem`,padding:`0.5rem 1.25rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`,background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`,boxShadow:`0 4px 14px rgba(2, 132, 199, 0.4)`},children:[(0,d.jsx)(t,{size:16}),(0,d.jsx)(`span`,{children:`Print Invoice / Save PDF`})]})]})]})]})]})};export{l as n,p as t};