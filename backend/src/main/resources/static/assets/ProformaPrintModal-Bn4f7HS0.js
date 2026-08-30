import{o as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t}from"./Toast-CiTqndlC.js";import{t as n}from"./printer-ItAD3ayA.js";import{F as r,P as i,Pt as a,n as o,ot as s,t as c}from"./index-NB0dUKj2.js";function l(e){let t=Math.round(Number(e)||0);if(t===0)return`Zero Only`;let n=[``,`One `,`Two `,`Three `,`Four `,`Five `,`Six `,`Seven `,`Eight `,`Nine `,`Ten `,`Eleven `,`Twelve `,`Thirteen `,`Fourteen `,`Fifteen `,`Sixteen `,`Seventeen `,`Eighteen `,`Nineteen `],r=[``,``,`Twenty `,`Thirty `,`Forty `,`Fifty `,`Sixty `,`Seventy `,`Eighty `,`Ninety `],i=(e=>{let t=``,i=(`000000000`+e).slice(-9),a=parseInt(i.substring(0,2),10),o=parseInt(i.substring(2,4),10),s=parseInt(i.substring(4,6),10),c=parseInt(i.substring(6,7),10),l=parseInt(i.substring(7,9),10);return a>0&&(t+=(n[a]||r[Math.floor(a/10)]+n[a%10])+`Crore `),o>0&&(t+=(n[o]||r[Math.floor(o/10)]+n[o%10])+`Lakhs `),s>0&&(t+=(n[s]||r[Math.floor(s/10)]+n[s%10])+`Thousand `),c>0&&(t+=n[c]+`Hundred `),l>0&&(t!==``&&(t+=`and `),t+=n[l]||r[Math.floor(l/10)]+n[l%10]),t})(t).trim();return i?`(Rupees : ${i} Only)`:`(Rupees : Zero Only)`}function u(e,t={}){if(!e)return``;let n=t.showDeclaration===void 0?typeof window<`u`?localStorage.getItem(`sri_durga_print_show_declaration`)!==`false`:!0:t.showDeclaration,r=e.proformaNumber||`PC/01/26-27`,i=`31-12-2025`;if(e.proformaDate){let t=new Date(e.proformaDate);isNaN(t.getTime())||(i=`${String(t.getDate()).padStart(2,`0`)}-${String(t.getMonth()+1).padStart(2,`0`)}-${t.getFullYear()}`)}let a=(Array.isArray(e.items)?e.items:[]).filter(e=>e.itemCode&&e.itemCode.trim()||e.description&&e.description.trim()||Number(e.rate)>0),o=a.reduce((e,t)=>e+(Number(t.amount)||(Number(t.quantity)||1)*(Number(t.rate)||0)),0),s=Number(e.gstPercent)!==void 0&&!isNaN(Number(e.gstPercent))?Number(e.gstPercent):18,u=(e.customerGstin||``).trim().substring(0,2),d=!u||u===`34`||e.customerStateCode&&(e.customerStateCode.toLowerCase().includes(`puducherry`)||e.customerStateCode.includes(`34`)),f=o*s/100,p=o+f,m=e.contractNo||e.poNumber||`9010038288`,h=e.contractPeriod||`01.05.2024 to 30.04.2027`,g=e.vendorCode||`840305`,_=e.poNumber||`5060173862`,v=e.bgNo||`8110IPEBG240001  Validity Upto : 30.09.2027`,y=e.gstin||`34ABDFS4476N1ZN`,b=e.pan||`ABDFS4476N`,x=e.epfCode||`PC 1758`,S=e.esiCode||`55000426770000602`,C=e.stateCode||`Puducherry (34)`,w=e.sacCode||`995469`,T=e.customerName||`The G.M (Electrical), Surface Team , ONGC, Tamilnadu.`,E=e.customerPan||`AAACO1598A`,D=e.customerGstin||`33AAACO1598A1ZU`,O=e.customerStateCode||`TAMILNADU (33)`,k=[];if(a.length<=22)k.push({pageNum:1,totalPages:1,items:a,isFirst:!0,isLast:!0,startIdx:0});else{let e=0,t=1,n=a.slice(0,28);for(e+=n.length,k.push({pageNum:1,items:n,isFirst:!0,isLast:e>=a.length,startIdx:0});e<a.length;){t++;let n=a.slice(e,e+26);e+=n.length,k.push({pageNum:t,items:n,isFirst:!1,isLast:e>=a.length,startIdx:e-n.length})}let r=k.length;k.forEach(e=>{e.totalPages=r})}let A=[],j=0;k.forEach((e,t)=>{let n=e.items.reduce((e,t)=>e+(Number(t.amount)||(Number(t.quantity)||1)*(Number(t.rate)||0)),0);j+=n,A.push(j)});let M=l(p);return`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proforma Invoice - ${r} - Sri Durga Enterprises</title>
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
      ${k.map((t,a)=>{let l=t.pageNum===1,u=t.pageNum===t.totalPages,k=A[a],j=a>0?A[a-1]:0;return`
      <div class="invoice-page ${a>0?`page-break`:``}">
        <div class="invoice-frame">
          
          <!-- Top Header Title Row -->
          <div class="header-title-row">
            <div class="header-main-title">PROFORMA INVOICE</div>
            <div class="header-copy-type">OFFICE COPY</div>
          </div>

          <!-- Company Header Section -->
          <div class="company-header-box">
            <div class="logo-box">
              <img src="${c}" alt="Logo" style="width: 70px; height: 70px; object-fit: contain;" />
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
                <td style="width: 45%; font-weight: 800; font-size: 13px;">${r}</td>
                <td style="width: 15%; font-weight: 700;">Date :</td>
                <td style="width: 25%; font-weight: 800; font-size: 13px;">${i}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Contract No.</td>
                <td>${m}</td>
                <td style="font-weight: 700;">Page</td>
                <td style="font-weight: 700;">${t.pageNum} of ${t.totalPages}</td>
              </tr>
              ${l?`
                <tr>
                  <td style="font-weight: 700;">CON. Period</td>
                  <td>${h}</td>
                  <td style="font-weight: 700;">Vendor Code</td>
                  <td>${g}</td>
                </tr>
                <tr>
                  <td style="font-weight: 800;">P.O. No.</td>
                  <td style="font-weight: 800;">${_}</td>
                  <td style="font-weight: 800;">GSTIN</td>
                  <td style="font-weight: 800;">${y}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">B.G. No</td>
                  <td>${v}</td>
                  <td style="font-weight: 800;">PAN</td>
                  <td style="font-weight: 800;">${b}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">EPF Code</td>
                  <td>${x}</td>
                  <td style="font-weight: 700;">State Code</td>
                  <td>${C}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">ESI CODE</td>
                  <td>${S}</td>
                  <td style="font-weight: 700;">Invoice Value</td>
                  <td style="font-weight: 800;">Rs. ${Math.round(p)}.00</td>
                </tr>
                <tr class="meta-row-billed" style="background-color: #dbe2ea !important;">
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">BILLED TO</td>
                  <td style="font-weight: 700; line-height: 1.3; background-color: #dbe2ea !important;">
                    <div style="font-weight: 800;">${T}</div>
                    ${e.customerAddress?`<div style="font-size: 11px; font-weight: normal; margin-top: 2px;">${e.customerAddress}</div>`:``}
                  </td>
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">PAN</td>
                  <td style="font-weight: 800; vertical-align: top; background-color: #dbe2ea !important;">${E}</td>
                </tr>
                <tr class="meta-row-billed" style="background-color: #dbe2ea !important;">
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">GST</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">${D}</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">State Code</td>
                  <td style="font-weight: 800; background-color: #dbe2ea !important;">${O}</td>
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
              ${l?``:`
                <tr class="brought-forward-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 700;">Amount Brought Forward from Page ${t.pageNum-1}:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 800;">${j.toFixed(2)}</td>
                </tr>
              `}

              ${t.items.map((e,n)=>{let r=t.startIdx+n+1,i=Number(e.quantity)||1,a=Number(e.rate)||0,o=Number(e.amount)||i*a;return`
                  <tr>
                    <td style="text-align: center;">${e.serialNumber||r}</td>
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

              ${u?``:`
                <tr class="carried-over-row">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 700; text-align: right;">Page ${t.pageNum} Total:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 700;">${(k-j).toFixed(2)}</td>
                </tr>
                <tr class="carried-over-row highlight">
                  <td style="text-align: center;"></td>
                  <td style="text-align: center;"></td>
                  <td style="font-weight: 800; text-align: right;">Amount Carried Over to Page ${t.pageNum+1}:</td>
                  <td></td>
                  <td></td>
                  <td style="text-align: right; font-weight: 800;">${k.toFixed(2)}</td>
                </tr>
              `}
            </tbody>
          </table>

          ${u?`
            <!-- Footer Totals Table -->
            <table class="totals-table">
              <tbody>
                <tr class="total-amount-row">
                  <td style="text-align: right; font-weight: 700; border-right: 1px solid #000;">Total Amount</td>
                  <td style="width: 105px; text-align: right; font-weight: 800;">${o.toFixed(2)}</td>
                </tr>
                ${d?`
                  <tr>
                    <td style="border-right: 1px solid #000;">SAC CODE : ${w} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CGST &nbsp;&nbsp;&nbsp;&nbsp; ${(s/2).toFixed(1)}%</td>
                    <td style="text-align: right;">${(f/2).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="border-right: 1px solid #000;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SGST / UGST &nbsp;&nbsp;&nbsp;&nbsp; ${(s/2).toFixed(1)}%</td>
                    <td style="text-align: right;">${(f/2).toFixed(2)}</td>
                  </tr>
                `:`
                  <tr>
                    <td style="border-right: 1px solid #000;">SAC CODE : ${w} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IGST &nbsp;&nbsp;&nbsp;&nbsp; ${s}%</td>
                    <td style="text-align: right;">${f.toFixed(2)}</td>
                  </tr>
                `}
                <tr class="gross-total-row">
                  <td style="text-align: right; font-weight: 900; border-right: 1px solid #000; font-size: 13px;">GROSS TOTAL</td>
                  <td style="text-align: right; font-weight: 900; font-size: 13.5px;">${p.toFixed(2)}</td>
                </tr>
                <tr class="rupees-words-row">
                  <td colspan="2" style="font-weight: 800; padding: 4px 6px;">${M}</td>
                </tr>
                ${n?`
                  <tr style="border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: center; background: #ffffff;">
                    <td colspan="2" style="padding: 5px 12px; text-align: center;">
                      <div style="font-weight: 700; text-decoration: underline; font-size: 11px; margin-bottom: 2px; letter-spacing: 0.5px;">DECLARATION</div>
                      <div style="font-size: 10.5px; font-weight: 500; line-height: 1.35; color: #000;">
                        We hereby certifying that all the clause of the contract agreement including statutory clauses, Remittance of EPF payment have been complied.
                      </div>
                    </td>
                  </tr>
                `:``}
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
  `}function d(e){let t=u(e),n=window.open(``,`_blank`,`width=900,height=1000`);n&&(n.document.open(),n.document.write(t),n.document.close(),n.focus(),setTimeout(()=>{n.print()},400))}var f=e(a()),p=i();function m(e){let t=Math.round(Number(e)||0);if(t===0)return`Zero Only`;let n=[``,`One `,`Two `,`Three `,`Four `,`Five `,`Six `,`Seven `,`Eight `,`Nine `,`Ten `,`Eleven `,`Twelve `,`Thirteen `,`Fourteen `,`Fifteen `,`Sixteen `,`Seventeen `,`Eighteen `,`Nineteen `],r=[``,``,`Twenty`,`Thirty`,`Forty`,`Fifty`,`Sixty`,`Seventy`,`Eighty`,`Ninety`],i=(e=>{let t=``,i=(`000000000`+e).slice(-9),a=parseInt(i.substring(0,2),10),o=parseInt(i.substring(2,4),10),s=parseInt(i.substring(4,6),10),c=parseInt(i.substring(6,7),10),l=parseInt(i.substring(7,9),10);return a>0&&(t+=(n[a]||r[Math.floor(a/10)]+` `+n[a%10])+`Crore `),o>0&&(t+=(n[o]||r[Math.floor(o/10)]+` `+n[o%10])+`Lakh `),s>0&&(t+=(n[s]||r[Math.floor(s/10)]+` `+n[s%10])+`Thousand `),c>0&&(t+=n[c]+`Hundred `),l>0&&(t!==``&&(t+=`and `),t+=n[l]||r[Math.floor(l/10)]+` `+n[l%10]),t})(t).trim();return i?`(Rupees :${i} Only)`:`(Rupees :Zero Only)`}var h=({isOpen:e,onClose:i,proforma:a})=>{let[l,u]=(0,f.useState)(`ORIGINAL`),[d,h]=(0,f.useState)(()=>{let e=localStorage.getItem(`sri_durga_print_show_item_number`);return e===null||e===`true`}),[g,_]=(0,f.useState)(()=>{let e=localStorage.getItem(`sri_durga_print_show_declaration`);return e===null||e===`true`}),[v,y]=(0,f.useState)(()=>{let e=localStorage.getItem(`sri_durga_company_details`);if(e)try{return JSON.parse(e)}catch{}return r});if((0,f.useEffect)(()=>{e&&s().then(e=>{e&&y(e)}).catch(e=>console.warn(`Could not load company details for print`,e))},[e]),(0,f.useEffect)(()=>{let t=e=>{e.key===`Escape`&&i()};return e&&window.addEventListener(`keydown`,t),()=>window.removeEventListener(`keydown`,t)},[e,i]),!e||!a)return null;let b=()=>{let e=document.getElementById(`proforma-invoice-print-area`);if(!e){window.print();return}let t=window.open(``,`_blank`,`width=900,height=1000`);if(t){let n=e.outerHTML;t.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Proforma Invoice - ${a.proformaNumber||`Sri Durga Enterprises`}</title>
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
      `),t.document.close()}else window.print()},x=a.proformaNumber||`PC/01/26-27`,S=a.proformaDate?new Date(a.proformaDate).toLocaleDateString(`en-GB`):new Date().toLocaleDateString(`en-GB`),C=a.items||[],w=C.reduce((e,t)=>e+(Number(t.amount)||Number(t.quantity||0)*Number(t.rate||0)),0),T=Number(a.gstPercent===void 0?18:a.gstPercent),E=T/2,D=(a.customerGstin||``).trim().substring(0,2),O=D===`34`||D===``,k=0,A=0,j=0;O?(k=E/100*w,A=E/100*w,j=0):(k=0,A=0,j=T/100*w);let M=w+k+A+j,N=m(M),P=d,F=(e=>{let t=[],n=[...e];if(n.length<=16)return t.push(n),t;for(t.push(n.slice(0,22)),n=n.slice(22);n.length>0;)t.push(n.slice(0,22)),n=n.slice(22);return t})(C),I=e=>{if(e===0)return 0;let t=0;for(let n=0;n<e;n++)for(let e of F[n])t+=Number(e.amount)||Number(e.quantity||0)*Number(e.rate||0);return t},L=e=>F[e].reduce((e,t)=>e+(Number(t.amount)||Number(t.quantity||0)*Number(t.rate||0)),0),R=l===`ALL`?[`ORIGINAL`,`DUPLICATE`,`OFFICE COPY`]:[(e=>e===`ORIGINAL`?`ORIGINAL`:e===`DUPLICATE`?`DUPLICATE`:e===`OFFICE COPY`?`OFFICE COPY`:e)(l)];return(0,p.jsxs)(`div`,{className:`no-print-modal-overlay`,style:{position:`fixed`,inset:0,zIndex:999999,background:`rgba(0, 0, 0, 0.85)`,backdropFilter:`blur(10px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`0.75rem`,overflow:`hidden`},onClick:e=>{e.target===e.currentTarget&&i()},children:[(0,p.jsx)(`style`,{children:`
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
      `}),(0,p.jsxs)(`div`,{className:`glass-panel-print-wrap`,style:{width:`100%`,maxWidth:`920px`,height:`95vh`,display:`flex`,flexDirection:`column`,background:`#0f172a`,border:`1.5px solid rgba(56, 189, 248, 0.4)`,borderRadius:`16px`,boxShadow:`0 25px 60px rgba(0, 0, 0, 0.65)`,overflow:`hidden`,position:`relative`},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.75rem 1.25rem`,background:`rgba(30, 41, 59, 0.98)`,borderBottom:`1px solid rgba(255, 255, 255, 0.1)`,flexShrink:0},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`},children:[(0,p.jsx)(`div`,{style:{width:`32px`,height:`32px`,borderRadius:`8px`,background:`rgba(56, 189, 248, 0.18)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,p.jsx)(t,{size:18,color:`#38bdf8`})}),(0,p.jsxs)(`div`,{children:[(0,p.jsxs)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:800,color:`#f8fafc`,margin:0,lineHeight:1.2},children:[`Proforma Invoice Preview & Print (`,F.length,` `,F.length>1?`Pages`:`Page`,`)`]}),(0,p.jsxs)(`span`,{style:{fontSize:`0.75rem`,color:`#94a3b8`},children:[`Invoice No: `,(0,p.jsx)(`strong`,{style:{color:`#38bdf8`},children:x}),` • Total Items: `,(0,p.jsx)(`strong`,{style:{color:`#34d399`},children:C.length})]})]})]}),(0,p.jsx)(`button`,{onClick:i,className:`btn btn-outline`,style:{width:`36px`,height:`36px`,borderRadius:`50%`,padding:0,display:`flex`,alignItems:`center`,justifyContent:`center`,borderColor:`rgba(255, 255, 255, 0.2)`,background:`rgba(255, 255, 255, 0.06)`,color:`#f8fafc`,cursor:`pointer`,transition:`all 0.2s ease`},title:`Close Preview (Esc)`,"aria-label":`Close Preview`,children:(0,p.jsx)(o,{size:18})})]}),(0,p.jsx)(`div`,{style:{flex:1,padding:`1.5rem`,overflowY:`auto`,background:`#334155`,display:`flex`,justifyContent:`center`,alignItems:`flex-start`},children:(0,p.jsx)(`div`,{id:`proforma-invoice-print-area`,style:{background:`#fff`,width:`100%`,maxWidth:`820px`,boxShadow:`0 8px 30px rgba(0, 0, 0, 0.35)`},children:R.map((e,t)=>(0,p.jsx)(f.Fragment,{children:F.map((n,r)=>{let i=r===0,o=r===F.length-1,s=I(r),l=L(r);return(0,p.jsxs)(`div`,{className:`invoice-page`,style:{border:`2px solid #000000`,padding:`0`,marginBottom:t===R.length-1&&r===F.length-1?`0`:`25px`,background:`#ffffff`,color:`#000000`,boxSizing:`border-box`,width:`100%`,height:`285mm`,minHeight:`285mm`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`,overflow:`hidden`,fontSize:`12px`,fontFamily:`Arial, sans-serif`},children:[(0,p.jsxs)(`div`,{style:{flexShrink:0},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,borderBottom:`1px solid #000`,position:`relative`},children:[(0,p.jsx)(`div`,{style:{width:`85px`,minWidth:`85px`,borderRight:`1px solid #000`,padding:`4px`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,p.jsx)(`img`,{src:c,alt:`Logo`,style:{width:`70px`,height:`70px`,objectFit:`contain`}})}),(0,p.jsxs)(`div`,{style:{flex:1,padding:`4px 8px`,textAlign:`center`},children:[(0,p.jsx)(`div`,{style:{fontSize:`13px`,fontWeight:`bold`,textDecoration:`underline`,letterSpacing:`1px`,marginBottom:`2px`},children:`PROFORMA INVOICE`}),(0,p.jsx)(`h1`,{style:{fontSize:`19px`,fontWeight:`900`,margin:`2px 0`,letterSpacing:`3px`,fontFamily:`Arial, sans-serif`},children:`SRI \xA0 DURGA \xA0 ENTERPRISES`}),(0,p.jsx)(`p`,{style:{margin:`1px 0`,fontSize:`12px`,fontWeight:`600`},children:`No. 10 V.G. Nagar, Kovilpathu, Karaikal – 609 602`}),i&&(0,p.jsx)(`p`,{style:{margin:`1px 0`,fontSize:`12px`,fontWeight:`600`},children:`E-mail : sridurgaenterprises@yahoo.com \xA0\xA0 Cell: 9842492946`})]}),(0,p.jsx)(`div`,{style:{position:`absolute`,right:`10px`,top:`6px`,fontWeight:`bold`,fontSize:`12px`,textTransform:`uppercase`,letterSpacing:`0.5px`},children:e})]}),(0,p.jsx)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,fontSize:`12px`,margin:0,borderBottom:`1px solid #000`},children:(0,p.jsxs)(`tbody`,{children:[(0,p.jsxs)(`tr`,{style:{background:`#dbe2ea`,borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{width:`15%`,padding:`4px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Invoice No.`}),(0,p.jsx)(`td`,{style:{width:`45%`,padding:`4px 6px`,fontWeight:`900`,fontSize:`12.5px`,borderRight:`1px solid #000`},children:x}),(0,p.jsx)(`td`,{style:{width:`15%`,padding:`4px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Date :`}),(0,p.jsx)(`td`,{style:{width:`25%`,padding:`4px 6px`,fontWeight:`900`,fontSize:`12.5px`},children:S})]}),(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Contract No.`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:a.contractNo||v?.contractNo||`9010038288`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Page`}),(0,p.jsxs)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,fontSize:`12px`},children:[r+1,` of `,F.length]})]}),i&&(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`CON. Period`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:a.contractPeriod||v?.contractPeriod||`01.05.2024 to 30.04.2027`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Vendor Code`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontSize:`12px`},children:a.vendorCode||v?.vendorCode||`840305`})]}),(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`P.O. No.`}),(0,p.jsxs)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:[a.poNumber||`5060173862`,` `,a.poDate?`Dt: ${new Date(a.poDate).toLocaleDateString(`en-GB`)}`:``]}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`GSTIN`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,fontSize:`12px`},children:v?.gstin||a.gstin||`34ABDFS4476N1ZN`})]}),(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`B.G. No`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:a.bgNo||v?.bgNo||`8110IPEBG240001  Validity Upto : 30.09.2027`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`PAN`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,fontSize:`12px`},children:v?.pan||a.pan||`ABDFS4476N`})]}),(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`EPF Code`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:v?.epfCode||a.epfCode||`PC 1758`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`State Code`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontSize:`12px`},children:v?.state||a.stateCode||`Puducherry (34)`})]}),(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`ESI CODE`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,borderRight:`1px solid #000`,fontSize:`12px`},children:v?.esiCode||a.esiCode||`55000426770000602`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Invoice Value`}),(0,p.jsxs)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,fontSize:`12px`},children:[`Rs. `,M.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})]})]}),(0,p.jsxs)(`tr`,{style:{background:`#dbe2ea`,borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,background:`#dbe2ea`,verticalAlign:`top`,borderRight:`1px solid #000`,fontSize:`12px`},children:`BILLED TO`}),(0,p.jsxs)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,background:`#dbe2ea`,lineHeight:`1.35`,borderRight:`1px solid #000`,fontSize:`12px`},children:[(0,p.jsx)(`div`,{style:{fontWeight:`bold`},children:a.customerName||`-`}),a.customerAddress&&(0,p.jsx)(`div`,{style:{fontWeight:`normal`,fontSize:`11px`,whiteSpace:`pre-line`},children:a.customerAddress}),a.customerPhone&&(0,p.jsxs)(`div`,{style:{fontWeight:`normal`,fontSize:`11px`},children:[`Phone: `,a.customerPhone]})]}),(0,p.jsx)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,background:`#dbe2ea`,verticalAlign:`top`,borderRight:`1px solid #000`,fontSize:`12px`},children:`PAN`}),(0,p.jsx)(`td`,{style:{padding:`4px 6px`,fontWeight:`bold`,background:`#dbe2ea`,verticalAlign:`top`,fontSize:`12px`},children:a.customerPan||`-`})]}),(0,p.jsxs)(`tr`,{style:{background:`#dbe2ea`,borderBottom:`1px solid #000`},children:[(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,background:`#dbe2ea`,borderRight:`1px solid #000`,fontSize:`12px`},children:`GST`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,background:`#dbe2ea`,borderRight:`1px solid #000`,fontSize:`12px`},children:a.customerGstin||`-`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,background:`#dbe2ea`,borderRight:`1px solid #000`,fontSize:`12px`},children:`State Code`}),(0,p.jsx)(`td`,{style:{padding:`3.5px 6px`,fontWeight:`bold`,background:`#dbe2ea`,fontSize:`12px`},children:a.customerStateCode||`TAMILNADU (33)`})]})]})]})}),a.equipmentHeader&&i&&(0,p.jsx)(`div`,{style:{borderBottom:`1px solid #000`,padding:`0.35rem 0.75rem`,background:`#f8fafc`,fontWeight:`bold`,fontSize:`12px`,textAlign:`center`},children:a.equipmentHeader})]}),(0,p.jsx)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minHeight:0},children:(0,p.jsxs)(`table`,{style:{width:`100%`,height:`100%`,borderCollapse:`collapse`,fontSize:`12px`,textAlign:`left`,margin:0,display:`table`},children:[(0,p.jsx)(`thead`,{children:(0,p.jsxs)(`tr`,{style:{borderBottom:`1.5px solid #000`,background:`#f1f5f9`,fontWeight:`bold`,textAlign:`center`,height:`28px`},children:[(0,p.jsx)(`th`,{style:{width:`42px`,padding:`4px 2px`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Sl.No.`}),P&&(0,p.jsx)(`th`,{style:{width:`80px`,padding:`4px 2px`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Item No.`}),(0,p.jsx)(`th`,{style:{padding:`4px 6px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`},children:`Description`}),(0,p.jsx)(`th`,{style:{width:`85px`,padding:`4px 4px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`},children:`Rate`}),(0,p.jsx)(`th`,{style:{width:`60px`,padding:`4px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`},children:`Qty`}),(0,p.jsx)(`th`,{style:{width:`105px`,padding:`4px 6px`,textAlign:`center`,fontSize:`12px`},children:`Amount`})]})}),(0,p.jsxs)(`tbody`,{children:[!i&&(0,p.jsxs)(`tr`,{style:{borderBottom:`1px solid #000`,background:`#f8fafc`,height:`26px`},children:[(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),P&&(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,p.jsxs)(`td`,{style:{padding:`4px 6px`,textAlign:`center`,borderRight:`1px solid #000`,fontStyle:`italic`,fontWeight:800,fontSize:`12px`},children:[`Brought Forward from Page `,r]}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,p.jsx)(`td`,{style:{padding:`4px 6px`,textAlign:`right`,fontWeight:800,fontSize:`12px`},children:s.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]}),n.map((e,t)=>{let n=Number(e.quantity)||1,i=Number(e.rate)||0,a=Number(e.amount)||n*i,o=r===0?t+1:F.slice(0,r).reduce((e,t)=>e+t.length,0)+t+1;return(0,p.jsxs)(`tr`,{style:{verticalAlign:`top`,minHeight:`24px`},children:[(0,p.jsx)(`td`,{style:{padding:`4px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`},children:e.serialNumber||o}),P&&(0,p.jsx)(`td`,{style:{padding:`4px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`600`},children:e.itemCode&&e.itemCode.toUpperCase()!==`CUSTOM`?e.itemCode:`-`}),(0,p.jsx)(`td`,{style:{padding:`4px 6px`,borderRight:`1px solid #000`,textAlign:`left`,fontSize:`12px`,whiteSpace:`pre-line`,lineHeight:`1.35`},children:e.description}),(0,p.jsx)(`td`,{style:{padding:`4px 4px`,borderRight:`1px solid #000`,textAlign:`right`,fontSize:`12px`},children:Number(i).toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})}),(0,p.jsxs)(`td`,{style:{padding:`4px 2px`,borderRight:`1px solid #000`,textAlign:`center`,fontSize:`12px`,fontWeight:`600`},children:[n,` `,e.unit||(Number(n)===1?`No`:`Nos`)]}),(0,p.jsx)(`td`,{style:{padding:`4px 6px`,textAlign:`right`,fontSize:`12px`,fontWeight:`600`},children:a.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]},t)}),(0,p.jsxs)(`tr`,{style:{height:`100%`},children:[(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),P&&(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`},children:`\xA0`}),(0,p.jsx)(`td`,{children:`\xA0`})]}),r<F.length-1&&(0,p.jsxs)(`tr`,{style:{fontWeight:`bold`,background:`#f8fafc`,borderTop:`1.5px solid #000`,height:`30px`},children:[(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),P&&(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,p.jsxs)(`td`,{style:{padding:`5px 8px`,textAlign:`center`,borderRight:`1px solid #000`,fontSize:`12px`,fontStyle:`italic`},children:[`Carried Over to Page `,r+2]}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,p.jsx)(`td`,{style:{borderRight:`1px solid #000`}}),(0,p.jsx)(`td`,{style:{padding:`5px 8px`,textAlign:`right`,fontSize:`12px`,fontWeight:800},children:(s+l).toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]}),o&&(0,p.jsxs)(`tr`,{style:{borderTop:`1.5px solid #000`,height:`28px`},children:[(0,p.jsx)(`td`,{colSpan:P?5:4,style:{padding:`4px 12px`,textAlign:`right`,fontStyle:`italic`,fontWeight:`bold`,borderRight:`1px solid #000`,fontSize:`12px`},children:`Total`}),(0,p.jsx)(`td`,{style:{padding:`4px 6px`,textAlign:`right`,fontWeight:`bold`,fontSize:`12px`},children:w.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]})]})]})}),o&&(0,p.jsxs)(`div`,{style:{flexShrink:0,borderTop:`1.5px solid #000`},children:[(0,p.jsxs)(`div`,{style:{borderBottom:`1px solid #000`,display:`flex`,fontSize:`12px`},children:[(0,p.jsxs)(`div`,{style:{flex:1,borderRight:`1px solid #000`,padding:`4px 8px`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`},children:[(0,p.jsxs)(`div`,{style:{fontWeight:`bold`,fontSize:`12px`},children:[`SAC Code : `,a.sacCode||`995464`,`, GST : `,T,`%`]}),(0,p.jsx)(`div`,{style:{fontStyle:`italic`,fontWeight:`bold`,fontSize:`11.5px`,marginTop:`6px`},children:N})]}),(0,p.jsxs)(`div`,{style:{width:`255px`,display:`flex`,flexDirection:`column`},children:[O?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,padding:`3px 8px`,borderBottom:`1px solid #000`,fontStyle:`italic`,fontSize:`12px`},children:[(0,p.jsxs)(`span`,{children:[`CGST @ `,E,`%`]}),(0,p.jsx)(`span`,{style:{fontWeight:`600`},children:k.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,padding:`3px 8px`,borderBottom:`1px solid #000`,fontStyle:`italic`,fontSize:`12px`},children:[(0,p.jsxs)(`span`,{children:[`SGST @ `,E,`%`]}),(0,p.jsx)(`span`,{style:{fontWeight:`600`},children:A.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]})]}):(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,padding:`4px 8px`,borderBottom:`1px solid #000`,fontStyle:`italic`,fontSize:`12px`},children:[(0,p.jsxs)(`span`,{children:[`IGST @ `,T,`%`]}),(0,p.jsx)(`span`,{style:{fontWeight:`600`},children:j.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,padding:`4px 8px`,fontWeight:`bold`,fontSize:`12.5px`},children:[(0,p.jsx)(`span`,{children:`GROSS AMOUNT`}),(0,p.jsxs)(`span`,{children:[`Rs. `,M.toLocaleString(`en-IN`,{minimumFractionDigits:2,maximumFractionDigits:2})]})]})]})]}),g&&(0,p.jsxs)(`div`,{style:{borderBottom:`1px solid #000`,padding:`5px 12px`,textAlign:`center`,background:`#ffffff`},children:[(0,p.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,fontSize:`11px`,marginBottom:`2px`,letterSpacing:`0.5px`},children:`DECLARATION`}),(0,p.jsx)(`div`,{style:{fontSize:`10.5px`,fontWeight:500,lineHeight:`1.35`,color:`#000`},children:`We hereby certifying that all the clause of the contract agreement including statutory clauses, Remittance of EPF payment have been complied.`})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,fontSize:`11.5px`,minHeight:`80px`},children:[(0,p.jsx)(`div`,{style:{width:`15%`,borderRight:`1px solid #000`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`4px`},children:(0,p.jsx)(`u`,{style:{fontWeight:`bold`,fontSize:`12px`},children:`E & O.E`})}),(0,p.jsxs)(`div`,{style:{width:`45%`,borderRight:`1px solid #000`,padding:`4px 8px`,lineHeight:`1.4`},children:[(0,p.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,marginBottom:`2px`,fontSize:`12px`},children:`Bank Account Details`}),(0,p.jsxs)(`div`,{style:{display:`flex`},children:[(0,p.jsx)(`span`,{style:{width:`85px`,fontWeight:`500`},children:`Bank Name`}),(0,p.jsxs)(`span`,{children:[`: `,v?.bankName||`-`]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`},children:[(0,p.jsx)(`span`,{style:{width:`85px`,fontWeight:`500`},children:`Account No.`}),(0,p.jsxs)(`span`,{children:[`: `,(0,p.jsx)(`strong`,{children:v?.accountNumber||`-`})]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`},children:[(0,p.jsx)(`span`,{style:{width:`85px`,fontWeight:`500`},children:`Branch`}),(0,p.jsxs)(`span`,{children:[`: `,v?.branch||`-`]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`},children:[(0,p.jsx)(`span`,{style:{width:`85px`,fontWeight:`500`},children:`IFSC`}),(0,p.jsxs)(`span`,{children:[`: `,(0,p.jsx)(`strong`,{children:v?.ifscCode||`-`})]})]})]}),(0,p.jsxs)(`div`,{style:{width:`40%`,padding:`4px 10px`,display:`flex`,flexDirection:`column`,justifyContent:`space-between`,textAlign:`right`},children:[(0,p.jsxs)(`div`,{style:{fontSize:`12px`},children:[`For `,(0,p.jsx)(`strong`,{children:v?.companyName||`SRI DURGA ENTERPRISES`})]}),(0,p.jsx)(`div`,{style:{fontStyle:`italic`,fontSize:`11px`,textAlign:`right`},children:`Authorised Signatory`})]})]})]})]},`${t}-${r}`)})},t))})}),(0,p.jsxs)(`div`,{style:{padding:`0.75rem 1.25rem`,background:`rgba(15, 23, 42, 0.98)`,borderTop:`1px solid rgba(255, 255, 255, 0.1)`,display:`flex`,alignItems:`center`,justifyContent:`space-between`,flexWrap:`wrap`,gap:`0.75rem`,flexShrink:0},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.4rem`},children:[(0,p.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`#94a3b8`,fontWeight:800,textTransform:`uppercase`,marginRight:`0.2rem`},children:`COPY:`}),[{id:`ORIGINAL`,label:`Original`},{id:`DUPLICATE`,label:`Duplicate`},{id:`OFFICE COPY`,label:`Office Copy`},{id:`ALL`,label:`All 3 Copies`}].map(e=>(0,p.jsx)(`button`,{onClick:()=>u(e.id),className:`btn btn-outline`,style:{fontSize:`0.78rem`,padding:`0.35rem 0.75rem`,borderRadius:`6px`,border:l===e.id?`1px solid #38bdf8`:`1px solid rgba(255, 255, 255, 0.12)`,background:l===e.id?`rgba(56, 189, 248, 0.2)`:`rgba(255, 255, 255, 0.04)`,color:l===e.id?`#38bdf8`:`#cbd5e1`,fontWeight:l===e.id?800:500},children:e.label},e.id))]}),(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`,flexWrap:`wrap`},children:[(0,p.jsxs)(`label`,{style:{display:`inline-flex`,alignItems:`center`,gap:`0.45rem`,background:d?`rgba(56, 189, 248, 0.2)`:`rgba(255, 255, 255, 0.04)`,border:d?`1.5px solid #38bdf8`:`1px solid rgba(255, 255, 255, 0.12)`,padding:`0.35rem 0.85rem`,borderRadius:`6px`,cursor:`pointer`,userSelect:`none`,transition:`all 0.2s ease`},title:`Toggle to Show or Hide Item Number column in Proforma Invoice printout`,children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:d,onChange:e=>{h(e.target.checked),localStorage.setItem(`sri_durga_print_show_item_number`,String(e.target.checked))},style:{width:`15px`,height:`15px`,accentColor:`#0284c7`,cursor:`pointer`}}),(0,p.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:700,color:d?`#38bdf8`:`#cbd5e1`},children:`Item Number`})]}),(0,p.jsxs)(`label`,{style:{display:`inline-flex`,alignItems:`center`,gap:`0.45rem`,background:g?`rgba(16, 185, 129, 0.25)`:`rgba(255, 255, 255, 0.04)`,border:g?`1.5px solid #34d399`:`1px solid rgba(255, 255, 255, 0.12)`,padding:`0.35rem 0.85rem`,borderRadius:`6px`,cursor:`pointer`,userSelect:`none`,transition:`all 0.2s ease`},title:`Toggle to Show or Hide statutory Declaration in Proforma Invoice printout`,children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:g,onChange:e=>{_(e.target.checked),localStorage.setItem(`sri_durga_print_show_declaration`,String(e.target.checked))},style:{width:`15px`,height:`15px`,accentColor:`#10b981`,cursor:`pointer`}}),(0,p.jsx)(`span`,{style:{fontSize:`0.8rem`,fontWeight:700,color:g?`#ffffff`:`#94a3b8`},children:`Declaration`})]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`},children:[(0,p.jsx)(`button`,{onClick:i,className:`btn btn-outline`,style:{fontSize:`0.85rem`,padding:`0.5rem 1rem`},children:`Close`}),(0,p.jsxs)(`button`,{onClick:b,className:`btn btn-primary`,style:{fontSize:`0.85rem`,padding:`0.5rem 1.25rem`,display:`flex`,alignItems:`center`,gap:`0.5rem`,background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`,boxShadow:`0 4px 14px rgba(2, 132, 199, 0.4)`},children:[(0,p.jsx)(n,{size:16}),(0,p.jsx)(`span`,{children:`Print Invoice / Save PDF`})]})]})]})]})]})};export{d as n,h as t};