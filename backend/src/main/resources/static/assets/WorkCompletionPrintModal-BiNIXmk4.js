import{o as e}from"./rolldown-runtime-C0FnF6B9.js";import{t}from"./file-text-BvqF6b7F.js";import{t as n}from"./printer-NLTCPpnw.js";import{N as r,Nt as i,n as a}from"./index-Dv2XbRre.js";var o=e(i()),s=r(),c=({isOpen:e,onClose:r,certificate:i})=>{let[c,l]=(0,o.useState)(`both`);if((0,o.useEffect)(()=>{let t=e=>{e.key===`Escape`&&r()};return e&&window.addEventListener(`keydown`,t),()=>window.removeEventListener(`keydown`,t)},[e,r]),!e||!i)return null;let u=i.equipmentDescription===`Service`,d=(i.items||[]).filter(e=>e.itemType===`SERVICE`),f=(i.items||[]).filter(e=>e.itemType===`MATERIAL`||!e.itemType),p=()=>{let e=document.getElementById(`work-cert-print-area`);if(!e){window.print();return}let t=window.open(``,`_blank`,`width=900,height=1050`);if(t){let n=e.innerHTML;t.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Work Completion Certificate - ${i.certificateNo||`Sri Durga Enterprises`}</title>
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
                padding: 12mm 15mm;
              }
              .cert-page {
                width: 100%;
                background: #ffffff;
                color: #000000;
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 25px;
                page-break-after: always !important;
                break-after: page !important;
              }
              .cert-page:last-child {
                margin-bottom: 0;
                page-break-after: auto !important;
                break-after: auto !important;
              }
              .cert-table {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0;
                font-size: 12.5px;
              }
              .cert-table th {
                border-top: 1.5px solid #000;
                border-bottom: 1.5px solid #000;
                padding: 6px 8px;
                text-align: left;
                font-weight: bold;
              }
              .cert-table td {
                padding: 6px 8px;
                vertical-align: top;
              }
              .cert-table tr.last-row td {
                border-bottom: 1.5px solid #000;
              }
              @page {
                size: A4 portrait;
                margin: 12mm 15mm;
              }
              @media print {
                body {
                  padding: 0;
                }
                .cert-page {
                  margin-bottom: 0 !important;
                  page-break-after: always !important;
                  break-after: page !important;
                }
                .cert-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
                }
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
      `),t.document.close()}else window.print()},m=()=>u?(0,s.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1.3fr 1fr`,gap:`6px 14px`,fontSize:`13px`},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Description:`}),` Service`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Equipment:`}),` `,i.equipment||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Location:`}),` `,i.location||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Make:`}),` `,i.make||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Sl. No.:`}),` `,i.slNo||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Capacity:`}),` `,i.capacity||`-`]}),(0,s.jsxs)(`div`,{style:{gridColumn:`span 3`},children:[(0,s.jsx)(`strong`,{children:`Type / Model:`}),` `,i.typeModel||`-`]})]}):(0,s.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1.2fr 1fr 1fr`,gap:`6px 12px`,fontSize:`13px`},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Description:`}),` Material`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Location:`}),` `,i.location||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Make:`}),` `,i.make||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Sl. No.:`}),` `,i.slNo||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Capacity:`}),` `,i.capacity||`-`]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`Type / Model:`}),` `,i.typeModel||`-`]})]}),h=e=>(0,s.jsxs)(`table`,{className:`cert-table`,style:{width:`100%`,borderCollapse:`collapse`,margin:`14px 0`,fontSize:`13px`},children:[(0,s.jsx)(`thead`,{children:(0,s.jsxs)(`tr`,{style:{borderTop:`1.5px solid #000`,borderBottom:`1.5px solid #000`},children:[(0,s.jsx)(`th`,{style:{width:`60px`,padding:`6px 8px`,fontWeight:`bold`},children:`Sl.No.`}),(0,s.jsx)(`th`,{style:{width:`120px`,padding:`6px 8px`,fontWeight:`bold`},children:`RC Item No.`}),(0,s.jsx)(`th`,{style:{padding:`6px 8px`,fontWeight:`bold`},children:`Description`}),(0,s.jsx)(`th`,{style:{width:`80px`,padding:`6px 8px`,textAlign:`right`,fontWeight:`bold`},children:`Qty.`})]})}),(0,s.jsx)(`tbody`,{children:e&&e.length>0?e.map((t,n)=>(0,s.jsxs)(`tr`,{style:n===e.length-1?{borderBottom:`1.5px solid #000`}:{},children:[(0,s.jsx)(`td`,{style:{padding:`6px 8px`,verticalAlign:`top`},children:n+1}),(0,s.jsx)(`td`,{style:{padding:`6px 8px`,verticalAlign:`top`,fontWeight:`600`},children:t.rcItemNo||`-`}),(0,s.jsx)(`td`,{style:{padding:`6px 8px`,verticalAlign:`top`,whiteSpace:`pre-line`},children:t.description}),(0,s.jsxs)(`td`,{style:{padding:`6px 8px`,verticalAlign:`top`,textAlign:`right`,fontWeight:`600`},children:[t.quantity,` `,t.unit||`No.`]})]},n)):(0,s.jsx)(`tr`,{style:{borderBottom:`1.5px solid #000`},children:(0,s.jsx)(`td`,{colSpan:4,style:{padding:`12px 8px`,textAlign:`center`},children:`No items listed`})})})]});return(0,s.jsx)(`div`,{className:`no-print-modal-overlay`,style:{position:`fixed`,inset:0,zIndex:999999,background:`rgba(0, 0, 0, 0.85)`,backdropFilter:`blur(10px)`,display:`flex`,alignItems:`center`,justifyContent:`center`,padding:`0.75rem`,overflow:`hidden`},onClick:e=>{e.target===e.currentTarget&&r()},children:(0,s.jsxs)(`div`,{className:`glass-panel-print-wrap`,style:{width:`100%`,maxWidth:`920px`,height:`95vh`,display:`flex`,flexDirection:`column`,background:`#0f172a`,border:`1.5px solid rgba(99, 102, 241, 0.4)`,borderRadius:`16px`,boxShadow:`0 25px 60px rgba(0, 0, 0, 0.65)`,overflow:`hidden`,position:`relative`},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.75rem 1.25rem`,background:`rgba(30, 41, 59, 0.98)`,borderBottom:`1px solid rgba(255, 255, 255, 0.1)`,flexShrink:0},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.625rem`},children:[(0,s.jsx)(`div`,{style:{width:`32px`,height:`32px`,borderRadius:`8px`,background:`rgba(52, 211, 153, 0.18)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,s.jsx)(t,{size:18,color:`#34d399`})}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h3`,{style:{fontSize:`0.95rem`,fontWeight:800,color:`#f8fafc`,margin:0,lineHeight:1.2},children:`Certificate Preview & Print`}),(0,s.jsxs)(`span`,{style:{fontSize:`0.75rem`,color:`#94a3b8`},children:[`Doc No: `,(0,s.jsx)(`strong`,{style:{color:`#38bdf8`},children:i.certificateNo}),` • Type: `,(0,s.jsx)(`strong`,{style:{color:`#34d399`},children:i.equipmentDescription||`Material`})]})]})]}),(0,s.jsx)(`button`,{onClick:r,className:`btn btn-outline`,style:{width:`36px`,height:`36px`,borderRadius:`50%`,padding:0,display:`flex`,alignItems:`center`,justifyContent:`center`,borderColor:`rgba(255, 255, 255, 0.2)`,background:`rgba(255, 255, 255, 0.06)`,color:`#f8fafc`,cursor:`pointer`,transition:`all 0.2s ease`},title:`Close Preview (Esc)`,"aria-label":`Close Preview`,children:(0,s.jsx)(a,{size:18})})]}),(0,s.jsx)(`div`,{style:{flex:1,padding:`1.5rem`,overflowY:`auto`,background:`#334155`,display:`flex`,justifyContent:`center`,alignItems:`flex-start`},children:(0,s.jsxs)(`div`,{id:`work-cert-print-area`,style:{display:`flex`,flexDirection:`column`,gap:`2rem`,width:`100%`,maxWidth:`820px`},children:[(c===`both`||c===`defect`)&&(0,s.jsxs)(`div`,{className:`cert-page`,style:{background:`#ffffff`,color:`#000000`,padding:`35px 40px`,fontFamily:`Arial, sans-serif`,fontSize:`13px`,lineHeight:`1.6`,boxShadow:`0 8px 30px rgba(0, 0, 0, 0.35)`,minHeight:`780px`,borderRadius:`2px`,display:`flex`,flexDirection:`column`},children:[(0,s.jsx)(`div`,{style:{textAlign:`center`,marginBottom:`25px`},children:(0,s.jsx)(`h2`,{style:{fontSize:`16px`,fontWeight:`bold`,textDecoration:`underline`,letterSpacing:`0.5px`,margin:0,textTransform:`uppercase`},children:`JOINT INSPECTION / DEFECT REPORT`})}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`,fontSize:`13px`,lineHeight:`1.6`},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`AGENCY:`}),` `,i.agency]}),(0,s.jsxs)(`div`,{style:{marginTop:`4px`},children:[(0,s.jsx)(`strong`,{children:`RATE CONTRACT REF:`}),` `,i.rateContractRef]})]}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`},children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,marginBottom:`8px`,fontSize:`13.5px`},children:`EQUIPMENT DETAILS`}),m()]}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`},children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,marginBottom:`6px`,fontSize:`13.5px`},children:`WORK RELEASE`}),u?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,marginTop:`6px`},children:`Work to be carried out:`}),h(d),(0,s.jsx)(`div`,{style:{fontWeight:`bold`,marginTop:`12px`},children:`Materials`}),h(f)]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,marginTop:`6px`},children:`Materials`}),h(f)]}),(0,s.jsxs)(`div`,{style:{marginTop:`8px`,fontSize:`13px`},children:[(0,s.jsx)(`strong`,{children:`Completion Time :`}),` `,i.completionTime||`5 Day(s)`]})]}),(0,s.jsxs)(`div`,{style:{marginTop:`auto`,paddingTop:`70px`,display:`flex`,justifyContent:`space-between`,alignItems:`flex-end`,fontSize:`13px`,fontWeight:`500`},children:[(0,s.jsx)(`div`,{children:`Signature of Contractor`}),(0,s.jsx)(`div`,{children:`Signature of EIC`})]})]}),(c===`both`||c===`wcc`)&&(0,s.jsxs)(`div`,{className:`cert-page`,style:{background:`#ffffff`,color:`#000000`,padding:`35px 40px`,fontFamily:`Arial, sans-serif`,fontSize:`13px`,lineHeight:`1.6`,boxShadow:`0 8px 30px rgba(0, 0, 0, 0.35)`,minHeight:`780px`,borderRadius:`2px`,display:`flex`,flexDirection:`column`},children:[(0,s.jsx)(`div`,{style:{textAlign:`center`,marginBottom:`25px`},children:(0,s.jsx)(`h2`,{style:{fontSize:`16px`,fontWeight:`bold`,textDecoration:`underline`,letterSpacing:`0.5px`,margin:0,textTransform:`uppercase`},children:`WORK COMPLETION CERTIFICATE`})}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`,fontSize:`13px`,lineHeight:`1.6`},children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`strong`,{children:`AGENCY:`}),` `,i.agency]}),(0,s.jsxs)(`div`,{style:{marginTop:`4px`},children:[(0,s.jsx)(`strong`,{children:`RATE CONTRACT REF:`}),` `,i.rateContractRef]})]}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`},children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,marginBottom:`8px`,fontSize:`13.5px`},children:`EQUIPMENT DETAILS`}),m()]}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`},children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,marginBottom:`6px`,fontSize:`13.5px`},children:`WORK COMPLETED`}),u?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,marginTop:`6px`},children:`Work to be carried out:`}),h(d),(0,s.jsx)(`div`,{style:{fontWeight:`bold`,marginTop:`12px`},children:`Materials`}),h(f)]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,marginTop:`6px`},children:`Materials`}),h(f)]})]}),(0,s.jsxs)(`div`,{style:{marginBottom:`20px`},children:[(0,s.jsx)(`div`,{style:{fontWeight:`bold`,textDecoration:`underline`,marginBottom:`8px`,fontSize:`13.5px`},children:`Other Details`}),(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`3px`,fontSize:`13px`},children:[(0,s.jsxs)(`div`,{children:[`a.Date of handing over for repairs: `,(0,s.jsx)(`strong`,{children:i.dateHandingOver||`-`})]}),(0,s.jsxs)(`div`,{children:[`b.Date of completion of work: `,(0,s.jsx)(`strong`,{children:i.dateCompletion||`-`})]}),(0,s.jsxs)(`div`,{children:[`c.Delay in completion of work, if any: `,(0,s.jsx)(`strong`,{children:i.delayInCompletion||`NIL`})]}),(0,s.jsxs)(`div`,{children:[`d.Performance of machines/ equipment after repair: `,(0,s.jsx)(`strong`,{children:i.performanceOfMachines||`OK`})]}),(0,s.jsxs)(`div`,{children:[`e.Defective spares/ material returned: `,(0,s.jsx)(`strong`,{children:i.defectiveSparesReturned||`NA`})]})]})]}),(0,s.jsx)(`div`,{style:{marginTop:`auto`,paddingTop:`70px`,textAlign:`right`,fontSize:`13px`,fontWeight:`500`},children:(0,s.jsx)(`div`,{children:`Signature of EIC with Seal`})})]})]})}),(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`0.85rem 1.5rem`,background:`rgba(15, 23, 42, 0.98)`,borderTop:`1px solid rgba(255, 255, 255, 0.12)`,flexShrink:0,flexWrap:`wrap`,gap:`0.75rem`,zIndex:10},children:[(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.5rem`},children:[(0,s.jsx)(`span`,{style:{fontSize:`0.75rem`,fontWeight:700,color:`#94a3b8`,textTransform:`uppercase`,letterSpacing:`0.05em`},children:`View:`}),(0,s.jsxs)(`div`,{style:{display:`flex`,background:`rgba(30, 41, 59, 0.8)`,padding:`3px`,borderRadius:`10px`,border:`1px solid rgba(255, 255, 255, 0.1)`},children:[(0,s.jsx)(`button`,{onClick:()=>l(`both`),style:{padding:`0.45rem 0.85rem`,borderRadius:`7px`,fontSize:`0.8rem`,fontWeight:c===`both`?700:500,background:c===`both`?`#4f46e5`:`transparent`,color:c===`both`?`#ffffff`:`#94a3b8`,border:`none`,cursor:`pointer`,transition:`all 0.2s ease`},children:`Both Pages`}),(0,s.jsx)(`button`,{onClick:()=>l(`wcc`),style:{padding:`0.45rem 0.85rem`,borderRadius:`7px`,fontSize:`0.8rem`,fontWeight:c===`wcc`?700:500,background:c===`wcc`?`#4f46e5`:`transparent`,color:c===`wcc`?`#ffffff`:`#94a3b8`,border:`none`,cursor:`pointer`,transition:`all 0.2s ease`},children:`Work Completion`}),(0,s.jsx)(`button`,{onClick:()=>l(`defect`),style:{padding:`0.45rem 0.85rem`,borderRadius:`7px`,fontSize:`0.8rem`,fontWeight:c===`defect`?700:500,background:c===`defect`?`#4f46e5`:`transparent`,color:c===`defect`?`#ffffff`:`#94a3b8`,border:`none`,cursor:`pointer`,transition:`all 0.2s ease`},children:`Defect Report`})]})]}),(0,s.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`0.75rem`},children:[(0,s.jsx)(`button`,{onClick:r,className:`btn btn-outline`,style:{padding:`0.55rem 1rem`,fontSize:`0.825rem`,color:`#cbd5e1`,borderColor:`rgba(255, 255, 255, 0.2)`},children:`Close`}),(0,s.jsxs)(`button`,{onClick:p,className:`btn btn-primary`,style:{padding:`0.55rem 1.35rem`,fontSize:`0.85rem`,fontWeight:700,display:`flex`,alignItems:`center`,gap:`0.5rem`,boxShadow:`0 4px 15px rgba(79, 70, 229, 0.4)`},children:[(0,s.jsx)(n,{size:17}),(0,s.jsx)(`span`,{children:`Print / Save PDF`})]})]})]})]})})};export{c as t};